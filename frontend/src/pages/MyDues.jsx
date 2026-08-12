import React, { useEffect, useState } from 'react';
import { Receipt, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const MyDues = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [myFlats, setMyFlats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // A resident/tenant can own or occupy more than one flat, so first find
        // every unit linked to them (not just the single flatNo on their profile).
        const unitsRes = await api.get('/units', { params: { limit: 200 } });
        const mine = unitsRes.data.data.filter(
          (u) => u.owner?._id === user?._id || u.resident?._id === user?._id || u.flatNo === user?.flatNo
        );
        const flatNos = [...new Set(mine.map((u) => u.flatNo).concat(user?.flatNo ? [user.flatNo] : []))];
        setMyFlats(flatNos);

        const invRes = await api.get('/invoices', { params: { limit: 200 } });
        setInvoices(invRes.data.data.filter((inv) => flatNos.includes(inv.flatNo)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const paid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter((i) => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter((i) => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);

  return (
    <Layout
      title="My Dues"
      subtitle={myFlats.length > 1 ? `Maintenance charges across your ${myFlats.length} flats: ${myFlats.join(', ')}` : `Maintenance charges and payment history for ${myFlats[0] || user?.flatNo || 'your flat'}`}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Receipt} label="Total Invoices" value={invoices.length} color="blue" />
        <StatCard icon={CheckCircle2} label="Paid" value={inr(paid)} color="green" />
        <StatCard icon={Clock} label="Pending" value={inr(pending)} color="amber" />
        <StatCard icon={AlertCircle} label="Overdue" value={inr(overdue)} color="red" />
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4">Invoice History</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="py-2 pr-4">Invoice #</th>
              <th className="py-2 pr-4">Flat</th>
              <th className="py-2 pr-4">Description</th>
              <th className="py-2 pr-4">Due Date</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">Loading...</td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">No invoices found for your flat(s) yet</td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv._id} className="border-b border-slate-100">
                  <td className="py-3 pr-4">{inv.invoiceNo}</td>
                  <td className="py-3 pr-4">{inv.flatNo}</td>
                  <td className="py-3 pr-4">{inv.description || 'Maintenance Charges'}</td>
                  <td className="py-3 pr-4">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="py-3 pr-4 font-medium">{inr(inv.amount)}</td>
                  <td className="py-3 pr-4">
                    <Badge text={inv.status} />
                  </td>
                  <td className="py-3 pr-4">
                    {inv.status !== 'Paid' ? (
                      <button className="btn-primary text-xs px-3 py-1.5">Pay Now</button>
                    ) : (
                      <button className="btn-secondary text-xs px-3 py-1.5">Download Receipt</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default MyDues;
