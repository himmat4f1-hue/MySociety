import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart3, FileText, Download, Crown, Wallet, ListChecks, Loader2 } from 'lucide-react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import { downloadCsv } from '../utils/csvExport';

const COLORS = ['#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// Each report row's Export button pulls the REAL data for that resource
// (not a placeholder) and downloads it as CSV, reusing the columns actually
// used in that module's own list page for consistent labeling.
const REPORT_DEFS = [
  { name: 'Resident Directory', category: 'Residents', endpoint: '/residents', columns: [['flatNo', 'Flat No.'], ['tower', 'Tower'], ['type', 'Type'], ['status', 'Status']] },
  { name: 'Units Occupancy Report', category: 'Units', endpoint: '/units', columns: [['flatNo', 'Flat No.'], ['tower', 'Tower'], ['status', 'Status'], ['managedBy', 'Managed By'], ['ownersCount', 'Owners']] },
  { name: 'Complaints Summary', category: 'Complaints', endpoint: '/complaints', columns: [['title', 'Complaint'], ['flatNo', 'Flat No.'], ['category', 'Type'], ['priority', 'Priority'], ['status', 'Status'], ['raisedOn', 'Raised On'], ['resolvedOn', 'Closing Date']] },
  { name: 'Maintenance Summary', category: 'Maintenance', endpoint: '/maintenance', columns: [['title', 'Title'], ['flatNo', 'Flat No.'], ['category', 'Category'], ['status', 'Status'], ['raisedOn', 'Raised On']] },
  { name: 'Visitor Log Report', category: 'Visitors', endpoint: '/visitors', columns: [['name', 'Visitor'], ['mobile', 'Mobile'], ['flatNo', 'Flat No.'], ['purpose', 'Purpose'], ['personsCount', 'People'], ['status', 'Status']] },
  { name: 'Amenities Utilization', category: 'Amenities', endpoint: '/amenities', columns: [['name', 'Amenity'], ['capacity', 'Capacity'], ['used', 'Used'], ['status', 'Status']] },
  { name: 'Lease & Police Verification', category: 'Leases', endpoint: '/leases', columns: [['flatNo', 'Flat No.'], ['tenantName', 'Tenant'], ['status', 'Lease Status'], ['policeVerificationStatus', 'Police Verification']] },
  { name: 'Parking Allotment', category: 'Parking', endpoint: '/parking', columns: [['spotNumber', 'Spot No.'], ['spotType', 'Type'], ['flatId', 'Flat'], ['status', 'Status']] },
];

const Reports = () => {
  const [counts, setCounts] = useState(null);
  const [perf, setPerf] = useState(null);
  const [exportingRow, setExportingRow] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [residents, units, complaints, maintenance, visitors, amenities, perfRes] = await Promise.all([
        api.get('/residents', { params: { limit: 1 } }),
        api.get('/units', { params: { limit: 1 } }),
        api.get('/complaints', { params: { limit: 1 } }),
        api.get('/maintenance', { params: { limit: 1 } }),
        api.get('/visitors', { params: { limit: 1 } }),
        api.get('/amenities', { params: { limit: 1 } }),
        api.get('/reports/management-performance'),
      ]);
      setCounts({
        residents: residents.data.total,
        units: units.data.total,
        complaints: complaints.data.total,
        maintenance: maintenance.data.total,
        visitors: visitors.data.total,
        amenities: amenities.data.total,
      });
      setPerf(perfRes.data);
    };
    load();
  }, []);

  const handleExportRow = async (report) => {
    setExportingRow(report.name);
    try {
      const res = await api.get(report.endpoint, { params: { limit: 10000 } });
      downloadCsv(
        report.name,
        report.columns.map((c) => c[1]),
        report.columns.map((c) => c[0]),
        res.data.data || []
      );
    } catch {
      alert('Could not export this report. Please try again.');
    } finally {
      setExportingRow(null);
    }
  };

  if (!counts || !perf) {
    return <p className="text-slate-400">Loading reports...</p>;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const pieData = Object.entries(counts).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
  }));

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={BarChart3} label="Available Reports" value={REPORT_DEFS.length} color="blue" />
        <StatCard icon={FileText} label="Total Records Tracked" value={total} color="green" />
        <StatCard icon={FileText} label="Residents" value={counts.residents} color="purple" />
        <StatCard icon={FileText} label="Units" value={counts.units} color="amber" />
      </div>

      {/* Management Performance (#10) - real aggregated data, last 90 days */}
      <div className="card mb-6">
        <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
          <Crown size={18} className="text-amber-600" /> Management Performance
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          {perf.period.startDate} to {perf.period.endDate} (last 90 days)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500">Active Management Members</p>
            <p className="text-xl font-bold text-slate-800">{perf.activeManagementCount}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Collection</p>
            <p className="text-xl font-bold text-emerald-600">{inr(perf.collection)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Expenditure</p>
            <p className="text-xl font-bold text-red-500">{inr(perf.expenditure)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Net Balance</p>
            <p className="text-xl font-bold text-slate-800">{inr(perf.netBalance)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Meetings Held</p>
            <p className="text-xl font-bold text-slate-800">{perf.meetingsHeld}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Agendas: Pending / Completed</p>
            <p className="text-xl font-bold text-slate-800">{perf.agendas.pending} / {perf.agendas.completed}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Decisions Made</p>
            <p className="text-xl font-bold text-slate-800">{perf.decisionsMade}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Votes Cast</p>
            <p className="text-xl font-bold text-slate-800">{perf.totalVotesCast}</p>
          </div>
        </div>

        {perf.roster.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 mb-2">Current Management Roster</p>
            <div className="flex flex-wrap gap-2">
              {perf.roster.map((r, i) => (
                <span key={i} className="badge bg-slate-100 text-slate-600">
                  {r.role.replace('_', ' ')}: {r.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Available Reports</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2">Report Name</th>
                <th className="py-2">Category</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {REPORT_DEFS.map((r) => (
                <tr key={r.name} className="border-b border-slate-100">
                  <td className="py-3">{r.name}</td>
                  <td className="py-3">{r.category}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleExportRow(r)}
                      disabled={exportingRow === r.name}
                      className="text-brand-600 flex items-center gap-1 text-xs font-medium disabled:opacity-50"
                    >
                      {exportingRow === r.name ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      {exportingRow === r.name ? 'Exporting...' : 'Export CSV'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Records by Category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default Reports;
