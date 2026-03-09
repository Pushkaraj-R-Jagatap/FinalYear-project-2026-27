import { useState } from 'react';
import { AlertTriangle, CheckCircle, Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { fraudAPI } from '../../services/api';

const LEVEL_BADGE = {
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
};

const STATUS_BADGE = {
  open: 'badge-open',
  investigating: 'badge-investigating',
  resolved: 'badge-resolved',
  dismissed: 'badge-dismissed',
};

const FRAUD_RULE_LABELS = {
  DUPLICATE_AADHAAR: '🪪 Duplicate Aadhaar',
  SHARED_BANK_ACCOUNT: '🏦 Shared Bank Account',
  MULTIPLE_IP_APPLICATIONS: '🌐 IP Flood',
  DISTRICT_ANOMALY: '📍 District Anomaly',
  AGE_INCONSISTENCY: '👶 Age Issue',
  INCOME_INCONSISTENCY: '💰 Income Issue',
};

export default function FraudTable({ alerts, onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesFilter = filter === 'all' || alert.status === filter || alert.fraudLevel === filter;
    const matchesSearch =
      !search ||
      alert.applicantName?.toLowerCase().includes(search.toLowerCase()) ||
      alert.schemeName?.toLowerCase().includes(search.toLowerCase()) ||
      alert.applicationId?.toLowerCase().includes(search.toLowerCase()) ||
      alert.district?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const updateStatus = async (alertId, status) => {
    setUpdatingId(alertId);
    try {
      await fraudAPI.updateAlert(alertId, { status });
      onRefresh?.();
    } catch (err) {
      console.error('Failed to update alert:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const FraudScoreBar = ({ score }) => {
    const color = score >= 61 ? 'bg-red-500' : score >= 31 ? 'bg-amber-500' : 'bg-green-500';
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${color} transition-all`}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-700">{score}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          <h3 className="font-semibold text-gray-900">Fraud Alerts</h3>
          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {alerts.filter((a) => a.status === 'open').length} open
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 ml-auto">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 w-36"
            />
          </div>

          {/* Status filter */}
          {['all', 'open', 'investigating', 'resolved', 'high', 'medium'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium capitalize transition-colors
                ${filter === f
                  ? 'bg-primary-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Alert ID', 'Applicant', 'Scheme', 'District', 'Risk', 'Score', 'Rules Triggered', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-400">
                  <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
                  No fraud alerts matching your filters
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr key={alert._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {alert.alertId}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{alert.applicantName}</div>
                    <div className="text-xs text-gray-500">{alert.applicationId}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-[140px]">
                    <div className="truncate" title={alert.affectedScheme}>
                      {alert.affectedScheme || alert.schemeName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {alert.district || alert.state || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={LEVEL_BADGE[alert.fraudLevel] || 'badge-low'}>
                      {alert.fraudLevel?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <FraudScoreBar score={alert.fraudScore} />
                  </td>
                  <td className="px-4 py-3 max-w-[180px]">
                    <div className="flex flex-wrap gap-1">
                      {(alert.rulesTriggered || []).map((rule) => (
                        <span key={rule} className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                          {FRAUD_RULE_LABELS[rule] || rule}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATUS_BADGE[alert.status] || 'badge-open'}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {alert.status === 'open' && (
                        <button
                          onClick={() => updateStatus(alert._id, 'investigating')}
                          disabled={updatingId === alert._id}
                          className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-1 rounded transition-colors"
                        >
                          Investigate
                        </button>
                      )}
                      {['open', 'investigating'].includes(alert.status) && (
                        <>
                          <button
                            onClick={() => updateStatus(alert._id, 'resolved')}
                            disabled={updatingId === alert._id}
                            className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded transition-colors"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => updateStatus(alert._id, 'dismissed')}
                            disabled={updatingId === alert._id}
                            className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
