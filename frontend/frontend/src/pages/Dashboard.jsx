import React, { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  UserCheck,
  MessageSquareWarning,
  Wrench,
  Wallet,
  Megaphone,
  Dumbbell,
  CalendarDays,
  Vote,
  ShieldAlert,
} from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';

const roleGreeting = {
  admin: 'Here is what’s happening across your society today.',
  security: 'Focused on gate entry, visitor management and security alerts.',
  resident: 'Access community updates, bookings, complaints and billing.',
  accountant: 'Access to financial data, invoices, receipts and reports.',
  secretary: 'Manage communication, documents, meetings and administrative tasks.',
  chairman: 'High-level overview, key insights and decision-making reports.',
  treasurer: 'Financial oversight, approvals, budgets, investments and funds.',
  committee_member: 'Review meetings, voting, projects, finance visibility and complaints.',
  tenant: 'Access your lease, dues, visitors, amenities and society notices.',
  housekeeping: 'View assigned tasks, complaints and society notices.',
};

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/overview')
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="text-slate-400">Loading dashboard...</div>
      </Layout>
    );
  }

  const role = user?.role;

  return (
    <Layout title={`Welcome, ${user?.name}`} subtitle={roleGreeting[role]}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(role === 'admin' || role === 'security' || role === 'secretary' || role === 'chairman') && (
          <>
            <StatCard icon={Building2} label="Total Units" value={stats.units.total} color="blue" />
            <StatCard icon={Users} label="Residents" value={stats.residents.total} color="green" />
            <StatCard icon={UserCheck} label="Visitors Today" value={stats.visitors.today} color="purple" />
            <StatCard icon={MessageSquareWarning} label="Open Complaints" value={stats.complaints.open} color="red" />
          </>
        )}

        {(role === 'accountant' || role === 'treasurer') && (
          <>
            <StatCard icon={Wallet} label="Total Collection" value={inr(stats.finance.collection)} color="green" />
            <StatCard icon={Wallet} label="Total Expense" value={inr(stats.finance.expense)} color="red" />
            <StatCard icon={Wallet} label="Outstanding" value={inr(stats.finance.outstanding)} color="amber" />
            <StatCard icon={Building2} label="Total Units" value={stats.units.total} color="blue" />
          </>
        )}

        {(role === 'resident' || role === 'tenant') && (
          <>
            <StatCard icon={MessageSquareWarning} label="My Complaints" value={stats.complaints.open} color="red" />
            <StatCard icon={Wrench} label="Maintenance Requests" value={stats.maintenance.open} color="amber" />
            <StatCard icon={CalendarDays} label="Upcoming Meetings" value={stats.meetings.upcoming} color="blue" />
            <StatCard icon={Vote} label="Active Voting" value={stats.polls.active} color="purple" />
          </>
        )}

        {role === 'committee_member' && (
          <>
            <StatCard icon={CalendarDays} label="Upcoming Meetings" value={stats.meetings.upcoming} color="blue" />
            <StatCard icon={Vote} label="Active Voting" value={stats.polls.active} color="purple" />
            <StatCard icon={Wallet} label="Total Collection" value={inr(stats.finance.collection)} color="green" />
            <StatCard icon={MessageSquareWarning} label="Open Complaints" value={stats.complaints.open} color="red" />
          </>
        )}

        {role === 'housekeeping' && (
          <>
            <StatCard icon={Wrench} label="Open Maintenance Tasks" value={stats.maintenance.open} color="amber" />
            <StatCard icon={Megaphone} label="Published Notices" value={stats.notices.published} color="blue" />
            <StatCard icon={Dumbbell} label="Amenities" value={stats.amenities.total} color="green" />
            <StatCard icon={ShieldAlert} label="Active Emergencies" value="—" color="red" />
          </>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card md:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">Quick Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500">Occupied Units</p>
              <p className="text-xl font-bold">{stats.units.occupied} / {stats.units.total}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500">Currently Inside (Visitors)</p>
              <p className="text-xl font-bold">{stats.visitors.inside}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500">Open Maintenance</p>
              <p className="text-xl font-bold">{stats.maintenance.open}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500">Published Notices</p>
              <p className="text-xl font-bold">{stats.notices.published} / {stats.notices.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Megaphone size={18} /> Society Snapshot
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span className="text-slate-500">Amenities Available</span>
              <span className="font-semibold">{stats.amenities.available} / {stats.amenities.total}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Documents</span>
              <span className="font-semibold">{stats.documents.total}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Upcoming Meetings</span>
              <span className="font-semibold">{stats.meetings.upcoming}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Active Polls</span>
              <span className="font-semibold">{stats.polls.active}</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
