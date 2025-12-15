import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

  // ⚙️ USER update (məs: profil şəkli, ad, email və s.)
  const updateUser = (newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
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
    updateUser,
    getUserProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppContext;
