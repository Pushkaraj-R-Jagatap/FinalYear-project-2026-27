import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, LogOut, RefreshCw, FileText, AlertTriangle, Shield, Layers,
  Eye, EyeOff, Loader2, ChevronRight,
} from 'lucide-react';
import { adminAPI, fraudAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/translations';
import StatsCard from '../components/admin/StatsCard';
import FraudTable from '../components/admin/FraudTable';
import {
  SchemeBarChart,
  DailyTrendChart,
  FraudPieChart,
  StatusBarChart,
} from '../components/admin/ActivityChart';

// ── Login Form ─────────────────────────────────────────
function LoginForm({ onLogin }) {
  const { language } = useLanguage();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.login(form);
      localStorage.setItem('adminToken', res.data.data.token);
      localStorage.setItem('adminUser', JSON.stringify(res.data.data.admin));
      onLogin(res.data.data.admin);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Try admin / admin@123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-16 h-16 gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gov<span className="text-saffron-500">AI</span> Admin
          </h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">{t('username', language)}</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              placeholder="admin"
              className="input-field"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label">{t('password', language)}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="input-field pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
            {loading ? 'Signing in...' : t('signIn', language)}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          Demo: <span className="font-mono bg-gray-100 px-1 rounded">admin</span> /{' '}
          <span className="font-mono bg-gray-100 px-1 rounded">admin@123</span>
        </p>
      </div>
    </div>
  );
}

// ── Main Admin Dashboard ────────────────────────────────
export default function AdminPage() {
  const { language } = useLanguage();
  const [admin, setAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem('adminUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!admin) return;
    setLoading(true);
    setError('');
    try {
      const [statsRes, alertsRes, appsRes] = await Promise.all([
        adminAPI.getStats(),
        fraudAPI.getAlerts({ limit: 50, sortBy: 'fraudScore' }),
        adminAPI.getApplications({ limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);
      setStats(statsRes.data.data);
      setAlerts(alertsRes.data.data || []);
      setApplications(appsRes.data.data || []);
    } catch (err) {
      setError('Failed to load dashboard data. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
    setStats(null);
    setAlerts([]);
  };

  if (!admin) {
    return <LoginForm onLogin={setAdmin} />;
  }

  const ov = stats?.overview || {};
  const charts = stats?.charts || {};

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{t('adminTitle', language)}</h1>
              <p className="text-xs text-gray-500">
                Welcome back, <span className="font-medium text-primary-700">{admin.username}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">{t('logout', language)}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Connection Error</p>
              <p className="text-sm mt-0.5">{error}</p>
              <button
                onClick={fetchData}
                className="text-sm font-medium underline mt-1 hover:no-underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ── Stats Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatsCard
            title={t('totalApplications', language)}
            value={ov.totalApplications ?? '—'}
            icon="📋"
            color="blue"
            subtitle={`${ov.pendingApplications ?? 0} pending`}
          />
          <StatsCard
            title={t('fraudAlertCount', language)}
            value={ov.totalFraudAlerts ?? '—'}
            icon="⚠️"
            color="amber"
            subtitle={`${ov.openFraudAlerts ?? 0} open alerts`}
          />
          <StatsCard
            title={t('highRiskAlerts', language)}
            value={ov.highRiskAlerts ?? '—'}
            icon="🚨"
            color="red"
            subtitle="Require immediate action"
          />
          <StatsCard
            title={t('activeSchemes', language)}
            value={ov.totalSchemes ?? '—'}
            icon="📜"
            color="green"
            subtitle="Government schemes"
          />
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Approved', value: ov.approvedApplications, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Under Review', value: ov.underReviewApplications, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Rejected', value: ov.rejectedApplications, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Medium Risk', value: ov.totalFraudAlerts ? ov.totalFraudAlerts - (ov.highRiskAlerts || 0) - Math.max(0, (ov.totalFraudAlerts || 0) - (ov.highRiskAlerts || 0) - (ov.openFraudAlerts || 0)) : 0, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl px-4 py-3 border border-transparent`}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'fraud', label: `Fraud Alerts (${alerts.filter(a => a.status === 'open').length})`, icon: AlertTriangle },
            { id: 'applications', label: 'Applications', icon: FileText },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === id
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ──────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">
                  📊 {t('topSchemes', language)}
                </h3>
                <SchemeBarChart data={charts.applicationsByScheme} />
              </div>
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">
                  📈 {t('dailyTrend', language)}
                </h3>
                <DailyTrendChart data={charts.dailyApplications} />
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">
                  🥧 {t('fraudDistribution', language)}
                </h3>
                <FraudPieChart data={charts.fraudByLevel} />
              </div>
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">
                  📋 Application Status Breakdown
                </h3>
                <StatusBarChart data={charts.applicationsByStatus} />
              </div>
            </div>

            {/* Recent Alerts Preview */}
            {alerts.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    🚨 Recent High-Risk Alerts
                  </h3>
                  <button
                    onClick={() => setActiveTab('fraud')}
                    className="text-sm text-primary-700 hover:text-primary-900 flex items-center gap-1"
                  >
                    View all <ChevronRight size={13} />
                  </button>
                </div>
                <div className="space-y-3">
                  {alerts
                    .filter((a) => a.fraudLevel === 'high' && a.status === 'open')
                    .slice(0, 3)
                    .map((alert) => (
                      <div
                        key={alert._id}
                        className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl"
                      >
                        <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{alert.applicantName}</p>
                          <p className="text-xs text-gray-600 truncate">{alert.affectedScheme}</p>
                          {alert.reasons?.[0] && (
                            <p className="text-xs text-red-600 mt-0.5">{alert.reasons[0]}</p>
                          )}
                        </div>
                        <span className="badge-high flex-shrink-0">Score: {alert.fraudScore}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Fraud Alerts Tab ──────────────────────────────── */}
        {activeTab === 'fraud' && (
          <FraudTable alerts={alerts} onRefresh={fetchData} />
        )}

        {/* ── Applications Tab ──────────────────────────────── */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <FileText size={18} className="text-primary-700" />
              <h3 className="font-semibold text-gray-900">All Applications</h3>
              <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {ov.totalApplications ?? 0} total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Application ID', 'Applicant', 'Scheme', 'State', 'Status', 'Fraud Score', 'Date'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400">
                        No applications found. Run the seed script to add demo data.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          {app.applicationId}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{app.applicant?.name}</p>
                          <p className="text-xs text-gray-500">
                            Age {app.applicant?.age} • {app.applicant?.occupation}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 max-w-[140px]">
                          <span className="truncate block" title={app.schemeName}>
                            {app.schemeName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {app.applicant?.state}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${app.status === 'approved' ? 'bg-green-100 text-green-800' :
                                app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                app.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                                'bg-gray-100 text-gray-700'}`}
                          >
                            {app.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {app.isFlagged ? (
                            <span className={
                              app.fraudLevel === 'high' ? 'badge-high' :
                              app.fraudLevel === 'medium' ? 'badge-medium' : 'badge-low'
                            }>
                              {app.fraudScore} ({app.fraudLevel})
                            </span>
                          ) : (
                            <span className="badge-low">Clean</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(app.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
