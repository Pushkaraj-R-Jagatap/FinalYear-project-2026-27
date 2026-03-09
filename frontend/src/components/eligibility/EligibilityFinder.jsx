import { useState } from 'react';
import { Search, Loader2, User, IndianRupee, Briefcase, MapPin, ChevronRight } from 'lucide-react';
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

export default function EligibilityFinder() {
  const { language } = useLanguage();
  const [form, setForm] = useState({
    age: '',
    income: '',
    occupation: '',
    state: '',
    gender: '',
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
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
          </div>

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
            {loading ? '🤖 AI is analysing your profile...' : t('checkEligibility', language)}
          </button>
        </form>
      </div>

      {/* Results */}
      {results && (
        <div className="animate-fade-in">
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
                  {results.profile.state && ` • ${results.profile.state}`}
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
