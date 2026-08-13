import React, { useEffect, useState } from 'react';
import { Tag, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';

const ListPropertyForSale = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [askingPrice, setAskingPrice] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/units/my-property')
      .then((res) => {
        setData(res.data);
        setAskingPrice(res.data.askingPrice || '');
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load your flat details.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleToggle = async (nextForSale) => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await api.patch('/units/my-property', {
        forSale: nextForSale,
        askingPrice: nextForSale ? Number(askingPrice) || null : null,
      });
      setData(res.data);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update your listing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="List Property for Sale">
        <div className="text-slate-400">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout title="List Property for Sale" subtitle="Let the Secretary and prospective buyers know your flat is available.">
      <div className="max-w-lg">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Tag size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Flat {data?.flatNo}</p>
              <p className="text-xs text-slate-500">
                Currently{' '}
                <span className={data?.forSale ? 'text-emerald-600 font-medium' : 'text-slate-500'}>
                  {data?.forSale ? 'listed for sale' : 'not listed'}
                </span>
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

          {!data?.forSale ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Asking Price (₹) - optional</label>
                <input
                  type="number"
                  className="input"
                  placeholder="e.g. 8500000"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                />
              </div>
              <button disabled={saving} onClick={() => handleToggle(true)} className="btn-primary w-full disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Listing...' : 'List My Property for Sale'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.askingPrice ? (
                <p className="text-sm text-slate-600">
                  Asking price: <span className="font-semibold text-slate-800">₹{Number(data.askingPrice).toLocaleString('en-IN')}</span>
                </p>
              ) : null}
              <button disabled={saving} onClick={() => handleToggle(false)} className="btn-secondary w-full disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Removing...' : 'Remove from Sale'}
              </button>
            </div>
          )}

          {saved && (
            <p className="text-sm text-emerald-600 flex items-center gap-1.5 mt-3">
              <CheckCircle2 size={14} /> Saved.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ListPropertyForSale;
