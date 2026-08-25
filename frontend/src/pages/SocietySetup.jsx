import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Home, Plus, Pencil, Check, X, Loader2, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Small inline-rename control shared by Building/Floor/Flat rows.
const RenameField = ({ value, onSave, textClass }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <span className="flex items-center gap-2">
        <span className={textClass}>{value}</span>
        <button onClick={() => { setDraft(value); setEditing(true); }} className="text-blue-500 hover:text-blue-700 text-xs flex items-center gap-1">
          <Pencil size={12} /> Rename
        </button>
      </span>
    );
  }

  const save = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <span className="flex items-center gap-1.5">
      <input
        autoFocus
        className="input py-1 text-sm w-40"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && save()}
      />
      <button disabled={saving} onClick={save} className="text-emerald-600 hover:text-emerald-800">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
      </button>
      <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-red-500">
        <X size={14} />
      </button>
    </span>
  );
};

const SocietySetup = () => {
  const { user, refreshSessionWithToken } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tree, setTree] = useState({ type: null, buildings: [], allFlats: [] });
  const [typeChosen, setTypeChosen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [addingFloorFor, setAddingFloorFor] = useState(null);
  const [addingFlatFor, setAddingFlatFor] = useState(null);

  // Final step
  const [showFinalTable, setShowFinalTable] = useState(false);
  const [secretaryFlatId, setSecretaryFlatId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const load = useCallback(async () => {
    const res = await api.get('/society-setup/structure');
    setTree(res.data);
    // Re-visiting later (buildings already exist) should skip straight past
    // the type-choice screen without needing a fresh click in this session.
    if (res.data.buildings.length > 0) setTypeChosen(true);
    return res.data;
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const isIndividualHouses = tree.type === 'IndividualHouses';

  const chooseType = async (type) => {
    setBusy(true);
    try {
      await api.post('/society-setup/type', { type });
      if (type === 'IndividualHouses') {
        // Individual Housing has no Building/Floor concept for the person
        // filling this in - auto-create one implicit "Individual Houses"
        // building + "Ground" floor behind the scenes, reusing the exact
        // same Building/Floor/Flat backend as the Apartment flow.
        const b = await api.post('/society-setup/buildings', {});
        await api.put(`/society-setup/buildings/${b.data._id}`, { name: 'Individual Houses' });
        const f = await api.post(`/society-setup/buildings/${b.data._id}/floors`, {});
        await api.put(`/society-setup/floors/${f.data._id}`, { name: 'Ground' });
      }
      setTypeChosen(true);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const addBuilding = async () => {
    setBusy(true);
    try {
      await api.post('/society-setup/buildings', {});
      await load();
    } finally {
      setBusy(false);
    }
  };

  const renameBuilding = async (id, name) => {
    await api.put(`/society-setup/buildings/${id}`, { name });
    await load();
  };

  const addFloor = async (buildingId) => {
    setAddingFloorFor(buildingId);
    try {
      await api.post(`/society-setup/buildings/${buildingId}/floors`, {});
      await load();
    } finally {
      setAddingFloorFor(null);
    }
  };

  const renameFloor = async (id, name) => {
    await api.put(`/society-setup/floors/${id}`, { name });
    await load();
  };

  const addFlat = async (floorId) => {
    setAddingFlatFor(floorId);
    try {
      await api.post(`/society-setup/floors/${floorId}/flats`, {});
      await load();
    } finally {
      setAddingFlatFor(null);
    }
  };

  const renameFlat = async (id, flatNo) => {
    await api.put(`/society-setup/flats/${id}`, { flatNo });
    await load();
  };

  const submit = async () => {
    if (!secretaryFlatId) {
      setSubmitError('Please select which flat is yours.');
      return;
    }
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await api.post('/society-setup/complete', { secretaryFlatId });
      await refreshSessionWithToken(res.data.token);
      navigate('/app');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Could not complete setup.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-brand-600 text-white flex items-center justify-center">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Society Setup</h1>
            <p className="text-sm text-slate-500">{user?.society?.name} - build out your buildings, floors, and flats</p>
          </div>
        </div>

        {/* Step 1: Flat vs Individual Housing - only shown until an explicit choice is made this session (or buildings already exist from before) */}
        {!typeChosen ? (
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-1">What type of society is this?</h3>
            <p className="text-xs text-slate-400 mb-4">This decides how you'll set up your flats below.</p>
            <div className="grid grid-cols-2 gap-3">
              <button disabled={busy} onClick={() => chooseType('Apartment')} className="border-2 border-slate-200 hover:border-brand-400 rounded-xl p-5 text-center transition-colors disabled:opacity-60">
                <Building2 size={28} className="mx-auto mb-2 text-brand-600" />
                <p className="font-medium text-slate-800">Flat</p>
                <p className="text-xs text-slate-400 mt-1">Buildings with floors and flats</p>
              </button>
              <button disabled={busy} onClick={() => chooseType('IndividualHouses')} className="border-2 border-slate-200 hover:border-brand-400 rounded-xl p-5 text-center transition-colors disabled:opacity-60">
                <Home size={28} className="mx-auto mb-2 text-brand-600" />
                <p className="font-medium text-slate-800">Individual Housing</p>
                <p className="text-xs text-slate-400 mt-1">Standalone houses, no floors</p>
              </button>
            </div>
          </div>
        ) : !showFinalTable ? (
          <div className="card">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-slate-800">{isIndividualHouses ? 'Add Your Houses' : 'Add Buildings, Floors & Flats'}</h3>
              {!isIndividualHouses && (
                <button disabled={busy} onClick={addBuilding} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-60">
                  <Plus size={13} /> Add Building
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {isIndividualHouses ? 'Click "Add House" to add each house one at a time - rename it right after.' : 'Add a building, then add floors under it, then add flats under each floor.'}
            </p>

            {isIndividualHouses ? (
              <div>
                <button disabled={addingFlatFor} onClick={() => addFlat(tree.buildings[0]?.floors[0]?._id)} className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5 mb-3">
                  {addingFlatFor ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Add House
                </button>
                <ul className="space-y-1.5">
                  {(tree.buildings[0]?.floors[0]?.flats || []).map((flat) => (
                    <li key={flat._id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                      <RenameField value={flat.flatNo} onSave={(name) => renameFlat(flat._id, name)} textClass="text-sm text-slate-700 font-medium" />
                    </li>
                  ))}
                  {!tree.buildings[0]?.floors[0]?.flats?.length && <p className="text-sm text-slate-400">No houses added yet.</p>}
                </ul>
              </div>
            ) : (
              <div className="space-y-3">
                {tree.buildings.map((b) => (
                  <div key={b._id} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <RenameField value={b.name} onSave={(name) => renameBuilding(b._id, name)} textClass="font-medium text-slate-800" />
                      <button disabled={addingFloorFor === b._id} onClick={() => addFloor(b._id)} className="btn-secondary text-xs px-2.5 py-1 flex items-center gap-1">
                        {addingFloorFor === b._id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add Floor
                      </button>
                    </div>

                    {b.floors.length > 0 && (
                      <div className="pl-4 border-l-2 border-slate-100 space-y-2">
                        {b.floors.map((f) => (
                          <div key={f._id}>
                            <div className="flex items-center justify-between mb-1">
                              <RenameField value={f.name} onSave={(name) => renameFloor(f._id, name)} textClass="text-sm text-slate-700" />
                              <button disabled={addingFlatFor === f._id} onClick={() => addFlat(f._id)} className="btn-secondary text-xs px-2.5 py-1 flex items-center gap-1">
                                {addingFlatFor === f._id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add Flat
                              </button>
                            </div>
                            {f.flats.length > 0 && (
                              <div className="pl-4 border-l-2 border-slate-100 flex flex-wrap gap-2 py-1">
                                {f.flats.map((flat) => (
                                  <span key={flat._id} className="bg-slate-50 rounded-lg px-2.5 py-1.5 text-xs">
                                    <RenameField value={flat.flatNo} onSave={(name) => renameFlat(flat._id, name)} textClass="text-slate-700 font-medium" />
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {!tree.buildings.length && <p className="text-sm text-slate-400">No buildings added yet.</p>}
              </div>
            )}

            {tree.allFlats.length > 0 && (
              <button onClick={() => setShowFinalTable(true)} className="btn-primary w-full mt-5 flex items-center justify-center gap-1.5">
                Continue <ChevronRight size={15} />
              </button>
            )}
          </div>
        ) : (
          /* Final step: full flat table + Secretary's own-flat picker */
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-1">Confirm Your Setup</h3>
            <p className="text-xs text-slate-400 mb-4">Here's every flat you've added. Select which one is yours, then submit to finish.</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Secretary - Your Flat *</label>
              <select className="input" value={secretaryFlatId} onChange={(e) => setSecretaryFlatId(e.target.value)}>
                <option value="">Select your flat...</option>
                {tree.allFlats.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.tower} - {f.floor} - {f.flatNo}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-left border-b border-slate-100">
                    <th className="font-medium py-1.5 pr-3">Building / Tower</th>
                    <th className="font-medium py-1.5 pr-3">Floor</th>
                    <th className="font-medium py-1.5 pr-3">Flat No.</th>
                  </tr>
                </thead>
                <tbody>
                  {tree.allFlats.map((f) => (
                    <tr key={f._id} className="border-b border-slate-50 last:border-0">
                      <td className="py-1.5 pr-3 text-slate-600">{f.tower}</td>
                      <td className="py-1.5 pr-3 text-slate-600">{f.floor}</td>
                      <td className="py-1.5 pr-3 text-slate-700 font-medium">{f.flatNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {submitError && <p className="text-sm text-red-600 mb-3">{submitError}</p>}

            <div className="flex gap-2">
              <button onClick={() => setShowFinalTable(false)} className="btn-secondary">
                Back
              </button>
              <button onClick={submit} disabled={submitting} className="btn-primary flex-1 disabled:opacity-60 flex items-center justify-center gap-1.5">
                {submitting && <Loader2 size={15} className="animate-spin" />} Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocietySetup;
