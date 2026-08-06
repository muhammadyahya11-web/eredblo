import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const invalidateSession = (event) => {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      toast.error(event.detail || 'Your session is no longer authorized.');
    };
    window.addEventListener('auth:session-invalid', invalidateSession);
    return () => window.removeEventListener('auth:session-invalid', invalidateSession);
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const { data } = await authAPI.login({ email, password });

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setToken(data.token);
        setUser(data);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        return { success: true, data };
      }

      toast.error(data.message || 'Login failed');
      return { success: false, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOTP = async (email, otp) => {
    try {
      setIsLoading(true);
      const { data } = await authAPI.loginWithOTP({ email, otp });

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setToken(data.token);
        setUser(data);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        return { success: true, data };
      }

      toast.error(data.message || 'OTP login failed');
      return { success: false, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'OTP login failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const sendLoginOTP = async (email) => {
    try {
      const { data } = await authAPI.sendLoginOTP({ email });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to send OTP';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const { data } = await authAPI.register(userData);
      if (data.success) {
        toast.success(data.message || 'Registration successful!');
        return { success: true, data };
      }
      toast.error(data.message || 'Registration failed');
      return { success: false, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, loginWithOTP, sendLoginOTP, register, logout, updateUser, setUser, setToken, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
