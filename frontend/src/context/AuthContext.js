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

  // **FIX:** A helper function to ensure the token is set on ALL API instances
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
    const tokenInStorage = localStorage.getItem('token');
    if (tokenInStorage) {
      try {
        const decoded = jwtDecode(tokenInStorage);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
          setLoading(false);
        } else {
          setAuthHeaders(tokenInStorage);
          // **FIX:** This fetches user data on page refresh, preventing redirection
          authAPI.get('/me')
            .then(res => {
              setUser(res.data.user);
            })
            .catch(() => logout()) // If token is invalid, log out
            .finally(() => setLoading(false));
        }
      } catch (error) {
        // If token is malformed
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.post('/login', { email, password });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    setAuthHeaders(newToken); // Use the helper
    return { success: true };
  };

  const register = async (name, email, password) => {
    const response = await authAPI.post('/register', { name, email, password });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    setAuthHeaders(newToken); // Use the helper
    return { success: true };
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