import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Megaphone, Plus, Pencil, Trash2, X, Loader2, FileText, Paperclip } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const todayISO = () => new Date().toISOString().slice(0, 10);

const readFileAsAttachment = (file) =>
  new Promise((resolve, reject) => {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      reject(`File is too large (max ${(MAX_ATTACHMENT_BYTES / 1024 / 1024).toFixed(0)}MB).`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ url: reader.result, name: file.name, type: file.type });
    reader.onerror = () => reject('Could not read that file.');
    reader.readAsDataURL(file);
  });

// Small icon/thumbnail per attachment, clickable to open in a new tab.
const AttachmentChip = ({ a }) => {
  const isImage = (a.type || '').startsWith('image/');
  return (
    <a href={a.url} target="_blank" rel="noreferrer" title={a.name} className="inline-block">
      {isImage ? (
        <img src={a.url} alt={a.name} className="w-8 h-8 rounded object-cover border border-slate-200" />
      ) : (
        <span className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand-600">
          <FileText size={14} />
        </span>
      )}
    </a>
  );
};

const emptyForm = { date: todayISO(), building: 'All Towers', title: '', description: '', attachments: [] };

const NoticeFormModal = ({ initial, towers, onClose, onSaved }) => {
  const [form, setForm] = useState(initial);
  const [attachError, setAttachError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial._id;

  const addAttachment = async (file) => {
    if (!file) return;
    setAttachError('');
    try {
      const att = await readFileAsAttachment(file);
      setForm((prev) => ({ ...prev, attachments: [...(prev.attachments || []), att] }));
    } catch (msg) {
      setAttachError(msg);
    }
  };

  const removeAttachment = (idx) => setForm((prev) => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }));

  const save = async () => {
    if (!form.title.trim() || !form.description.trim()) return alert('Notice title and description are required.');
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        building: form.building,
        attachments: form.attachments,
        publishedOn: new Date(`${form.date}T00:00:00`).toISOString(),
        category: initial.category || 'General',
      };
      if (isEdit) {
        await api.put(`/notices/${initial._id}`, payload);
      } else {
        await api.post('/notices', payload);
      }
      await onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save this notice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">{isEdit ? 'Edit Notice' : 'Add Notice'}</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
            <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Building / Tower</label>
            <select className="input" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })}>
              <option value="All Towers">All Towers</option>
              {towers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notice / Description *</label>
          <textarea className="input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Attachments</label>
          <label className="btn-secondary text-xs px-3 py-1.5 cursor-pointer inline-flex items-center gap-1">
            <Paperclip size={13} /> Add File
            <input type="file" className="hidden" onChange={(e) => addAttachment(e.target.files?.[0])} />
          </label>
          {attachError && <p className="text-xs text-red-600 mt-1">{attachError}</p>}
          {form.attachments?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {form.attachments.map((a, i) => (
                <li key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-1.5 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 truncate">
                    <Paperclip size={11} className="shrink-0" /> {a.name}
                  </span>
                  <button onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-500 shrink-0 ml-2">
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
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

const Notices = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'secretary';

  const [filterDate, setFilterDate] = useState(todayISO());
  const [notices, setNotices] = useState([]);
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formTarget, setFormTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/notices', { params: { limit: 300 } });
      setNotices(res.data.data || res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    api
      .get('/units', { params: { limit: 500 } })
      .then((res) => setTowers([...new Set((res.data.data || []).map((u) => u.tower))].sort()))
      .catch(() => {});
  }, [load]);

  // Every user sees all notices for the filtered date - "All Towers"
  // notices always show; a tower-specific notice only shows if it matches
  // the tower filter... but since there's no separate tower filter here
  // (just date), we simply show every notice published on that date,
  // regardless of which tower it targets - the Building/Tower column tells
  // the reader who it's for.
  const shownNotices = useMemo(() => notices.filter((n) => n.publishedOn && new Date(n.publishedOn).toISOString().slice(0, 10) === filterDate), [notices, filterDate]);

  const remove = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    await api.delete(`/notices/${id}`);
    await load();
  };

  return (
    <Layout title="Notice Board" subtitle="Publish and browse society notices, filtered by date">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500">Date</label>
          <input type="date" className="input w-auto" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        </div>
        {canManage && (
          <button onClick={() => setFormTarget({ ...emptyForm, date: filterDate })} className="btn-primary flex items-center gap-1.5">
            <Plus size={16} /> Add Notice
          </button>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <p className="text-slate-400 text-center py-10">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-left border-b border-slate-100 bg-slate-50">
                <th className="font-medium px-4 py-2.5 w-28">Date</th>
                <th className="font-medium px-4 py-2.5 w-36">Building / Tower</th>
                <th className="font-medium px-4 py-2.5">Notice</th>
                <th className="font-medium px-4 py-2.5 w-32">Attachments</th>
                {canManage && <th className="font-medium px-4 py-2.5 w-20">Action</th>}
              </tr>
            </thead>
            <tbody>
              {shownNotices.map((n) => (
                <tr key={n._id} className="border-b border-slate-50 last:border-0 align-top">
                  <td className="px-4 py-2.5 text-slate-600">{new Date(n.publishedOn).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-slate-600">{n.building || 'All Towers'}</td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-slate-800">{n.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{n.description}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    {n.attachments?.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {n.attachments.map((a, i) => (
                          <AttachmentChip key={i} a={a} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  {canManage && (
                    <td className="px-4 py-2.5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFormTarget({ ...n, date: new Date(n.publishedOn).toISOString().slice(0, 10) })}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => remove(n._id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {!shownNotices.length && (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="text-center text-slate-400 py-10">
                    <div className="flex flex-col items-center gap-2">
                      <Megaphone size={22} className="text-slate-300" />
                      No notices for this date.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {formTarget && <NoticeFormModal initial={formTarget} towers={towers} onClose={() => setFormTarget(null)} onSaved={load} />}
    </Layout>
  );
};

export default Notices;
