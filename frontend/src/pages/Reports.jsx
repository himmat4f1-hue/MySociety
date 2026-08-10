import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart3, FileText, Download } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';

const COLORS = ['#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const Reports = () => {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [residents, units, complaints, maintenance, visitors, amenities] = await Promise.all([
        api.get('/residents', { params: { limit: 1 } }),
        api.get('/units', { params: { limit: 1 } }),
        api.get('/complaints', { params: { limit: 1 } }),
        api.get('/maintenance', { params: { limit: 1 } }),
        api.get('/visitors', { params: { limit: 1 } }),
        api.get('/amenities', { params: { limit: 1 } }),
      ]);
      setCounts({
        residents: residents.data.total,
        units: units.data.total,
        complaints: complaints.data.total,
        maintenance: maintenance.data.total,
        visitors: visitors.data.total,
        amenities: amenities.data.total,
      });
    };
    load();
  }, []);

  if (!counts) {
    return (
      <Layout title="Reports">
        <p className="text-slate-400">Loading reports...</p>
      </Layout>
    );
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const pieData = Object.entries(counts).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
  }));

  const reportsList = [
    { name: 'Resident Directory', category: 'Residents', format: 'Excel' },
    { name: 'Units Occupancy Report', category: 'Units', format: 'PDF' },
    { name: 'Complaints Summary', category: 'Complaints', format: 'PDF' },
    { name: 'Maintenance Summary', category: 'Maintenance', format: 'PDF' },
    { name: 'Visitor Log Report', category: 'Visitors', format: 'Excel' },
    { name: 'Amenities Utilization', category: 'Amenities', format: 'Excel' },
    { name: 'Collection Summary Report', category: 'Finance', format: 'PDF' },
    { name: 'Income & Expense Report', category: 'Finance', format: 'Excel' },
  ];

  return (
    <Layout title="Reports" subtitle="Generate, schedule, and manage all reports">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={BarChart3} label="Total Reports" value={reportsList.length} color="blue" />
        <StatCard icon={FileText} label="Total Records Tracked" value={total} color="green" />
        <StatCard icon={FileText} label="Residents" value={counts.residents} color="purple" />
        <StatCard icon={FileText} label="Units" value={counts.units} color="amber" />
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
                <th className="py-2">Format</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {reportsList.map((r) => (
                <tr key={r.name} className="border-b border-slate-100">
                  <td className="py-3">{r.name}</td>
                  <td className="py-3">{r.category}</td>
                  <td className="py-3">{r.format}</td>
                  <td className="py-3">
                    <button className="text-brand-600 flex items-center gap-1 text-xs font-medium">
                      <Download size={14} /> Export
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
    </Layout>
  );
};

export default Reports;
