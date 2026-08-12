import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, ShieldCheck, Wallet, Users, MessageSquareWarning, Vote,
  Megaphone, KeyRound, ArrowRight, CheckCircle2,
} from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

const features = [
  { icon: Users, title: 'Residents & Units', desc: 'Manage every resident, owner, tenant and flat in one directory - even multiple flats per owner.' },
  { icon: ShieldCheck, title: 'Visitors & Security', desc: 'Gate passes, visitor logs, camera check requests and emergency SOS alerts.' },
  { icon: MessageSquareWarning, title: 'Complaints & Maintenance', desc: 'Log, assign and track every complaint and maintenance request to resolution.' },
  { icon: Wallet, title: 'Finance & Invoicing', desc: 'Collections, expenses, dues, receipts and clear financial reports.' },
  { icon: Vote, title: 'Meetings & Voting', desc: 'Schedule meetings and run society polls with live results.' },
  { icon: Megaphone, title: 'Notices & Documents', desc: 'Publish notices and keep every society document organised and accessible.' },
];

const roles = [
  'Admin', 'Chairman', 'Secretary', 'Treasurer', 'Accountant',
  'Committee Member', 'Security Staff', 'Housekeeping', 'Resident / Member', 'Tenant',
];

const Home = () => {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full mb-5">
            <Building2 size={14} /> Built for modern residential societies
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
            Run your entire society, from one dashboard.
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            MySociety brings residents, security, accountants, committee members and management
            together on a single platform - visitors, complaints, maintenance, finance, meetings,
            voting and more, with a dedicated view for every role.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/plans" className="btn-primary flex items-center gap-2 px-6 py-3 text-base">
              View Plans & Offers <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary px-6 py-3 text-base">
              Try as Guest (Free Sandbox)
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-3">No credit card required to explore the sandbox.</p>
        </div>

        <div className="bg-gradient-to-br from-brand-50 to-slate-50 rounded-2xl border border-slate-200 p-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <p className="text-sm font-semibold text-slate-800 mb-4">Everything your committee needs</p>
            <div className="space-y-3">
              {['Multi-tenant, secure per-society data', '10 role-based dashboards out of the box', 'Guest sandbox to try before you buy', 'Plan pricing based on number of flats'].map((t) => (
                <div key={t} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-100">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-2">Everything, in one platform</h2>
        <p className="text-slate-500 text-center mb-12">Modules built specifically for residential society operations.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card">
              <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <f.icon size={22} />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="bg-slate-50 border-y border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-2">A dedicated view for every role</h2>
          <p className="text-slate-500 text-center mb-10">Each person only sees what's relevant to them.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {roles.map((r) => (
              <span key={r} className="bg-white border border-slate-200 rounded-full px-4 py-2 text-sm font-medium text-slate-700 flex items-center gap-2">
                <KeyRound size={14} className="text-brand-500" /> {r}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to digitize your society?</h2>
        <p className="text-slate-500 mb-8">Pick a plan based on your number of flats, or explore a free guest sandbox first - no commitment.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/plans" className="btn-primary px-6 py-3 text-base">See Plans & Offers</Link>
          <Link to="/contact" className="btn-secondary px-6 py-3 text-base">Talk to Us</Link>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Home;
