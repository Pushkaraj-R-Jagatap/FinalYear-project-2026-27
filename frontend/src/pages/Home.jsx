import { Link } from 'react-router-dom';
import { Bot, Shield, BarChart3, ArrowRight, CheckCircle, Zap, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/translations';

const features = [
  {
    icon: '🤖',
    titleKey: 'feature1Title',
    descKey: 'feature1Desc',
    to: '/chatbot',
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: '📋',
    titleKey: 'feature2Title',
    descKey: 'feature2Desc',
    to: '/eligibility',
    color: 'from-green-500 to-teal-600',
    bgLight: 'bg-green-50',
    border: 'border-green-100',
  },
  {
    icon: '🔍',
    titleKey: 'feature3Title',
    descKey: 'feature3Desc',
    to: '/admin',
    color: 'from-orange-500 to-red-600',
    bgLight: 'bg-orange-50',
    border: 'border-orange-100',
  },
];

const stats = [
  { value: '15+', labelKey: 'schemesAvailable', emoji: '📋' },
  { value: '3', labelKey: 'languagesSupported', emoji: '🌐' },
  { value: '60+', labelKey: 'fraudAlerts', emoji: '🔍' },
  { value: '10 Cr+', labelKey: 'citizensHelped', emoji: '🇮🇳' },
];

const popularSchemes = [
  { name: 'PM-KISAN', desc: '₹6,000/year for farmers', emoji: '🌾', color: 'bg-green-50 border-green-200 text-green-800' },
  { name: 'Ayushman Bharat', desc: '₹5 lakh health cover', emoji: '🏥', color: 'bg-red-50 border-red-200 text-red-800' },
  { name: 'PM Awas Yojana', desc: 'Housing for all', emoji: '🏠', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { name: 'MUDRA Loan', desc: 'Business loans ₹10 lakh', emoji: '💼', color: 'bg-amber-50 border-amber-200 text-amber-800' },
  { name: 'Sukanya Samriddhi', desc: 'Girl child savings 8.2%', emoji: '👧', color: 'bg-pink-50 border-pink-200 text-pink-800' },
  { name: 'Atal Pension Yojana', desc: 'Monthly pension ₹1k–₹5k', emoji: '🧓', color: 'bg-purple-50 border-purple-200 text-purple-800' },
];

export default function Home() {
  const { language } = useLanguage();

  return (
    <div className="overflow-x-hidden bg-slate-100 min-h-screen">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-60 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-primary-100"
              style={{
                width: `${200 + i * 100}px`,
                height: `${200 + i * 100}px`,
                top: `${-50 + i * 20}px`,
                right: `${-100 + i * 30}px`,
              }}
            />
          ))}
        </div>

        <div className="relative scheme-shell gradient-hero px-6 py-14 sm:px-10 lg:px-16 lg:py-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-sm px-4 py-1.5 rounded-full mb-6 shadow-sm">
              <Zap size={13} className="text-primary-600" />
              AI-Powered • Multilingual • Scheme Guidance
            </div>

            <h1 className="scheme-section-title leading-tight mb-5">
              {t('heroTitle', language)}{' '}
              <span className="text-primary-700 block sm:inline">
                {t('heroHighlight', language)}
              </span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
              {t('heroSubtitle', language)}
            </p>

            {/* Language pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['🇬🇧 English', '🇮🇳 हिंदी', '🇮🇳 मराठी'].map((lang) => (
                <span key={lang} className="scheme-chip text-sm">
                  {lang}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/chatbot"
                className="flex items-center justify-center gap-2 btn-primary px-8 py-4"
              >
                <Bot size={20} />
                {t('getStarted', language)}
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/eligibility"
                className="flex items-center justify-center gap-2 btn-secondary px-8 py-4"
              >
                <Shield size={20} />
                Check My Eligibility
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              Popular Schemes: PM Kisan / Ayushman / Scholarships
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scheme-shell bg-white px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ value, labelKey, emoji }) => (
              <div key={labelKey} className="text-center">
                <div className="text-3xl mb-1">{emoji}</div>
                <div className="text-3xl font-bold text-slate-800">{value}</div>
                <div className="text-sm text-slate-500 mt-0.5">{t(labelKey, language)}</div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Everything You Need
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            A complete AI-powered platform for government scheme awareness and fraud prevention
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon, titleKey, descKey, to, color, bgLight, border }) => (
            <Link
              key={to}
              to={to}
              className={`group rounded-[28px] border ${border} ${bgLight} p-8 hover:shadow-lg transition-all duration-300 bg-white/80`}
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl mb-5 shadow-md group-hover:scale-110 transition-transform`}
              >
                {icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t(titleKey, language)}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                {t(descKey, language)}
              </p>
              <span className="flex items-center gap-1 text-sm font-semibold text-primary-700 group-hover:gap-2 transition-all">
                Explore <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Popular Schemes ────────────────────────────────── */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scheme-shell bg-[#f7fafc] p-8 sm:p-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Schemes</h2>
              <p className="text-gray-500 mt-1">Most searched government schemes</p>
            </div>
            <Link
              to="/eligibility"
              className="hidden sm:flex items-center gap-1 text-primary-700 font-medium hover:text-primary-900"
            >
              See all schemes <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {popularSchemes.map(({ name, desc, emoji, color }) => (
              <div
                key={name}
                className={`flex items-center gap-4 p-5 rounded-2xl border ${color} bg-white hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => window.location.href = '/chatbot'}
              >
                <span className="text-3xl">{emoji}</span>
                <div>
                  <p className="font-semibold text-gray-900">{name}</p>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
                <ArrowRight size={14} className="ml-auto flex-shrink-0 text-gray-400" />
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900">How GovAI Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '1', icon: '💬', title: 'Ask in Your Language', desc: 'Type your question in English, Hindi, or Marathi' },
            { step: '2', icon: '🤖', title: 'AI Understands', desc: 'LLM processes your query with deep scheme knowledge' },
            { step: '3', icon: '📋', title: 'Get Matched', desc: 'Receive personalized scheme recommendations' },
            { step: '4', icon: '✅', title: 'Apply Safely', desc: 'Fraud detection ensures safe application processing' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-14 h-14 bg-primary-700 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">
                {step}
              </div>
              <div className="text-2xl mb-2">{icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to find your eligible schemes?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join millions of Indian citizens already benefiting from government schemes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/chatbot"
              className="flex items-center justify-center gap-2 bg-white text-primary-800 font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-blue-50 transition-colors"
            >
              <Bot size={18} />
              Start AI Chat
            </Link>
            <Link
              to="/eligibility"
              className="flex items-center justify-center gap-2 border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors"
            >
              <CheckCircle size={18} />
              Check Eligibility
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
