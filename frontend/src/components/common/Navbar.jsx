import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { t } from '../../utils/translations';
import { Menu, X, Globe, Bot, Home, BarChart3, Shield, ShieldAlert, User, LogIn } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
];

const navLinks = [
  { to: '/', labelKey: 'home', icon: Home },
  { to: '/chatbot', labelKey: 'chatbot', icon: Bot },
  { to: '/eligibility', labelKey: 'eligibility', icon: Shield },
  { to: '/fraud', labelKey: 'fraudDetection', icon: ShieldAlert },
  { to: '/admin', labelKey: 'adminDashboard', icon: BarChart3 },
];

export default function Navbar() {
  const { language, changeLanguage } = useLanguage();
  const { user, admin } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === language);

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 w-full pointer-events-none">
      <header className="glass-nav w-full max-w-6xl pointer-events-auto">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group hover:scale-105 transition-transform">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center shadow-lg ring-2 ring-white/50">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">SchemeAI</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1.5 rounded-2xl bg-slate-50 border border-slate-200 p-1.5">
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

          {/* Right side — language selector & auth */}
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

            {/* User Session Indicator */}
            {user ? (
              <Link
                to="/profile"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 bg-white rounded-xl shadow-sm transition-colors"
              >
                <User size={15} className="text-primary-600" />
                <span>{user.name.split(' ')[0]}</span>
              </Link>
            ) : admin ? (
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 bg-white rounded-xl shadow-sm transition-colors"
              >
                <Shield size={15} className="text-saffron-500 animate-pulse" />
                <span>Admin</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-primary-700 hover:bg-primary-800 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 rounded-b-3xl">
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

            {/* Mobile Auth button */}
            <div className="border-t border-slate-100 pt-2 mt-2">
              {user ? (
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <User size={16} className="text-primary-600" />
                  <span>Profile ({user.name})</span>
                </Link>
              ) : admin ? (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Shield size={16} className="text-saffron-500" />
                  <span>Admin Dashboard</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-primary-700 hover:bg-primary-800"
                >
                  <LogIn size={16} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

