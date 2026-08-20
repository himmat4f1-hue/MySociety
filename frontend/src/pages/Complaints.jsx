import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MessageSquareWarning, Plus, Trash2, MessageCircleReply, Loader2, X } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';

const todayISO = () => new Date().toISOString().slice(0, 10);
const CATEGORIES = ['Housekeeping', 'Lift', 'Camera', 'Electrical', 'Plumbing', 'Other'];

const emptyForm = { title: '', description: '', flatNo: '', category: 'Other', priority: 'Medium' };

// Raise New complaint/request - open to everyone. Once saved, none of these
// fields can be edited again by anyone (see backend/routes/complaintRoutes.js) -
// only the Secretary's Response/Closing Date/Status, and only the raiser's
// own Delete, are possible afterwards.
const RaiseModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.flatNo.trim()) {
      return alert('Title, Description, and Flat No. are required.');
    }
    setSaving(true);
    try {
      await api.post('/complaints', form);
      await onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not raise this complaint/request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Raise a Complaint / Request</h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
          <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Flat No. *</label>
            <input className="input" value={form.flatNo} onChange={(e) => setForm({ ...form, flatNo: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
          <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60 flex items-center gap-1.5">
            {saving && <Loader2 size={14} className="animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Secretary's response modal - the ONLY thing anyone can edit on an
// already-raised complaint/request, and only the Secretary can do it.
const RespondModal = ({ target, onClose, onSaved }) => {
  const [response, setResponse] = useState(target.response || '');
  const [closingDate, setClosingDate] = useState(target.resolvedOn ? target.resolvedOn.slice(0, 10) : '');
  const [status, setStatus] = useState(target.status);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/complaints/${target._id}`, {
        response,
        status,
        resolvedOn: closingDate ? new Date(`${closingDate}T00:00:00`).toISOString() : null,
      });
      await onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Respond - {target.title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-500 -mt-2">{target.description}</p>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Response</label>
          <textarea className="input" rows={3} value={response} onChange={(e) => setResponse(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Closing Date</label>
            <input type="date" className="input" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Open">Open</option>
              <option value="In Process">In Process</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60 flex items-center gap-1.5">
            {saving && <Loader2 size={14} className="animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Complaints = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'secretary';

  const [filterDate, setFilterDate] = useState(todayISO());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [respondTarget, setRespondTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints', { params: { limit: 300 } });
      setItems(res.data.data || res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => items.filter((c) => c.raisedOn && new Date(c.raisedOn).toISOString().slice(0, 10) === filterDate), [items, filterDate]);

  const remove = async (id) => {
    if (!window.confirm('Delete this complaint/request? This cannot be undone.')) return;
    try {
      await api.delete(`/complaints/${id}`);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete.');
    }
  };

  return (
    <Layout title="Complaint / Request" subtitle="Raise and track complaints & requests - visible to every member">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500">Date</label>
          <input type="date" className="input w-auto" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        </div>
        <button onClick={() => setRaiseOpen(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> Raise Complaint / Request
        </button>
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <p className="text-slate-400 text-center py-10">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-left border-b border-slate-100 bg-slate-50">
                <th className="font-medium px-4 py-2.5 w-24">Date</th>
                <th className="font-medium px-4 py-2.5">Complaint / Request</th>
                <th className="font-medium px-4 py-2.5">Flat No.</th>
                <th className="font-medium px-4 py-2.5">Priority</th>
                <th className="font-medium px-4 py-2.5">Response</th>
                <th className="font-medium px-4 py-2.5">Closing Date</th>
                <th className="font-medium px-4 py-2.5">Status</th>
                <th className="font-medium px-4 py-2.5 w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((c) => {
                const isOwn = c.raisedBy?._id === user?._id || c.raisedBy === user?._id;
                return (
                  <tr key={c._id} className="border-b border-slate-50 last:border-0 align-top">
                    <td className="px-4 py-2.5 text-slate-600">{new Date(c.raisedOn).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-slate-800">{c.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{c.description}</p>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{c.flatNo}</td>
                    <td className="px-4 py-2.5">
                      <Badge text={c.priority} />
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{c.response || <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-2.5 text-slate-600">{c.resolvedOn ? new Date(c.resolvedOn).toLocaleDateString() : <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-2.5">
                      <Badge text={c.status} />
                    </td>
                    <td className="px-4 py-2.5">
                      {canManage && (
                        <button onClick={() => setRespondTarget(c)} title="Respond" className="text-blue-500 hover:text-blue-700">
                          <MessageCircleReply size={15} />
                        </button>
                      )}
                      {!canManage && isOwn && (
                        <button onClick={() => remove(c._id)} title="Delete" className="text-red-500 hover:text-red-700">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!shown.length && (
                <tr>
                  <td colSpan={8} className="text-center text-slate-400 py-10">
                    <div className="flex flex-col items-center gap-2">
                      <MessageSquareWarning size={22} className="text-slate-300" />
                      No complaints/requests for this date.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {raiseOpen && <RaiseModal onClose={() => setRaiseOpen(false)} onSaved={load} />}
      {respondTarget && <RespondModal target={respondTarget} onClose={() => setRespondTarget(null)} onSaved={load} />}
    </Layout>
  );
};

export default Complaints;
