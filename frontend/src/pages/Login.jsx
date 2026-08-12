import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Loader2, Sparkles, ArrowLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PublicLayout from '../components/PublicLayout';

const DEMO_ACCOUNTS = [
  { role: 'Security', email: 'security@mysociety.com' },
  { role: 'Accountant', email: 'accountant@mysociety.com' },
  { role: 'Secretary', email: 'secretary@mysociety.com' },
  { role: 'Chairman (view-only + structure rights)', email: 'chairman@mysociety.com' },
  { role: 'Treasurer', email: 'treasurer@mysociety.com' },
  { role: 'Committee Member', email: 'committee@mysociety.com' },
  { role: 'Housekeeping', email: 'housekeeping@mysociety.com' },
  { role: 'Owner (2 flats) + Secretary', email: 'rahul@mysociety.com' },
  { role: 'Tenant', email: 'tenant@mysociety.com' },
  { role: '3 societies, 3 roles, 5 flats - try this one!', email: 'multiuser@mysociety.com' },
];

const ROLE_LABELS = {
  security: 'Security Staff',
  resident: 'Resident (Owner/Member)',
  accountant: 'Accountant',
  secretary: 'Secretary',
  chairman: 'Chairman',
  treasurer: 'Treasurer',
  committee_member: 'Committee Member',
  tenant: 'Tenant',
  housekeeping: 'Housekeeping Staff',
};

const TABS = [
  { id: 'login', label: 'Login' },
  { id: 'register', label: 'Register' },
  { id: 'forgot', label: 'Forgot Password' },
];

// Groups a flat list of {membershipId, societyId, societyName, role, flatNo, ...}
// options into [{ societyId, societyName, accounts: [...] }] so the picker can
// show one heading per society with all of that society's roles/flats under it.
const groupBySociety = (options) => {
  const bySociety = new Map();
  options.forEach((opt) => {
    if (!bySociety.has(opt.societyId)) {
      bySociety.set(opt.societyId, { societyId: opt.societyId, societyName: opt.societyName, accounts: [] });
    }
    bySociety.get(opt.societyId).accounts.push(opt);
  });
  return [...bySociety.values()];
};

const Login = () => {
  const [tab, setTab] = useState('login');
  const { login, guestLogin } = useAuth();
  const navigate = useNavigate();

  // Login state
  const [email, setEmail] = useState('rahul@mysociety.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  // When the account has more than one society/role/flat, this holds the full
  // list of options returned by the backend so the person can pick directly.
  const [accountOptions, setAccountOptions] = useState(null);
  const [pickLoading, setPickLoading] = useState(null); // membershipId currently being confirmed

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAccountOptions(null);
    setLoading(true);
    try {
      const result = await login({ email, password });
      if (result.step === 'select') {
        setAccountOptions(result.options);
      } else {
        navigate('/app');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickAccount = async (membershipId) => {
    setError('');
    setPickLoading(membershipId);
    try {
      const result = await login({ email, password, membershipId });
      if (result.token) {
        navigate('/app');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not open that account. Please try again.');
    } finally {
      setPickLoading(null);
    }
  };

  const handleBack = () => {
    setAccountOptions(null);
    setError('');
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    setError('');
    try {
      await guestLogin();
      navigate('/app');
    } catch {
      setError('Could not start a guest sandbox right now. Please try again.');
    } finally {
      setGuestLoading(false);
    }
  };

  // Forgot password state
  const [fpStep, setFpStep] = useState(0);
  const [fpEmail, setFpEmail] = useState('');
  const [fpCode, setFpCode] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpDemoCode, setFpDemoCode] = useState('');
  const [fpMessage, setFpMessage] = useState('');
  const [fpError, setFpError] = useState('');
  const [fpLoading, setFpLoading] = useState(false);

  const handleForgotStep1 = async (e) => {
    e.preventDefault();
    setFpError('');
    setFpLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: fpEmail });
      setFpMessage(res.data.message);
      setFpDemoCode(res.data.demoResetCode || '');
      setFpStep(1);
    } catch (err) {
      setFpError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setFpLoading(false);
    }
  };

  const handleForgotStep2 = async (e) => {
    e.preventDefault();
    setFpError('');
    setFpLoading(true);
    try {
      await api.post('/auth/reset-password', { email: fpEmail, code: fpCode, newPassword: fpNewPassword });
      setFpStep(2);
    } catch (err) {
      setFpError(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setFpLoading(false);
    }
  };

  const groupedAccounts = accountOptions ? groupBySociety(accountOptions) : [];

  return (
    <PublicLayout>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mb-3">
              <Building2 size={28} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">MySociety</h1>
            <p className="text-slate-500 text-sm">Society Management System</p>
          </div>

          <div className="card">
            <div className="flex border-b border-slate-200 mb-5 -mt-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    setError('');
                    setAccountOptions(null);
                  }}
                  className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                    tab === t.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ---- LOGIN TAB - email/password form ---- */}
            {tab === 'login' && !accountOptions && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* ---- LOGIN TAB - full account picker (shown when the account has more than one) ---- */}
            {tab === 'login' && accountOptions && (
              <div>
                <p className="text-sm text-slate-600 mb-4">
                  Your account has access to <strong>{accountOptions.length}</strong> {accountOptions.length === 1 ? 'account' : 'accounts'} across{' '}
                  <strong>{groupedAccounts.length}</strong> {groupedAccounts.length === 1 ? 'society' : 'societies'}. Choose which one to open:
                </p>

                <div className="space-y-4 mb-2 max-h-96 overflow-y-auto pr-1">
                  {groupedAccounts.map((group) => (
                    <div key={group.societyId}>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                        <Building2 size={12} /> {group.societyName}
                      </p>
                      <div className="space-y-1.5">
                        {group.accounts.map((acc) => (
                          <button
                            key={acc.membershipId}
                            disabled={pickLoading !== null}
                            onClick={() => handlePickAccount(acc.membershipId)}
                            className="w-full text-left border border-slate-200 rounded-lg px-4 py-2.5 hover:border-brand-400 hover:bg-brand-50 transition-colors disabled:opacity-50 flex items-center justify-between gap-2"
                          >
                            <span>
                              <span className="font-medium text-slate-800 block">{ROLE_LABELS[acc.role] || acc.role}</span>
                              {acc.flatId && <span className="text-xs text-slate-400">Flat {acc.flatNo || acc.flatId}{acc.tower ? ` · ${acc.tower}` : ''}</span>}
                            </span>
                            {pickLoading === acc.membershipId ? (
                              <Loader2 size={16} className="animate-spin text-brand-500 shrink-0" />
                            ) : (
                              <ChevronRight size={16} className="text-slate-300 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
                <button onClick={handleBack} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                  <ArrowLeft size={14} /> Back to login
                </button>
              </div>
            )}

            {/* ---- REGISTER TAB ---- */}
            {tab === 'register' && (
              <div className="text-center py-4">
                <Building2 size={32} className="mx-auto text-brand-500 mb-3" />
                <h3 className="font-semibold text-slate-800 mb-2">Register a New Society</h3>
                <p className="text-sm text-slate-500 mb-5">
                  Creating a society involves choosing a plan and telling us how many buildings/flats (or houses) you have.
                  Head over to Plans & Offers to get started - it only takes a minute. You'll become the Chairman of that society.
                </p>
                <Link to="/plans" className="btn-primary inline-block">Go to Plans & Offers</Link>
                <p className="text-xs text-slate-400 mt-4">
                  Already have an account and want to join an existing society (e.g. as Secretary or a resident)? Ask your society's Chairman or Secretary to add you.
                </p>
              </div>
            )}

            {/* ---- FORGOT PASSWORD TAB ---- */}
            {tab === 'forgot' && fpStep === 0 && (
              <form onSubmit={handleForgotStep1} className="space-y-4">
                <p className="text-sm text-slate-500">Enter your account email and we'll generate a reset code.</p>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" className="input" value={fpEmail} onChange={(e) => setFpEmail(e.target.value)} required />
                </div>
                {fpError && <p className="text-sm text-red-600">{fpError}</p>}
                <button type="submit" disabled={fpLoading} className="btn-primary w-full disabled:opacity-60">
                  {fpLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            )}

            {tab === 'forgot' && fpStep === 1 && (
              <form onSubmit={handleForgotStep2} className="space-y-4">
                <p className="text-sm text-slate-500">{fpMessage}</p>
                {fpDemoCode && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3">
                    <strong>Demo mode:</strong> no email service is configured, so here's your code directly: <span className="font-mono font-bold">{fpDemoCode}</span>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reset Code</label>
                  <input className="input" value={fpCode} onChange={(e) => setFpCode(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input type="password" className="input" value={fpNewPassword} onChange={(e) => setFpNewPassword(e.target.value)} required minLength={6} />
                </div>
                {fpError && <p className="text-sm text-red-600">{fpError}</p>}
                <button type="submit" disabled={fpLoading} className="btn-primary w-full disabled:opacity-60">
                  {fpLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            {tab === 'forgot' && fpStep === 2 && (
              <div className="text-center py-4">
                <p className="text-sm text-slate-700 mb-4">Your password has been reset successfully.</p>
                <button onClick={() => { setTab('login'); setFpStep(0); setEmail(fpEmail); }} className="btn-primary">
                  Back to Login
                </button>
              </div>
            )}
          </div>

          {/* Guest sandbox */}
          <div className="card mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-brand-500" />
              <div>
                <p className="text-sm font-medium text-slate-800">Just exploring?</p>
                <p className="text-xs text-slate-500">Get a free temporary sandbox with sample data.</p>
              </div>
            </div>
            <button onClick={handleGuest} disabled={guestLoading} className="btn-secondary shrink-0 flex items-center gap-1 disabled:opacity-60">
              {guestLoading ? <Loader2 size={14} className="animate-spin" /> : null}
              {guestLoading ? 'Creating...' : 'Try as Guest'}
            </button>
          </div>

          {tab === 'login' && !accountOptions && (
            <div className="card mt-4">
              <p className="text-xs font-semibold text-slate-500 mb-2">DEMO ACCOUNTS (password: 123456)</p>
              <div className="grid grid-cols-1 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword('123456');
                    }}
                    className="text-left text-xs px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    <span className="font-medium block">{acc.role}</span>
                    <span className="text-slate-400">{acc.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default Login;
