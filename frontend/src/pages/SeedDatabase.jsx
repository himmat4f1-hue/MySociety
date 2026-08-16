import React, { useState } from 'react';
import { DatabaseZap, Wrench, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

// Standalone utility page - lets you (re)seed the deployed database, or run
// pending non-destructive schema fixes, from a button instead of needing
// Shell/SSH access to the backend (Render's free plan doesn't include
// Shell). Not linked from the main nav; visit /seed-database directly. Uses
// a plain fetch (not the shared `api` client) so a wrong-password 401 here
// never triggers the app's global "log me out" interceptor.
const SeedDatabase = () => {
  const [secret, setSecret] = useState('');

  // "Run Pending Fixes" - safe, non-destructive schema corrections (see
  // backend/utils/migrations/). Never touches data - always safe to click,
  // even repeatedly; already-applied fixes are skipped automatically.
  const [fixStatus, setFixStatus] = useState('idle'); // idle | loading | success | error
  const [fixMessage, setFixMessage] = useState('');

  // "Seed / Reset Demo Data" - DESTRUCTIVE, wipes everything.
  const [seedStatus, setSeedStatus] = useState('idle'); // idle | confirm | loading | success | error
  const [seedMessage, setSeedMessage] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const runFixes = async () => {
    setFixStatus('loading');
    setFixMessage('');
    try {
      const res = await fetch(`${apiUrl}/dev/migrate`, {
        method: 'POST',
        headers: { 'x-seed-secret': secret },
      });
      const data = await res.json();
      if (!res.ok) {
        setFixStatus('error');
        setFixMessage(data.message || 'Something went wrong.');
        return;
      }
      setFixStatus('success');
      setFixMessage(data.message);
    } catch (err) {
      setFixStatus('error');
      setFixMessage('Could not reach the backend. Check that VITE_API_URL is set correctly and the backend is live.');
    }
  };

  const runSeed = async () => {
    setSeedStatus('loading');
    setSeedMessage('');
    try {
      const res = await fetch(`${apiUrl}/dev/seed`, {
        method: 'POST',
        headers: { 'x-seed-secret': secret },
      });
      const data = await res.json();
      if (!res.ok) {
        setSeedStatus('error');
        setSeedMessage(data.message || 'Something went wrong.');
        return;
      }
      setSeedStatus('success');
      setSeedMessage(`Seeded successfully. Demo society: "${data.society}". You can now log in with secretary@mysociety.com / 123456 (or any of the other demo accounts).`);
    } catch (err) {
      setSeedStatus('error');
      setSeedMessage('Could not reach the backend. Check that VITE_API_URL is set correctly and the backend is live.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <label className="block text-sm font-medium text-slate-700 -mb-2">Secret</label>
        <input
          type="password"
          className="input"
          placeholder="Value of SEED_SECRET on the backend"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          disabled={fixStatus === 'loading' || seedStatus === 'loading'}
        />

        {/* Safe section - schema fixes only, no data touched, repeatable. */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wrench size={20} />
            </div>
            <div>
              <h1 className="font-semibold text-slate-800">Run Pending Fixes</h1>
              <p className="text-xs text-slate-500">Safe - never touches your data</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Applies any pending schema corrections (e.g. a constraint change that <code>sequelize.sync</code> alone couldn't finish). Only ever alters schema, never
            deletes or modifies a row of data. Safe to click any time - already-applied fixes are skipped automatically.
          </p>

          <button className="btn-secondary w-full flex items-center justify-center gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50" disabled={!secret || fixStatus === 'loading'} onClick={runFixes}>
            {fixStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Wrench size={16} />} Run Pending Fixes
          </button>

          {fixStatus === 'success' && (
            <div className="mt-3 flex gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800">{fixMessage}</p>
            </div>
          )}
          {fixStatus === 'error' && (
            <div className="mt-3 flex gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <XCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-800">{fixMessage}</p>
            </div>
          )}
        </div>

        {/* Destructive section - wipes everything, kept visually distinct. */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DatabaseZap size={20} />
            </div>
            <div>
              <h1 className="font-semibold text-slate-800">Seed / Reset Demo Data</h1>
              <p className="text-xs text-slate-500">Destructive - one-time setup / reset tool</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              This wipes ALL existing data in the connected database and replaces it with fresh demo data. Only run this on a fresh setup, not on a live society with
              real data - and it does NOT apply schema fixes (use "Run Pending Fixes" above for that instead).
            </p>
          </div>

          {seedStatus !== 'confirm' && (
            <button className="btn-primary w-full flex items-center justify-center gap-2" disabled={!secret || seedStatus === 'loading'} onClick={() => setSeedStatus('confirm')}>
              Seed Database
            </button>
          )}

          {seedStatus === 'confirm' && (
            <div className="space-y-2">
              <p className="text-sm text-slate-700">Are you sure? This will delete all existing data.</p>
              <div className="flex gap-2">
                <button className="btn-secondary flex-1" onClick={() => setSeedStatus('idle')}>
                  Cancel
                </button>
                <button className="btn-primary flex-1" onClick={runSeed}>
                  Yes, wipe &amp; seed
                </button>
              </div>
            </div>
          )}

          {seedStatus === 'loading' && (
            <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 text-sm">
              <Loader2 size={16} className="animate-spin" /> Seeding... this can take up to a minute.
            </div>
          )}

          {seedStatus === 'success' && (
            <div className="mt-4 flex gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800">{seedMessage}</p>
            </div>
          )}

          {seedStatus === 'error' && (
            <div className="mt-4 flex gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <XCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-800">{seedMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeedDatabase;
