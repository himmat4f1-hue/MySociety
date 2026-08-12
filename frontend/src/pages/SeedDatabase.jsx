import React, { useState } from 'react';
import { DatabaseZap, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

// Standalone utility page - lets you (re)seed the deployed database from a
// button instead of needing Shell/SSH access to the backend (Render's free
// plan doesn't include Shell). Not linked from the main nav; visit
// /seed-database directly. Uses a plain fetch (not the shared `api` client)
// so a wrong-password 401 here never triggers the app's global "log me out"
// interceptor.
const SeedDatabase = () => {
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState('idle'); // idle | confirm | loading | success | error
  const [message, setMessage] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const runSeed = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch(`${apiUrl}/dev/seed`, {
        method: 'POST',
        headers: { 'x-seed-secret': secret },
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.message || 'Something went wrong.');
        return;
      }
      setStatus('success');
      setMessage(`Seeded successfully. Demo society: "${data.society}". You can now log in with secretary@mysociety.com / 123456 (or any of the other demo accounts).`);
    } catch (err) {
      setStatus('error');
      setMessage('Could not reach the backend. Check that VITE_API_URL is set correctly and the backend is live.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <DatabaseZap size={20} />
          </div>
          <div>
            <h1 className="font-semibold text-slate-800">Seed Database</h1>
            <p className="text-xs text-slate-500">One-time setup / reset tool</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex gap-2">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            This wipes ALL existing data in the connected database and replaces it with fresh demo data. Only run this on a fresh setup, not on a live society with real data.
          </p>
        </div>

        <label className="block text-sm font-medium text-slate-700 mb-1">Seed Secret</label>
        <input
          type="password"
          className="input mb-3"
          placeholder="Value of SEED_SECRET on the backend"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          disabled={status === 'loading'}
        />

        {status !== 'confirm' && (
          <button
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={!secret || status === 'loading'}
            onClick={() => setStatus('confirm')}
          >
            Seed Database
          </button>
        )}

        {status === 'confirm' && (
          <div className="space-y-2">
            <p className="text-sm text-slate-700">Are you sure? This will delete all existing data.</p>
            <div className="flex gap-2">
              <button className="btn-secondary flex-1" onClick={() => setStatus('idle')}>
                Cancel
              </button>
              <button className="btn-primary flex-1" onClick={runSeed}>
                Yes, wipe &amp; seed
              </button>
            </div>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 text-sm">
            <Loader2 size={16} className="animate-spin" /> Seeding... this can take up to a minute.
          </div>
        )}

        {status === 'success' && (
          <div className="mt-4 flex gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 flex gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
            <XCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-800">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeedDatabase;
