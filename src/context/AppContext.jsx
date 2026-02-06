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

// Normalize image URL coming from backend.
// - If it's already absolute (http/https) -> return as-is
// - If it contains an uploaded filename/UUID -> prefix with API_BASE
// - Otherwise assume it's a public/local asset path and return as-is (ensure leading slash)
const getImageUrl = (img) => {
  if (!img) return null;
  const trimmed = String(img).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // UUID-like filename detection (e.g. f5c143a9-bca1-4697-8069-4e18b2fb6672.png)
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  if (uuidRegex.test(trimmed)) {
    const base = API_BASE.replace(/\/$/, '');
    return base + (trimmed.startsWith('/') ? trimmed : '/' + trimmed);
  }

  // Fallback: treat as app-local public asset path
  return trimmed.startsWith('/') ? trimmed : '/' + trimmed;
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [language, setLanguage] = useState('en');
  const [recentGames, setRecentGames] = useState([]);
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
      const userData = res.data || {};
      // Normalize image URL so UI can use it directly
      if (userData.image) userData.image = getImageUrl(userData.image);
      setUser(userData);
      setBalance(userData.balance || 0);
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
        navigate("/games");
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
      const userData = res.data || {};
      if (userData.image) userData.image = getImageUrl(userData.image);
      setBalance(userData.balance || 0);
      // keep local user object in sync with refreshed profile
      setUser((prev) => ({ ...prev, ...(userData || {}) }));
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

  // Save profile number + image locally (no backend endpoint available)
  const saveProfileSelection = async (profileNo, profileImageSrc) => {
    // Update local user object so UI reflects choice immediately
    setUser((prev) => ({
      ...prev,
      profileNo,
      profileImage: profileImageSrc,
      // also set `image` normalized so UI components reading `user.image` get updated
      image: getImageUrl(profileImageSrc) || prev?.image,
    }));

    return { success: true };
  };

  // --- Leaderboard / recent games fetch and transform ---
  const formatDateLabel = (iso) => {
    if (!iso) return '—';
    const last = new Date(iso);
    if (isNaN(last)) return '—';
    const now = new Date();
    const diffMs = now - last;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 24) return `${hours} saat əvvəl`;
    const dd = String(last.getDate()).padStart(2, '0');
    const mm = String(last.getMonth() + 1).padStart(2, '0');
    const yy = String(last.getFullYear()).slice(-2);
    return `${dd}.${mm}.${yy}`;
  };

  const formatCoinsString = (num) => {
    const v = Number(num) || 0;
    const s = Number.isInteger(v) ? String(v) : v.toFixed(2);
    return s.replace(/\.00$/, '');
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/api/Leaderboard/player/all');
      console.log('Leaderboard raw response:', res.data);
      const data = Array.isArray(res.data) ? res.data : (res.data && res.data.result) || [];

      const sorted = (data || []).slice().sort((a, b) => {
        const da = a && a.lastGamePlayed ? new Date(a.lastGamePlayed) : new Date(0);
        const db = b && b.lastGamePlayed ? new Date(b.lastGamePlayed) : new Date(0);
        return db - da; // newest first
      });

      const transformed = (sorted || []).map((it, idx) => {
        const totalEarnings = Number(it.totalEarnings) || 0;
        const totalLossAmount = Number(it.totalLossAmount) || 0;
        const isWin = totalEarnings >= totalLossAmount;
        const coinsValue = isWin ? (totalEarnings - totalLossAmount) : (totalLossAmount - totalEarnings);
        const coinsFormatted = (isWin ? '+' : '-') + formatCoinsString(coinsValue);

        return {
          id: idx + 1,
          game: it.gameType || it.GameType || 'Unknown',
          result: isWin ? 'Win' : 'Loss',
          coins: coinsFormatted,
          // keep original for debugging/other UI needs
          raw: it,
          date: formatDateLabel(it.lastGamePlayed),
        };
      });

      // Keep the order as received: first item remains first
      setRecentGames(transformed);
      console.log('Leaderboard data:', transformed);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    }
  };

  // fetch leaderboard on mount and whenever user/token changes
  useEffect(() => {
    fetchLeaderboard();
  }, [user?.id, localStorage.getItem('token')]);

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
    recentGames,
    refreshLeaderboard: fetchLeaderboard,
    // language helpers
    language,
    setAppLanguage,
    t,
    // Derived profile image for components: prefer backend `image`, then local `profileImage`
    profileImage: (user && (user.image || user.profileImage)) || null,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppContext;
