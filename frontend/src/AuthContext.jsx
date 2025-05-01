// src/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from './config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:5005/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        setUser(res.data);
        setIsLoggedIn(true);
      })
      .catch(err => {
        console.error('Failed to fetch user:', err);
        setUser(null);
        setIsLoggedIn(false);
      });
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.AUTH.ME, {
        withCredentials: true
      });
      setUser(response.data);
    } catch (error) {
      setUser(null);
    }
  };

  const login = async (formData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, formData, {
        withCredentials: true
      });
      const userRes = await axios.get(API_ENDPOINTS.AUTH.ME, {
        withCredentials: true
      });
      setUser(userRes.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
