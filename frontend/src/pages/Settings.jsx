import React, { useEffect, useState } from 'react';
import { ListChecks, Plus, X, Loader2, Save, User as UserIcon, Camera } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024;

const MyProfileCard = () => {
  const { user } = useAuth();
  const [photo, setPhoto] = useState(user?.photo || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (file) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError(`Image is too large (max ${(MAX_PHOTO_BYTES / 1024 / 1024).toFixed(1)}MB).`);
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      setPhoto(reader.result);
      setSaving(true);
      try {
        await api.put('/auth/me/photo', { photo: reader.result });
      } catch {
        setError('Could not save your photo. Please try again.');
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="card mb-6">
      <h3 className="font-semibold text-slate-800 mb-1">My Profile Photo</h3>
      <p className="text-xs text-slate-400 mb-3">Shown next to your name in the Management List and anywhere else your profile appears.</p>
      <div className="flex items-center gap-4">
        {photo ? (
          <img src={photo} alt="" className="w-16 h-16 rounded-full object-cover border border-slate-200" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
            <UserIcon size={26} />
          </div>
        )}
        <div>
          <label className="btn-secondary text-xs cursor-pointer inline-flex items-center gap-1.5">
            <Camera size={14} /> {saving ? 'Saving...' : 'Change Photo'}
            <input type="file" accept="image/*" className="hidden" disabled={saving} onChange={(e) => handleFile(e.target.files?.[0])} />
          </label>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
};

// The default set of dropdown-list categories a society typically needs.
// If a category has never been configured, this is what seeds it the first
// time Settings loads - after that, whatever is saved here is exactly what
// shows up in the corresponding dropdown across the app.
const DEFAULT_CATEGORIES = [
  { category: 'petTypes', label: 'Pet Types', defaults: ['Dog', 'Cat', 'Bird', 'Fish', 'Other'] },
  { category: 'vehicleTypes', label: 'Vehicle Types', defaults: ['Car', 'Bike', 'Scooter', 'Auto Rickshaw', 'Truck', 'Lauri', 'Tempo'] },
  { category: 'homeServiceTypes', label: 'Home Service Types', defaults: ['Personal Housekeeping', 'School Van', 'House Maid', 'Milk Supplier', 'News Paper Supplier', 'Other'] },
];

const DropdownListCard = ({ category, label, defaults }) => {
  const [row, setRow] = useState(null); // the ConfigList record (has _id once saved)
  const [values, setValues] = useState(defaults);
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    api
      .get('/config-lists', { params: { search: category, limit: 50 } })
      .then((res) => {
        const existing = res.data.data.find((r) => r.category === category);
        if (existing) {
          setRow(existing);
          setValues(existing.values?.length ? existing.values : defaults);
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addValue = () => {
    const v = newValue.trim();
    if (!v || values.includes(v)) return;
    setValues([...values, v]);
    setNewValue('');
    setDirty(true);
  };

  const removeValue = (v) => {
    setValues(values.filter((x) => x !== v));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (row) {
        await api.put(`/config-lists/${row._id}`, { values });
      } else {
        const res = await api.post('/config-lists', { category, label, values });
        setRow(res.data);
      }
      setDirty(false);
    } catch {
      alert('Could not save this list. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h4 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
        <ListChecks size={16} className="text-brand-600" /> {label}
      </h4>
      <p className="text-xs text-slate-400 mb-3">Whatever is listed here is exactly what shows up in the "{label}" dropdown across the app.</p>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {values.map((v) => (
              <span key={v} className="badge bg-slate-100 text-slate-700 flex items-center gap-1 pr-1">
                {v}
                <button onClick={() => removeValue(v)} className="hover:text-red-600">
                  <X size={11} />
                </button>
              </span>
            ))}
            {values.length === 0 && <p className="text-xs text-slate-400">No values yet - add one below.</p>}
          </div>

          <div className="flex gap-2">
            <input
              className="input py-1.5 text-sm"
              placeholder="Add a new value..."
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addValue())}
            />
            <button onClick={addValue} className="btn-secondary px-3 shrink-0">
              <Plus size={16} />
            </button>
          </div>

          {dirty && (
            <button onClick={save} disabled={saving} className="btn-primary text-xs mt-3 flex items-center gap-1.5 disabled:opacity-60">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

const MeetingQuorumCard = ({ canManage }) => {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    api.get('/meetings/quorum-settings').then((res) => setSettings(res.data));
  }, []);

  const update = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/meetings/quorum-settings', {
        minRequiredMembers: Number(settings.minRequiredMembers),
        minRequiredManagement: Number(settings.minRequiredManagement),
      });
      setSettings(res.data);
      setDirty(false);
    } catch {
      alert('Could not save quorum settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card mb-6">
      <h3 className="font-semibold text-slate-800 mb-1">Meeting Quorum</h3>
      <p className="text-xs text-slate-400 mb-3">Applies to every meeting automatically - not set per-meeting.</p>
      {!settings ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Members Required (General meetings)</label>
            <input
              type="number"
              className="input"
              disabled={!canManage}
              value={settings.minRequiredMembers}
              onChange={(e) => update('minRequiredMembers', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Management Required (Committee meetings)</label>
            <input
              type="number"
              className="input"
              disabled={!canManage}
              value={settings.minRequiredManagement}
              onChange={(e) => update('minRequiredManagement', e.target.value)}
            />
          </div>
        </div>
      )}
      {canManage && dirty && (
        <button onClick={save} disabled={saving} className="btn-primary text-xs mt-3 flex items-center gap-1.5 disabled:opacity-60">
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} {saving ? 'Saving...' : 'Save Changes'}
        </button>
      )}
    </div>
  );
};

const Settings = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'secretary';

  return (
    <Layout title="Settings" subtitle="Configure dropdown lists used across the app">
      <MyProfileCard />
      <MeetingQuorumCard canManage={canManage} />
      <div className="card mb-6">
        <h3 className="font-semibold text-slate-800 mb-1">System Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
          <div>
            <p className="text-slate-500">Society</p>
            <p className="font-medium">{user?.society?.name}</p>
          </div>
          <div>
            <p className="text-slate-500">Your Role</p>
            <p className="font-medium">{user?.role}</p>
          </div>
          <div>
            <p className="text-slate-500">Stack</p>
            <p className="font-medium">PostgreSQL + Express + React</p>
          </div>
        </div>
      </div>

      <h3 className="font-semibold text-slate-800 mb-3">Dropdown Lists</h3>
      {!canManage && <p className="text-sm text-slate-400 mb-3">Only the Secretary can edit these lists - you can view them here.</p>}
      <div className="grid md:grid-cols-3 gap-4">
        {DEFAULT_CATEGORIES.map((c) => (
          <DropdownListCard key={c.category} {...c} />
        ))}
      </div>
    </Layout>
  );
};

export default Settings;
