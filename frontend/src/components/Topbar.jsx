import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Search, ChevronDown, Building2, Plus, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const roleLabels = {
  security: 'Security Staff',
  resident: 'Resident (Owner/Member)',
  accountant: 'Accountant',
  secretary: 'Secretary',
  chairman: 'Chairman',
  treasurer: 'Treasurer',
  committee_member: 'Committee Member',
  tenant: 'Tenant',
  housekeeping: 'Housekeeping Staff',
};

// Groups the flat /auth/my-societies list into one entry per society so the
// dropdown reads as "Society name -> its roles/flats", not one long flat list.
const groupBySociety = (list) => {
  const bySociety = new Map();
  list.forEach((m) => {
    if (!bySociety.has(m.societyId)) {
      bySociety.set(m.societyId, { societyId: m.societyId, name: m.name, accounts: [] });
    }
    bySociety.get(m.societyId).accounts.push(m);
  });
  return [...bySociety.values()];
};

const Topbar = ({ title, subtitle }) => {
  const { user, logout, switchAccount } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [memberships, setMemberships] = useState(null);
  const [switching, setSwitching] = useState(null); // membershipId currently switching to

  const openSwitcher = async () => {
    const next = !menuOpen;
    setMenuOpen(next);
    if (next && !memberships) {
      try {
        const res = await api.get('/auth/my-societies');
        setMemberships(res.data);
      } catch {
        setMemberships([]);
      }
    }
  };

  const handleSwitch = async (m) => {
    setSwitching(m.membershipId);
    try {
      await switchAccount(m.membershipId);
      window.location.href = '/app';
    } catch {
      alert('Could not switch to that account. Please try again.');
      setSwitching(null);
    }
  };

  const isCurrent = (m) =>
    m.societyId === user?.society?._id && m.role === user?.role && (m.flatId || null) === (user?.flatId || null);

  const grouped = memberships ? groupBySociety(memberships) : [];

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-64">
          <Search size={16} className="text-slate-400" />
          <input
            className="bg-transparent text-sm outline-none w-full placeholder:text-slate-400"
            placeholder="Search..."
          />
        </div>

        <button className="relative p-2 rounded-lg hover:bg-slate-100">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </button>

        <div className="relative">
          <button onClick={openSwitcher} className="hidden sm:flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-600 max-w-[180px]">
            <Building2 size={14} className="shrink-0" />
            <span className="truncate">{user?.society?.name || 'Society'}</span>
            <ChevronDown size={14} className="shrink-0" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-2 max-h-96 overflow-y-auto">
                <p className="px-3 py-1 text-xs font-semibold text-slate-400">SWITCH ACCOUNT</p>
                {memberships === null && <p className="px-3 py-2 text-sm text-slate-400">Loading...</p>}
                {memberships !== null && memberships.length === 0 && (
                  <p className="px-3 py-2 text-sm text-slate-400">No accounts found.</p>
                )}

                {grouped.map((group) => (
                  <div key={group.societyId} className="mb-1">
                    <p className="px-3 pt-1.5 pb-0.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide truncate">{group.name}</p>
                    {group.accounts.map((m) => (
                      <button
                        key={m.membershipId}
                        disabled={switching !== null}
                        onClick={() => handleSwitch(m)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between gap-2 disabled:opacity-50"
                      >
                        <span className="min-w-0">
                          <span className="block truncate">{roleLabels[m.role] || m.role}</span>
                          {m.flatId && (
                            <span className="block text-xs text-slate-400 truncate">
                              Flat {m.flatNo || m.flatId}
                              {m.tower ? ` · ${m.tower}` : ''}
                            </span>
                          )}
                        </span>
                        {switching === m.membershipId ? (
                          <Loader2 size={14} className="animate-spin text-brand-500 shrink-0" />
                        ) : isCurrent(m) ? (
                          <Check size={14} className="text-brand-600 shrink-0" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                ))}

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => navigate('/plans')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-1.5 text-brand-600"
                  >
                    <Plus size={14} /> Add another society
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold text-sm shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-medium text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500">
              {roleLabels[user?.role] || user?.role}
              {user?.flatId ? ` · Flat ${user.flatId}` : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          title="Logout"
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-red-600"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
