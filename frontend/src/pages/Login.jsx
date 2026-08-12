import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
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
  { role: 'Owner (2 flats) + Secretary - try this one!', email: 'rahul@mysociety.com' },
  { role: 'Tenant', email: 'tenant@mysociety.com' },
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

  // Progressive resolution state: what the last login() call is asking us to pick
  const [pending, setPending] = useState(null); // { step, options, societyId?, societyName?, role? }
  const [selections, setSelections] = useState({}); // accumulated societyId/role/flatId

  const attemptLogin = async (extra = {}) => {
    setError('');
    setLoading(true);
    try {
      const merged = { ...selections, ...extra };
      const result = await login({ email, password, ...merged });
      if (result.step) {
        setPending(result);
        setSelections(merged);
      } else {
        navigate('/app');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSelections({});
    setPending(null);
    attemptLogin({});
  };

  const handlePick = (key, value) => {
    attemptLogin({ [key]: value });
  };

  const handleBack = () => {
    setPending(null);
    setSelections({});
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
                    setPending(null);
                    setSelections({});
                  }}
                  className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                    tab === t.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ---- LOGIN TAB ---- */}
            {tab === 'login' && !pending && (
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

            {/* ---- PROGRESSIVE SELECTION (society / role / flat) ---- */}
            {tab === 'login' && pending && (
              <div>
                {pending.step === 'society' && (
                  <p className="text-sm text-slate-600 mb-4">Your account belongs to more than one society. Which one would you like to enter?</p>
                )}
                {pending.step === 'role' && (
                  <p className="text-sm text-slate-600 mb-4">
                    You have more than one role in <strong>{pending.societyName}</strong>. How are you logging in today?
                  </p>
                )}
                {pending.step === 'flat' && (
                  <p className="text-sm text-slate-600 mb-4">
                    You have more than one flat as {ROLE_LABELS[pending.role] || pending.role} in <strong>{pending.societyName}</strong>. Which flat is this for?
                  </p>
                )}

                <div className="space-y-2 mb-2">
                  {pending.step === 'society' &&
                    pending.options.map((s) => (
                      <button
                        key={s.societyId}
                        disabled={loading}
                        onClick={() => handlePick('societyId', s.societyId)}
                        className="w-full text-left border border-slate-200 rounded-lg px-4 py-3 hover:border-brand-400 hover:bg-brand-50 transition-colors disabled:opacity-50"
                      >
                        <span className="font-medium text-slate-800">{s.name}</span>
                      </button>
                    ))}

                  {pending.step === 'role' &&
                    pending.options.map((r) => (
                      <button
                        key={r.role}
                        disabled={loading}
                        onClick={() => handlePick('role', r.role)}
                        className="w-full text-left border border-slate-200 rounded-lg px-4 py-3 hover:border-brand-400 hover:bg-brand-50 transition-colors disabled:opacity-50 capitalize"
                      >
                        <span className="font-medium text-slate-800">{ROLE_LABELS[r.role] || r.role}</span>
                      </button>
                    ))}

                  {pending.step === 'flat' &&
                    pending.options.map((f) => (
                      <button
                        key={f.flatId}
                        disabled={loading}
                        onClick={() => handlePick('flatId', f.flatId)}
                        className="w-full text-left border border-slate-200 rounded-lg px-4 py-3 hover:border-brand-400 hover:bg-brand-50 transition-colors disabled:opacity-50"
                      >
                        <span className="font-medium text-slate-800">Flat {f.flatId}</span>
                      </button>
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

          {tab === 'login' && !pending && (
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
