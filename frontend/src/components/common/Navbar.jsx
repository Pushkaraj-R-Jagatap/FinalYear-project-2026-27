import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { t } from '../../utils/translations';
import { Menu, X, Globe, Bot, Home, BarChart3, Shield } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
];

const navLinks = [
  { to: '/', labelKey: 'home', icon: Home },
  { to: '/chatbot', labelKey: 'chatbot', icon: Bot },
  { to: '/eligibility', labelKey: 'eligibility', icon: Shield },
  { to: '/admin', labelKey: 'adminDashboard', icon: BarChart3 },
];

export default function Navbar() {
  const { language, changeLanguage } = useLanguage();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === language);

  return (
    <header className="bg-white/95 backdrop-blur sticky top-0 z-50 border-b border-slate-200 shadow-sm">
      {/* India tricolor accent bar */}
      <div className="h-1 india-bar" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f5d67a] via-[#d9b14a] to-[#a77c1b] flex items-center justify-center shadow-sm ring-2 ring-white">
              <Bot size={18} className="text-primary-800" />
            </div>
            <div>
              <span className="text-xl font-bold text-primary-900">SchemeAI</span>
              <span className="text-xl font-semibold text-primary-700"> Assistant</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5 rounded-2xl bg-slate-50 border border-slate-200 p-1.5">
            {navLinks.map(({ to, labelKey, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-white text-primary-800 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                >
                  <Icon size={15} />
                  {t(labelKey, language)}
                </Link>
              );
            })}
          </nav>

          {/* Right side — language selector */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600
                           hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 bg-white shadow-sm"
              >
                <Globe size={15} />
                <span>{currentLang?.flag} {currentLang?.label}</span>
              </button>

              {langDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-lg border border-slate-200 py-1 z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setLangDropdown(false);
                      }}
                      className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors
                        ${language === lang.code ? 'text-primary-700 font-medium bg-primary-50' : 'text-slate-700'}`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                      {language === lang.code && <span className="ml-auto text-primary-600">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map(({ to, labelKey, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <Icon size={16} />
                {t(labelKey, language)}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
