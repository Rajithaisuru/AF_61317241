// src/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from './config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.AUTH.ME, {
        withCredentials: true
      });
      setUser(response.data);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, formData, {
        withCredentials: true
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      const userRes = await axios.get(API_ENDPOINTS.AUTH.ME, {
        withCredentials: true
      });
      
      setUser(userRes.data);
      setIsLoggedIn(true);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
