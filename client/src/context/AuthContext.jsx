import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        if (res.data.success) {
          setUser(res.data.data);
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Login from API call — used by Login page
  const loginFromApi = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      // Fetch full user data
      const meRes = await api.get('/auth/me');
      setUser(meRes.data.data);
      return meRes.data;
    }
    return res.data;
  };

  // Set user directly — used after login page gets user from /auth/me
  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore errors
    } finally {
      setUser(null);
    }
  };

  const isConsumer = () => user?.role === 'consumer';
  const isThekedar = () => user?.role === 'thekedar';

  return (
    <AuthContext.Provider value={{ user, loading, login, loginFromApi, logout, isConsumer, isThekedar }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
