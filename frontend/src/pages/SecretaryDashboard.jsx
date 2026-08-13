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
  Tag,
} from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const todayISO = () => new Date().toISOString().slice(0, 10);

// Scrollbar is ALWAYS visible (not just on overflow) on every list-style card,
// per explicit instruction - `overflow-y-scroll` forces the scrollbar track
// to render even when content fits, matching the reference mockup.
const SCROLL_CLS = 'overflow-y-scroll pr-1';

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

const FinanceTriple = ({ collection, expense, balance }) => (
  <div className="grid grid-cols-3 gap-3 text-center">
    <div>
      <p className="text-xs text-slate-500">Total Collection</p>
      <p className="font-bold text-emerald-600">{inr(collection)}</p>
    </div>
    <div>
      <p className="text-xs text-slate-500">Total Expense</p>
      <p className="font-bold text-red-500">{inr(expense)}</p>
    </div>
    <div>
      <p className="text-xs text-slate-500">Balance</p>
      <p className="font-bold text-slate-800">{inr(balance)}</p>
    </div>
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

  return (
    <Layout title="Dashboard">
      {/* Date filter - compact, top-right; scopes visitors / upcoming meetings / finance below */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <label className="text-xs font-medium text-slate-500">Filter: By Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input w-40 py-1.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* ============ MAIN COLUMN ============ */}
        <div className="lg:col-span-3 space-y-4">
          {/* Row 1: flats, residents, visitors, upcoming meetings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                <Building2 size={16} /> No. of Flats / Houses: {detail.totalUnits}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div>
                  <p className="text-[11px] text-slate-400">Owner</p>
                  <p className="font-semibold text-slate-700">{units.Owner || 0}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Tenant</p>
                  <p className="font-semibold text-slate-700">{units.Tenant || 0}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Vacant</p>
                  <p className="font-semibold text-slate-700">{units.Vacant || 0}</p>
                </div>
              </div>
            </div>

            <SummaryTile icon={Users} label="No. of Residents" value={detail.residents ?? 0} tone="green" />
            <SummaryTile icon={UserCheck} label="No. of Visitors" value={detail.visitorsToday ?? 0} tone="purple" />

            <div className="card flex flex-col">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm shrink-0">
                <CalendarDays size={17} className="text-blue-600" /> Upcoming Meeting
              </h3>
              <div className={`max-h-28 ${SCROLL_CLS}`}>
                {detail.meetings.length === 0 ? (
                  <p className="text-sm text-slate-400">No upcoming meetings.</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 text-left">
                        <th className="font-medium pb-1">Date</th>
                        <th className="font-medium pb-1">Venue</th>
                        <th className="font-medium pb-1 text-right">Agendas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.meetings.map((m) => (
                        <tr key={m._id} className="border-t border-slate-50">
                          <td className="py-1.5 text-slate-700 whitespace-nowrap">
                            {new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </td>
                          <td className="py-1.5 text-slate-600 truncate max-w-[90px]">{m.location || '—'}</td>
                          <td className="py-1.5 text-right font-semibold text-slate-800">{m.agendaCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: staff */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryTile icon={ShieldCheck} label="No. of Security Staff" value={detail.staff?.security ?? 0} tone="blue" />
            <SummaryTile icon={HardHat} label="No. of Housekeeping Staff" value={detail.staff?.housekeeping ?? 0} tone="amber" />
          </div>

          {/* Row 3: pets / vehicles / home services */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card flex flex-col">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm shrink-0">
                <PawPrint size={17} className="text-purple-600" /> No. of Pets (By Type)
              </h3>
              <div className={`max-h-32 ${SCROLL_CLS}`}>
                <BreakdownTable rows={Object.entries(detail.pets.byType)} total={detail.pets.total} />
              </div>
            </div>
            <div className="card flex flex-col">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm shrink-0">
                <Car size={17} className="text-blue-600" /> No. of Vehicles (By Type)
              </h3>
              <div className={`max-h-32 ${SCROLL_CLS}`}>
                <BreakdownTable rows={Object.entries(detail.vehicles.byType)} total={detail.vehicles.total} />
              </div>
            </div>
            <div className="card flex flex-col">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm shrink-0">
                <HomeIcon size={17} className="text-emerald-600" /> No. of Home Services (By Type)
              </h3>
              <div className={`max-h-32 ${SCROLL_CLS}`}>
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

          {/* Row 5: Finance Summary + Celebration/Donation (same look) */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                <Wallet size={17} className="text-emerald-600" /> Finance Summary (as of {selectedDate})
              </h3>
              <FinanceTriple collection={detail.finance.collection} expense={detail.finance.expense} balance={detail.finance.balance} />
            </div>

            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                <Gift size={17} className="text-purple-600" /> Celebration / Donation
              </h3>
              <FinanceTriple collection={detail.celebration.collection} expense={detail.celebration.expense} balance={detail.celebration.balance} />
            </div>
          </div>

          {/* Row 6: Society Fund & Assets Information + Amenities */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-2 text-sm">Society Fund &amp; Assets Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-1">Society Fund</p>
                  <div className={`max-h-32 ${SCROLL_CLS}`}>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-400 text-left">
                          <th className="font-medium pb-1">Fund Name</th>
                          <th className="font-medium pb-1 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.funds.list.map((f) => (
                          <tr key={f._id} className="border-t border-slate-50">
                            <td className="py-1.5 text-slate-700 truncate max-w-[90px]">{f.title}</td>
                            <td className="py-1.5 text-right font-semibold text-slate-800">{Number(f.collectedAmount).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                        <tr className="border-t border-slate-200">
                          <td className="pt-1.5 font-semibold text-slate-800">Total Fund</td>
                          <td className="pt-1.5 text-right font-bold text-emerald-600">{Number(detail.funds.totalCollected).toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-1">Assets</p>
                  <div className={`max-h-32 ${SCROLL_CLS}`}>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-400 text-left">
                          <th className="font-medium pb-1">Asset Type</th>
                          <th className="font-medium pb-1 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.investments.assetsList.map((a) => (
                          <tr key={a._id} className="border-t border-slate-50">
                            <td className="py-1.5 text-slate-700 truncate max-w-[90px]">{a.name}</td>
                            <td className="py-1.5 text-right font-semibold text-slate-800">{Number(a.amount).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                        <tr className="border-t border-slate-200">
                          <td className="pt-1.5 font-semibold text-slate-800">Total Assets</td>
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
              <div className={`max-h-40 ${SCROLL_CLS}`}>
                <table className="w-full text-xs">
                  <thead>
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
              </div>
            </div>
          </div>
        </div>

        {/* ============ RIGHT SIDEBAR: Properties in Sale + Management List ============ */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
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

          <div className="card lg:sticky lg:top-4 flex flex-col">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm shrink-0">
              <Crown size={17} className="text-amber-600" /> List of Management (By Role)
            </h3>
            <div className={`max-h-[60vh] ${SCROLL_CLS}`}>
              {detail.management.length === 0 ? (
                <p className="text-sm text-slate-400">No management roles assigned yet.</p>
              ) : (
                <div className="space-y-1 text-sm">
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
      </div>
    </Layout>
  );
};

export default SecretaryDashboard;
