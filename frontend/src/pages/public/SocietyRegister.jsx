import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Loader2, CheckCircle2, XCircle, Phone, User, CreditCard, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import PublicLayout from '../../components/PublicLayout';

const STEPS = ['Society', 'Verify', 'Plan', 'Payment'];

const SocietyRegister = () => {
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Card 1 - Society Name + Zip Code
  const [societyName, setSocietyName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [availability, setAvailability] = useState(null); // null | 'checking' | 'available' | 'unavailable'

  // Card 2 - Name + Mobile + OTP
  const [adminName, setAdminName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');
  const [otp, setOtp] = useState('');

  // Card 3 - Plan
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Card 4 - Payment (placeholder) + final submit
  const [done, setDone] = useState(false);

  const checkAvailability = async (e) => {
    e.preventDefault();
    if (!societyName.trim() || !zipCode.trim()) return;
    setError('');
    setAvailability('checking');
    try {
      const res = await api.post('/auth/check-society-availability', { societyName, zipCode });
      setAvailability(res.data.available ? 'available' : 'unavailable');
    } catch (err) {
      setAvailability(null);
      setError(err.response?.data?.message || 'Could not check availability. Please try again.');
    }
  };

  const goToVerify = () => {
    setError('');
    setStep(1);
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!adminName.trim() || !mobile.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register/send-otp', { mobile });
      setDemoOtp(res.data.demoOtp || '');
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register/verify-otp', { mobile, otp });
      // Load plans for Card 3 now that mobile is verified.
      const res = await api.get('/plans');
      setPlans(res.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const choosePlan = (plan) => {
    setSelectedPlan(plan);
    setError('');
    setStep(3);
  };

  // "Payment" is a placeholder for now (per spec: "abhi ke liye bina payment
  // ka age ka process kardena") - clicking straight through finalizes
  // registration. No token is issued/persisted here on purpose: the person
  // is asked to go log in via mobile + OTP afterward instead of being
  // auto-logged-in.
  const finishRegistration = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register-society', {
        societyName,
        zipCode,
        adminName,
        mobile,
        planSlug: selectedPlan?.slug,
      });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md card text-center">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Your society is registered!</h2>
            <p className="text-sm text-slate-600 mb-6">
              <strong>{societyName}</strong> (Zip {zipCode}) has been created and you've been set up as its Secretary. Please go to the login page and sign in with your
              mobile number <strong>{mobile}</strong> to finish setting up your buildings, floors, and flats.
            </p>
            <Link to="/login" className="btn-primary inline-block">
              Go to Login
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mb-3">
              <Building2 size={28} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Register Your Society</h1>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${i <= step ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {i + 1}
                </span>
                {i < STEPS.length - 1 && <span className={`w-6 h-0.5 ${i < step ? 'bg-brand-600' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="card">
            {/* ---- CARD 1: Society Name + Zip Code ---- */}
            {step === 0 && (
              <form onSubmit={checkAvailability} className="space-y-4">
                <h3 className="font-semibold text-slate-800">Society Details</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Society Name *</label>
                  <input
                    className="input"
                    value={societyName}
                    onChange={(e) => {
                      setSocietyName(e.target.value);
                      setAvailability(null);
                    }}
                    placeholder="e.g. Greenfield Residency"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zip Code *</label>
                  <input
                    className="input"
                    value={zipCode}
                    onChange={(e) => {
                      setZipCode(e.target.value);
                      setAvailability(null);
                    }}
                    placeholder="e.g. 380015"
                    required
                  />
                </div>
                <p className="text-xs text-slate-400">Every society is listed by its name + zip code together - this combination must be unique.</p>

                {error && <p className="text-sm text-red-600">{error}</p>}

                {availability === 'unavailable' && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 flex items-center gap-2">
                    <XCircle size={16} className="shrink-0" /> Not Available. A society with this name and zip code is already registered.
                  </div>
                )}
                {availability === 'available' && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg p-3 flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0" /> Available! You can proceed.
                  </div>
                )}

                {availability !== 'available' ? (
                  <button type="submit" disabled={availability === 'checking'} className="btn-primary w-full disabled:opacity-60">
                    {availability === 'checking' ? 'Checking...' : 'Check Availability'}
                  </button>
                ) : (
                  <button type="button" onClick={goToVerify} className="btn-primary w-full">
                    Next
                  </button>
                )}
              </form>
            )}

            {/* ---- CARD 2: Name + Mobile + Verify ---- */}
            {step === 1 && (
              <form onSubmit={otpSent ? verifyOtp : sendOtp} className="space-y-4">
                <button type="button" onClick={() => setStep(0)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 -mt-1 -mb-1">
                  <ArrowLeft size={12} /> Back
                </button>
                <h3 className="font-semibold text-slate-800">Your Details</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="input pl-9" value={adminName} onChange={(e) => setAdminName(e.target.value)} disabled={otpSent} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="tel" className="input pl-9" value={mobile} onChange={(e) => setMobile(e.target.value)} disabled={otpSent} required />
                    </div>
                    {!otpSent && (
                      <button type="submit" disabled={loading} className="btn-primary shrink-0 disabled:opacity-60">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
                      </button>
                    )}
                  </div>
                </div>

                {otpSent && (
                  <>
                    {demoOtp && (
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3">
                        <strong>Demo mode:</strong> your verification code is <span className="font-mono font-bold">{demoOtp}</span>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code *</label>
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
                  </>
                )}
                {!otpSent && error && <p className="text-sm text-red-600">{error}</p>}
              </form>
            )}

            {/* ---- CARD 3: Plan Selection ---- */}
            {step === 2 && (
              <div className="space-y-3">
                <button type="button" onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 -mt-1 -mb-1">
                  <ArrowLeft size={12} /> Back
                </button>
                <h3 className="font-semibold text-slate-800">Choose a Plan</h3>
                {!plans.length && <p className="text-sm text-slate-400">Loading plans...</p>}
                {plans.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => choosePlan(p)}
                    className="w-full text-left border border-slate-200 rounded-lg px-4 py-3 hover:border-brand-400 hover:bg-brand-50 transition-colors flex items-center justify-between"
                  >
                    <span>
                      <span className="font-medium text-slate-800 flex items-center gap-2">
                        {p.name} {p.isPopular && <span className="badge bg-brand-100 text-brand-700">Popular</span>}
                      </span>
                      <span className="text-xs text-slate-400">₹{p.pricePerFlatPerMonth}/flat/month</span>
                    </span>
                    <span className="text-brand-600 text-sm font-medium">Select →</span>
                  </button>
                ))}
              </div>
            )}

            {/* ---- CARD 4: Payment placeholder ---- */}
            {step === 3 && (
              <div className="space-y-4">
                <button type="button" onClick={() => setStep(2)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 -mt-1 -mb-1">
                  <ArrowLeft size={12} /> Back
                </button>
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <CreditCard size={17} /> Payment
                </h3>
                <div className="bg-slate-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Plan</span>
                    <span className="font-medium text-slate-800">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Rate</span>
                    <span className="font-medium text-slate-800">₹{selectedPlan?.pricePerFlatPerMonth}/flat/month</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">Payment integration isn't wired up yet - clicking below completes your registration directly.</p>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button onClick={finishRegistration} disabled={loading} className="btn-primary w-full disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading && <Loader2 size={16} className="animate-spin" />} {loading ? 'Finishing up...' : 'Complete Registration'}
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-slate-400 mt-4">
            Already have a society?{' '}
            <Link to="/login" className="text-brand-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};

export default SocietyRegister;
