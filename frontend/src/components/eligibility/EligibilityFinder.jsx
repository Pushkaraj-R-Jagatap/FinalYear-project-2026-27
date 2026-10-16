import { useState } from 'react';
import { Search, Loader2, User, IndianRupee, Briefcase, MapPin, ChevronRight, GraduationCap, Users2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { t } from '../../utils/translations';
import { schemesAPI } from '../../services/api';
import SchemeCard from './SchemeCard';

const OCCUPATIONS = [
  { value: '', label: 'Select Occupation' },
  { value: 'farmer', label: 'Farmer / Kisan' },
  { value: 'daily-wage-worker', label: 'Daily Wage Worker' },
  { value: 'small-business-owner', label: 'Small Business Owner' },
  { value: 'student', label: 'Student' },
  { value: 'artisan', label: 'Artisan / Craftsperson' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'government-employee', label: 'Government Employee' },
  { value: 'private-employee', label: 'Private Employee' },
  { value: 'self-employed', label: 'Self-Employed' },
  { value: 'fisherman', label: 'Fisherman' },
];

const STATES = [
  '', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
];

const INCOME_RANGES = [
  { value: '', label: 'Select Income Range' },
  { value: '50000', label: 'Below ₹50,000' },
  { value: '100000', label: '₹50,000 – ₹1 Lakh' },
  { value: '150000', label: '₹1 Lakh – ₹1.5 Lakh' },
  { value: '250000', label: '₹1.5 Lakh – ₹2.5 Lakh' },
  { value: '500000', label: '₹2.5 Lakh – ₹5 Lakh' },
  { value: '1000000', label: '₹5 Lakh – ₹10 Lakh' },
  { value: '1800000', label: '₹10 Lakh – ₹18 Lakh' },
  { value: '5000000', label: 'Above ₹18 Lakh' },
];

const EDUCATION_LEVELS = [
  { value: '', label: 'Select Education Level' },
  { value: 'below-10th', label: 'Below 10th Pass' },
  { value: '10th-pass', label: '10th Pass' },
  { value: '12th-pass', label: '12th Pass / Intermediate' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'post-graduate', label: 'Post Graduate & Above' },
];

const SOCIAL_CATEGORIES = [
  { value: '', label: 'Select Category (Social)' },
  { value: 'general', label: 'General / Unreserved' },
  { value: 'obc', label: 'OBC (Other Backward Classes)' },
  { value: 'sc', label: 'SC (Scheduled Caste)' },
  { value: 'st', label: 'ST (Scheduled Tribe)' },
  { value: 'ews', label: 'EWS (Economically Weaker Section)' },
];

export default function EligibilityFinder() {
  const { language } = useLanguage();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState({
    age: '',
    income: '',
    occupation: '',
    state: '',
    gender: '',
    education: '',
    socialCategory: '',
    // NEW:
    district: '',
    maritalStatus: '',
    disability: false,
    disabilityType: '',
    bplCard: false,
    rationCardType: '',
    landOwnership: '',
    religion: '',
    isMinority: false,
    numberOfDependents: '',
    annualHouseholdIncome: '',
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleCheckbox = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.age || !form.income) {
      setError('Please provide at least your age and income.');
      return;
    }

    if (parseInt(form.age) < 1 || parseInt(form.age) > 120) {
      setError('Please enter a valid age between 1 and 120.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await schemesAPI.findEligible({
        age: parseInt(form.age),
        income: parseInt(form.income),
        occupation: form.occupation || undefined,
        state: form.state || undefined,
        gender: form.gender || undefined,
        education: form.education || undefined,
        socialCategory: form.socialCategory || undefined,
        // NEW:
        district: form.district || undefined,
        maritalStatus: form.maritalStatus || undefined,
        disability: form.disability || undefined,
        disabilityType: form.disabilityType || undefined,
        bplCard: form.bplCard || undefined,
        rationCardType: form.rationCardType || undefined,
        landOwnership: form.landOwnership || undefined,
        religion: form.religion || undefined,
        isMinority: form.isMinority || undefined,
        numberOfDependents: form.numberOfDependents ? parseInt(form.numberOfDependents) : undefined,
        annualHouseholdIncome: form.annualHouseholdIncome ? parseInt(form.annualHouseholdIncome) : undefined,
      });
      setResults(res.data);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch schemes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Form */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {t('eligibilityTitle', language)}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {t('eligibilitySubtitle', language)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Age */}
            <div>
              <label className="label">
                <User size={13} className="inline mr-1" />
                {t('yourAge', language)} *
              </label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="e.g. 35"
                min="1"
                max="120"
                className="input-field"
                required
              />
            </div>

            {/* Income */}
            <div>
              <label className="label">
                <IndianRupee size={13} className="inline mr-1" />
                {t('annualIncome', language)} *
              </label>
              <select
                name="income"
                value={form.income}
                onChange={handleChange}
                className="select-field"
                required
              >
                {INCOME_RANGES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="label">{t('gender', language)}</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="select-field"
              >
                <option value="">Any / Not Specified</option>
                <option value="male">{t('male', language)}</option>
                <option value="female">{t('female', language)}</option>
                <option value="other">{t('other', language)}</option>
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className="label">
                <Briefcase size={13} className="inline mr-1" />
                {t('occupation', language)}
              </label>
              <select
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                className="select-field"
              >
                {OCCUPATIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            <div>
              <label className="label">
                <MapPin size={13} className="inline mr-1" />
                {t('state', language)}
              </label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                className="select-field"
              >
                <option value="">All India</option>
                {STATES.filter(Boolean).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Education Level */}
            <div>
              <label className="label">
                <GraduationCap size={13} className="inline mr-1" /> Education Level
              </label>
              <select
                name="education"
                value={form.education}
                onChange={handleChange}
                className="select-field"
              >
                {EDUCATION_LEVELS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Social Category */}
            <div>
              <label className="label">
                <Users2 size={13} className="inline mr-1" /> Social Category
              </label>
              <select
                name="socialCategory"
                value={form.socialCategory}
                onChange={handleChange}
                className="select-field"
              >
                {SOCIAL_CATEGORIES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Profile Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-primary-600 hover:underline flex items-center gap-1 font-medium"
          >
            {showAdvanced ? '▲ Hide' : '▼ Show'} Advanced Profile Options
            <span className="text-xs text-slate-400 font-normal ml-1">(disability, BPL card, religion, etc.)</span>
          </button>

          {showAdvanced && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">🗂️ Advanced Profile — Optional</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* District */}
                <div>
                  <label className="label">📍 District</label>
                  <input
                    type="text"
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    placeholder="e.g. Nashik, Patna, Coimbatore"
                    className="input-field"
                  />
                </div>

                {/* Marital Status */}
                <div>
                  <label className="label">💍 Marital Status</label>
                  <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className="select-field">
                    <option value="">Not Specified</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="widow">Widowed</option>
                    <option value="divorced">Divorced</option>
                  </select>
                </div>

                {/* Ration Card Type */}
                <div>
                  <label className="label">🪪 Ration Card Type</label>
                  <select name="rationCardType" value={form.rationCardType} onChange={handleChange} className="select-field">
                    <option value="">Not Applicable</option>
                    <option value="APL">APL (Above Poverty Line)</option>
                    <option value="BPL">BPL (Below Poverty Line)</option>
                    <option value="AAY">AAY (Antyodaya Anna Yojana)</option>
                  </select>
                </div>

                {/* Land Ownership */}
                <div>
                  <label className="label">🌾 Land Ownership</label>
                  <select name="landOwnership" value={form.landOwnership} onChange={handleChange} className="select-field">
                    <option value="">Not Specified</option>
                    <option value="none">No Land</option>
                    <option value="small">Small (&lt; 2 acres)</option>
                    <option value="marginal">Marginal (2–5 acres)</option>
                    <option value="large">Large (&gt; 5 acres)</option>
                  </select>
                </div>

                {/* Religion */}
                <div>
                  <label className="label">🛕 Religion</label>
                  <select name="religion" value={form.religion} onChange={handleChange} className="select-field">
                    <option value="">Not Specified</option>
                    <option value="hindu">Hindu</option>
                    <option value="muslim">Muslim</option>
                    <option value="christian">Christian</option>
                    <option value="sikh">Sikh</option>
                    <option value="buddhist">Buddhist</option>
                    <option value="jain">Jain</option>
                    <option value="others">Others</option>
                  </select>
                </div>

                {/* Number of Dependents */}
                <div>
                  <label className="label">👨‍👩‍👧‍👦 Number of Dependents</label>
                  <input
                    type="number"
                    name="numberOfDependents"
                    value={form.numberOfDependents}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    max="20"
                    className="input-field"
                  />
                </div>

                {/* Annual Household Income */}
                <div>
                  <label className="label">🏠 Annual Household Income (₹)</label>
                  <input
                    type="number"
                    name="annualHouseholdIncome"
                    value={form.annualHouseholdIncome}
                    onChange={handleChange}
                    placeholder="Total family income in ₹/year"
                    min="0"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Checkboxes row */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="disability"
                    checked={form.disability}
                    onChange={handleCheckbox}
                    className="w-4 h-4 rounded text-primary-600"
                  />
                  ♿ Person with Disability
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="bplCard"
                    checked={form.bplCard}
                    onChange={handleCheckbox}
                    className="w-4 h-4 rounded text-primary-600"
                  />
                  🪪 BPL / Antyodaya Card Holder
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isMinority"
                    checked={form.isMinority}
                    onChange={handleCheckbox}
                    className="w-4 h-4 rounded text-primary-600"
                  />
                  🌙 Minority Community Member
                </label>
              </div>

              {/* Disability type (conditional) */}
              {form.disability && (
                <div className="max-w-xs">
                  <label className="label">Disability Type</label>
                  <input
                    type="text"
                    name="disabilityType"
                    value={form.disabilityType}
                    onChange={handleChange}
                    placeholder="e.g. visual, locomotor, hearing, intellectual"
                    className="input-field"
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              ⚠️ {error}
            </p>
          )}

          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            {loading ? '🤖 AI & Rules Matching is running...' : t('checkEligibility', language)}
          </button>
        </form>
      </div>

      {/* Results */}
      {results && (
        <div className="animate-fade-in">

          {results.regionInsight && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 flex items-start gap-2 mb-4">
              <span className="text-base">🗺️</span>
              <p className="leading-relaxed">{results.regionInsight}</p>
            </div>
          )}

          {/* Summary Banner */}
          <div
            className={`flex items-center gap-3 px-5 py-4 rounded-xl mb-6 shadow-sm
              ${results.count > 0
                ? 'bg-green-50 border border-green-200'
                : 'bg-amber-50 border border-amber-200'
              }`}
          >
            <span className="text-2xl">{results.count > 0 ? '🎉' : '😔'}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900">
                  {results.count > 0
                    ? `${t('youQualifyFor', language)} ${results.count} ${t('schemes', language)}`
                    : t('noSchemesFound', language)}
                </p>
                {results.aiPowered && (
                  <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                    🤖 AI Powered
                  </span>
                )}
              </div>
              {results.profile && (
                <p className="text-sm text-gray-600 mt-0.5">
                  Profile: Age {results.profile.age} •{' '}
                  ₹{parseInt(results.profile.income).toLocaleString('en-IN')}/year
                  {results.profile.occupation && ` • ${results.profile.occupation}`}
                  {results.profile.district && ` • ${results.profile.district},`}
                  {results.profile.state && ` ${results.profile.state}`}
                </p>
              )}
            </div>
          </div>

          {/* Scheme Cards */}
          {results.count > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {results.data.map((scheme, idx) => (
                <SchemeCard key={scheme._id || idx} scheme={scheme} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state (before search) */}
      {!searched && !loading && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-lg font-medium text-gray-500">
            Fill in your details above to discover eligible schemes
          </p>
          <p className="text-sm mt-1">
            🤖 Powered by AI — analyses your profile to find every scheme you qualify for
          </p>
        </div>
      )}
    </div>
  );
}
