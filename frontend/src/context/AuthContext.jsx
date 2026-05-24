import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminAPI, api } from '../services/api';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => {
    return localStorage.getItem('userToken') || localStorage.getItem('adminToken') || null;
  });
  const [loading, setLoading] = useState(true);

  // Verify auth token on startup
  const verifyAuth = useCallback(async () => {
    const userToken = localStorage.getItem('userToken');
    const adminToken = localStorage.getItem('adminToken');

    if (userToken) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '/api';
        const res = await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        setUser(res.data.data);
        setToken(userToken);
      } catch (err) {
        console.error('User token verification failed:', err.message);
        localStorage.removeItem('userToken');
        localStorage.removeItem('userProfile');
        setUser(null);
      }
    } else if (adminToken) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '/api';
        const res = await axios.get(`${API_URL}/admin/me`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setAdmin(res.data.data);
        setToken(adminToken);
      } catch (err) {
        console.error('Admin token verification failed:', err.message);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setAdmin(null);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  // Citizen Login
  const login = async (email, password) => {
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token: receivedToken, user: profile } = res.data.data;

    localStorage.setItem('userToken', receivedToken);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setToken(receivedToken);
    setUser(profile);
    setAdmin(null);
    return profile;
  };

  // Citizen Register
  const register = async (name, email, password, languagePreference) => {
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const res = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password,
      languagePreference,
    });
    const { token: receivedToken, user: profile } = res.data.data;

    localStorage.setItem('userToken', receivedToken);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setToken(receivedToken);
    setUser(profile);
    setAdmin(null);
    return profile;
  };

  // Admin Login
  const adminLogin = async (username, password) => {
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const res = await axios.post(`${API_URL}/admin/login`, { username, password });
    const { token: receivedToken, admin: profile } = res.data.data;

    localStorage.setItem('adminToken', receivedToken);
    localStorage.setItem('adminUser', JSON.stringify(profile));
    setToken(receivedToken);
    setAdmin(profile);
    setUser(null);
    return profile;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setUser(null);
    setAdmin(null);
  };

  // Update Profile
  const updateProfile = async (name, languagePreference) => {
    const userToken = localStorage.getItem('userToken');
    if (!userToken) throw new Error('No user token found');

    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const res = await axios.put(
      `${API_URL}/auth/profile`,
      { name, languagePreference },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    const updatedProfile = res.data.data;
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    setUser(updatedProfile);
    return updatedProfile;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        token,
        loading,
        login,
        register,
        adminLogin,
        logout,
        updateProfile,
        verifyAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
