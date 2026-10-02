import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('gighub_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('gighub_token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const storedToken = localStorage.getItem('gighub_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      const profileUser = response?.data?.user;
      setUser(profileUser);
      localStorage.setItem('gighub_user', JSON.stringify(profileUser));
      setToken(storedToken);
    } catch (error) {
      console.error('Error restoring session:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('gighub_token');
      localStorage.removeItem('gighub_user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (payload) => {
    const response = await authService.login(payload);
    const authData = response?.data;

    if (authData?.token) {
      localStorage.setItem('gighub_token', authData.token);
      localStorage.setItem('gighub_user', JSON.stringify(authData.user));
      setToken(authData.token);
      setUser(authData.user);
    }

    return response;
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    const authData = response?.data;

    if (authData?.token) {
      localStorage.setItem('gighub_token', authData.token);
      localStorage.setItem('gighub_user', JSON.stringify(authData.user));
      setToken(authData.token);
      setUser(authData.user);
    }

    return response;
  };

  const logout = () => {
    localStorage.removeItem('gighub_token');
    localStorage.removeItem('gighub_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: !!token && !!user,
      loading
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
