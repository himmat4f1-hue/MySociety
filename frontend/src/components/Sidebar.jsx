import React from 'react';
import { NavLink } from 'react-router-dom';
import { Building, LifeBuoy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NAV_ITEMS } from '../config/navConfig';

const roleColors = {
  security: 'bg-slate-900',
  resident: 'bg-emerald-800',
  accountant: 'bg-violet-800',
  secretary: 'bg-rose-900',
  chairman: 'bg-blue-900',
  treasurer: 'bg-indigo-900',
  committee_member: 'bg-teal-800',
  tenant: 'bg-emerald-700',
  housekeeping: 'bg-orange-800',
};

const Sidebar = () => {
  const { user } = useAuth();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));
  const themeClass = roleColors[user?.role] || 'bg-slate-900';

  return (
    <aside className={`${themeClass} text-white w-64 min-h-screen flex flex-col shrink-0`}>
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <Building size={26} />
        <div>
          <p className="font-bold leading-tight">MySociety</p>
          <p className="text-xs text-white/60 leading-tight">Greenfield Residency</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/app'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-white/15 font-semibold' : 'text-white/80 hover:bg-white/10'
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="px-2 py-4 border-t border-white/10">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:bg-white/10 w-full">
          <LifeBuoy size={18} />
          Help & Support
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
