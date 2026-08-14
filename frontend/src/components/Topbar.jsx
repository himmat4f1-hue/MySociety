import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, ChevronDown, Building2, Plus, Check, Loader2, Menu, ShieldAlert, Megaphone } from 'lucide-react';
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

const EMERGENCY_TYPES = ['Medical', 'Security', 'Fire/Safety', 'Other'];

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

const Topbar = ({ title, subtitle, extra, onMenuClick }) => {
  const { user, logout, switchAccount } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [memberships, setMemberships] = useState(null);
  const [switching, setSwitching] = useState(null); // membershipId currently switching to

  // Notifications (real data - recent Notices, not a fake hardcoded badge)
  const [notifOpen, setNotifOpen] = useState(false);
  const [notices, setNotices] = useState(null);

  // Emergency (SOS) - lives here instead of the sidebar since it needs to be
  // reachable from anywhere, not buried in the menu.
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencies, setEmergencies] = useState(null);
  const [raising, setRaising] = useState(false);
  const [emergencyType, setEmergencyType] = useState(EMERGENCY_TYPES[0]);
  const [emergencyNotes, setEmergencyNotes] = useState('');

  const openSwitcher = async () => {
    const next = !menuOpen;
    setMenuOpen(next);
    setNotifOpen(false);
    setEmergencyOpen(false);
    if (next && !memberships) {
      try {
        const res = await api.get('/auth/my-societies');
        setMemberships(res.data);
      } catch {
        setMemberships([]);
      }
    }
  };

  const openNotifications = async () => {
    const next = !notifOpen;
    setNotifOpen(next);
    setMenuOpen(false);
    setEmergencyOpen(false);
    if (next) {
      try {
        const res = await api.get('/notices', { params: { limit: 6, page: 1 } });
        setNotices(res.data.data || []);
      } catch {
        setNotices([]);
      }
    }
  };

  const loadEmergencies = async () => {
    try {
      const res = await api.get('/emergencies', { params: { status: 'Active', limit: 10 } });
      setEmergencies(res.data.data || []);
    } catch {
      setEmergencies([]);
    }
  };

  const openEmergency = async () => {
    const next = !emergencyOpen;
    setEmergencyOpen(next);
    setMenuOpen(false);
    setNotifOpen(false);
    if (next) await loadEmergencies();
  };

  const handleRaiseEmergency = async () => {
    setRaising(true);
    try {
      await api.post('/emergencies', { type: emergencyType, notes: emergencyNotes });
      setEmergencyNotes('');
      await loadEmergencies();
    } catch {
      alert('Could not raise the emergency alert. Please try again or contact security directly.');
    } finally {
      setRaising(false);
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
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-100 shrink-0">
          <Menu size={22} className="text-slate-600" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {extra}

        {/* Emergency (SOS) */}
        <div className="relative">
          <button onClick={openEmergency} title="Emergency (SOS)" className="relative p-2 rounded-lg hover:bg-red-50">
            <ShieldAlert size={20} className="text-red-600" />
          </button>
          {emergencyOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setEmergencyOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-2">
                <p className="px-3 py-1 text-xs font-semibold text-red-500 flex items-center gap-1">
                  <ShieldAlert size={12} /> ACTIVE EMERGENCIES
                </p>
                <div className="max-h-56 overflow-y-auto">
                  {emergencies === null && <p className="px-3 py-2 text-sm text-slate-400">Loading...</p>}
                  {emergencies !== null && emergencies.length === 0 && (
                    <p className="px-3 py-2 text-sm text-slate-400">No active emergencies right now.</p>
                  )}
                  {emergencies?.map((e) => (
                    <div key={e._id} className="px-3 py-2 text-sm border-b border-slate-50 last:border-0">
                      <span className="font-medium text-red-600">{e.type}</span>
                      {e.flatNo && <span className="text-slate-500"> · Flat {e.flatNo}</span>}
                      {e.notes && <p className="text-xs text-slate-500 mt-0.5">{e.notes}</p>}
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 mt-1 pt-2 px-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-500">Raise Emergency</p>
                  <select className="input py-1.5 text-xs" value={emergencyType} onChange={(e) => setEmergencyType(e.target.value)}>
                    {EMERGENCY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input py-1.5 text-xs"
                    placeholder="Brief notes (optional)"
                    value={emergencyNotes}
                    onChange={(e) => setEmergencyNotes(e.target.value)}
                  />
                  <button
                    onClick={handleRaiseEmergency}
                    disabled={raising}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-2 rounded-lg disabled:opacity-60 flex items-center justify-center gap-1"
                  >
                    {raising && <Loader2 size={12} className="animate-spin" />}
                    {raising ? 'Raising...' : 'Raise Emergency Alert'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications (real recent Notices, not a fake badge) */}
        <div className="relative">
          <button onClick={openNotifications} className="relative p-2 rounded-lg hover:bg-slate-100">
            <Bell size={20} className="text-slate-600" />
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-2">
                <p className="px-3 py-1 text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Megaphone size={12} /> RECENT NOTICES
                </p>
                <div className="max-h-72 overflow-y-auto">
                  {notices === null && <p className="px-3 py-2 text-sm text-slate-400">Loading...</p>}
                  {notices !== null && notices.length === 0 && <p className="px-3 py-2 text-sm text-slate-400">No notices yet.</p>}
                  {notices?.map((n) => (
                    <div key={n._id} className="px-3 py-2 text-sm border-b border-slate-50 last:border-0">
                      <p className="font-medium text-slate-700 truncate">{n.title}</p>
                      <p className="text-xs text-slate-400">
                        {n.category} · {n.building}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button onClick={() => navigate('/app/notices')} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 text-brand-600">
                    View all notices
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

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
