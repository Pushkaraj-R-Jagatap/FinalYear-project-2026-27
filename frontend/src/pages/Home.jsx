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
    <div className="overflow-x-hidden min-h-screen relative">
      {/* Premium Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-200/50 mix-blend-multiply filter blur-3xl opacity-70 animate-float pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-indigo-200/50 mix-blend-multiply filter blur-3xl opacity-70 animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20 pb-16 relative z-10 animate-slide-up">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-nav px-5 py-2 text-sm text-primary-700 font-semibold mb-8 shadow-sm">
            <Zap size={15} className="text-saffron-500" />
            AI-Powered • Multilingual • Fraud Secure
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
            {t('heroTitle', language)}{' '}
            <span className="text-gradient block mt-2">
              {t('heroHighlight', language)}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto font-light">
            {t('heroSubtitle', language)}
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link
              to="/chatbot"
              className="group flex items-center justify-center gap-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-medium px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <Bot size={22} className="group-hover:animate-bounce" />
              {t('getStarted', language)}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/eligibility"
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-medium px-8 py-4 rounded-full shadow-sm border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1"
            >
              <Shield size={22} className="text-emerald-500" />
              Check My Eligibility
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Glass Panel ──────────────────────────────── */}
      <section className="relative z-10 -mt-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="glass-card p-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200/50">
          {stats.map(({ value, labelKey, emoji }) => (
            <div key={labelKey} className="text-center pt-6 md:pt-0">
              <div className="text-3xl mb-2">{emoji}</div>
              <div className="text-3xl font-black text-slate-800 tracking-tight">{value}</div>
              <div className="text-sm text-slate-500 mt-1 font-medium uppercase tracking-wider">{t(labelKey, language)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Everything You Need
          </h2>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto font-light">
            A complete AI-powered platform for government scheme awareness and fraud prevention
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon, titleKey, descKey, to, color, bgLight, border }) => (
            <Link
              key={to}
              to={to}
              className={`group glass-card p-10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3`}
              >
                {icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                {t(titleKey, language)}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6 font-light">
                {t(descKey, language)}
              </p>
              <span className="flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:gap-3 transition-all">
                Explore Feature <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Popular Schemes ────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-10 sm:p-14 bg-white/60">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Popular Schemes</h2>
                <p className="text-gray-500 mt-2 font-light text-lg">Most searched government programs</p>
              </div>
              <Link
                to="/eligibility"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full text-primary-700 font-semibold shadow-sm border border-primary-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                See all schemes <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularSchemes.map(({ name, desc, emoji, color }) => (
                <div
                  key={name}
                  className={`group flex items-center gap-5 p-6 rounded-3xl border ${color} bg-white hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1`}
                  onClick={() => window.location.href = '/chatbot'}
                >
                  <div className="w-14 h-14 rounded-full bg-white shadow-sm border flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    {emoji}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{name}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">How GovAI Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: '1', icon: '💬', title: 'Ask in Your Language', desc: 'Type your question in English, Hindi, or Marathi' },
            { step: '2', icon: '🤖', title: 'AI Understands', desc: 'LLM processes your query with deep scheme knowledge' },
            { step: '3', icon: '📋', title: 'Get Matched', desc: 'Receive personalized scheme recommendations' },
            { step: '4', icon: '✅', title: 'Apply Safely', desc: 'Fraud detection ensures safe application processing' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                {step}
              </div>
              <div className="text-3xl mb-3 group-hover:-translate-y-2 transition-transform">{icon}</div>
              <h3 className="font-bold text-gray-900 mb-2 text-xl">{title}</h3>
              <p className="text-base text-gray-500 font-light">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="relative m-4 sm:m-8 rounded-[40px] overflow-hidden gradient-hero shadow-2xl">
        <div className="absolute inset-0 bg-primary-900/10 mix-blend-multiply" />
        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight text-slate-900">
            Ready to find your eligible schemes?
          </h2>
          <p className="text-slate-700 text-xl mb-10 font-light">
            Join millions of Indian citizens already benefiting from government schemes
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link
              to="/chatbot"
              className="flex items-center justify-center gap-3 bg-slate-900 text-white font-semibold px-10 py-5 rounded-full shadow-xl hover:shadow-2xl hover:bg-slate-800 transition-all hover:-translate-y-1"
            >
              <Bot size={20} />
              Start AI Chat
            </Link>
            <Link
              to="/eligibility"
              className="flex items-center justify-center gap-3 bg-white text-primary-700 border border-primary-200 font-semibold px-10 py-5 rounded-full hover:bg-primary-50 transition-all hover:-translate-y-1 shadow-sm"
            >
              <CheckCircle size={20} />
              Check Eligibility
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
