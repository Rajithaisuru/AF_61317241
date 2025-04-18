// src/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
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

  const login = async (formData) => {
    const response = await axios.post('http://localhost:5005/api/auth/login', formData);
    localStorage.setItem('token', response.data.token);
    const userRes = await axios.get('http://localhost:5005/api/auth/me', {
      headers: { Authorization: `Bearer ${response.data.token}` },
    });
    setUser(userRes.data);
    setIsLoggedIn(true);
    return userRes.data; // return user info after login
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
