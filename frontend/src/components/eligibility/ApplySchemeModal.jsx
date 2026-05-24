import { useState, useEffect } from 'react';
import { X, Send, ShieldAlert, CheckCircle, Loader2, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { applicationsAPI } from '../../services/api';

const STATES = [
  'Maharashtra', 'Uttar Pradesh', 'Rajasthan', 'Bihar', 'Madhya Pradesh',
  'Gujarat', 'West Bengal', 'Andhra Pradesh', 'Tamil Nadu', 'Karnataka',
  'Punjab', 'Haryana', 'Odisha', 'Jharkhand', 'Chhattisgarh'
];

const OCCUPATIONS = [
  'farmer', 'daily-wage-worker', 'small-business-owner', 'student',
  'artisan', 'unemployed', 'government-employee', 'private-employee', 'self-employed'
];

export default function ApplySchemeModal({ scheme, onClose }) {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [form, setForm] = useState({
    name: user?.name || '',
    age: '',
    gender: 'male',
    occupation: 'student',
    income: '',
    state: 'Maharashtra',
    district: '',
    aadhaarNumber: '',
    bankAccount: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (form.aadhaarNumber.length !== 12 || isNaN(form.aadhaarNumber)) {
      setError('Aadhaar Number must be exactly 12 digits.');
      return;
    }
    if (form.bankAccount.length < 9 || isNaN(form.bankAccount)) {
      setError('Please enter a valid bank account number.');
      return;
    }
    if (form.phone.length !== 10 || isNaN(form.phone)) {
      setError('Phone Number must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await applicationsAPI.submit({
        schemeId: scheme._id,
        schemeName: scheme.name,
        applicant: {
          name: form.name,
          age: parseInt(form.age),
          gender: form.gender,
          occupation: form.occupation,
          income: parseInt(form.income),
          state: form.state,
          district: form.district || 'Pune',
          aadhaarNumber: form.aadhaarNumber,
          bankAccount: form.bankAccount,
          phone: form.phone,
        },
      });

      const resData = res.data.data;
      setResult(resData);

      if (resData.isFlagged) {
        addToast(
          'Application Audit Triggered',
          `Application ${resData.applicationId} was flagged for review due to suspicious data checks.`,
          'warning'
        );
      } else {
        addToast(
          'Application Submitted',
          `Application ${resData.applicationId} has been successfully submitted for processing.`,
          'success'
        );
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
      addToast('Submission Error', 'An error occurred during scheme registration.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Apply for Scheme</h3>
            <p className="text-xs text-primary-700 font-semibold truncate max-w-[320px]">
              {scheme.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {result ? (
            /* Result Dashboard after submission */
            <div className="space-y-5 text-center py-4">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center shadow-md">
                {result.isFlagged ? (
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <ShieldAlert size={36} className="animate-bounce" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <CheckCircle size={36} />
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">
                  {result.isFlagged ? 'Under Verification Review' : 'Application Processed'}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-1">ID: {result.applicationId}</p>
              </div>

              <div className={`p-4 rounded-2xl border text-sm text-left leading-relaxed ${
                result.isFlagged 
                  ? 'bg-amber-50/50 border-amber-200 text-amber-950' 
                  : 'bg-green-50/50 border-green-200 text-green-950'
              }`}>
                {result.isFlagged ? (
                  <p>
                    <strong>⚠️ Suspicious Flag Triggered:</strong> Our real-time fraud prevention scanner flagged this application (Risk Level: <strong>{result.fraudLevel}</strong>, Score: <strong>{result.fraudScore}%</strong>). It has been sent to the Admin Audit board for Aadhaar verification and district validity checks.
                  </p>
                ) : (
                  <p>
                    <strong>✅ Verification Complete:</strong> Your application matches scheme eligibility criteria. No fraud alert indicators were triggered. The application has been stored in Mongoose under `pending` status.
                  </p>
                )}
              </div>

              <button onClick={onClose} className="btn-secondary w-full">
                Close Application Window
              </button>
            </div>
          ) : (
            /* Form Fields */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-4 py-2.5">
                  ⚠️ {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Applicant Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="e.g. 35"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} className="select-field">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Occupation</label>
                  <select name="occupation" value={form.occupation} onChange={handleChange} className="select-field">
                    {OCCUPATIONS.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ.replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Annual Income (₹) *</label>
                  <input
                    type="number"
                    name="income"
                    value={form.income}
                    onChange={handleChange}
                    placeholder="e.g. 90000"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Phone Number *</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    maxLength={10}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">State</label>
                  <select name="state" value={form.state} onChange={handleChange} className="select-field">
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">District *</label>
                  <input
                    type="text"
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    placeholder="e.g. Pune"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Aadhaar Card Number *</label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={form.aadhaarNumber}
                  onChange={handleChange}
                  placeholder="12-digit Aadhaar"
                  maxLength={12}
                  className="input-field font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="label">Bank Account Number *</label>
                <input
                  type="text"
                  name="bankAccount"
                  value={form.bankAccount}
                  onChange={handleChange}
                  placeholder="Enter Account Number"
                  className="input-field font-mono text-sm"
                  required
                />
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex gap-2 text-xs text-slate-500">
                <Info size={16} className="text-primary-600 flex-shrink-0 mt-0.5" />
                <p className="leading-normal font-light">
                  Aadhaar and Bank account numbers are hashed cryptographically on submission to ensure citizens' privacy remains fully secure.
                </p>
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {loading ? 'Running security audits...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
