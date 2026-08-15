import React, { useEffect, useState } from 'react';
import { ClipboardCheck, Plus, Trash2, Loader2, Crown, ShieldCheck, Wallet, Users2, HardHat, Sparkles, Calculator } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { role: 'chairman', label: 'Chairman', icon: Crown },
  { role: 'secretary', label: 'Secretary', icon: ClipboardCheck },
  { role: 'treasurer', label: 'Treasurer', icon: Wallet },
  { role: 'committee_member', label: 'Committee Member', icon: Users2 },
  { role: 'accountant', label: 'Accountant', icon: Calculator },
  { role: 'security', label: 'Security Incharge', icon: ShieldCheck },
  { role: 'housekeeping', label: 'Housekeeping Incharge', icon: Sparkles },
];

const RoleChecklistDetail = ({ role, label, onClose, canManage }) => {
  const [checklist, setChecklist] = useState(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await api.get(`/role-checklists/by-role/${role}`);
    setChecklist(res.data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const addItem = async () => {
    const text = draft.trim();
    if (!text) return;
    setBusy(true);
    try {
      await api.post(`/role-checklists/by-role/${role}/items`, { text });
      setDraft('');
      await load();
    } finally {
      setBusy(false);
    }
  };

  const toggleItem = async (item) => {
    setBusy(true);
    try {
      await api.patch(`/role-checklists/by-role/${role}/items/${item.id}`, { done: !item.done });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const deleteItem = async (item) => {
    setBusy(true);
    try {
      await api.delete(`/role-checklists/by-role/${role}/items/${item.id}`);
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (!checklist) {
    return (
      <div className="card mt-4">
        <p className="text-slate-400">Loading checklist...</p>
      </div>
    );
  }

  return (
    <div className="card mt-4 border-2 border-brand-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">{label} Checklist</h3>
        <button onClick={onClose} className="text-xs text-slate-400">
          Close
        </button>
      </div>

      {checklist.items.length === 0 ? (
        <p className="text-sm text-slate-400 mb-4">No tasks added yet.</p>
      ) : (
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-100">
              <th className="font-medium pb-1.5 w-16">Done</th>
              <th className="font-medium pb-1.5">Checklist Item</th>
              {canManage && <th className="font-medium pb-1.5 w-10"></th>}
            </tr>
          </thead>
          <tbody>
            {checklist.items.map((item) => (
              <tr key={item.id} className="border-b border-slate-50 last:border-0">
                <td className="py-2">
                  <input
                    type="checkbox"
                    checked={item.done}
                    disabled={!canManage || busy}
                    onChange={() => toggleItem(item)}
                    className="w-4 h-4 accent-brand-600"
                  />
                </td>
                <td className={`py-2 ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.text}</td>
                {canManage && (
                  <td className="py-2 text-right">
                    <button disabled={busy} onClick={() => deleteItem(item)} className="text-slate-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {canManage && (
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Add a new checklist item..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
          />
          <button disabled={busy} onClick={addItem} className="btn-primary px-3 shrink-0 flex items-center gap-1 disabled:opacity-60">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add
          </button>
        </div>
      )}
    </div>
  );
};

const RoleChecklistPage = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const canManage = user?.role === 'secretary';

  return (
    <Layout title="Role Checklist" subtitle="Click a role to view and manage its task checklist">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {ROLES.map((r) => (
          <button
            key={r.role}
            onClick={() => setSelected(r)}
            className={`card flex flex-col items-center gap-2 py-6 hover:border-brand-300 transition-colors ${selected?.role === r.role ? 'border-brand-300 ring-1 ring-brand-100' : ''}`}
          >
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
              <r.icon size={22} />
            </div>
            <span className="font-medium text-slate-700 text-sm text-center">{r.label}</span>
          </button>
        ))}
      </div>

      {selected && <RoleChecklistDetail role={selected.role} label={selected.label} onClose={() => setSelected(null)} canManage={canManage} />}
    </Layout>
  );
};

export default RoleChecklistPage;
