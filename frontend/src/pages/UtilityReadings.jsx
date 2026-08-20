import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Droplets, Zap, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const currentMonthISO = () => new Date().toISOString().slice(0, 7); // "YYYY-MM"

const emptyForm = { month: currentMonthISO(), utilityType: 'Water', area: 'All Towers', unitsConsumed: '' };

const UtilityFormModal = ({ initial, towers, onClose, onSaved }) => {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial._id;

  const save = async () => {
    if (!form.unitsConsumed || Number(form.unitsConsumed) < 0) return alert('Total Consumption is required.');
    setSaving(true);
    try {
      const payload = {
        utilityType: form.utilityType,
        month: `${form.month}-01`,
        unitsConsumed: Number(form.unitsConsumed),
        tower: form.area === 'All Towers' ? null : form.area,
        scope: form.area === 'All Towers' ? 'Common Area' : 'Tower',
      };
      if (isEdit) {
        await api.put(`/utility-readings/${initial._id}`, payload);
      } else {
        await api.post('/utility-readings', payload);
      }
      await onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save this reading.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">{isEdit ? 'Edit Utility Reading' : 'Add Utility Reading'}</h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Month *</label>
          <input type="month" className="input" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Utility *</label>
          <select className="input" value={form.utilityType} onChange={(e) => setForm({ ...form, utilityType: e.target.value })}>
            <option value="Water">Water</option>
            <option value="Electricity">Electricity</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Area *</label>
          <select className="input" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>
            <option value="All Towers">All Towers</option>
            {towers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Total Consumption *</label>
          <input type="number" min="0" step="0.01" className="input" value={form.unitsConsumed} onChange={(e) => setForm({ ...form, unitsConsumed: e.target.value })} />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60 flex items-center gap-1.5">
            {saving && <Loader2 size={14} className="animate-spin" />} {isEdit ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

const UtilityReadings = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'secretary';

  const [filterMonth, setFilterMonth] = useState(currentMonthISO());
  const [readings, setReadings] = useState([]);
  const [flatCounts, setFlatCounts] = useState({ total: 0, byTower: {} }); // for the "Divide into Flats" calculation
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formTarget, setFormTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/utility-readings', { params: { limit: 300 } });
      setReadings(res.data.data || res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    api.get('/units', { params: { limit: 500 } }).then((res) => {
      const units = res.data.data || [];
      const byTower = {};
      units.forEach((u) => {
        byTower[u.tower] = (byTower[u.tower] || 0) + 1;
      });
      setFlatCounts({ total: units.length, byTower });
      setTowers([...new Set(units.map((u) => u.tower))].sort());
    });
  }, [load]);

  const shownReadings = useMemo(
    () => readings.filter((r) => r.month && new Date(r.month).toISOString().slice(0, 7) === filterMonth),
    [readings, filterMonth]
  );

  const flatCountFor = (tower) => (tower ? flatCounts.byTower[tower] || 0 : flatCounts.total);

  const remove = async (id) => {
    if (!window.confirm('Delete this reading?')) return;
    await api.delete(`/utility-readings/${id}`);
    await load();
  };

  return (
    <Layout title="Utility Usage" subtitle="Water & electricity consumption, and each flat's average share">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500">Month</label>
          <input type="month" className="input w-auto" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
        </div>
        {canManage && (
          <button onClick={() => setFormTarget({ ...emptyForm, month: filterMonth })} className="btn-primary flex items-center gap-1.5">
            <Plus size={16} /> Add Reading
          </button>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <p className="text-slate-400 text-center py-10">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-left border-b border-slate-100 bg-slate-50">
                <th className="font-medium px-4 py-2.5">Month</th>
                <th className="font-medium px-4 py-2.5">Utility</th>
                <th className="font-medium px-4 py-2.5">Area</th>
                <th className="font-medium px-4 py-2.5">Total Consumption</th>
                <th className="font-medium px-4 py-2.5">Divide into Flats</th>
                {canManage && <th className="font-medium px-4 py-2.5 w-20">Action</th>}
              </tr>
            </thead>
            <tbody>
              {shownReadings.map((r) => {
                const flats = flatCountFor(r.tower);
                const perFlat = flats > 0 ? (Number(r.unitsConsumed) / flats).toFixed(2) : null;
                return (
                  <tr key={r._id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2.5 text-slate-600">{new Date(r.month).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        {r.utilityType === 'Water' ? <Droplets size={13} className="text-blue-500" /> : <Zap size={13} className="text-amber-500" />}
                        {r.utilityType}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{r.tower || 'All Towers'}</td>
                    <td className="px-4 py-2.5 text-slate-700 font-medium">{r.unitsConsumed}</td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {perFlat !== null ? (
                        <span>
                          {r.unitsConsumed}/{flats} = <span className="font-medium text-slate-800">{perFlat}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    {canManage && (
                      <td className="px-4 py-2.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setFormTarget({
                                _id: r._id,
                                month: new Date(r.month).toISOString().slice(0, 7),
                                utilityType: r.utilityType,
                                area: r.tower || 'All Towers',
                                unitsConsumed: r.unitsConsumed,
                              })
                            }
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => remove(r._id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {!shownReadings.length && (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="text-center text-slate-400 py-10">
                    No utility readings for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {formTarget && <UtilityFormModal initial={formTarget} towers={towers} onClose={() => setFormTarget(null)} onSaved={load} />}
    </Layout>
  );
};

export default UtilityReadings;
