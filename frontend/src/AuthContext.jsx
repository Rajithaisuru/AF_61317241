// src/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from './config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false); // No need to checkAuth on mount

  // Remove checkAuth on mount, since there's no persistent token
  // useEffect(() => {
  //   checkAuth();
  // }, []);

  // No persistent token, so always not authenticated on refresh
  const checkAuth = async () => {
    setUser(null);
    setIsLoggedIn(false);
    setLoading(false);
  };

  // Store token only in memory for this session
  let sessionToken = null;

  const login = async (formData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, formData);
      if (response.data.token) {
        sessionToken = response.data.token;
        const userRes = await axios.get(API_ENDPOINTS.AUTH.ME, {
          headers: {
            Authorization: `Bearer ${sessionToken}`
          }
        });
        setUser(userRes.data);
        setIsLoggedIn(true);
        return response.data;
      }
      throw new Error('No token received from server');
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        await axios.post(API_ENDPOINTS.AUTH.LOGOUT, {}, {
          headers: {
            Authorization: `Bearer ${sessionToken}`
          }
        });
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      sessionToken = null;
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
