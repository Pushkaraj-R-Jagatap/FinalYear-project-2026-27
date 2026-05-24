import { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, HelpCircle, Loader2, ArrowRight, Link, MessageSquare, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/translations';
import axios from 'axios';

export default function FraudDetectionPage() {
  const { language } = useLanguage();
  const { addToast } = useNotifications();

  const [form, setForm] = useState({ suspiciousLink: '', scamMessage: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await axios.get(`${API_URL}/fraud/reports`);
      setReports(res.data.data || []);
    } catch (err) {
      console.error('Failed to load fraud reports:', err.message);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.suspiciousLink && !form.scamMessage) {
      setError('Please provide either a suspicious URL or a scam message to analyze.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await axios.post(`${API_URL}/fraud/verify`, form);
      setResult(res.data.data);
      addToast(
        res.data.data.isScam ? 'Scam Alert Triggered!' : 'Legitimacy Check Complete',
        res.data.data.isScam
          ? 'This submission has been flagged as suspicious.'
          : 'This submission does not match known phishing patterns.',
        res.data.data.isScam ? 'fraud_alert' : 'success'
      );
      // Refresh reports log
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.error || 'Verification analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="scheme-shell gradient-hero text-center py-12 px-6 mb-8">
        <div className="max-w-3xl mx-auto">
          <div className="w-14 h-14 bg-white border border-red-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm animate-pulse-slow">
            <ShieldAlert size={28} className="text-red-500" />
          </div>
          <h1 className="scheme-section-title mb-2">Citizen Scam & Fraud Shield</h1>
          <p className="text-slate-600 text-lg font-light leading-relaxed">
            Verify messages, phishing links, and fake advertisements requesting your Aadhaar, bank details, or registration fees.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left column - Form & Results (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              🔍 Fraud Analysis Scanner
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">
                  <Link size={13} className="inline mr-1 text-slate-400" /> Suspicious URL Link
                </label>
                <input
                  type="text"
                  value={form.suspiciousLink}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, suspiciousLink: e.target.value }));
                    setError('');
                  }}
                  placeholder="e.g. http://pm-kisan-awas-money.xyz/apply"
                  className="input-field font-mono text-xs"
                />
              </div>

              <div>
                <label className="label">
                  <MessageSquare size={13} className="inline mr-1 text-slate-400" /> SMS Text, WhatsApp Message or Ad Copy
                </label>
                <textarea
                  value={form.scamMessage}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, scamMessage: e.target.value }));
                    setError('');
                  }}
                  placeholder="Paste the WhatsApp scam message or scheme offer advertisement details here..."
                  rows={4}
                  className="input-field text-sm"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-4 py-2.5">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"
                disabled={loading}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldAlert size={18} />}
                {loading ? 'AI & Pattern Analysis Running...' : 'Verify Government Scheme Legitimacy'}
              </button>
            </form>
          </div>

          {/* Results section */}
          {result && (
            <div className="card border-slate-200 animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 india-bar" />
              
              <h3 className="text-lg font-bold text-slate-900 mb-4">Verification Result Analysis</h3>

              {/* Risk Level Badge */}
              <div className="flex items-center gap-4 p-4 rounded-2xl border mb-6 bg-slate-50">
                <div className="flex-shrink-0">
                  {result.isScam ? (
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-inner">
                      <AlertTriangle size={28} className="animate-bounce" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-inner">
                      <ShieldCheck size={28} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Legitimacy Score:</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      result.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                      result.riskLevel === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {result.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-2xl font-black text-slate-800 mt-1">
                    {result.isScam ? 'Scam / Phishing Spoof Detected' : 'Safe / Unflagged Scheme Link'}
                  </p>
                </div>
              </div>

              {/* Score Meter */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-1.5 uppercase">
                  <span>Scam Likelihood Meter</span>
                  <span>{result.confidenceScore}% Risk</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all duration-500 ${
                      result.confidenceScore >= 60 ? 'bg-red-500' :
                      result.confidenceScore >= 30 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${result.confidenceScore}%` }}
                  />
                </div>
              </div>

              {/* Analysis Reasons */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Indicators Detected</p>
                <div className="space-y-2">
                  {result.reasons && result.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-red-500 mt-0.5">•</span>
                      <p className="font-light leading-relaxed">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column - Reported Scams Feed (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
              <span>⚠️ Verified Fake Schemes Log</span>
              <button onClick={fetchReports} className="text-xs text-primary-700 hover:underline">
                Refresh
              </button>
            </h3>

            {loadingReports ? (
              <div className="text-center py-10">
                <Loader2 size={24} className="animate-spin text-slate-400 mx-auto" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                <HelpCircle size={28} className="mx-auto mb-2 opacity-50" />
                <p>No scam reports recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {reports.map((rep) => (
                  <div key={rep._id} className="p-4 bg-red-50/30 border border-red-100 rounded-2xl space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 uppercase">
                        {rep.fraudType}
                      </span>
                      <span className="badge-high text-[10px]">
                        {rep.confidenceScore}% Risk
                      </span>
                    </div>

                    {rep.suspiciousLink && (
                      <p className="text-xs font-mono text-slate-600 truncate bg-white p-2 rounded border border-slate-100">
                        {rep.suspiciousLink}
                      </p>
                    )}

                    {rep.scamMessage && (
                      <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100 line-clamp-3">
                        "{rep.scamMessage}"
                      </p>
                    )}

                    <p className="text-xs text-red-700 font-light leading-relaxed">
                      {rep.description}
                    </p>
                    
                    <span className="text-[9px] text-slate-400 block pt-1">
                      Reported: {new Date(rep.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
