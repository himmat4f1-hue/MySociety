import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Building2, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import PublicLayout from '../../components/PublicLayout';
import { useAuth } from '../../context/AuthContext';

const FALLBACK_PLANS = [
  { name: 'Basic', slug: 'basic', pricePerFlatPerMonth: 5, features: ['Visitor & Gate Management', 'Complaints & Maintenance', 'Notice Board', 'Amenities Booking'] },
  { name: 'Standard', slug: 'standard', pricePerFlatPerMonth: 8, isPopular: true, features: ['Everything in Basic', 'Finance & Invoicing', 'Meetings & Voting', 'Documents & Policies'] },
  { name: 'Premium', slug: 'premium', pricePerFlatPerMonth: 12, features: ['Everything in Standard', 'Investments & Funds', 'Staff Shifts & Tasks', 'Gate Passes & Lease Management', 'Priority Support'] },
];

const PlansOffers = () => {
  const { user, registerSociety } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [step, setStep] = useState(0); // 0 = pick plan, 1 = flats, 2 = society details, 3 = admin account
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    societyType: 'Apartment',
    buildingsCount: 4,
    flatsPerBuilding: 15,
    housesCount: 20,
    societyName: '',
    city: '',
    adminName: user?.name || '',
    adminEmail: user?.email || '',
    adminPassword: '',
  });

  useEffect(() => {
    api
      .get('/plans')
      .then((res) => {
        if (res.data?.length) setPlans(res.data);
      })
      .catch(() => {}); // fall back to FALLBACK_PLANS silently
  }, []);

  const totalFlats = form.societyType === 'IndividualHouses'
    ? Number(form.housesCount || 0)
    : Number(form.buildingsCount || 0) * Number(form.flatsPerBuilding || 0);
  const estimatedMonthly = selectedPlan ? (totalFlats * selectedPlan.pricePerFlatPerMonth).toLocaleString('en-IN') : 0;

  const pickPlan = (plan) => {
    setSelectedPlan(plan);
    setStep(1);
  };

  const handleFinalSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await registerSociety({
        societyName: form.societyName,
        city: form.city,
        societyType: form.societyType,
        buildingsCount: form.societyType === 'Apartment' ? Number(form.buildingsCount) : undefined,
        flatsPerBuilding: form.societyType === 'Apartment' ? Number(form.flatsPerBuilding) : undefined,
        housesCount: form.societyType === 'IndividualHouses' ? Number(form.housesCount) : undefined,
        planSlug: selectedPlan?.slug,
        adminName: form.adminName,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
      });
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Plans & Offers</h1>
          <p className="text-slate-500">Simple, transparent pricing based on the number of flats in your society.</p>
        </div>

        {step === 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.slug} className={`card relative flex flex-col ${plan.isPopular ? 'ring-2 ring-brand-500' : ''}`}>
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="font-bold text-lg text-slate-800 mb-1">{plan.name}</h3>
                <p className="text-3xl font-extrabold text-slate-900 mb-1">
                  ₹{plan.pricePerFlatPerMonth}
                  <span className="text-sm font-normal text-slate-500"> / flat / month</span>
                </p>
                <ul className="space-y-2 my-5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => pickPlan(plan)} className="btn-primary w-full">Get Started</button>
              </div>
            ))}
          </div>
        )}

        {step === 1 && selectedPlan && (
          <div className="max-w-lg mx-auto card">
            <p className="text-sm text-brand-600 font-semibold mb-1">Step 1 of 3 &middot; {selectedPlan.name} Plan</p>
            <h3 className="text-xl font-bold text-slate-800 mb-5">How is your society structured?</h3>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setForm({ ...form, societyType: 'Apartment' })}
                className={`border rounded-lg px-4 py-3 text-left ${form.societyType === 'Apartment' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}
              >
                <p className="font-medium text-sm text-slate-800">Apartment / Buildings</p>
                <p className="text-xs text-slate-500">Multiple buildings, each with floors and flats</p>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, societyType: 'IndividualHouses' })}
                className={`border rounded-lg px-4 py-3 text-left ${form.societyType === 'IndividualHouses' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}
              >
                <p className="font-medium text-sm text-slate-800">Individual Houses</p>
                <p className="text-xs text-slate-500">A row/colony of standalone houses</p>
              </button>
            </div>

            {form.societyType === 'Apartment' ? (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">No. of Buildings / Towers</label>
                  <input type="number" min="1" className="input" value={form.buildingsCount} onChange={(e) => setForm({ ...form, buildingsCount: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Flats per Building</label>
                  <input type="number" min="1" className="input" value={form.flatsPerBuilding} onChange={(e) => setForm({ ...form, flatsPerBuilding: e.target.value })} />
                </div>
                <p className="col-span-2 text-xs text-slate-400">
                  This just gets you started quickly - once your society is set up, the Chairman can add/remove buildings and set a different number of floors and flats per floor for each building.
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">No. of Houses</label>
                <input type="number" min="1" className="input" value={form.housesCount} onChange={(e) => setForm({ ...form, housesCount: e.target.value })} />
                <p className="text-xs text-slate-400 mt-1">The Chairman can add or remove individual houses later too.</p>
              </div>
            )}

            <div className="bg-brand-50 rounded-lg p-4 text-sm text-slate-700 mb-6">
              <p>Total {form.societyType === 'IndividualHouses' ? 'Houses' : 'Flats'}: <span className="font-bold">{totalFlats}</span></p>
              <p>Estimated Monthly Cost: <span className="font-bold">₹{estimatedMonthly}</span></p>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(0)} className="btn-secondary flex items-center gap-1"><ArrowLeft size={16} /> Back</button>
              <button onClick={() => setStep(2)} disabled={totalFlats < 1} className="btn-primary flex items-center gap-1 disabled:opacity-50">Next <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-lg mx-auto card">
            <p className="text-sm text-brand-600 font-semibold mb-1">Step 2 of 3</p>
            <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2"><Building2 size={20} /> What's your society called?</h3>
            <p className="text-sm text-slate-500 mb-5">This name is how you'll be identified on the platform - and lets you (or your neighbours) use the same login across different societies if needed.</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Society Name</label>
                <input required className="input" placeholder="e.g. Greenfield Residency" value={form.societyName} onChange={(e) => setForm({ ...form, societyName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input className="input" placeholder="e.g. Mumbai" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-1"><ArrowLeft size={16} /> Back</button>
              <button onClick={() => setStep(3)} disabled={!form.societyName.trim()} className="btn-primary flex items-center gap-1 disabled:opacity-50">Next <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-lg mx-auto card">
            <p className="text-sm text-brand-600 font-semibold mb-1">Step 3 of 3</p>
            <h3 className="text-xl font-bold text-slate-800 mb-5">
              {user ? 'Confirm your admin account' : 'Create your admin account'}
            </h3>

            <div className="space-y-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                <input required className="input" value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" required disabled={!!user} className="input disabled:bg-slate-100" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} />
              </div>
              {!user && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input type="password" required className="input" value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} />
                </div>
              )}
              {user && (
                <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                  You're already logged in as <strong>{user.email}</strong>. This new society will be added to your account -
                  next time you log in, you'll be asked which society to enter.
                </p>
              )}
            </div>

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <div className="flex justify-between mt-4">
              <button onClick={() => setStep(2)} className="btn-secondary flex items-center gap-1"><ArrowLeft size={16} /> Back</button>
              <button onClick={handleFinalSubmit} disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {submitting ? 'Setting up your society...' : 'Confirm & Create Society'}
              </button>
            </div>
          </div>
        )}
      </section>
    </PublicLayout>
  );
};

export default PlansOffers;
