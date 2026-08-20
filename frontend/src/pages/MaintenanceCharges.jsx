import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Receipt, Plus, Pencil, Trash2, Loader2, ChevronRight, Building2, X, CalendarClock } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const monthKey = (d) => new Date(d).toISOString().slice(0, 7); // "YYYY-MM"
const monthLabel = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
const currentMonthKey = () => new Date().toISOString().slice(0, 7);

// The rate/penalty that applies to a given month is whichever schedule
// entry has the LATEST effectiveFromMonth that's still <= that month -
// i.e. "the most recent rate change on or before this month".
const scheduleForMonth = (schedule, mKey) => {
  const applicable = schedule.filter((s) => monthKey(s.effectiveFromMonth) <= mKey).sort((a, b) => monthKey(b.effectiveFromMonth).localeCompare(monthKey(a.effectiveFromMonth)));
  return applicable[0] || null;
};

// Builds every month's due/paid/pending picture for one flat, from the
// schedule's earliest entry through the current month.
const buildLedger = (schedule, payments) => {
  if (!schedule.length) return [];
  const sorted = [...schedule].sort((a, b) => monthKey(a.effectiveFromMonth).localeCompare(monthKey(b.effectiveFromMonth)));
  const startKey = monthKey(sorted[0].effectiveFromMonth);
  const nowKey = currentMonthKey();

  const months = [];
  let cursor = `${startKey}-01`;
  while (monthKey(cursor) <= nowKey) {
    months.push(monthKey(cursor));
    const d = new Date(cursor);
    d.setMonth(d.getMonth() + 1);
    cursor = d.toISOString();
  }

  return months
    .map((mKey) => {
      const rate = scheduleForMonth(schedule, mKey);
      const monthPayments = payments.filter((p) => monthKey(p.month) === mKey);
      const totalPaid = monthPayments.reduce((s, p) => s + Number(p.amount), 0);
      const amountDue = rate ? Number(rate.amount) : 0;
      const isPast = mKey < nowKey;
      const penalty = isPast && totalPaid < amountDue && rate ? Number(rate.penaltyAmount || 0) : 0;
      const pending = Math.max(amountDue + penalty - totalPaid, 0);
      return { month: mKey, amountDue, penalty, totalPaid, paymentCount: monthPayments.length, pending, payments: monthPayments };
    })
    .reverse(); // most recent first
};

// Shared ledger table - used both for a member's own view and inside the
// Secretary's per-flat inspection modal.
const FlatLedger = ({ flatId, schedule }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/maintenance-payments', { params: { flatId, limit: 500 } })
      .then((res) => setPayments(res.data.data || []))
      .finally(() => setLoading(false));
  }, [flatId]);

  const ledger = useMemo(() => buildLedger(schedule, payments), [schedule, payments]);
  const totalPending = ledger.reduce((s, r) => s + r.pending, 0);

  if (loading) return <p className="text-slate-400 text-sm py-6 text-center">Loading...</p>;
  if (!schedule.length) return <p className="text-slate-400 text-sm py-6 text-center">No maintenance schedule has been set up yet.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500">Total Pending Dues</p>
        <p className={`text-lg font-bold ${totalPending > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{inr(totalPending)}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-100">
              <th className="font-medium py-1.5 pr-3">Month</th>
              <th className="font-medium py-1.5 pr-3">Amount Due</th>
              <th className="font-medium py-1.5 pr-3">Penalty</th>
              <th className="font-medium py-1.5 pr-3">Payments Made</th>
              <th className="font-medium py-1.5 pr-3">Pending Due</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((row) => (
              <tr key={row.month} className="border-b border-slate-50 last:border-0">
                <td className="py-1.5 pr-3 text-slate-700 font-medium">{monthLabel(`${row.month}-01`)}</td>
                <td className="py-1.5 pr-3 text-slate-600">{inr(row.amountDue)}</td>
                <td className="py-1.5 pr-3 text-slate-600">{row.penalty > 0 ? inr(row.penalty) : '—'}</td>
                <td className="py-1.5 pr-3 text-slate-600">
                  {row.paymentCount > 0 ? (
                    <span>
                      {row.paymentCount}x - {inr(row.totalPaid)}
                    </span>
                  ) : (
                    <span className="text-slate-300">No payments</span>
                  )}
                </td>
                <td className="py-1.5 pr-3">
                  {row.pending > 0 ? <span className="font-medium text-red-600">{inr(row.pending)}</span> : <Badge text="Paid" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const emptyScheduleForm = { effectiveFromMonth: currentMonthKey(), amount: '', penaltyAmount: '', meetingId: '', notes: '' };

const ScheduleFormModal = ({ initial, meetings, onClose, onSaved }) => {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial._id;

  const save = async () => {
    if (!form.effectiveFromMonth || !form.amount) return alert('Effective Month and Amount are required.');
    setSaving(true);
    try {
      const meeting = meetings.find((m) => m._id === form.meetingId);
      const payload = {
        effectiveFromMonth: `${form.effectiveFromMonth}-01`,
        amount: Number(form.amount),
        penaltyAmount: Number(form.penaltyAmount) || 0,
        meetingId: meeting ? meeting._id : null,
        meetingTitle: meeting ? meeting.title : null,
        meetingDate: meeting ? meeting.date : null,
        notes: form.notes || null,
      };
      if (isEdit) {
        await api.put(`/maintenance-schedule/${initial._id}`, payload);
      } else {
        await api.post('/maintenance-schedule', payload);
      }
      await onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save this schedule entry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">{isEdit ? 'Edit Schedule Entry' : 'Add Schedule Entry'}</h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Effective From Month *</label>
          <input type="month" className="input" value={form.effectiveFromMonth} onChange={(e) => setForm({ ...form, effectiveFromMonth: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount / Flat *</label>
            <input type="number" min="0" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Penalty (if unpaid)</label>
            <input type="number" min="0" className="input" value={form.penaltyAmount} onChange={(e) => setForm({ ...form, penaltyAmount: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Reference</label>
          <select className="input" value={form.meetingId} onChange={(e) => setForm({ ...form, meetingId: e.target.value })}>
            <option value="">— No meeting / Other —</option>
            {meetings.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title} ({new Date(m.date).toLocaleDateString()})
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">Which meeting's discussion this rate/schedule change came from.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea className="input" rows={2} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60 flex items-center gap-1.5">
            {saving && <Loader2 size={14} className="animate-spin" />} {isEdit ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Secretary's schedule card - the rates/penalties + meeting-reference table,
// with Add/Edit/Delete.
const ScheduleCard = ({ schedule, meetings, onChanged }) => {
  const [formTarget, setFormTarget] = useState(null);

  const remove = async (id) => {
    if (!window.confirm('Delete this schedule entry? Past months will fall back to whatever entry applied before it.')) return;
    await api.delete(`/maintenance-schedule/${id}`);
    await onChanged();
  };

  const sorted = [...schedule].sort((a, b) => monthKey(b.effectiveFromMonth).localeCompare(monthKey(a.effectiveFromMonth)));

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <CalendarClock size={17} /> Maintenance Charge Schedule
        </h3>
        <button onClick={() => setFormTarget(emptyScheduleForm)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
          <Plus size={13} /> Add Entry
        </button>
      </div>
      <p className="text-xs text-slate-400 mb-3">Set from which month onward maintenance charges (and late penalty) change - per the society's maintenance policy.</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-100">
              <th className="font-medium py-1.5 pr-3">Effective From</th>
              <th className="font-medium py-1.5 pr-3">Amount</th>
              <th className="font-medium py-1.5 pr-3">Penalty</th>
              <th className="font-medium py-1.5 pr-3">Meeting Reference</th>
              <th className="font-medium py-1.5 pr-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s._id} className="border-b border-slate-50 last:border-0">
                <td className="py-1.5 pr-3 text-slate-700 font-medium">{monthLabel(s.effectiveFromMonth)}</td>
                <td className="py-1.5 pr-3 text-slate-600">{inr(s.amount)}</td>
                <td className="py-1.5 pr-3 text-slate-600">{s.penaltyAmount ? inr(s.penaltyAmount) : '—'}</td>
                <td className="py-1.5 pr-3 text-slate-600">
                  {s.meetingTitle ? (
                    <span>
                      {s.meetingTitle} <span className="text-slate-400">({new Date(s.meetingDate).toLocaleDateString()})</span>
                    </span>
                  ) : s.notes ? (
                    s.notes
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="py-1.5">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setFormTarget({
                          _id: s._id,
                          effectiveFromMonth: monthKey(s.effectiveFromMonth),
                          amount: s.amount,
                          penaltyAmount: s.penaltyAmount,
                          meetingId: s.meetingId || '',
                          notes: s.notes || '',
                        })
                      }
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => remove(s._id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!sorted.length && (
              <tr>
                <td colSpan={5} className="text-center text-slate-400 py-6">
                  No schedule entries yet - add one to start tracking dues.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formTarget && <ScheduleFormModal initial={formTarget} meetings={meetings} onClose={() => setFormTarget(null)} onSaved={onChanged} />}
    </div>
  );
};

const MaintenanceCharges = () => {
  const { user } = useAuth();
  const isSecretary = user?.role === 'secretary';

  const [schedule, setSchedule] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState([]);
  const [activeBuilding, setActiveBuilding] = useState('');
  const [openFlat, setOpenFlat] = useState(null);

  const loadSchedule = useCallback(async () => {
    const res = await api.get('/maintenance-schedule', { params: { limit: 200 } });
    setSchedule(res.data.data || []);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadSchedule(), isSecretary ? api.get('/meetings', { params: { limit: 200 } }).then((res) => setMeetings(res.data.data || [])) : Promise.resolve()]).finally(() =>
      setLoading(false)
    );
    if (isSecretary) {
      api.get('/units', { params: { limit: 500 } }).then((res) => {
        const data = res.data.data || [];
        setUnits(data);
        if (data.length) setActiveBuilding(data[0].tower);
      });
    }
  }, [loadSchedule, isSecretary]);

  const buildings = useMemo(() => [...new Set(units.map((u) => u.tower))].sort(), [units]);
  const flatsInBuilding = useMemo(() => units.filter((u) => u.tower === activeBuilding).sort((a, b) => a.flatNo.localeCompare(b.flatNo, undefined, { numeric: true })), [units, activeBuilding]);

  if (loading) {
    return (
      <Layout title="Maintenance Charges" subtitle="Monthly society maintenance dues, penalties, and payment history">
        <p className="text-slate-400">Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout title="Maintenance Charges" subtitle="Monthly society maintenance dues, penalties, and payment history">
      {isSecretary ? (
        <>
          <ScheduleCard schedule={schedule} meetings={meetings} onChanged={loadSchedule} />

          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
              <Receipt size={17} /> Flat-wise Dues
            </h3>
            <p className="text-xs text-slate-400 mb-3">Click a flat to see its full maintenance ledger.</p>

            <div className="flex gap-1 border-b border-slate-200 mb-3 overflow-x-auto">
              {buildings.map((b) => (
                <button
                  key={b}
                  onClick={() => setActiveBuilding(b)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap flex items-center gap-1.5 ${
                    activeBuilding === b ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Building2 size={14} /> Building {b}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-left border-b border-slate-100">
                    <th className="font-medium py-1.5 pr-3">Flat No.</th>
                    <th className="font-medium py-1.5 pr-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {flatsInBuilding.map((u) => (
                    <tr key={u._id} onClick={() => setOpenFlat(u.flatNo)} className="border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50">
                      <td className="py-1.5 pr-3 font-medium text-slate-700">{u.flatNo}</td>
                      <td className="py-1.5 text-slate-300">
                        <ChevronRight size={15} />
                      </td>
                    </tr>
                  ))}
                  {!flatsInBuilding.length && (
                    <tr>
                      <td colSpan={2} className="text-center text-slate-400 py-6">
                        No flats in this building.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {openFlat && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-slate-800">Flat {openFlat} - Maintenance Ledger</h2>
                  <button onClick={() => setOpenFlat(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>
                <FlatLedger flatId={openFlat} schedule={schedule} />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-1">Your Maintenance Ledger</h3>
          <p className="text-xs text-slate-400 mb-3">Every month's due amount, penalty (if any), payments you've made, and what's still pending.</p>
          {user?.flatId ? <FlatLedger flatId={user.flatId} schedule={schedule} /> : <p className="text-slate-400 text-sm">Your account is not linked to a flat.</p>}
        </div>
      )}
    </Layout>
  );
};

export default MaintenanceCharges;
