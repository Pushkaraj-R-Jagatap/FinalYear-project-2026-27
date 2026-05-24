import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/translations';
import { User, Mail, Globe, Save, Loader2, LogOut, Bell, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function ProfilePage() {
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const { user, logout, updateProfile, token } = useAuth();
  const { addToast } = useNotifications();

  const [name, setName] = useState(user?.name || '');
  const [langPref, setLangPref] = useState(user?.languagePreference || 'en');
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setName(user.name);
      setLangPref(user.languagePreference);
      fetchNotifications();
    }
  }, [user, navigate]);

  const fetchNotifications = async () => {
    if (!token) return;
    setLoadingNotifs(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      await axios.put(
        `${API_URL}/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      addToast('Success', 'Notification marked as read.', 'success');
    } catch (err) {
      console.error('Failed to mark notification read:', err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(name, langPref);
      changeLanguage(langPref);
      addToast('Profile Updated', 'Your profile details have been saved.', 'success');
    } catch (err) {
      addToast('Update Failed', err.message || 'Could not update profile details.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    addToast('Signed Out', 'You have been successfully logged out.', 'success');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side — User Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card text-center relative overflow-hidden">
            {/* India Flag top bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 india-bar" />
            
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold mx-auto mt-4 shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 mt-4">{user.name}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user.userId || 'Citizen User'}</p>
            <p className="text-sm text-slate-500 flex items-center justify-center gap-1.5 mt-2">
              <Mail size={14} /> {user.email}
            </p>
            
            <div className="border-t border-slate-100 my-6 pt-6 flex justify-around text-xs text-slate-500">
              <div>
                <p className="font-semibold text-slate-800 capitalize">{user.role}</p>
                <p>Role</p>
              </div>
              <div className="border-l border-slate-100" />
              <div>
                <p className="font-semibold text-slate-800 uppercase">{user.languagePreference}</p>
                <p>Language</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-secondary w-full flex items-center justify-center gap-2 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              <LogOut size={16} />
              {t('logout', language)}
            </button>
          </div>
        </div>

        {/* Right Side — Profile Settings & Notifications */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Settings Card */}
          <div className="card">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User size={18} className="text-primary-600" /> Profile Settings
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field pl-10"
                    required
                  />
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="label">Preferred Language</label>
                <div className="relative">
                  <select
                    value={langPref}
                    onChange={(e) => setLangPref(e.target.value)}
                    className="select-field pl-10"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="mr">मराठी (Marathi)</option>
                  </select>
                  <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
                disabled={saving}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving changes...' : 'Save Settings'}
              </button>
            </form>
          </div>

          {/* Notifications Card */}
          <div className="card">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell size={18} className="text-saffron-500" /> System Alerts & Notifications
              </span>
              <button
                onClick={fetchNotifications}
                className="text-xs text-primary-700 font-medium hover:underline"
              >
                Refresh
              </button>
            </h3>

            {loadingNotifs ? (
              <div className="text-center py-8">
                <Loader2 size={24} className="animate-spin text-slate-400 mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>No notifications or alert warnings yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`flex items-start justify-between gap-3 p-4 rounded-2xl border transition-all ${
                      notif.read
                        ? 'bg-slate-50 border-slate-200 opacity-70'
                        : 'bg-primary-50/50 border-primary-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            notif.read ? 'bg-slate-300' : 'bg-primary-500'
                          }`}
                        />
                        <p className="font-bold text-sm text-slate-900">{notif.title}</p>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-light leading-normal">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 block mt-2">
                        {new Date(notif.createdAt).toLocaleDateString('en-IN')} {new Date(notif.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif._id)}
                        className="text-xs text-primary-700 hover:text-primary-900 font-semibold flex items-center gap-1"
                        title="Mark as Read"
                      >
                        <CheckCircle size={14} /> Mark Read
                      </button>
                    )}
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
