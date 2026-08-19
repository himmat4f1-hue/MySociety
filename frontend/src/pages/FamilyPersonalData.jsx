import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Building2, User, PawPrint, Plus, Pencil, Trash2, X, ChevronRight, Loader2 } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import FormModal from '../components/FormModal';

const PhotoOrPlaceholder = ({ src, alt }) =>
  src ? (
    <img src={src} alt={alt} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 shrink-0">
      <User size={16} />
    </div>
  );

const FAMILY_FIELDS = [
  { name: 'firstName', label: 'First Name', required: true },
  { name: 'middleName', label: 'Middle Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'birthDate', label: 'Birth Date', type: 'date' },
  { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
  { name: 'religion', label: 'Religion' },
  { name: 'mobileNumber', label: 'Mobile Number' },
  { name: 'photo', label: 'Photo', type: 'photo' },
];

const OWNER_FIELDS = [
  { name: 'ownerNo', label: 'Owner No. (1 for sole owner, 2+ for co-owners)', type: 'number', required: true },
  { name: 'firstName', label: 'First Name', required: true },
  { name: 'middleName', label: 'Middle Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'birthDate', label: 'Birth Date', type: 'date' },
  { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
  { name: 'religion', label: 'Religion' },
  { name: 'mobileNumber', label: 'Mobile Number' },
  { name: 'photo', label: 'Photo', type: 'photo' },
];

// Flat detail: family members (owners + others, from FamilyMember - owners
// are auto-added there too, see backend/routes/flatOwnerRoutes.js) and a
// compact pets summary. Shared by both the Secretary/Chairman drill-down
// (rendered inside a modal) and the resident/tenant's own-flat view
// (rendered inline, no modal chrome).
const FlatDetail = ({ flatId, building, floor, canManageAny, isOwnFlat, onClose }) => {
  const { user } = useAuth();
  const canWrite = canManageAny || isOwnFlat; // secretary (any flat) or the flat's own resident/tenant
  const canManageOwners = user?.role === 'secretary'; // FlatOwner is Secretary-only, even for your own flat

  const [members, setMembers] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberModal, setMemberModal] = useState(null); // null closed, {} add, {...member} edit
  const [ownerModal, setOwnerModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, pRes] = await Promise.all([
        api.get('/family-members', { params: { flatId, limit: 100 } }),
        api.get('/pets', { params: { flatId, limit: 100 } }),
      ]);
      setMembers(mRes.data.data || []);
      setPets(pRes.data.data || []);
    } finally {
      setLoading(false);
    }
  }, [flatId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveMember = async (values) => {
    if (memberModal?._id) {
      await api.put(`/family-members/${memberModal._id}`, values);
    } else {
      await api.post('/family-members', { ...values, flatId });
    }
    await load();
  };

  const deleteMember = async (id) => {
    if (!window.confirm('Remove this family member?')) return;
    await api.delete(`/family-members/${id}`);
    await load();
  };

  const saveOwner = async (values) => {
    await api.post('/flat-owners', { ...values, flatId, building, flatNo: flatId.includes('-') ? flatId.split('-').slice(1).join('-') : flatId });
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Flat {flatId}</h2>
          <p className="text-xs text-slate-500">
            {building && `Building ${building}`} {floor && `· Floor ${floor}`} · {members.length} {members.length === 1 ? 'person' : 'people'} · {pets.length} {pets.length === 1 ? 'pet' : 'pets'}
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm py-6 text-center">Loading...</p>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-700">Family Members</h3>
            {canWrite && (
              <div className="flex gap-2">
                {canManageOwners && (
                  <button onClick={() => setOwnerModal(true)} className="btn-secondary text-xs px-2.5 py-1 flex items-center gap-1">
                    <Plus size={12} /> Add Owner
                  </button>
                )}
                <button onClick={() => setMemberModal({})} className="btn-primary text-xs px-2.5 py-1 flex items-center gap-1">
                  <Plus size={12} /> Add Family Member
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-left border-b border-slate-100">
                  <th className="font-medium py-1.5 pr-3 w-12">Photo</th>
                  <th className="font-medium py-1.5 pr-3">Name</th>
                  <th className="font-medium py-1.5 pr-3">Type</th>
                  <th className="font-medium py-1.5 pr-3">Birth Date</th>
                  <th className="font-medium py-1.5 pr-3">Gender</th>
                  <th className="font-medium py-1.5 pr-3">Mobile No.</th>
                  {canWrite && <th className="font-medium py-1.5 w-16"></th>}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m._id} className="border-b border-slate-50 last:border-0">
                    <td className="py-1.5 pr-3">
                      <PhotoOrPlaceholder src={m.photo} alt={m.firstName} />
                    </td>
                    <td className="py-1.5 pr-3 text-slate-700">
                      {m.firstName} {m.middleName} {m.lastName}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-500">{m.isAutoAddedOwner ? 'Owner' : 'Family Member'}</td>
                    <td className="py-1.5 pr-3 text-slate-500">{m.birthDate ? new Date(m.birthDate).toLocaleDateString() : '—'}</td>
                    <td className="py-1.5 pr-3 text-slate-500">{m.gender || '—'}</td>
                    <td className="py-1.5 pr-3 text-slate-500">{m.mobileNumber || '—'}</td>
                    {canWrite && (
                      <td className="py-1.5">
                        <div className="flex gap-2">
                          <button onClick={() => setMemberModal(m)} className="text-blue-500 hover:text-blue-700">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteMember(m._id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {!members.length && (
                  <tr>
                    <td colSpan={canWrite ? 7 : 6} className="text-center text-slate-400 py-6">
                      No family members added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <PawPrint size={14} /> Pets
            </h3>
            <a href="/app/pets" className="text-xs text-brand-600 hover:underline">
              Manage Pets →
            </a>
          </div>
          {pets.length ? (
            <ul className="text-sm space-y-1">
              {pets.map((p) => (
                <li key={p._id} className="text-slate-600">
                  {p.name} <span className="text-slate-400">({p.type}{p.breed ? `, ${p.breed}` : ''})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No pets registered for this flat.</p>
          )}
        </>
      )}

      {canWrite && (
        <FormModal
          open={!!memberModal}
          onClose={() => setMemberModal(null)}
          onSubmit={saveMember}
          fields={FAMILY_FIELDS}
          initialValues={memberModal}
          title={memberModal?._id ? 'Edit Family Member' : 'Add Family Member'}
        />
      )}
      {canManageOwners && (
        <FormModal open={ownerModal} onClose={() => setOwnerModal(false)} onSubmit={saveOwner} fields={OWNER_FIELDS} initialValues={{ ownerNo: 1 }} title="Add Owner" />
      )}
    </div>
  );
};

const FamilyPersonalData = () => {
  const { user } = useAuth();
  const canBrowseAll = ['secretary', 'chairman'].includes(user?.role);

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBuilding, setActiveBuilding] = useState('');
  const [openFlat, setOpenFlat] = useState(null); // { flatId, building, floor }

  useEffect(() => {
    if (!canBrowseAll) {
      setLoading(false);
      return;
    }
    api.get('/units', { params: { limit: 500 } }).then((res) => {
      const data = res.data.data || [];
      setUnits(data);
      if (data.length) setActiveBuilding(data[0].tower);
      setLoading(false);
    });
  }, [canBrowseAll]);

  const buildings = useMemo(() => [...new Set(units.map((u) => u.tower))].sort(), [units]);
  const flatsInBuilding = useMemo(
    () =>
      units
        .filter((u) => u.tower === activeBuilding)
        .sort((a, b) => (a.floor || '').localeCompare(b.floor || '', undefined, { numeric: true }) || a.flatNo.localeCompare(b.flatNo, undefined, { numeric: true })),
    [units, activeBuilding]
  );

  if (!canBrowseAll) {
    // Resident/Tenant: no directory to browse - just their own flat's data,
    // scoped automatically by the backend via req.flatId.
    return (
      <Layout title="Family & Personal Data" subtitle="Your household's members and details">
        {user?.flatId ? (
          <div className="card">
            <FlatDetail flatId={user.flatId} canManageAny={false} isOwnFlat />
          </div>
        ) : (
          <p className="text-slate-400">Your account is not linked to a flat.</p>
        )}
      </Layout>
    );
  }

  return (
    <Layout title="Family & Personal Data" subtitle="Building-wise directory of every flat's family members, owners, and pets">
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <>
          <div className="flex gap-1 border-b border-slate-200 mb-4 overflow-x-auto">
            {buildings.map((b) => (
              <button
                key={b}
                onClick={() => setActiveBuilding(b)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap flex items-center gap-1.5 ${
                  activeBuilding === b ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Building2 size={14} /> Building {b}
              </button>
            ))}
            {!buildings.length && <p className="text-sm text-slate-400 py-2">No units set up yet.</p>}
          </div>

          <div className="card !p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-left border-b border-slate-100 bg-slate-50">
                  <th className="font-medium px-4 py-2.5">Building / Tower</th>
                  <th className="font-medium px-4 py-2.5">Floor No.</th>
                  <th className="font-medium px-4 py-2.5">Flat No.</th>
                  <th className="font-medium px-4 py-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {flatsInBuilding.map((u) => (
                  <tr
                    key={u._id}
                    onClick={() => setOpenFlat({ flatId: u.flatNo, building: u.tower, floor: u.floor })}
                    className="border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50"
                  >
                    <td className="px-4 py-2.5 text-slate-700">{u.tower}</td>
                    <td className="px-4 py-2.5 text-slate-600">{u.floor}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-700">{u.flatNo}</td>
                    <td className="px-4 py-2.5 text-slate-300">
                      <ChevronRight size={16} />
                    </td>
                  </tr>
                ))}
                {!flatsInBuilding.length && (
                  <tr>
                    <td colSpan={4} className="text-center text-slate-400 py-8">
                      No flats in this building.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {openFlat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-5">
            <FlatDetail flatId={openFlat.flatId} building={openFlat.building} floor={openFlat.floor} canManageAny onClose={() => setOpenFlat(null)} />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default FamilyPersonalData;
