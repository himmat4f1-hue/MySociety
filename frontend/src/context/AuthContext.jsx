import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mysociety_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mysociety_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('mysociety_user', JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem('mysociety_token');
        localStorage.removeItem('mysociety_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (data) => {
    localStorage.setItem('mysociety_token', data.token);
    localStorage.setItem('mysociety_user', JSON.stringify(data));
    setUser(data);
  };

  // Progressive login: call with { email, password } first. The response is
  // EITHER { step: 'society'|'role'|'flat', options: [...] } - meaning the
  // person needs to pick something before we can continue - OR a full session
  // object (has a `token`), meaning login is complete. Re-call this same
  // function again with the accumulated selections (societyId/role/flatId)
  // until you get a session back.
  const login = async ({ email, password, societyId, role, flatId }) => {
    const res = await api.post('/auth/login', { email, password, societyId, role, flatId });
    if (res.data.token) {
      persistSession(res.data);
    }
    return res.data;
  };

  const registerSociety = async (payload) => {
    const res = await api.post('/auth/register-society', payload);
    persistSession(res.data);
    return res.data;
  };

  const guestLogin = async () => {
    const res = await api.post('/auth/guest');
    persistSession(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('mysociety_token');
    localStorage.removeItem('mysociety_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, registerSociety, guestLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
