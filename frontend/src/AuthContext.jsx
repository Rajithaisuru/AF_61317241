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
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(API_ENDPOINTS.AUTH.ME, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(response.data);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData) => {
    try {
      console.log('Attempting login with:', formData);
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, formData);
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        const userRes = await axios.get(API_ENDPOINTS.AUTH.ME, {
          headers: {
            Authorization: `Bearer ${response.data.token}`
          }
        });
        setUser(userRes.data);
        setIsLoggedIn(true);
        return response.data;
      }
      throw new Error('No token received from server');
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(API_ENDPOINTS.AUTH.LOGOUT, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
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
