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
  Banknote,
  PiggyBank,
  Landmark,
  Dumbbell,
  Crown,
  Tag,
  CalendarRange,
} from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const todayISO = () => new Date().toISOString().slice(0, 10);
const AVATAR_COLORS = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-indigo-100 text-indigo-700'];

const CardTitle = ({ icon: Icon, tone, children }) => {
  const toneMap = { blue: 'text-blue-600', green: 'text-emerald-600', purple: 'text-purple-600', amber: 'text-amber-600', rose: 'text-rose-600', red: 'text-red-500' };
  return (
    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
      <Icon size={17} className={toneMap[tone]} /> {children}
    </h3>
  );
};

const StatTile = ({ icon: Icon, label, value, tone = 'blue' }) => {
  const toneMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className="card flex items-center gap-3 py-3.5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${toneMap[tone]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 leading-tight">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

// Two stats stacked in one card - used for Security/Housekeeping so the row
// doesn't end up with two nearly-empty tiles side by side.
const DualStatCard = ({ items }) => (
  <div className="card py-3.5">
    <div className="grid grid-cols-2 divide-x divide-slate-100">
      {items.map(({ icon: Icon, label, value, tone }) => (
        <div key={label} className="flex items-center gap-3 px-3 first:pl-0 last:pr-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 leading-tight">{label}</p>
            <p className="text-lg font-bold text-slate-800">{value}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

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
            <td className="py-1.5 text-slate-600">{p}</td>
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

const FinanceTiles = ({ collection, expense, balance }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <StatTile icon={Wallet} label="Total Collection" value={inr(collection)} tone="green" />
    <StatTile icon={Banknote} label="Total Expense" value={inr(expense)} tone="rose" />
    <StatTile icon={PiggyBank} label="Total Balance" value={inr(balance)} tone="blue" />
  </div>
);

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

  const dateFilter = (
    <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
      <CalendarRange size={14} />
      <span className="font-medium whitespace-nowrap">Filter: By Date</span>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="bg-transparent text-xs outline-none border-none p-0 w-28"
      />
    </div>
  );

  if (error) {
    return (
      <Layout title="Dashboard" topbarExtra={dateFilter}>
        <div className="text-red-600">{error}</div>
      </Layout>
    );
  }

  if (loading && !detail) {
    return (
      <Layout title="Dashboard" topbarExtra={dateFilter}>
        <div className="text-slate-400">Loading dashboard...</div>
      </Layout>
    );
  }

  const units = detail.units || {};

  return (
    <Layout title="Dashboard" topbarExtra={dateFilter}>
      <div className="space-y-4">
        {/* ---- Flats/Houses (own card, since it carries a breakdown) + quick stat tiles ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card py-3.5">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
              <Building2 size={16} /> No. of Flats / Houses
            </div>
            <p className="text-lg font-bold text-slate-800 mb-2">{detail.totalUnits}</p>
            <div className="flex items-center justify-between text-center border-t border-slate-100 pt-2">
              <div className="flex-1">
                <p className="text-[11px] text-slate-400">Owner</p>
                <p className="font-semibold text-slate-700 text-sm">{units.Owner || 0}</p>
              </div>
              <div className="flex-1 border-l border-slate-100">
                <p className="text-[11px] text-slate-400">Tenant</p>
                <p className="font-semibold text-slate-700 text-sm">{units.Tenant || 0}</p>
              </div>
              <div className="flex-1 border-l border-slate-100">
                <p className="text-[11px] text-slate-400">Vacant</p>
                <p className="font-semibold text-slate-700 text-sm">{units.Vacant || 0}</p>
              </div>
            </div>
          </div>

          <StatTile icon={Users} label="No. of Residents" value={detail.residents ?? 0} tone="green" />
          <StatTile icon={UserCheck} label="No. of Visitors" value={detail.visitorsToday ?? 0} tone="purple" />
          <StatTile icon={Tag} label="No. of Properties in Sales" value={detail.propertiesInSale ?? 0} tone="rose" />
        </div>

        {/* ---- Staff (merged into one card) + Upcoming Meetings ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <DualStatCard
            items={[
              { icon: ShieldCheck, label: 'Security Staff', value: detail.staff?.security ?? 0, tone: 'bg-blue-50 text-blue-600' },
              { icon: HardHat, label: 'Housekeeping Staff', value: detail.staff?.housekeeping ?? 0, tone: 'bg-amber-50 text-amber-600' },
            ]}
          />

          <div className="card lg:col-span-2 min-w-0">
            <CardTitle icon={CalendarDays} tone="blue">Upcoming Meetings</CardTitle>
            {detail.meetings.length === 0 ? (
              <p className="text-sm text-slate-400">No upcoming meetings.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-left border-b border-slate-100">
                    <th className="font-medium pb-1.5">Date</th>
                    <th className="font-medium pb-1.5">Time</th>
                    <th className="font-medium pb-1.5">Venue</th>
                    <th className="font-medium pb-1.5 text-right">Agendas</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.meetings.map((m) => (
                    <tr key={m._id} className="border-b border-slate-50 last:border-0">
                      <td className="py-1.5 text-slate-700 whitespace-nowrap">
                        {new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-1.5 text-slate-600 whitespace-nowrap">{m.time || '—'}</td>
                      <td className="py-1.5 text-slate-600">{m.location || '—'}</td>
                      <td className="py-1.5 text-right font-semibold text-slate-800">{m.agendaCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ---- Pets / Vehicles / Home Services ---- */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card min-w-0">
            <CardTitle icon={PawPrint} tone="purple">No. of Pets (By Type)</CardTitle>
            <BreakdownTable rows={Object.entries(detail.pets.byType)} total={detail.pets.total} />
          </div>
          <div className="card min-w-0">
            <CardTitle icon={Car} tone="blue">No. of Vehicles (By Type)</CardTitle>
            <BreakdownTable rows={Object.entries(detail.vehicles.byType)} total={detail.vehicles.total} />
          </div>
          <div className="card min-w-0">
            <CardTitle icon={HomeIcon} tone="green">No. of Home Services (By Type)</CardTitle>
            <BreakdownTable rows={Object.entries(detail.homeServices.byType)} total={detail.homeServices.total} />
          </div>
        </div>

        {/* ---- Complaints (merged Pending+Resolved into one card) + Lease Submission ---- */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="card lg:col-span-2 min-w-0">
            <CardTitle icon={AlertTriangle} tone="red">Complaints &amp; Requests (By Priority)</CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <AlertTriangle size={12} className="text-red-500" /> Pending
                </p>
                <PriorityTable tone="red" data={detail.complaints.pending} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-500" /> Resolved
                </p>
                <PriorityTable tone="green" data={detail.complaints.resolved} />
              </div>
            </div>
          </div>

          <div className="card min-w-0">
            <CardTitle icon={FileClock} tone="amber">Expire / Pending Lease Submission</CardTitle>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-50">
                  <td className="py-1.5 text-slate-600">Expire</td>
                  <td className="py-1.5 text-right font-semibold text-red-500">{detail.leases.expiringSoon}</td>
                </tr>
                <tr className="border-b border-slate-50">
                  <td className="py-1.5 text-slate-600">Pending</td>
                  <td className="py-1.5 text-right font-semibold text-amber-600">{detail.leases.pending}</td>
                </tr>
                <tr>
                  <td className="pt-2 font-semibold text-slate-800">Total</td>
                  <td className="pt-2 text-right font-bold text-slate-900">{detail.leases.total}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ---- Finance Summary ---- */}
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Finance Summary (as of {selectedDate})</p>
          <FinanceTiles collection={detail.finance.collection} expense={detail.finance.expense} balance={detail.finance.balance} />
        </div>

        {/* ---- Celebration / Donation ---- */}
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-1.5">
            <Gift size={13} className="text-purple-600" /> Celebration / Donation
          </p>
          <FinanceTiles collection={detail.celebration.collection} expense={detail.celebration.expense} balance={detail.celebration.balance} />
        </div>

        {/* ---- Society Fund & Assets + Amenities ---- */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="card min-w-0">
            <CardTitle icon={Landmark} tone="blue">Society Fund &amp; Assets Information</CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1">Society Fund</p>
                <table className="w-full text-sm table-fixed">
                  <tbody>
                    {detail.funds.list.map((f) => (
                      <tr key={f._id} className="border-b border-slate-50">
                        <td className="py-1.5 text-slate-600 truncate pr-2">{f.title}</td>
                        <td className="py-1.5 text-right font-semibold text-slate-800 whitespace-nowrap w-24">{Number(f.collectedAmount).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="pt-2 font-semibold text-slate-800">Total</td>
                      <td className="pt-2 text-right font-bold text-emerald-600 whitespace-nowrap">{Number(detail.funds.totalCollected).toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1">Assets</p>
                <table className="w-full text-sm table-fixed">
                  <tbody>
                    {detail.investments.assetsList.map((a) => (
                      <tr key={a._id} className="border-b border-slate-50">
                        <td className="py-1.5 text-slate-600 truncate pr-2">{a.name}</td>
                        <td className="py-1.5 text-right font-semibold text-slate-800 whitespace-nowrap w-24">{Number(a.amount).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="pt-2 font-semibold text-slate-800">Total</td>
                      <td className="pt-2 text-right font-bold text-blue-600 whitespace-nowrap">{Number(detail.investments.totalAssets).toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card min-w-0">
            <CardTitle icon={Dumbbell} tone="rose">Amenities</CardTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[420px]">
                <thead>
                  <tr className="text-slate-400 text-left border-b border-slate-100">
                    <th className="font-medium pb-1.5">Amenity</th>
                    <th className="font-medium pb-1.5 text-right">Capacity</th>
                    <th className="font-medium pb-1.5 text-right">Used</th>
                    <th className="font-medium pb-1.5 text-right">Available</th>
                    <th className="font-medium pb-1.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.amenities.map((a) => (
                    <tr key={a._id} className="border-b border-slate-50 last:border-0">
                      <td className="py-1.5 text-slate-700 whitespace-nowrap">{a.name}</td>
                      <td className="py-1.5 text-right text-slate-600">{a.capacity ?? 0}</td>
                      <td className="py-1.5 text-right text-slate-600">{a.used ?? 0}</td>
                      <td className="py-1.5 text-right text-slate-600">{a.available ?? 0}</td>
                      <td className="py-1.5 text-right">
                        <span
                          className={`badge whitespace-nowrap ${
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
        </div>

        {/* ---- List of Management (full width, multi-column so it never needs a cramped scrollbox) ---- */}
        <div className="card min-w-0">
          <CardTitle icon={Crown} tone="amber">List of Management (By Role)</CardTitle>
          {detail.management.length === 0 ? (
            <p className="text-sm text-slate-400">No management roles assigned yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              {detail.management.map((m, i) => (
                <div key={`${m.role}-${i}`} className="flex items-center justify-between border-b border-slate-50 py-2 gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                      {(m.name || '?').charAt(0).toUpperCase()}
                    </span>
                    <span className="text-slate-500 text-sm truncate">{roleLabel(m.role)}</span>
                  </span>
                  <span className="font-medium text-slate-800 text-sm truncate text-right shrink-0">{m.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SecretaryDashboard;
