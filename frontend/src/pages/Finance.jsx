import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { Wallet, Clock, TrendingDown, AlertCircle, Plus } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import FormModal from '../components/FormModal';
import { useAuth } from '../context/AuthContext';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

const Finance = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('Income');

  const canWrite = ['accountant', 'treasurer'].includes(user?.role);

  const load = async () => {
    const [invRes, txRes] = await Promise.all([
      api.get('/invoices', { params: { limit: 100 } }),
      api.get('/transactions', { params: { limit: 100 } }),
    ]);
    setInvoices(invRes.data.data);
    setTransactions(txRes.data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const totalCollection = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter((i) => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);

  const pieData = [
    { name: 'Collected', value: totalCollection },
    { name: 'Pending', value: totalPending },
    { name: 'Overdue', value: totalOverdue },
  ];

  const expenseByCategory = Object.values(
    transactions
      .filter((t) => t.type === 'Expense')
      .reduce((acc, t) => {
        acc[t.category] = acc[t.category] || { category: t.category, amount: 0 };
        acc[t.category].amount += t.amount;
        return acc;
      }, {})
  );

  const handleSubmit = async (values) => {
    await api.post('/transactions', { ...values, type: modalType, amount: Number(values.amount) });
    load();
  };

  return (
    <Layout title="Finance Dashboard" subtitle="Manage collections, payments, expenses, and account summaries">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Wallet} label="Total Collection" value={inr(totalCollection)} color="green" />
        <StatCard icon={Clock} label="Total Pending" value={inr(totalPending)} color="amber" />
        <StatCard icon={TrendingDown} label="Total Expenses" value={inr(totalExpense)} color="red" />
        <StatCard icon={AlertCircle} label="Total Overdue" value={inr(totalOverdue)} color="purple" />
      </div>

      {canWrite && (
        <div className="flex gap-2 mb-6">
          <button
            className="btn-primary flex items-center gap-1"
            onClick={() => {
              setModalType('Income');
              setModalOpen(true);
            }}
          >
            <Plus size={16} /> Add Income
          </button>
          <button
            className="btn-secondary flex items-center gap-1"
            onClick={() => {
              setModalType('Expense');
              setModalOpen(true);
            }}
          >
            <Plus size={16} /> Add Expense
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Collection by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => inr(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Expense by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={expenseByCategory}>
              <XAxis dataKey="category" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v) => inr(v)} />
              <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Recent Invoices</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2">Invoice #</th>
                <th className="py-2">Flat</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 6).map((inv) => (
                <tr key={inv._id} className="border-b border-slate-100">
                  <td className="py-2">{inv.invoiceNo}</td>
                  <td className="py-2">{inv.flatNo}</td>
                  <td className="py-2">{inr(inv.amount)}</td>
                  <td className="py-2">
                    <Badge text={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Recent Transactions</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2">Description</th>
                <th className="py-2">Type</th>
                <th className="py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 6).map((tx) => (
                <tr key={tx._id} className="border-b border-slate-100">
                  <td className="py-2">{tx.description}</td>
                  <td className="py-2">
                    <span className={tx.type === 'Income' ? 'text-green-600' : 'text-red-600'}>{tx.type}</span>
                  </td>
                  <td className="py-2">{inr(tx.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={`Add ${modalType}`}
        fields={[
          { name: 'category', label: 'Category', required: true },
          { name: 'description', label: 'Description', required: true },
          { name: 'amount', label: 'Amount', type: 'number', required: true },
          { name: 'flatNo', label: 'Flat No. (optional)' },
        ]}
      />
    </Layout>
  );
};

export default Finance;
