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

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data.data);
    }
    return res.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const isConsumer = () => user?.role === 'consumer';
  const isThekedar = () => user?.role === 'thekedar';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isConsumer, isThekedar }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
