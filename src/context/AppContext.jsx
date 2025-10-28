import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(7777);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const navigate = useNavigate();

  const login = async (credentials) => {
    try {
      // Here you would make your API call
      // For now, we'll simulate a successful login
      setUser({
        id: '1',
        username: credentials.email,
        // other user data
      });
      setBalance(1000); // Example initial balance
      setIsAuthenticated(true);
      navigate('/');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      // Here you would make your API call
      // For now, we'll simulate a successful registration
      setUser({
        id: '1',
        username: userData.email,
        // other user data
      });
      setBalance(500); // Example initial balance for new users
      setIsAuthenticated(true);
      navigate('/');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setBalance(0);
    setIsAuthenticated(false);
    navigate('/');
  };

  const updateBalance = (newBalance) => {
    setBalance(newBalance);
  };

  const value = {
    user,
    setUser,
    balance,
    updateBalance,
    isAuthenticated,
    login,
    register,
    logout
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}

export default AppContext;
