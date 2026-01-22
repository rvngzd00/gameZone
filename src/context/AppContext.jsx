import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import translations from '../i18n/translations';

export const AppContext = createContext(null);

// Custom hook to use the AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// 🔗 Backend URL-ni burda dəyiş
const API_BASE = "https://nehemiah-paginal-alan.ngrok-free.dev/";


export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [language, setLanguage] = useState('en');
  const navigate = useNavigate();

  // 🔧 Axios instance
  // const api = axios.create({
  //   baseURL: API_BASE,
  //   withCredentials: true,
  // });
  const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true' // ngrok üçün
    }
  });
  // 🧩 Token interceptor
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // 🚀 İlk açılışda token varsa user-i çək
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      getUserProfile();
    }
    // Load language from localStorage or default
    const savedLang = localStorage.getItem('app_language') || 'en';
    setLanguage(savedLang);
    // set document direction
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  // 👤 USER məlumatlarını çək
  const getUserProfile = async () => {

    try {
      setLoading(true);
      const res = await api.get("/api/Auths/GetCurrentUser/current", { withCredentials: true });
      console.log("User data:", res.data);
      setUser(res.data);
      setBalance(res.data.balance || 0);
    } catch (err) {
      console.error("User fetch error:", err);
      setIsAuthenticated(false);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  // 🔑 LOGIN
  const login = async (credentials) => {
    try {

      setLoading(true);
      const res = await api.post("/api/Auths/Login", credentials);
      const token = typeof res.data === "string" ? res.data : res.data.token;

      if (token) {
        localStorage.setItem("token", token);
        setIsAuthenticated(true);
        await getUserProfile();
        navigate("/");
        return { success: true };
      } else {
        return { success: false, error: "Token tapılmadı" };
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };

  // 📝 REGISTER
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await api.post("/api/Auths/Register", userData);
      const token = typeof res.data === "string" ? res.data : res.data.token;

      if (token) {
        localStorage.setItem("token", token);
        setIsAuthenticated(true);
        await getUserProfile();
        navigate("/");
        return { success: true };
      } else {
        return { success: false, error: "Token tapılmadı" };
      }
    } catch (err) {
      console.error("Register error:", err.response?.data || err.message);
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setBalance(0);
    setIsAuthenticated(false);
    navigate("/login");
  };

  // 💰 BALANCE update
  const updateBalance = (newBalance) => {
    setBalance(newBalance);
    setUser((prev) => ({ ...prev, balance: newBalance }));
  };

  const refreshBalance = async () => {
    try {
      const res = await api.get("/api/Auths/GetCurrentUser/current", { withCredentials: true });
      setBalance(res.data.balance || 0);
    } catch (err) {
      console.error('Balance refresh error:', err);
    }
  };

  // ⚙️ USER update (məs: profil şəkli, ad, email və s.)
  const updateUser = (newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  };

  // --- Language handling (simple, no external libs) ---
  const setAppLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key) => {
    const lang = language || 'en';
    return (translations[lang] && translations[lang][key]) || key;
  };

  // Save profile number + image to backend (best-effort) and update local user
  const saveProfileSelection = async (profileNo, profileImageSrc) => {
    try {
      setLoading(true);
      // Try to persist to backend. Endpoint may differ on your backend.
      // Adjust the URL and payload to match your API.
      await api.post('/api/user/profile-selection', { profileNo });
    } catch (err) {
      console.warn('Profile selection save failed (this is non-blocking):', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }

    // Update local user object so UI reflects choice immediately
    setUser((prev) => ({ ...prev, profileNo, profileImage: profileImageSrc }));
  };

  const value = {
    user,
    balance,
    isAuthenticated,
    loading,
    token: localStorage.getItem("token"),
    login,
    register,
    logout,
    updateBalance,
    refreshBalance,
    updateUser,
    saveProfileSelection,
    getUserProfile,
    // language helpers
    language,
    setAppLanguage,
    t,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppContext;
