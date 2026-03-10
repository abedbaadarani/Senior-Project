import React, { createContext, useState, useEffect, useContext } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await client('/auth/me');
          setUser(data.user);
        } catch (error) {
          console.error('Failed to load user profile, token might be expired', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await client('/auth/login', { body: { email, password } });
    localStorage.setItem('token', data.token);

    // Fetch profile
    const profileData = await client('/auth/me');
    setUser(profileData.user);
  };

  const logout = async () => {
    try {
      await client('/auth/logout', { body: {} });
    } catch (e) {
      console.error('Logout error', e);
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  const setupPassword = async (oldPassword, newPassword) => {
    const data = await client('/auth/change-password', {
      method: 'POST',
      body: { oldPassword, newPassword }
    });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const updateUser = async (profileData) => {
    const data = await client('/auth/me', {
      method: 'PUT',
      body: profileData
    });
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setupPassword, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
