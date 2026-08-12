import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Building2, Menu, X } from 'lucide-react';

const PublicNavbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'}`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <span className="font-bold text-lg text-slate-800">MySociety</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/plans" className={navLinkClass}>Plans &amp; Offers</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact Us</NavLink>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="btn-primary">Login</button>
        </div>

        <button className="md:hidden text-slate-600" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 px-4 py-3 space-y-3 bg-white">
          <NavLink to="/" end onClick={() => setOpen(false)} className="block text-sm font-medium text-slate-700">Home</NavLink>
          <NavLink to="/plans" onClick={() => setOpen(false)} className="block text-sm font-medium text-slate-700">Plans & Offers</NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)} className="block text-sm font-medium text-slate-700">Contact Us</NavLink>
          <button
            onClick={() => {
              setOpen(false);
              navigate('/login');
            }}
            className="btn-primary w-full"
          >
            Login
          </button>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
