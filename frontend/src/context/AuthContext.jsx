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

  // Login: call with { email, password } first.
  //  - If the account has exactly one society/role/flat ("account"), the
  //    response is a full session object (has a `token`) - login is done.
  //  - If it has more than one, the response is { step: 'select', options }
  //    listing every account up front. Call login again with
  //    { email, password, membershipId } using the chosen option's id.
  const login = async ({ email, password, membershipId }) => {
    const res = await api.post('/auth/login', { email, password, membershipId });
    if (res.data.token) {
      persistSession(res.data);
    }
    return res.data;
  };

  // Switch the current session to a different account the same person also
  // has, without re-entering a password (used by the account switcher).
  const switchAccount = async (membershipId) => {
    const res = await api.post('/auth/switch', { membershipId });
    persistSession(res.data);
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
    <AuthContext.Provider value={{ user, login, switchAccount, registerSociety, guestLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
