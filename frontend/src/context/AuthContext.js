import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, pdfAPI, highlightsAPI, drawingsAPI } from '../services/api';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Helper to set headers on all api instances
  const setAuthHeaders = (token) => {
    authAPI.defaults.headers.Authorization = `Bearer ${token}`;
    pdfAPI.defaults.headers.Authorization = `Bearer ${token}`;
    highlightsAPI.defaults.headers.Authorization = `Bearer ${token}`;
    drawingsAPI.defaults.headers.Authorization = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete authAPI.defaults.headers.Authorization;
    delete pdfAPI.defaults.headers.Authorization;
    delete highlightsAPI.defaults.headers.Authorization;
    delete drawingsAPI.defaults.headers.Authorization;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
          setLoading(false);
        } else {
          setAuthHeaders(token);
          // **THIS IS THE CRUCIAL FIX:** Fetch user data on page load
          authAPI.get('/me')
            .then(res => {
              setUser(res.data.user);
            })
            .catch(() => {
              // If token is invalid, logout
              logout();
            })
            .finally(() => {
              setLoading(false);
            });
        }
      } catch (error) {
          // Handle invalid token format
          logout();
          setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.post('/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setAuthHeaders(newToken);
      
      return { success: true };
    } catch (error) {
        throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await authAPI.post('/register', { name, email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setAuthHeaders(newToken);
      
      return { success: true };
    } catch (error) {
        throw error;
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};