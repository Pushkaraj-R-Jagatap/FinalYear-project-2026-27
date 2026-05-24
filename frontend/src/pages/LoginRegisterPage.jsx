import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/translations';
import { Shield, Mail, Lock, User, Globe, Loader2, ArrowRight } from 'lucide-react';

export default function LoginRegisterPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { addToast } = useNotifications();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    languagePreference: 'en',
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(loginForm.email, loginForm.password);
      addToast('Welcome Back!', 'You have successfully signed in.', 'success');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
      addToast('Sign In Failed', 'Please check your credentials and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      await register(
        registerForm.name,
        registerForm.email,
        registerForm.password,
        registerForm.languagePreference
      );
      addToast('Registration Successful', 'Welcome to SchemeAI! Your account is active.', 'success');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
      addToast('Registration Failed', 'Please try again with a different email.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 relative">
      {/* Dynamic Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary-100/50 filter blur-3xl opacity-50 pointer-events-none" />

      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 shadow-2xl p-8 w-full max-w-md relative z-10">
        {/* Logo and Tabs */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Shield size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Scheme<span className="text-gradient">AI</span> Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">Access Indian Government Schemes Safely</p>
        </div>

        {/* Form Selector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              isLogin ? 'bg-white text-primary-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('login', language)}
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              !isLogin ? 'bg-white text-primary-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('register', language) || 'Register'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-4 py-2.5">
            ⚠️ {error}
          </div>
        )}

        {/* Forms */}
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="label">{t('email', language) || 'Email Address'}</label>
              <div className="relative">
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="name@example.com"
                  className="input-field pl-10"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label mb-0">{t('password', language)}</label>
                <button
                  type="button"
                  onClick={() => addToast('Forgot Password', 'Please contact support at support@govai.in to reset your password.', 'info')}
                  className="text-xs text-primary-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="input-field pl-10"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              disabled={loading}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? 'Logging in...' : t('signIn', language)}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="label">{t('name', language) || 'Full Name'}</label>
              <div className="relative">
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ranjit Patil"
                  className="input-field pl-10"
                  required
                />
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="label">{t('email', language) || 'Email Address'}</label>
              <div className="relative">
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="name@example.com"
                  className="input-field pl-10"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('password', language)}</label>
                <div className="relative">
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Min 6 chars"
                    className="input-field pl-10"
                    required
                  />
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="label">Confirm</label>
                <div className="relative">
                  <input
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Repeat"
                    className="input-field pl-10"
                    required
                  />
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Preferred Language</label>
              <div className="relative">
                <select
                  value={registerForm.languagePreference}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, languagePreference: e.target.value }))}
                  className="select-field pl-10"
                >
                  <option value="en">🇬🇧 English</option>
                  <option value="hi">🇮🇳 हिंदी (Hindi)</option>
                  <option value="mr">🇮🇳 मराठी (Marathi)</option>
                </select>
                <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              disabled={loading}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
