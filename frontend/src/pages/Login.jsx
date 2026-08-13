import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Loader2, Sparkles, ArrowLeft, ChevronRight, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PublicLayout from '../components/PublicLayout';

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
  const { requestOtp, verifyOtp, guestLogin } = useAuth();
  const navigate = useNavigate();

  // Mobile + OTP state
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'select'
  const [demoOtp, setDemoOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  // Once OTP is verified, if the account has more than one society/role/flat,
  // this holds the full list of options so the person can pick directly.
  const [accountOptions, setAccountOptions] = useState(null);
  const [pickLoading, setPickLoading] = useState(null); // membershipId currently being confirmed

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await requestOtp(phone);
      setDemoOtp(result.demoOtp || '');
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send OTP. Please check the number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await verifyOtp(phone, otp);
      if (result.step === 'select') {
        setAccountOptions(result.options);
        setStep('select');
      } else if (result.token) {
        navigate('/app');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickAccount = async (membershipId) => {
    setError('');
    setPickLoading(membershipId);
    try {
      const result = await verifyOtp(phone, otp, membershipId);
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
    if (step === 'select') {
      setStep('otp');
      setAccountOptions(null);
    } else if (step === 'otp') {
      setStep('phone');
      setOtp('');
      setDemoOtp('');
    }
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
                    setStep('phone');
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

            {/* ---- LOGIN TAB - step 1: mobile number ---- */}
            {tab === 'login' && step === 'phone' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      className="input pl-9"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            )}

            {/* ---- LOGIN TAB - step 2: enter OTP ---- */}
            {tab === 'login' && step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-sm text-slate-600">
                  Enter the OTP sent to <strong>{phone}</strong>.
                </p>
                {demoOtp && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3">
                    <strong>Demo mode:</strong> no SMS service is configured, so here's your code directly: <span className="font-mono font-bold">{demoOtp}</span>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">OTP</label>
                  <input
                    className="input tracking-widest text-center text-lg"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
                <button type="button" onClick={handleBack} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                  <ArrowLeft size={14} /> Change mobile number
                </button>
              </form>
            )}

            {/* ---- LOGIN TAB - step 3: full account picker (shown when the account has more than one) ---- */}
            {tab === 'login' && step === 'select' && (
              <div>
                <p className="text-sm text-slate-600 mb-4">
                  Your account has access to <strong>{accountOptions.length}</strong> {accountOptions.length === 1 ? 'account' : 'accounts'} across{' '}
                  <strong>{groupedAccounts.length}</strong> {groupedAccounts.length === 1 ? 'society' : 'societies'}. Choose which one to open:
                </p>

                <div className="space-y-4 mb-2">
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

                  {/* Guest sandbox, listed as the last option per the account list */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                      <Sparkles size={12} /> Just Exploring
                    </p>
                    <button
                      disabled={pickLoading !== null || guestLoading}
                      onClick={handleGuest}
                      className="w-full text-left border border-dashed border-slate-300 rounded-lg px-4 py-2.5 hover:border-brand-400 hover:bg-brand-50 transition-colors disabled:opacity-50 flex items-center justify-between gap-2"
                    >
                      <span>
                        <span className="font-medium text-slate-800 block">Try as Guest</span>
                        <span className="text-xs text-slate-400">Free temporary sandbox with sample data</span>
                      </span>
                      {guestLoading ? <Loader2 size={16} className="animate-spin text-brand-500 shrink-0" /> : <ChevronRight size={16} className="text-slate-300 shrink-0" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
                <button onClick={handleBack} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                  <ArrowLeft size={14} /> Back
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
          </div>

          {/* Guest sandbox - only shown before OTP verification; once verified, it's the last item in the account list above */}
          {tab === 'login' && step !== 'select' && (
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
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default Login;
