import React, { useEffect, useState, useCallback } from 'react';
import { Wrench, Plus, Pencil, X, Loader2, ImageOff, FileText, Paperclip } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

const emptyForm = {
  serviceType: '',
  name: '',
  companyName: '',
  phone: '',
  email: '',
  address: '',
  workTiming: '',
  charges: '',
  notes: '',
  photo: null,
  attachmentUrl: null,
  attachmentName: null,
  attachmentType: null,
};

const readAsDataUrl = (file, maxBytes) =>
  new Promise((resolve, reject) => {
    if (file.size > maxBytes) {
      reject(`File is too large (max ${(maxBytes / 1024 / 1024).toFixed(1)}MB).`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject('Could not read that file.');
    reader.readAsDataURL(file);
  });

// "More" card: Company Name, Email, Address, Work Timing, Charges, and the
// attachment (clickable to open) - the extended details that don't fit in
// the simplified 6-column list.
const MoreDetailsCard = ({ provider, onClose }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">{provider.name}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
      </div>
      <div className="text-sm space-y-2">
        <div className="flex justify-between border-b border-slate-100 py-1.5">
          <span className="text-slate-500">Company Name</span>
          <span className="text-slate-800 font-medium">{provider.companyName || '—'}</span>
        </div>
        <div className="flex justify-between border-b border-slate-100 py-1.5">
          <span className="text-slate-500">Email</span>
          <span className="text-slate-800 font-medium">{provider.email || '—'}</span>
        </div>
        <div className="flex justify-between border-b border-slate-100 py-1.5 gap-4">
          <span className="text-slate-500 shrink-0">Address</span>
          <span className="text-slate-800 font-medium text-right">{provider.address || '—'}</span>
        </div>
        <div className="flex justify-between border-b border-slate-100 py-1.5">
          <span className="text-slate-500">Work Timing</span>
          <span className="text-slate-800 font-medium">{provider.workTiming || '—'}</span>
        </div>
        <div className="flex justify-between border-b border-slate-100 py-1.5">
          <span className="text-slate-500">Charges</span>
          <span className="text-slate-800 font-medium">{provider.charges || '—'}</span>
        </div>
        {provider.notes && (
          <div className="border-b border-slate-100 py-1.5">
            <span className="text-slate-500 block mb-0.5">Notes</span>
            <span className="text-slate-800">{provider.notes}</span>
          </div>
        )}
        <div className="flex justify-between items-center py-1.5">
          <span className="text-slate-500">Attachment</span>
          {provider.attachmentUrl ? (
            <a href={provider.attachmentUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline flex items-center gap-1">
              <Paperclip size={13} /> {provider.attachmentName || 'View file'}
            </a>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button onClick={onClose} className="btn-secondary">
          Close
        </button>
      </div>
    </div>
  </div>
);

const ProviderFormModal = ({ initial, onClose, onSaved }) => {
  const [form, setForm] = useState(initial || emptyForm);
  const [photoError, setPhotoError] = useState('');
  const [attachmentError, setAttachmentError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?._id;

  const handlePhoto = async (file) => {
    if (!file) return;
    setPhotoError('');
    try {
      const dataUrl = await readAsDataUrl(file, MAX_PHOTO_BYTES);
      setForm((prev) => ({ ...prev, photo: dataUrl }));
    } catch (msg) {
      setPhotoError(msg);
    }
  };

  const handleAttachment = async (file) => {
    if (!file) return;
    setAttachmentError('');
    try {
      const dataUrl = await readAsDataUrl(file, MAX_ATTACHMENT_BYTES);
      setForm((prev) => ({ ...prev, attachmentUrl: dataUrl, attachmentName: file.name, attachmentType: file.type }));
    } catch (msg) {
      setAttachmentError(msg);
    }
  };

  const save = async () => {
    if (!form.serviceType.trim() || !form.name.trim() || !form.phone.trim()) {
      return alert('Service Type, Name, and Phone are required.');
    }
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload._id;
      if (isEdit) {
        await api.put(`/service-providers/${initial._id}`, payload);
      } else {
        await api.post('/service-providers', payload);
      }
      await onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save this service provider.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">{isEdit ? 'Edit Service Provider' : 'Add Service Provider'}</h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Photo</label>
          <div className="flex items-center gap-3">
            {form.photo ? (
              <img src={form.photo} alt="" className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
            ) : (
              <span className="w-14 h-14 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                <ImageOff size={20} />
              </span>
            )}
            <label className="btn-secondary text-xs px-3 py-1.5 cursor-pointer">
              Choose Photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files?.[0])} />
            </label>
          </div>
          {photoError && <p className="text-xs text-red-600 mt-1">{photoError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Type *</label>
            <input className="input" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} placeholder="e.g. Plumber" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contact person" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
            <input className="input" value={form.companyName || ''} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" className="input" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
          <textarea className="input" rows={2} value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Work Timing</label>
            <input className="input" placeholder="e.g. 9 AM - 6 PM" value={form.workTiming || ''} onChange={(e) => setForm({ ...form, workTiming: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Charges</label>
            <input className="input" placeholder="e.g. Rs. 500/visit" value={form.charges || ''} onChange={(e) => setForm({ ...form, charges: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea className="input" rows={2} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Attachment</label>
          <div className="flex items-center gap-2">
            <label className="btn-secondary text-xs px-3 py-1.5 cursor-pointer flex items-center gap-1">
              <Paperclip size={13} /> Choose File
              <input type="file" className="hidden" onChange={(e) => handleAttachment(e.target.files?.[0])} />
            </label>
            {form.attachmentName && <span className="text-xs text-emerald-600">{form.attachmentName}</span>}
          </div>
          {attachmentError && <p className="text-xs text-red-600 mt-1">{attachmentError}</p>}
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

const ServiceProviders = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'secretary';

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formTarget, setFormTarget] = useState(null);
  const [moreTarget, setMoreTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/service-providers', { params: { limit: 200 } });
      setProviders(res.data.data || res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Layout title="Service Providers" subtitle="Contact details for society vendors, contractors, and service partners">
      <div className="flex justify-end mb-4">
        {canManage && (
          <button onClick={() => setFormTarget(emptyForm)} className="btn-primary flex items-center gap-1.5">
            <Plus size={16} /> Add Service Provider
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
                <th className="font-medium px-4 py-2.5 w-16">Photo</th>
                <th className="font-medium px-4 py-2.5">Service Type</th>
                <th className="font-medium px-4 py-2.5">Name</th>
                <th className="font-medium px-4 py-2.5">Phone</th>
                <th className="font-medium px-4 py-2.5">More</th>
                {canManage && <th className="font-medium px-4 py-2.5 w-16">Action</th>}
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p._id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2.5">
                    {p.photo ? (
                      <img src={p.photo} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <span className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300">
                        <Wrench size={16} />
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">{p.serviceType}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-700">{p.name}</td>
                  <td className="px-4 py-2.5 text-slate-600">{p.phone}</td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => setMoreTarget(p)} className="text-brand-600 hover:text-brand-700 hover:underline text-xs flex items-center gap-1">
                      <FileText size={12} /> Details
                    </button>
                  </td>
                  {canManage && (
                    <td className="px-4 py-2.5">
                      <button onClick={() => setFormTarget(p)} className="text-blue-500 hover:text-blue-700">
                        <Pencil size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {!providers.length && (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="text-center text-slate-400 py-10">
                    No service providers added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {formTarget && <ProviderFormModal initial={formTarget} onClose={() => setFormTarget(null)} onSaved={load} />}
      {moreTarget && <MoreDetailsCard provider={moreTarget} onClose={() => setMoreTarget(null)} />}
    </Layout>
  );
};

export default ServiceProviders;
