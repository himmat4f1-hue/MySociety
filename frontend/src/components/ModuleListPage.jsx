import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Trash2, Pencil, Download } from 'lucide-react';
import api from '../api/axios';
import Badge from './Badge';
import FormModal from './FormModal';
import Layout from './Layout';
import StatCard from './StatCard';
import { useAuth } from '../context/AuthContext';

// config = {
//   title, subtitle, endpoint, icon,
//   statCards: [{ label, icon, color, compute: (data,total) => value }],
//   columns: [{ key, label, render? }],
//   statusField: 'status' (for badge rendering shortcut, optional per-column render preferred),
//   filters: [{ key, label, options }],
//   searchPlaceholder,
//   formFields: [...] (for FormModal, used for both add & edit),
//   canWrite: (role) => bool
// }
const ModuleListPage = ({ config }) => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const limit = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, search, ...filterValues };
      const res = await api.get(config.endpoint, { params });
      setData(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [config.endpoint, page, search, filterValues]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  const canWrite = config.canWrite ? config.canWrite(user?.role) : true;

  const handleAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    await api.delete(`${config.endpoint}/${item._id}`);
    fetchData();
  };

  const handleSubmit = async (values) => {
    if (editingItem) {
      await api.put(`${config.endpoint}/${editingItem._id}`, values);
    } else {
      await api.post(config.endpoint, values);
    }
    fetchData();
  };

  const pages = Math.ceil(total / limit) || 1;

  return (
    <Layout title={config.title} subtitle={config.subtitle}>
      {config.statCards && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {config.statCards.map((sc) => (
            <StatCard key={sc.label} icon={sc.icon} label={sc.label} color={sc.color} value={sc.compute(data, total)} />
          ))}
        </div>
      )}

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-full md:w-80">
            <Search size={16} className="text-slate-400" />
            <input
              className="bg-transparent text-sm outline-none w-full placeholder:text-slate-400"
              placeholder={config.searchPlaceholder || 'Search...'}
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(config.filters || []).map((f) => (
              <select
                key={f.key}
                className="input w-auto"
                value={filterValues[f.key] || ''}
                onChange={(e) => {
                  setPage(1);
                  setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }));
                }}
              >
                <option value="">{f.label}</option>
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ))}

            <button className="btn-secondary flex items-center gap-1">
              <Download size={16} /> Export
            </button>

            {canWrite && (
              <button onClick={handleAdd} className="btn-primary flex items-center gap-1">
                <Plus size={16} /> Add
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                {config.columns.map((col) => (
                  <th key={col.key} className="py-2 pr-4 font-medium">
                    {col.label}
                  </th>
                ))}
                {canWrite && <th className="py-2 pr-4 font-medium">Action</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={config.columns.length + 1} className="py-8 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 1} className="py-8 text-center text-slate-400">
                    No records found
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                    {config.columns.map((col) => (
                      <td key={col.key} className="py-3 pr-4">
                        {col.render ? col.render(item) : col.badge ? <Badge text={item[col.key]} /> : item[col.key] ?? '—'}
                      </td>
                    ))}
                    {canWrite && (
                      <td className="py-3 pr-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(item)} className="p-1.5 rounded hover:bg-slate-200 text-slate-600">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(item)} className="p-1.5 rounded hover:bg-red-100 text-red-600">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-4 text-sm text-slate-500">
          <p>
            Showing {data.length ? (page - 1) * limit + 1 : 0} to {(page - 1) * limit + data.length} of {total} entries
          </p>
          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="px-3 py-1">{page} / {pages}</span>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {canWrite && (
        <FormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          fields={config.formFields}
          initialValues={editingItem}
          title={editingItem ? `Edit ${config.title}` : `Add ${config.title}`}
        />
      )}
    </Layout>
  );
};

export default ModuleListPage;
