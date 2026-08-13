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
  CalendarRange,
} from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const todayISO = () => new Date().toISOString().slice(0, 10);

const SummaryTile = ({ icon: Icon, label, value, tone = 'blue' }) => {
  const toneMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className="card flex items-center gap-3 py-3">
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

// A card with a scrollable table body - mirrors the reference mockup, where
// list-style cards (pets/vehicles/home-services/meetings/amenities/etc) have
// their own internal scrollbar instead of growing the whole page.
const ScrollCard = ({ icon: Icon, title, tone, children, maxHeight = 'max-h-44' }) => {
  const toneMap = { blue: 'text-blue-600', green: 'text-emerald-600', purple: 'text-purple-600', amber: 'text-amber-600', rose: 'text-rose-600' };
  return (
    <div className="card flex flex-col">
      <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm shrink-0">
        <Icon size={17} className={toneMap[tone]} /> {title}
      </h3>
      <div className={`${maxHeight} overflow-y-auto pr-1`}>{children}</div>
    </div>
  );
};

const BreakdownTable = ({ rows, total }) =>
  rows.length === 0 ? (
    <p className="text-sm text-slate-400">No records yet.</p>
  ) : (
    <table className="w-full text-sm">
      <tbody>
        {rows.map(([label, count]) => (
          <tr key={label} className="border-b border-slate-50">
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
  );

const PriorityTable = ({ tone, data }) => {
  const toneMap = { red: 'text-red-600', green: 'text-emerald-600' };
  const priorities = ['High', 'Medium', 'Low'];
  const total = priorities.reduce((s, p) => s + (data[p] || 0), 0);
  return (
    <table className="w-full text-sm">
      <tbody>
        {priorities.map((p) => (
          <tr key={p} className="border-b border-slate-50">
            <td className="py-1.5 text-slate-600">{p} Priority</td>
            <td className={`py-1.5 text-right font-semibold ${p === 'High' ? 'text-red-500' : p === 'Medium' ? 'text-amber-500' : 'text-slate-700'}`}>
              {data[p] || 0}
            </td>
          </tr>
        ))}
        <tr>
          <td className="pt-2 font-semibold text-slate-800">Total</td>
          <td className={`pt-2 text-right font-bold ${toneMap[tone]}`}>{total}</td>
        </tr>
      </tbody>
    </table>
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
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayISO());

  useEffect(() => {
    setLoading(true);
    api
      .get(`/dashboard/secretary?date=${selectedDate}`)
      .then((res) => setDetail(res.data))
      .catch(() => setError('Could not load the dashboard right now. Please try refreshing.'))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="text-red-600">{error}</div>
      </Layout>
    );
  }

  if (loading && !detail) {
    return (
      <Layout title="Dashboard">
        <div className="text-slate-400">Loading dashboard...</div>
      </Layout>
    );
  }

  const units = detail.units || {};
  const totalUnits = (units.Occupied || 0) + (units.Vacant || 0) + (units.Maintenance || 0);

  return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${user?.name} — Secretary overview for ${user?.society?.name || 'your society'}.`}>
      {/* Date filter - scopes visitors / upcoming meetings / finance below */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
          <CalendarRange size={14} /> Filter: By Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input w-auto py-1.5 text-sm"
        />
        {loading && <span className="text-xs text-slate-400">Updating...</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* ---------------- Main column ---------------- */}
        <div className="lg:col-span-3 space-y-4">
          {/* Row 1: flats, residents, visitors, upcoming meetings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                <Building2 size={16} /> No. of Flats / Houses
              </div>
              <p className="text-xl font-bold text-slate-800 mb-2">{totalUnits}</p>
              <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-100 pt-2">
                <div>
                  <p className="text-[11px] text-slate-400">Occupied</p>
                  <p className="font-semibold text-slate-700">{units.Occupied || 0}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Vacant</p>
                  <p className="font-semibold text-slate-700">{units.Vacant || 0}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Maint.</p>
                  <p className="font-semibold text-slate-700">{units.Maintenance || 0}</p>
                </div>
              </div>
            </div>

            <SummaryTile icon={Users} label="No. of Residents" value={detail.residents ?? 0} tone="green" />
            <SummaryTile icon={UserCheck} label="Visitors (selected date)" value={detail.visitorsToday ?? 0} tone="purple" />
            <SummaryTile icon={ShieldCheck} label="No. of Security Staff" value={detail.staff?.security ?? 0} tone="blue" />
          </div>

          {/* Row 2: housekeeping staff + leases + upcoming meetings table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-4">
              <SummaryTile icon={HardHat} label="No. of Housekeeping Staff" value={detail.staff?.housekeeping ?? 0} tone="amber" />
              <SummaryTile icon={FileClock} label="Leases Expiring Soon" value={detail.leases.expiringSoon} tone="rose" />
            </div>

            <div className="md:col-span-2">
              <ScrollCard icon={CalendarDays} title="Upcoming Meetings" tone="blue" maxHeight="max-h-40">
                {detail.meetings.length === 0 ? (
                  <p className="text-sm text-slate-400">No upcoming meetings.</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-white">
                      <tr className="text-slate-400 text-left">
                        <th className="font-medium pb-1">Date</th>
                        <th className="font-medium pb-1">Venue</th>
                        <th className="font-medium pb-1 text-right">No. of Agendas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.meetings.map((m) => (
                        <tr key={m._id} className="border-t border-slate-50">
                          <td className="py-1.5 text-slate-700 whitespace-nowrap">
                            {new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-1.5 text-slate-600 truncate max-w-[140px]">{m.location || '—'}</td>
                          <td className="py-1.5 text-right font-semibold text-slate-800">{m.agendaCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </ScrollCard>
            </div>
          </div>

          {/* Row 3: pets / vehicles / home services (scrollable) */}
          <div className="grid md:grid-cols-3 gap-4">
            <ScrollCard icon={PawPrint} title="No. of Pets (By Type)" tone="purple">
              <BreakdownTable rows={Object.entries(detail.pets.byType)} total={detail.pets.total} />
            </ScrollCard>
            <ScrollCard icon={Car} title="No. of Vehicles (By Type)" tone="blue">
              <BreakdownTable rows={Object.entries(detail.vehicles.byType)} total={detail.vehicles.total} />
            </ScrollCard>
            <ScrollCard icon={HomeIcon} title="No. of Home Services (By Type)" tone="green">
              <BreakdownTable rows={Object.entries(detail.homeServices.byType)} total={detail.homeServices.total} />
            </ScrollCard>
          </div>

          {/* Row 4: complaints + lease submissions */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                <AlertTriangle size={17} className="text-red-500" /> Pending Complaints &amp; Requests
              </h3>
              <PriorityTable tone="red" data={detail.complaints.pending} />
            </div>
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                <CheckCircle2 size={17} className="text-emerald-500" /> Resolved Complaints &amp; Requests
              </h3>
              <PriorityTable tone="green" data={detail.complaints.resolved} />
            </div>
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm">
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

          {/* Row 5: finance + celebration/donation */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                <Wallet size={17} className="text-emerald-600" /> Finance Summary (as of {selectedDate})
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

            <ScrollCard icon={Gift} title="Funds & Celebrations" tone="purple" maxHeight="max-h-28">
              {detail.funds.list.length === 0 ? (
                <p className="text-sm text-slate-400">No funds set up yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {detail.funds.list.map((f) => (
                    <li key={f._id} className="flex justify-between gap-2">
                      <span className="text-slate-600 truncate">{f.title}</span>
                      <span className="font-semibold text-slate-800 shrink-0">{inr(f.collectedAmount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollCard>
          </div>

          {/* Row 6: society fund & assets + amenities */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm">
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

            <ScrollCard icon={Dumbbell} title="Amenities" tone="rose">
              {detail.amenities.length === 0 ? (
                <p className="text-sm text-slate-400">No amenities set up yet.</p>
              ) : (
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-slate-400 text-left">
                      <th className="font-medium pb-1">Amenity</th>
                      <th className="font-medium pb-1 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.amenities.map((a) => (
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
              )}
            </ScrollCard>
          </div>
        </div>

        {/* ---------------- Right sidebar: Management List ---------------- */}
        <div className="lg:col-span-1">
          <div className="card lg:sticky lg:top-4">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
              <Crown size={17} className="text-amber-600" /> List of Management (By Role)
            </h3>
            {detail.management.length === 0 ? (
              <p className="text-sm text-slate-400">No management roles assigned yet.</p>
            ) : (
              <div className="space-y-1 text-sm max-h-[70vh] overflow-y-auto pr-1">
                {detail.management.map((m, i) => (
                  <div key={`${m.role}-${i}`} className="flex justify-between border-b border-slate-50 py-1.5 gap-2">
                    <span className="text-slate-500 truncate">{roleLabel(m.role)}</span>
                    <span className="font-medium text-slate-800 truncate text-right">{m.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SecretaryDashboard;
