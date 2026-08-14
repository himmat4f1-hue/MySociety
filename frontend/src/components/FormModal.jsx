import React, { useEffect, useState } from 'react';
import { X, ImagePlus } from 'lucide-react';

const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024; // 1.5MB - keeps base64 payloads reasonable since there's no external file storage wired up

// fields: [{ name, label, type: 'text'|'number'|'select'|'date'|'datetime-local'|'textarea'|'photo', options: [] , required }]
const FormModal = ({ open, onClose, onSubmit, fields, initialValues, title }) => {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [photoError, setPhotoError] = useState('');

  useEffect(() => {
    if (open) {
      const defaults = {};
      fields.forEach((f) => {
        defaults[f.name] = initialValues?.[f.name] ?? (f.type === 'number' ? '' : '');
      });
      setValues(defaults);
      setPhotoError('');
    }
  }, [open, initialValues, fields]);

  if (!open) return null;

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (name, file) => {
    setPhotoError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError(`Image is too large (max ${(MAX_PHOTO_BYTES / 1024 / 1024).toFixed(1)}MB). Please choose a smaller photo.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => handleChange(name, reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Strip empty-string values ONLY for 'select' fields: an unselected
      // <select> (e.g. Type, Status) defaults to "" here, and sending "" for
      // an ENUM-backed column is invalid at the database level (Postgres
      // rejects "" for an enum type) - this caused a real 500 error on save
      // whenever an optional dropdown was left unselected. Omitting the key
      // lets the column's own default apply. Text/photo/date fields keep
      // their "" as-is, since blanking those (e.g. "Remove photo") is a
      // legitimate, intentional action that should actually persist.
      const selectFieldNames = new Set(fields.filter((f) => f.type === 'select').map((f) => f.name));
      const payload = {};
      Object.entries(values).forEach(([key, val]) => {
        if (val === '' && selectFieldNames.has(key)) return;
        payload[key] = val;
      });
      await onSubmit(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>
              {f.type === 'select' ? (
                <select
                  className="input"
                  required={f.required}
                  value={values[f.name] ?? ''}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                >
                  <option value="">Select {f.label}</option>
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  className="input"
                  rows={3}
                  required={f.required}
                  value={values[f.name] ?? ''}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              ) : f.type === 'photo' ? (
                <div className="flex items-center gap-3">
                  {values[f.name] ? (
                    <img src={values[f.name]} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-300 shrink-0">
                      <ImagePlus size={22} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="text-xs w-full"
                      onChange={(e) => handlePhotoChange(f.name, e.target.files?.[0])}
                    />
                    {values[f.name] && (
                      <button type="button" onClick={() => handleChange(f.name, '')} className="text-xs text-red-500 mt-1">
                        Remove photo
                      </button>
                    )}
                    {photoError && <p className="text-xs text-red-500 mt-1">{photoError}</p>}
                  </div>
                </div>
              ) : (
                <input
                  className="input"
                  type={f.type || 'text'}
                  required={f.required}
                  value={values[f.name] ?? ''}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              )}
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
