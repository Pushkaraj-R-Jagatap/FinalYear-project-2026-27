import { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, HelpCircle, Loader2, ArrowRight, Link, MessageSquare, AlertTriangle, AlertCircle, Upload, Image, FileText, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/translations';
import axios from 'axios';
import FeedbackWidget from '../components/common/FeedbackWidget';

export default function FraudDetectionPage() {
  const { language } = useLanguage();
  const { addToast } = useNotifications();

  const [form, setForm] = useState({ suspiciousLink: '', scamMessage: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState('');

  const [inputMode, setInputMode] = useState('text'); // 'text' | 'image'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');

  const handleImageSelect = (file) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setOcrError('Please upload a JPG, PNG, WebP or GIF image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setOcrError('Image must be under 5MB.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setExtractedText('');
    setOcrError('');
    setResult(null);
  };

  const handleExtractText = async () => {
    if (!imageFile) return;
    setOcrLoading(true);
    setOcrError('');
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await axios.post(`${API_URL}/ocr/extract`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setExtractedText(res.data.data.extractedText);
    } catch (err) {
      setOcrError(err.response?.data?.error || 'OCR extraction failed. Try a clearer image.');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile) return;
    setAnalyzeLoading(true);
    setOcrError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await axios.post(`${API_URL}/ocr/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.data);
      addToast(
        res.data.data.isScam ? '🖼️ Scam Image Detected!' : '✅ Image Check Complete',
        res.data.data.isScam ? 'This image was flagged as suspicious.' : 'No scam indicators found in this image.',
        res.data.data.isScam ? 'fraud_alert' : 'success'
      );
      fetchReports();
    } catch (err) {
      setOcrError(err.response?.data?.error || 'Image analysis failed. Please try again.');
    } finally {
      setAnalyzeLoading(false);
    }
  };

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

            {/* Tab Switcher */}
            <div className="flex gap-2 mb-5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => { setInputMode('text'); setResult(null); setError(''); }}
                className={`flex items-center gap-2 flex-1 justify-center py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
                  inputMode === 'text' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileText size={14} /> Text / URL
              </button>
              <button
                type="button"
                onClick={() => { setInputMode('image'); setResult(null); setError(''); }}
                className={`flex items-center gap-2 flex-1 justify-center py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
                  inputMode === 'image' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Image size={14} /> Image / Screenshot
              </button>
            </div>

            {/* TEXT MODE — existing form */}
            {inputMode === 'text' && (
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
            )}

            {/* IMAGE MODE — new upload section */}
            {inputMode === 'image' && (
              <div className="space-y-4">
                {/* Drop Zone */}
                <div
                  onClick={() => document.getElementById('image-upload-input').click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleImageSelect(e.dataTransfer.files[0]); }}
                  className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition-colors"
                >
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img src={imagePreview} alt="Preview" className="max-h-48 object-contain mx-auto rounded-xl" />
                      <p className="text-xs text-slate-500">{imageFile?.name}</p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); setExtractedText(''); setResult(null); }}
                        className="text-xs text-red-500 hover:underline flex items-center gap-1 mx-auto"
                      >
                        <X size={11} /> Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} className="text-slate-400 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-600">📸 Drop a screenshot here or click to upload</p>
                      <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP · Max 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  id="image-upload-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleImageSelect(e.target.files[0])}
                />

                {ocrError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-4 py-2.5">
                    ⚠️ {ocrError}
                  </div>
                )}

                {imageFile && (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleExtractText}
                      disabled={ocrLoading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50"
                    >
                      {ocrLoading ? <span className="animate-spin">⏳</span> : <FileText size={15} />}
                      {ocrLoading ? 'Extracting...' : '🔍 Extract Text'}
                    </button>
                    <button
                      type="button"
                      onClick={handleAnalyzeImage}
                      disabled={analyzeLoading}
                      className="btn-primary flex items-center gap-2 py-2.5 text-sm disabled:opacity-50"
                    >
                      {analyzeLoading ? <span className="animate-spin">⏳</span> : <ShieldAlert size={15} />}
                      {analyzeLoading ? 'AI Analyzing...' : '🛡️ Analyze for Scam'}
                    </button>
                  </div>
                )}

                {extractedText && (
                  <div>
                    <label className="label">📄 Extracted Text from Image</label>
                    <textarea
                      readOnly
                      value={extractedText}
                      rows={4}
                      className="input-field text-xs font-mono bg-slate-50"
                    />
                  </div>
                )}
              </div>
            )}
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

              {result?.ocrExtracted && result?.extractedText && (
                <details className="mt-4">
                  <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">📄 View OCR extracted text</summary>
                  <p className="mt-2 text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">{result.extractedText}</p>
                </details>
              )}

              <FeedbackWidget
                targetType="fraud"
                targetId={result.reportId || 'fraud-result'}
                compact={false}
                label="Was this fraud analysis accurate?"
              />
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
