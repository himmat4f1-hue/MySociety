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
  // NOTE: kept for internal/back-compat use - the login screen itself now
  // uses requestOtp/verifyOtp below (mobile number + OTP) instead.
  const login = async ({ email, password, membershipId }) => {
    const res = await api.post('/auth/login', { email, password, membershipId });
    if (res.data.token) {
      persistSession(res.data);
    }
    return res.data;
  };

  // Mobile number login, step 1: send (demo: returns) an OTP for this phone.
  const requestOtp = async (phone) => {
    const res = await api.post('/auth/request-otp', { phone });
    return res.data; // { message, demoOtp }
  };

  // Mobile number login, step 2: verify the OTP.
  //  - If the account has exactly one society/role/flat, the response is a
  //    full session object (has a `token`) - login is done.
  //  - If it has more than one, the response is { step: 'select', options }.
  //    Call verifyOtp again with membershipId set to complete login.
  const verifyOtp = async (phone, otp, membershipId) => {
    const res = await api.post('/auth/verify-otp', { phone, otp, membershipId });
    if (res.data.token) {
      persistSession(res.data);
    }
    return res.data;
  };

  // Switch the current session to a different account the same person also
  // has, without re-entering anything (used by the account switcher).
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

  // Used by the Society Setup wizard's final step: /society-setup/complete
  // reissues a fresh token (now with the Secretary's flatId baked in, since
  // the one from registration had flatId: null). Swap it in and refetch
  // /auth/me so the rest of the app sees the completed profile immediately.
  const refreshSessionWithToken = async (newToken) => {
    localStorage.setItem('mysociety_token', newToken);
    const res = await api.get('/auth/me');
    localStorage.setItem('mysociety_user', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('mysociety_token');
    localStorage.removeItem('mysociety_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, requestOtp, verifyOtp, switchAccount, registerSociety, guestLogin, refreshSessionWithToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
