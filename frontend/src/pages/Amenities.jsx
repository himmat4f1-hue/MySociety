import React, { useEffect, useState, useCallback } from 'react';
import { Dumbbell, Plus, Pencil, Trash2, X, Loader2, ImageOff } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';

const STATUS_OPTIONS = ['Available', 'Not Available', 'Under Maintenance', 'Out of Service'];
const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024;

const emptyForm = { name: '', status: 'Available', photo: null };

// "Click here" link + card (#Rules column): shows an amenity's rules, and
// for the Secretary, lets them add/remove rule lines and Save (or Cancel to
// discard local edits without touching the saved list).
const RulesCard = ({ amenity, canManage, onClose, onSaved }) => {
  const [rules, setRules] = useState(amenity.rules || []);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const addRule = () => {
    const text = draft.trim();
    if (!text) return;
    setRules([...rules, text]);
    setDraft('');
  };

  const removeRule = (idx) => setRules(rules.filter((_, i) => i !== idx));

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/amenities/${amenity._id}`, { rules });
      await onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save rules.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">{amenity.name} - Rules</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>

          {rules.length === 0 && !canManage && <p className="text-sm text-slate-400">No rules have been added for this amenity yet.</p>}

          {rules.length > 0 && (
            <ul className="space-y-1.5">
              {rules.map((r, i) => (
                <li key={i} className="flex items-start justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-700">
                  <span>
                    {i + 1}. {r}
                  </span>
                  {canManage && (
                    <button onClick={() => removeRule(i)} className="text-red-400 hover:text-red-600 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {canManage && (
            <>
              <div className="flex items-center gap-2 pt-1">
                <input
                  className="input"
                  placeholder="Add a rule..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                />
                <button onClick={addRule} className="btn-secondary px-3 shrink-0 flex items-center gap-1">
                  <Plus size={15} /> Add
                </button>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button disabled={saving} onClick={save} className="btn-primary disabled:opacity-60 flex items-center gap-1.5">
                  {saving && <Loader2 size={14} className="animate-spin" />} Save
                </button>
              </div>
            </>
          )}

          {!canManage && (
            <div className="flex justify-end pt-2">
              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Create/Edit form (Secretary only) - just the four fields this page now
// manages: Photo, Name, Status (Rules are edited separately via RulesCard).
const AmenityFormModal = ({ initial, onClose, onSaved }) => {
  const [form, setForm] = useState(initial || emptyForm);
  const [photoError, setPhotoError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?._id;

  const handlePhoto = (file) => {
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError(`Photo is too large (max ${(MAX_PHOTO_BYTES / 1024 / 1024).toFixed(1)}MB).`);
      return;
    }
    setPhotoError('');
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, photo: reader.result }));
    reader.onerror = () => setPhotoError('Could not read that file.');
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!form.name.trim()) return alert('Name is required.');
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/amenities/${initial._id}`, { name: form.name, status: form.status, photo: form.photo });
      } else {
        // type is a required field on the model but no longer collected in
        // this simplified form - default it so creation doesn't 400.
        await api.post('/amenities', { name: form.name, status: form.status, photo: form.photo, type: 'General' });
      }
      await onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save this amenity.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${initial.name}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await api.delete(`/amenities/${initial._id}`);
      await onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete this amenity.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">{isEdit ? 'Edit Amenity' : 'Create New Amenity'}</h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Photo</label>
          <div className="flex items-center gap-3">
            {form.photo ? (
              <img src={form.photo} alt="" className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
            ) : (
              <span className="w-14 h-14 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                <ImageOff size={20} />
              </span>
            )}
            <label className="btn-secondary text-xs px-3 py-1.5 cursor-pointer">
              Choose Photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files?.[0])} />
            </label>
          </div>
          {photoError && <p className="text-xs text-red-600 mt-1">{photoError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Swimming Pool" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          {isEdit && (
            <button onClick={remove} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
              Delete
            </button>
          )}
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60 flex items-center gap-1.5">
            {saving && <Loader2 size={14} className="animate-spin" />} {isEdit ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Amenities = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'secretary';

  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formTarget, setFormTarget] = useState(null); // null = closed, {} = create, {...amenity} = edit
  const [rulesTarget, setRulesTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Generic list endpoints paginate (default 20/page) - amenity counts
      // are small enough per society that a generous single-page limit is
      // simpler and safer than adding real pagination UI here.
      const res = await api.get('/amenities', { params: { limit: 200 } });
      setAmenities(res.data.data || res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Layout title="Amenities" subtitle="Society amenities, their availability, and usage rules">
      <div className="flex justify-end mb-4">
        {canManage && (
          <button onClick={() => setFormTarget(emptyForm)} className="btn-primary flex items-center gap-1.5">
            <Plus size={16} /> Create New
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
                <th className="font-medium px-4 py-2.5 w-20">Photo</th>
                <th className="font-medium px-4 py-2.5">Name</th>
                <th className="font-medium px-4 py-2.5">Status</th>
                <th className="font-medium px-4 py-2.5">Rules</th>
                {canManage && <th className="font-medium px-4 py-2.5 w-20"></th>}
              </tr>
            </thead>
            <tbody>
              {amenities.map((a) => (
                <tr key={a._id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2.5">
                    {a.photo ? (
                      <img src={a.photo} alt={a.name} className="w-11 h-11 rounded-lg object-cover border border-slate-200" />
                    ) : (
                      <span className="w-11 h-11 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300">
                        <Dumbbell size={18} />
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-700">{a.name}</td>
                  <td className="px-4 py-2.5">
                    <Badge text={a.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => setRulesTarget(a)} className="text-brand-600 hover:text-brand-700 hover:underline">
                      Click here
                    </button>
                  </td>
                  {canManage && (
                    <td className="px-4 py-2.5">
                      <button onClick={() => setFormTarget(a)} className="text-blue-500 hover:text-blue-700">
                        <Pencil size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {!amenities.length && (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="text-center text-slate-400 py-10">
                    No amenities added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {formTarget && <AmenityFormModal initial={formTarget} onClose={() => setFormTarget(null)} onSaved={load} />}
      {rulesTarget && <RulesCard amenity={rulesTarget} canManage={canManage} onClose={() => setRulesTarget(null)} onSaved={load} />}
    </Layout>
  );
};

export default Amenities;
