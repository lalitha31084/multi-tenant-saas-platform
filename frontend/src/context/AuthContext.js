import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token with backend
          const res = await api.get('/auth/me');
          setUser(res.data.data);
        } catch (err) {
          console.error("Auth check failed", err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password, subdomain) => {
    const res = await api.post('/auth/login', { email, password, tenantSubdomain: subdomain });
    localStorage.setItem('token', res.data.data.token);
    setUser(res.data.data.user);
    return res.data;
  };

  const registerTenant = async (data) => {
    const res = await api.post('/auth/register-tenant', data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    api.post('/auth/logout').catch(err => console.log(err)); // Fire and forget
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerTenant, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};