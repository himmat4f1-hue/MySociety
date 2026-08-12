import React, { useEffect, useState } from 'react';
import { Building2, Plus, Trash2, Layers, Home } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const SocietyStructure = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'chairman';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Apartment: add building / add floor state
  const [newBuildingName, setNewBuildingName] = useState('');
  const [floorForm, setFloorForm] = useState({}); // { [buildingName]: { flatsCount, flatType, areaSqft } }

  // Individual houses: add house state
  const [houseForm, setHouseForm] = useState({ flatNo: '', type: '', areaSqft: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/society-structure');
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddBuilding = async (e) => {
    e.preventDefault();
    if (!newBuildingName.trim()) return;
    try {
      await api.post('/society-structure/buildings', { name: newBuildingName.trim() });
      setNewBuildingName('');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add building');
    }
  };

  const handleRemoveBuilding = async (name) => {
    if (!window.confirm(`Remove ${name} and all its flats? This cannot be undone.`)) return;
    try {
      await api.delete(`/society-structure/buildings/${encodeURIComponent(name)}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not remove building');
    }
  };

  const handleAddFloor = async (buildingName) => {
    const form = floorForm[buildingName] || {};
    if (!form.flatsCount) {
      alert('Please enter how many flats this floor should have');
      return;
    }
    try {
      await api.post(`/society-structure/buildings/${encodeURIComponent(buildingName)}/floors`, {
        flatsCount: Number(form.flatsCount),
        flatType: form.flatType || '2 BHK',
        areaSqft: form.areaSqft ? Number(form.areaSqft) : undefined,
      });
      setFloorForm((prev) => ({ ...prev, [buildingName]: {} }));
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add floor');
    }
  };

  const handleRemoveFloor = async (buildingName, floor) => {
    if (!window.confirm(`Remove ${floor} of ${buildingName} and all its flats?`)) return;
    try {
      await api.delete(`/society-structure/buildings/${encodeURIComponent(buildingName)}/floors/${encodeURIComponent(floor)}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not remove floor');
    }
  };

  const handleAddHouse = async (e) => {
    e.preventDefault();
    if (!houseForm.flatNo.trim()) return;
    try {
      await api.post('/society-structure/houses', houseForm);
      setHouseForm({ flatNo: '', type: '', areaSqft: '' });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add house');
    }
  };

  const handleRemoveHouse = async (id) => {
    if (!window.confirm('Remove this house?')) return;
    try {
      await api.delete(`/society-structure/houses/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not remove house');
    }
  };

  if (loading || !data) {
    return (
      <Layout title="Society Structure">
        <p className="text-slate-400">Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout
      title="Society Structure"
      subtitle={canEdit ? 'Add or remove buildings, floors and flats - only the Chairman can make changes here' : 'View-only: only the Chairman can add or remove buildings, floors and flats'}
    >
      {data.type === 'Apartment' ? (
        <div className="space-y-6">
          {canEdit && (
            <form onSubmit={handleAddBuilding} className="card flex items-end gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-1">Add a New Building</label>
                <input className="input" placeholder="e.g. Tower E" value={newBuildingName} onChange={(e) => setNewBuildingName(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary flex items-center gap-1">
                <Plus size={16} /> Add Building
              </button>
            </form>
          )}

          {data.buildings.length === 0 ? (
            <p className="text-slate-400">No buildings yet.</p>
          ) : (
            data.buildings.map((b) => (
              <div key={b.buildingId} className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Building2 size={18} /> {b.name}
                    <span className="text-xs font-normal text-slate-400">({b.floors.length} floors)</span>
                  </h3>
                  {canEdit && (
                    <button onClick={() => handleRemoveBuilding(b.name)} className="text-red-500 hover:bg-red-50 p-1.5 rounded">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {b.floors.map((f) => (
                    <div key={f.floor} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                      <span className="text-sm flex items-center gap-2">
                        <Layers size={14} className="text-slate-400" /> {f.floor} &middot; {f.flatsCount} flats
                      </span>
                      {canEdit && (
                        <button onClick={() => handleRemoveFloor(b.name, f.floor)} className="text-red-500 hover:bg-red-100 p-1 rounded">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {canEdit && (
                  <div className="flex items-end gap-2 mt-4 pt-4 border-t border-slate-100 flex-wrap">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">No. of Flats on New Floor</label>
                      <input
                        type="number"
                        min="1"
                        className="input w-32"
                        value={floorForm[b.name]?.flatsCount || ''}
                        onChange={(e) => setFloorForm((prev) => ({ ...prev, [b.name]: { ...prev[b.name], flatsCount: e.target.value } }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Flat Type</label>
                      <input
                        className="input w-32"
                        placeholder="2 BHK"
                        value={floorForm[b.name]?.flatType || ''}
                        onChange={(e) => setFloorForm((prev) => ({ ...prev, [b.name]: { ...prev[b.name], flatType: e.target.value } }))}
                      />
                    </div>
                    <button onClick={() => handleAddFloor(b.name)} className="btn-secondary flex items-center gap-1">
                      <Plus size={14} /> Add Floor
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {canEdit && (
            <form onSubmit={handleAddHouse} className="card grid sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">House No./Name</label>
                <input className="input" value={houseForm.flatNo} onChange={(e) => setHouseForm({ ...houseForm, flatNo: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <input className="input" placeholder="Independent House" value={houseForm.type} onChange={(e) => setHouseForm({ ...houseForm, type: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Area (sq.ft.)</label>
                <input type="number" className="input" value={houseForm.areaSqft} onChange={(e) => setHouseForm({ ...houseForm, areaSqft: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary flex items-center gap-1">
                <Plus size={16} /> Add House
              </button>
            </form>
          )}

          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Home size={18} /> Houses ({data.houses.length})</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {data.houses.map((h) => (
                <div key={h._id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{h.flatNo}</p>
                    <p className="text-xs text-slate-400">{h.type} &middot; {h.status}</p>
                  </div>
                  {canEdit && (
                    <button onClick={() => handleRemoveHouse(h._id)} className="text-red-500 hover:bg-red-100 p-1 rounded">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SocietyStructure;
