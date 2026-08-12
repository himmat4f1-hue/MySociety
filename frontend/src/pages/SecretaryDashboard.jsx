import React, { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  UserCheck,
  CalendarDays,
  ShieldCheck,
  HardHat,
  PawPrint,
  Car,
  HomeIcon,
  AlertTriangle,
  CheckCircle2,
  FileClock,
  Gift,
  Wallet,
  Landmark,
  Dumbbell,
  Crown,
} from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const SummaryTile = ({ icon: Icon, label, value, tone = 'blue' }) => {
  const toneMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className="card flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${toneMap[tone]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 truncate">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

const BreakdownCard = ({ icon: Icon, title, tone, rows, total }) => {
  const toneMap = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
  };
  return (
    <div className="card">
      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
        <Icon size={17} className={toneMap[tone]} /> {title}
      </h3>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([label, count]) => (
            <tr key={label} className="border-b border-slate-50 last:border-0">
              <td className="py-1.5 text-slate-600">{label}</td>
              <td className="py-1.5 text-right font-semibold text-slate-800">{count}</td>
            </tr>
          ))}
          <tr>
            <td className="pt-2 font-semibold text-slate-800">Total</td>
            <td className="pt-2 text-right font-bold text-slate-900">{total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const PriorityCard = ({ icon: Icon, title, tone, data }) => {
  const toneMap = {
    red: { icon: 'text-red-500', total: 'text-red-600' },
    green: { icon: 'text-emerald-500', total: 'text-emerald-600' },
  };
  const priorities = ['High', 'Medium', 'Low'];
  const total = priorities.reduce((s, p) => s + (data[p] || 0), 0);
  return (
    <div className="card">
      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
        <Icon size={17} className={toneMap[tone].icon} /> {title}
      </h3>
      <table className="w-full text-sm">
        <tbody>
          {priorities.map((p) => (
            <tr key={p} className="border-b border-slate-50 last:border-0">
              <td className="py-1.5 text-slate-600">{p} Priority</td>
              <td className={`py-1.5 text-right font-semibold ${p === 'High' ? 'text-red-500' : p === 'Medium' ? 'text-amber-500' : 'text-slate-700'}`}>
                {data[p] || 0}
              </td>
            </tr>
          ))}
          <tr>
            <td className="pt-2 font-semibold text-slate-800">Total</td>
            <td className={`pt-2 text-right font-bold ${toneMap[tone].total}`}>{total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const roleLabel = (role) =>
  ({
    security: 'Security Incharge',
    resident: 'Resident',
    accountant: 'Accountant Incharge',
    secretary: 'Secretary',
    chairman: 'Chairman',
    treasurer: 'Treasurer',
    committee_member: 'Committee Member',
    tenant: 'Tenant',
    housekeeping: 'Housekeeping Incharge',
  }[role] || role);

const SecretaryDashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/dashboard/overview'), api.get('/dashboard/secretary')])
      .then(([a, b]) => {
        setOverview(a.data);
        setDetail(b.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !overview || !detail) {
    return (
      <Layout title="Dashboard">
        <div className="text-slate-400">Loading dashboard...</div>
      </Layout>
    );
  }

  const units = detail.units || {};
  const totalUnits = overview.units.total;

  return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${user?.name} — Secretary overview for your society.`}>
      {/* Top summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="card">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
            <Building2 size={16} /> No. of Flats / Houses: {totalUnits}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[11px] text-slate-400">Occupied</p>
              <p className="font-bold text-slate-800">{units.Occupied || 0}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Vacant</p>
              <p className="font-bold text-slate-800">{units.Vacant || 0}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Maint.</p>
              <p className="font-bold text-slate-800">{units.Maintenance || 0}</p>
            </div>
          </div>
        </div>

        <SummaryTile icon={Users} label="No. of Residents" value={overview.residents.total} tone="green" />
        <SummaryTile icon={UserCheck} label="No. of Visitors Today" value={overview.visitors.today} tone="purple" />

        <div className="card">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
            <CalendarDays size={16} /> Upcoming Meeting
          </div>
          {detail.meetings?.[0] ? (
            <div>
              <p className="font-semibold text-sm text-slate-800 truncate">{detail.meetings[0].title}</p>
              <p className="text-xs text-slate-500">
                {new Date(detail.meetings[0].date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No upcoming meetings</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryTile icon={ShieldCheck} label="Security Staff" value="—" tone="blue" />
        <SummaryTile icon={HardHat} label="Housekeeping Staff" value="—" tone="amber" />
        <SummaryTile icon={Crown} label="Management Roles" value={detail.management.length} tone="purple" />
        <SummaryTile icon={FileClock} label="Leases Expiring Soon" value={detail.leases.expiringSoon} tone="rose" />
      </div>

      {/* Pets / Vehicles / Home Services */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <BreakdownCard
          icon={PawPrint}
          title="No. of Pets (By Type)"
          tone="purple"
          rows={Object.entries(detail.pets.byType)}
          total={detail.pets.total}
        />
        <BreakdownCard
          icon={Car}
          title="No. of Vehicles (By Type)"
          tone="blue"
          rows={Object.entries(detail.vehicles.byType)}
          total={detail.vehicles.total}
        />
        <BreakdownCard
          icon={HomeIcon}
          title="No. of Home Services (By Type)"
          tone="green"
          rows={Object.entries(detail.homeServices.byType)}
          total={detail.homeServices.total}
        />
      </div>

      {/* Complaints */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <PriorityCard icon={AlertTriangle} title="Pending Complaints & Requests (By Priority)" tone="red" data={detail.complaints.pending} />
        <PriorityCard icon={CheckCircle2} title="Resolved Complaints & Requests (By Priority)" tone="green" data={detail.complaints.resolved} />

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
            <FileClock size={17} className="text-amber-500" /> Lease Submissions
          </h3>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-50">
                <td className="py-1.5 text-slate-600">Expiring Soon</td>
                <td className="py-1.5 text-right font-semibold text-amber-600">{detail.leases.expiringSoon}</td>
              </tr>
              <tr>
                <td className="pt-2 font-semibold text-slate-800">Total Leases</td>
                <td className="pt-2 text-right font-bold text-slate-900">{detail.leases.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Finance + Celebration/Donation */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
            <Wallet size={17} className="text-emerald-600" /> Finance Summary
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-slate-500">Total Collection</p>
              <p className="font-bold text-emerald-600">{inr(detail.finance.collection)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Expense</p>
              <p className="font-bold text-red-500">{inr(detail.finance.expense)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Balance</p>
              <p className="font-bold text-slate-800">{inr(detail.finance.balance)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
            <Gift size={17} className="text-purple-600" /> Funds &amp; Celebrations
          </h3>
          <ul className="space-y-2 text-sm max-h-32 overflow-y-auto">
            {detail.funds.list.map((f) => (
              <li key={f._id} className="flex justify-between">
                <span className="text-slate-600 truncate pr-2">{f.title}</span>
                <span className="font-semibold text-slate-800 shrink-0">{inr(f.collectedAmount)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Fund/Assets + Amenities */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
            <Landmark size={17} className="text-blue-600" /> Society Fund &amp; Assets
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Fund Collected</p>
              <p className="text-lg font-bold text-emerald-600">{inr(detail.funds.totalCollected)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Assets</p>
              <p className="text-lg font-bold text-blue-600">{inr(detail.investments.totalAssets)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
            <Dumbbell size={17} className="text-rose-600" /> Amenities
          </h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 text-left">
                <th className="font-medium pb-1">Amenity</th>
                <th className="font-medium pb-1 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {detail.amenities.slice(0, 5).map((a) => (
                <tr key={a._id} className="border-t border-slate-50">
                  <td className="py-1.5 text-slate-700">{a.name}</td>
                  <td className="py-1.5 text-right">
                    <span
                      className={`badge ${
                        a.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-600'
                          : a.status === 'Under Maintenance'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Management list */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
          <Crown size={17} className="text-amber-600" /> List of Management (By Role)
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm max-h-72 overflow-y-auto pr-1">
          {detail.management.map((m, i) => (
            <div key={i} className="flex justify-between border-b border-slate-50 py-1.5">
              <span className="text-slate-500">{roleLabel(m.role)}</span>
              <span className="font-medium text-slate-800">{m.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SecretaryDashboard;
