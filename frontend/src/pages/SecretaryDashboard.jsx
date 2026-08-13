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

// Scrollbar is ALWAYS visible (not just on overflow), and each card gets
// exactly ONE scroll region for its whole body - never two nested scroll
// areas inside the same card (that's what was causing the stray horizontal
// scrollbars before).
const SCROLL_CLS = 'overflow-y-scroll overflow-x-hidden';

const AVATAR_COLORS = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];

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
        <p className="text-xs text-slate-500 leading-snug">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

const BreakdownTable = ({ rows, total }) =>
  rows.length === 0 ? (
    <p className="text-sm text-slate-400">No records yet.</p>
  ) : (
    <table className="w-full text-xs">
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
    <table className="w-full text-xs">
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

// Reference mockup shows Finance Summary and Celebration/Donation as three
// small icon-tiles in a row (same visual language as the top summary tiles),
// NOT one bordered card with three unlabeled numbers - this reproduces that.
const FinanceTiles = ({ collection, expense, balance }) => (
  <div className="grid grid-cols-3 gap-3">
    <SummaryTile icon={Wallet} label="Total Collection" value={inr(collection)} tone="green" />
    <SummaryTile icon={Banknote} label="Total Expense" value={inr(expense)} tone="rose" />
    <SummaryTile icon={PiggyBank} label="Total Balance" value={inr(balance)} tone="blue" />
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

  // Date filter lives IN the Topbar (next to the notification bell/switcher),
  // matching the reference layout - not as a separate row in the page body.
  const dateFilter = (
    <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
      <CalendarRange size={14} />
      <span className="font-medium">Filter: By Date</span>
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
  const occupied = (units.Owner || 0) + (units.Tenant || 0);

  return (
    <Layout title="Dashboard" topbarExtra={dateFilter}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
        {/* ============ MAIN COLUMN ============ */}
        <div className="lg:col-span-3 space-y-4">
          {/* Row 1: flats, residents, visitors, upcoming meetings (wider) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="card">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                <Building2 size={16} /> No. of Flats / Houses: <span className="font-semibold text-slate-700">{detail.totalUnits}</span>
              </div>
              <table className="w-full text-center text-xs">
                <thead>
                  <tr>
                    <th colSpan={2} className="font-medium text-slate-400 pb-1 border-b border-slate-100">Occupied</th>
                    <th className="font-medium text-slate-400 pb-1 border-b border-slate-100"></th>
                  </tr>
                  <tr>
                    <th className="font-medium text-slate-400 pt-1">Owner</th>
                    <th className="font-medium text-slate-400 pt-1">Tenant</th>
                    <th className="font-medium text-slate-400 pt-1">Vacant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold text-slate-800 pt-1">{units.Owner || 0}</td>
                    <td className="font-semibold text-slate-800 pt-1">{units.Tenant || 0}</td>
                    <td className="font-semibold text-slate-800 pt-1">{units.Vacant || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <SummaryTile icon={Users} label="No. of Residents" value={detail.residents ?? 0} tone="green" />
            <SummaryTile icon={UserCheck} label="No. of Visitors" value={detail.visitorsToday ?? 0} tone="purple" />

            <div className="card flex flex-col lg:col-span-2">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm shrink-0">
                <CalendarDays size={17} className="text-blue-600" /> Upcoming Meeting
              </h3>
              <div className={`h-28 ${SCROLL_CLS}`}>
                {detail.meetings.length === 0 ? (
                  <p className="text-sm text-slate-400">No upcoming meetings.</p>
                ) : (
                  <table className="w-full text-xs table-fixed">
                    <thead>
                      <tr className="text-slate-400 text-left">
                        <th className="font-medium pb-1 w-20">Date</th>
                        <th className="font-medium pb-1 w-16">Time</th>
                        <th className="font-medium pb-1">Venue</th>
                        <th className="font-medium pb-1 text-right w-16">Agendas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.meetings.map((m) => (
                        <tr key={m._id} className="border-t border-slate-50">
                          <td className="py-1.5 text-slate-700 whitespace-nowrap">
                            {new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </td>
                          <td className="py-1.5 text-slate-600 whitespace-nowrap">{m.time || '—'}</td>
                          <td className="py-1.5 text-slate-600 truncate">{m.location || '—'}</td>
                          <td className="py-1.5 text-right font-semibold text-slate-800">{m.agendaCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: staff (no truncation - just two natural-width cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SummaryTile icon={ShieldCheck} label="No. of Security Staff" value={detail.staff?.security ?? 0} tone="blue" />
            <SummaryTile icon={HardHat} label="No. of Housekeeping Staff" value={detail.staff?.housekeeping ?? 0} tone="amber" />
          </div>

          {/* Row 3: pets / vehicles / home services */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card flex flex-col">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm shrink-0">
                <PawPrint size={17} className="text-purple-600" /> No. of Pets (By Type)
              </h3>
              <div className={`h-28 ${SCROLL_CLS}`}>
                <BreakdownTable rows={Object.entries(detail.pets.byType)} total={detail.pets.total} />
              </div>
            </div>
            <div className="card flex flex-col">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm shrink-0">
                <Car size={17} className="text-blue-600" /> No. of Vehicles (By Type)
              </h3>
              <div className={`h-28 ${SCROLL_CLS}`}>
                <BreakdownTable rows={Object.entries(detail.vehicles.byType)} total={detail.vehicles.total} />
              </div>
            </div>
            <div className="card flex flex-col">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm shrink-0">
                <HomeIcon size={17} className="text-emerald-600" /> No. of Home Services (By Type)
              </h3>
              <div className={`h-28 ${SCROLL_CLS}`}>
                <BreakdownTable rows={Object.entries(detail.homeServices.byType)} total={detail.homeServices.total} />
              </div>
            </div>
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
                <FileClock size={17} className="text-amber-500" /> Expire / Pending Lease Submission
              </h3>
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

          {/* Row 5: Finance Summary tiles + Celebration/Donation tiles */}
          <div>
            <FinanceTiles collection={detail.finance.collection} expense={detail.finance.expense} balance={detail.finance.balance} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm">
              <Gift size={17} className="text-purple-600" /> Celebration / Donation
            </h3>
            <FinanceTiles collection={detail.celebration.collection} expense={detail.celebration.expense} balance={detail.celebration.balance} />
          </div>

          {/* Row 6: Society Fund & Assets Information (ONE scrollbar for the whole card) + Amenities */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card flex flex-col">
              <h3 className="font-semibold text-slate-800 mb-2 text-sm shrink-0">Society Fund &amp; Assets Information</h3>
              <div className={`h-40 ${SCROLL_CLS}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-1 sticky top-0 bg-white">Society Fund</p>
                    <table className="w-full text-xs table-fixed">
                      <thead>
                        <tr className="text-slate-400 text-left">
                          <th className="font-medium pb-1 w-2/3">Fund Name</th>
                          <th className="font-medium pb-1 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.funds.list.map((f) => (
                          <tr key={f._id} className="border-t border-slate-50">
                            <td className="py-1.5 text-slate-700 truncate">{f.title}</td>
                            <td className="py-1.5 text-right font-semibold text-slate-800">{Number(f.collectedAmount).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                        <tr className="border-t border-slate-200">
                          <td className="pt-1.5 font-semibold text-slate-800">Total</td>
                          <td className="pt-1.5 text-right font-bold text-emerald-600">{Number(detail.funds.totalCollected).toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-1 sticky top-0 bg-white">Assets</p>
                    <table className="w-full text-xs table-fixed">
                      <thead>
                        <tr className="text-slate-400 text-left">
                          <th className="font-medium pb-1 w-2/3">Asset Type</th>
                          <th className="font-medium pb-1 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.investments.assetsList.map((a) => (
                          <tr key={a._id} className="border-t border-slate-50">
                            <td className="py-1.5 text-slate-700 truncate">{a.name}</td>
                            <td className="py-1.5 text-right font-semibold text-slate-800">{Number(a.amount).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                        <tr className="border-t border-slate-200">
                          <td className="pt-1.5 font-semibold text-slate-800">Total</td>
                          <td className="pt-1.5 text-right font-bold text-blue-600">{Number(detail.investments.totalAssets).toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="card flex flex-col">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm shrink-0">
                <Dumbbell size={17} className="text-rose-600" /> Amenities
              </h3>
              <div className={`h-40 ${SCROLL_CLS}`}>
                <table className="w-full text-xs table-fixed">
                  <thead>
                    <tr className="text-slate-400 text-left">
                      <th className="font-medium pb-1 pr-1">Amenity</th>
                      <th className="font-medium pb-1 text-right pr-2">Cap.</th>
                      <th className="font-medium pb-1 text-right pr-2">Used</th>
                      <th className="font-medium pb-1 text-right pr-2">Avail.</th>
                      <th className="font-medium pb-1 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.amenities.map((a) => (
                      <tr key={a._id} className="border-t border-slate-50">
                        <td className="py-1.5 text-slate-700 truncate pr-1">{a.name}</td>
                        <td className="py-1.5 text-right text-slate-600 pr-2">{a.capacity ?? 0}</td>
                        <td className="py-1.5 text-right text-slate-600 pr-2">{a.used ?? 0}</td>
                        <td className="py-1.5 text-right text-slate-600 pr-2">{a.available ?? 0}</td>
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
        </div>

        {/* ============ RIGHT SIDEBAR: Properties in Sale + Management List (stretches to full column height) ============ */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-full">
          <div className="card shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Tag size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500">No. of Properties in Sales</p>
                <p className="text-xl font-bold text-slate-800">{detail.propertiesInSale ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="card flex-1 min-h-0 flex flex-col">
            <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm shrink-0">
              <Crown size={17} className="text-amber-600" /> List of Management (By Role)
            </h3>
            {detail.management.length > 0 && (
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-1 pb-1 border-b border-slate-100 shrink-0">
                <span>Role</span>
                <span>Name</span>
              </div>
            )}
            <div className={`flex-1 min-h-0 ${SCROLL_CLS}`}>
              {detail.management.length === 0 ? (
                <p className="text-sm text-slate-400">No management roles assigned yet.</p>
              ) : (
                <div className="text-sm">
                  {detail.management.map((m, i) => (
                    <div key={`${m.role}-${i}`} className="flex items-center justify-between border-b border-slate-50 py-2 gap-2">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                          {(m.name || '?').charAt(0).toUpperCase()}
                        </span>
                        <span className="text-slate-500 truncate">{roleLabel(m.role)}</span>
                      </span>
                      <span className="font-medium text-slate-800 truncate text-right shrink-0">{m.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SecretaryDashboard;
