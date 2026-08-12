import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Search, ChevronDown, Building2, Plus } from 'lucide-react';
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

const Topbar = ({ title, subtitle }) => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [memberships, setMemberships] = useState(null);
  const [switching, setSwitching] = useState(false);

  const openSwitcher = async () => {
    setMenuOpen(!menuOpen);
    if (!memberships) {
      try {
        const res = await api.get('/auth/my-societies');
        setMemberships(res.data);
      } catch {
        setMemberships([]);
      }
    }
  };

  const handleSwitch = async (m) => {
    const password = window.prompt('For security, please re-enter your password to switch:');
    if (!password) return;
    setSwitching(true);
    try {
      await login({ email: user.email, password, societyId: m.societyId, role: m.role, flatId: m.flatId || undefined });
      window.location.href = '/app';
    } catch {
      alert('Could not switch - check your password and try again.');
    } finally {
      setSwitching(false);
    }
  };

  const isCurrent = (m) => m.societyId === user?.society?._id && m.role === user?.role && (m.flatId || null) === (user?.flatId || null);

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
          <button onClick={openSwitcher} className="hidden sm:flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-600">
            <Building2 size={14} />
            {user?.society?.name || 'Society'}
            <ChevronDown size={14} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-2">
              <p className="px-3 py-1 text-xs font-semibold text-slate-400">YOUR ACCOUNTS</p>
              {memberships === null && <p className="px-3 py-2 text-sm text-slate-400">Loading...</p>}
              {memberships?.map((m) => (
                <button
                  key={`${m.societyId}-${m.role}-${m.flatId}`}
                  disabled={switching}
                  onClick={() => handleSwitch(m)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between disabled:opacity-50"
                >
                  <span>
                    <span className="block">{m.name}</span>
                    <span className="block text-xs text-slate-400">
                      {roleLabels[m.role] || m.role}
                      {m.flatId ? ` · Flat ${m.flatId}` : ''}
                    </span>
                  </span>
                  {isCurrent(m) && <span className="text-brand-600 text-xs shrink-0">current</span>}
                </button>
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
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold text-sm">
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
