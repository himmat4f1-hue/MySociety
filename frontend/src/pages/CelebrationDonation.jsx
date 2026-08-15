import React, { useEffect, useState, useCallback } from 'react';
import {
  PartyPopper, ClipboardList, Wallet, Receipt, FileBarChart, Plus, Pencil, Trash2,
  Target, Clock, Wallet as WalletIcon, PieChart, Building2, CheckCircle2,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';

const TABS = [
  { id: 1, key: 'fund', label: 'Fund / Celebration', sub: 'Create / Edit / Delete', icon: ClipboardList, color: 'blue' },
  { id: 2, key: 'collection', label: 'Enter Fund / Collection', sub: 'Add fund for selected celebration', icon: Wallet, color: 'green' },
  { id: 3, key: 'expense', label: 'Enter Expense', sub: 'Add expense for selected celebration', icon: Receipt, color: 'amber' },
  { id: 4, key: 'report', label: 'Report / Summary', sub: 'View summary and details', icon: FileBarChart, color: 'purple' },
];

const TAB_COLOR = {
  blue: { active: 'border-blue-600 bg-blue-50', badge: 'bg-blue-600', text: 'text-blue-700' },
  green: { active: 'border-green-600 bg-green-50', badge: 'bg-green-600', text: 'text-green-700' },
  amber: { active: 'border-amber-500 bg-amber-50', badge: 'bg-amber-500', text: 'text-amber-700' },
  purple: { active: 'border-purple-600 bg-purple-50', badge: 'bg-purple-600', text: 'text-purple-700' },
};

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const toDateInput = (val) => (val ? new Date(val).toISOString().slice(0, 10) : '');
const toTimeInput = (val) => (val ? new Date(val).toTimeString().slice(0, 5) : '');

const emptyFundForm = { title: '', startDate: '', startTime: '', targetAmount: '', dueDate: '', dueTime: '' };

const CelebrationDonation = () => {
  const { user } = useAuth();
  const canWrite = ['secretary', 'treasurer'].includes(user?.role);

  const [activeTab, setActiveTab] = useState(1);
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Panel 1 - Fund/Celebration CRUD
  const [fundForm, setFundForm] = useState(emptyFundForm);
  const [editingFundId, setEditingFundId] = useState(null);

  // Shared "selected celebration" dropdown, used by panels 2, 3 & 4
  const [selectedFundId, setSelectedFundId] = useState('');

  // Panel 2 - Collections
  const [collections, setCollections] = useState([]);
  const [collectionForm, setCollectionForm] = useState({ date: '', time: '', flatNo: '', amount: '' });

  // Panel 3 - Expenses
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ date: '', time: '', description: '', amount: '' });

  // Panel 4 - Report/Summary
  const [summary, setSummary] = useState(null);

  const loadFunds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/funds/celebrations');
      setFunds(res.data);
      setSelectedFundId((prev) => prev || (res.data[0] && res.data[0]._id) || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load celebrations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFunds(); }, [loadFunds]);

  const loadCollections = useCallback(async (fundId) => {
    if (!fundId) return setCollections([]);
    const res = await api.get(`/funds/${fundId}/collections`);
    setCollections(res.data);
  }, []);

  const loadExpenses = useCallback(async (fundId) => {
    if (!fundId) return setExpenses([]);
    const res = await api.get(`/funds/${fundId}/expenses`);
    setExpenses(res.data);
  }, []);

  const loadSummary = useCallback(async (fundId) => {
    if (!fundId) return setSummary(null);
    const res = await api.get(`/funds/${fundId}/summary`);
    setSummary(res.data);
  }, []);

  useEffect(() => {
    if (!selectedFundId) return;
    loadCollections(selectedFundId);
    loadExpenses(selectedFundId);
    loadSummary(selectedFundId);
  }, [selectedFundId, loadCollections, loadExpenses, loadSummary]);

  const refreshAfterMutation = async () => {
    await loadFunds();
    if (selectedFundId) {
      loadCollections(selectedFundId);
      loadExpenses(selectedFundId);
      loadSummary(selectedFundId);
    }
  };

  // --- Panel 1: Fund/Celebration CRUD ---
  const resetFundForm = () => { setFundForm(emptyFundForm); setEditingFundId(null); };

  const handleEditFund = (f) => {
    setEditingFundId(f._id);
    setFundForm({
      title: f.title || '',
      startDate: toDateInput(f.startDate),
      startTime: toTimeInput(f.startDate),
      targetAmount: f.targetAmount || '',
      dueDate: toDateInput(f.dueDate),
      dueTime: toTimeInput(f.dueDate),
    });
  };

  const combine = (date, time) => (date ? new Date(`${date}T${time || '00:00'}:00`).toISOString() : null);

  const handleSaveFund = async () => {
    if (!fundForm.title) return setError('Fund / Celebration Name is required');
    setError('');
    const payload = {
      type: 'Celebration',
      title: fundForm.title,
      startDate: combine(fundForm.startDate, fundForm.startTime),
      targetAmount: fundForm.targetAmount || 0,
      dueDate: combine(fundForm.dueDate, fundForm.dueTime),
    };
    try {
      if (editingFundId) {
        await api.put(`/funds/${editingFundId}`, payload);
      } else {
        await api.post('/funds', payload);
      }
      resetFundForm();
      await loadFunds();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save Fund / Celebration');
    }
  };

  const handleDeleteFund = async (id) => {
    if (!window.confirm('Delete this Fund / Celebration? Its collection/expense entries will be kept but unlinked.')) return;
    try {
      await api.delete(`/funds/${id}`);
      if (editingFundId === id) resetFundForm();
      if (selectedFundId === id) setSelectedFundId('');
      await loadFunds();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete Fund / Celebration');
    }
  };

  // --- Panel 2: Collections ---
  const handleAddCollection = async () => {
    if (!collectionForm.flatNo || !collectionForm.amount) return setError('Flat No. and Amount are required');
    if (!selectedFundId) return setError('Select a Fund / Celebration first');
    setError('');
    try {
      await api.post(`/funds/${selectedFundId}/collections`, collectionForm);
      setCollectionForm({ date: '', time: '', flatNo: '', amount: '' });
      refreshAfterMutation();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add collection');
    }
  };

  const handleDeleteCollection = async (txnId) => {
    if (!window.confirm('Delete this collection entry?')) return;
    await api.delete(`/funds/${selectedFundId}/collections/${txnId}`);
    refreshAfterMutation();
  };

  // --- Panel 3: Expenses ---
  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount) return setError('Description and Amount are required');
    if (!selectedFundId) return setError('Select a Fund / Celebration first');
    setError('');
    try {
      await api.post(`/funds/${selectedFundId}/expenses`, expenseForm);
      setExpenseForm({ date: '', time: '', description: '', amount: '' });
      refreshAfterMutation();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleDeleteExpense = async (txnId) => {
    if (!window.confirm('Delete this expense entry?')) return;
    await api.delete(`/funds/${selectedFundId}/expenses/${txnId}`);
    refreshAfterMutation();
  };

  const FundDropdown = ({ value, onChange }) => (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select Fund / Celebration</option>
      {funds.map((f) => (
        <option key={f._id} value={f._id}>
          {f.title} ({toDateInput(f.startDate) || '—'} - {toDateInput(f.dueDate) || '—'})
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <PartyPopper size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Fund / Celebration Management</h1>
          <p className="text-sm text-slate-500">Create Fund/Celebration, Add Funds, Enter Expenses and View Reports</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>
      )}

      {/* Step tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TABS.map((t) => {
          const Icon = t.icon;
          const c = TAB_COLOR[t.color];
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`card !p-4 text-left flex items-start gap-3 border-2 transition-colors ${active ? c.active : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <span className={`w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0 ${c.badge}`}>{t.id}</span>
              <span>
                <span className={`flex items-center gap-1.5 font-semibold ${active ? c.text : 'text-slate-800'}`}>
                  <Icon size={16} /> {t.label}
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">{t.sub}</span>
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="card text-center text-slate-500 py-10">Loading...</div>
      ) : (
        <>
          {/* Panel 1 */}
          {activeTab === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card space-y-3">
                <h2 className="font-semibold text-slate-800">Fund / Donation / Celebration</h2>
                <p className="text-xs text-slate-500 -mt-2">Create, Edit or Delete Fund/Celebration</p>
                {canWrite && (
                  <button onClick={resetFundForm} className="btn-primary flex items-center gap-1.5 !w-auto">
                    <Plus size={16} /> Create New
                  </button>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-200">
                        <th className="py-2 pr-2">Fund / Celebration Name</th>
                        <th className="py-2 pr-2">Start Date</th>
                        <th className="py-2 pr-2">Closing Date</th>
                        {canWrite && <th className="py-2"></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {funds.map((f) => (
                        <tr key={f._id} className="border-b border-slate-100">
                          <td className="py-2 pr-2 font-medium text-slate-700">{f.title}</td>
                          <td className="py-2 pr-2 text-slate-500">{toDateInput(f.startDate) || '—'}</td>
                          <td className="py-2 pr-2 text-slate-500">{toDateInput(f.dueDate) || '—'}</td>
                          {canWrite && (
                            <td className="py-2">
                              <div className="flex gap-2">
                                <button onClick={() => handleEditFund(f)} className="text-blue-600 hover:text-blue-800"><Pencil size={15} /></button>
                                <button onClick={() => handleDeleteFund(f._id)} className="text-red-500 hover:text-red-700"><Trash2 size={15} /></button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                      {!funds.length && (
                        <tr><td colSpan={4} className="text-center text-slate-400 py-6">No Fund / Celebration created yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {canWrite && (
                <div className="card space-y-3">
                  <h2 className="font-semibold text-slate-800">{editingFundId ? 'Edit Fund / Celebration' : 'Create / Edit Fund / Celebration'}</h2>
                  <div>
                    <label className="text-sm text-slate-600">Fund / Celebration Name *</label>
                    <input className="input mt-1" placeholder="Enter fund or celebration name" value={fundForm.title}
                      onChange={(e) => setFundForm({ ...fundForm, title: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-slate-600">Start Date *</label>
                      <input type="date" className="input mt-1" value={fundForm.startDate}
                        onChange={(e) => setFundForm({ ...fundForm, startDate: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Start Time *</label>
                      <input type="time" className="input mt-1" value={fundForm.startTime}
                        onChange={(e) => setFundForm({ ...fundForm, startTime: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Minimum Amount Required *</label>
                    <input type="number" className="input mt-1" placeholder="Enter amount" value={fundForm.targetAmount}
                      onChange={(e) => setFundForm({ ...fundForm, targetAmount: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-slate-600">Closing Date *</label>
                      <input type="date" className="input mt-1" value={fundForm.dueDate}
                        onChange={(e) => setFundForm({ ...fundForm, dueDate: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Closing Time *</label>
                      <input type="time" className="input mt-1" value={fundForm.dueTime}
                        onChange={(e) => setFundForm({ ...fundForm, dueTime: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleSaveFund} className="btn-primary">{editingFundId ? 'Update' : 'Save'}</button>
                    {editingFundId && (
                      <>
                        <button onClick={() => handleDeleteFund(editingFundId)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Delete</button>
                        <button onClick={resetFundForm} className="btn-secondary">Cancel</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Panel 2 */}
          {activeTab === 2 && (
            <div className="card space-y-3 max-w-xl">
              <h2 className="font-semibold text-slate-800">Enter Fund / Collection</h2>
              <p className="text-xs text-slate-500 -mt-2">Add fund collection for selected celebration</p>
              <div>
                <label className="text-sm text-slate-600">Select Fund / Celebration *</label>
                <div className="mt-1"><FundDropdown value={selectedFundId} onChange={setSelectedFundId} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">Date *</label>
                  <input type="date" className="input mt-1" value={collectionForm.date}
                    onChange={(e) => setCollectionForm({ ...collectionForm, date: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Time *</label>
                  <input type="time" className="input mt-1" value={collectionForm.time}
                    onChange={(e) => setCollectionForm({ ...collectionForm, time: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-600">Flat No. *</label>
                <input className="input mt-1" placeholder="e.g. A-101" value={collectionForm.flatNo}
                  onChange={(e) => setCollectionForm({ ...collectionForm, flatNo: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-slate-600">Amount (₹) *</label>
                <input type="number" className="input mt-1" value={collectionForm.amount}
                  onChange={(e) => setCollectionForm({ ...collectionForm, amount: e.target.value })} />
              </div>
              {canWrite && (
                <button onClick={handleAddCollection} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
                  <Plus size={16} /> Add Fund / Collection
                </button>
              )}

              <h3 className="font-medium text-slate-700 pt-2">Recent Collections</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-200">
                      <th className="py-2 pr-2">Date</th><th className="py-2 pr-2">Time</th><th className="py-2 pr-2">Flat No.</th><th className="py-2 pr-2">Amount</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.map((c) => (
                      <tr key={c._id} className="border-b border-slate-100">
                        <td className="py-2 pr-2">{toDateInput(c.date)}</td>
                        <td className="py-2 pr-2">{new Date(c.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-2 pr-2">{c.flatNo}</td>
                        <td className="py-2 pr-2">{money(c.amount)}</td>
                        <td>{canWrite && <button onClick={() => handleDeleteCollection(c._id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>}</td>
                      </tr>
                    ))}
                    {!collections.length && <tr><td colSpan={5} className="text-center text-slate-400 py-6">No collections yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Panel 3 */}
          {activeTab === 3 && (
            <div className="card space-y-3 max-w-xl">
              <h2 className="font-semibold text-slate-800">Enter Expense</h2>
              <p className="text-xs text-slate-500 -mt-2">Add expense for selected celebration</p>
              <div>
                <label className="text-sm text-slate-600">Select Fund / Celebration *</label>
                <div className="mt-1"><FundDropdown value={selectedFundId} onChange={setSelectedFundId} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">Date *</label>
                  <input type="date" className="input mt-1" value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Time *</label>
                  <input type="time" className="input mt-1" value={expenseForm.time}
                    onChange={(e) => setExpenseForm({ ...expenseForm, time: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-600">Description *</label>
                <input className="input mt-1" placeholder="e.g. Decoration Material" value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-slate-600">Amount (₹) *</label>
                <input type="number" className="input mt-1" value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
              </div>
              {canWrite && (
                <button onClick={handleAddExpense} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
                  <Plus size={16} /> Add Expense
                </button>
              )}

              <h3 className="font-medium text-slate-700 pt-2">Recent Expenses</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-200">
                      <th className="py-2 pr-2">Date</th><th className="py-2 pr-2">Time</th><th className="py-2 pr-2">Description</th><th className="py-2 pr-2">Amount</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((x) => (
                      <tr key={x._id} className="border-b border-slate-100">
                        <td className="py-2 pr-2">{toDateInput(x.date)}</td>
                        <td className="py-2 pr-2">{new Date(x.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-2 pr-2">{x.description}</td>
                        <td className="py-2 pr-2">{money(x.amount)}</td>
                        <td>{canWrite && <button onClick={() => handleDeleteExpense(x._id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>}</td>
                      </tr>
                    ))}
                    {!expenses.length && <tr><td colSpan={5} className="text-center text-slate-400 py-6">No expenses yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Panel 4 */}
          {activeTab === 4 && (
            <div className="card space-y-4">
              <h2 className="font-semibold text-slate-800">Fund / Celebration Summary</h2>
              <p className="text-xs text-slate-500 -mt-3">View summary and details for selected celebration</p>
              <div className="max-w-md">
                <label className="text-sm text-slate-600">Select Fund / Celebration *</label>
                <div className="mt-1"><FundDropdown value={selectedFundId} onChange={setSelectedFundId} /></div>
              </div>

              {summary ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <SummaryCard icon={Target} color="blue" label="Minimum Required" value={money(summary.minimumRequired)} />
                    <SummaryCard icon={CheckCircle2} color="green" label="Total Collected" value={money(summary.totalCollected)} />
                    <SummaryCard icon={Clock} color="amber" label="Total Pending" value={money(summary.totalPending)} />
                    <SummaryCard icon={Receipt} color="red" label="Total Expenses" value={money(summary.totalExpenses)} />
                    <SummaryCard icon={WalletIcon} color="purple" label="Balance Amount" value={money(summary.balanceAmount)} />
                    <SummaryCard icon={PieChart} color="teal" label="Collection %" value={`${summary.collectionPercent}%`} />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="card !p-4 text-center">
                      <p className="text-xs text-slate-500">Total Flats</p>
                      <p className="text-xl font-bold text-slate-800">{summary.totalFlats}</p>
                    </div>
                    <div className="card !p-4 text-center">
                      <p className="text-xs text-slate-500">Contributed Flats</p>
                      <p className="text-xl font-bold text-slate-800">{summary.contributedFlats}</p>
                    </div>
                    <div className="card !p-4 text-center">
                      <p className="text-xs text-slate-500">Pending Flats</p>
                      <p className="text-xl font-bold text-slate-800">{summary.pendingFlats}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-700 mb-2">Quick Details</h3>
                    <div className="text-sm text-slate-600 space-y-1.5">
                      <div className="flex justify-between border-b border-slate-100 py-1.5"><span>Start Date / Time</span><span className="font-medium text-slate-800">{summary.startDate ? new Date(summary.startDate).toLocaleString('en-IN') : '—'}</span></div>
                      <div className="flex justify-between border-b border-slate-100 py-1.5"><span>Closing Date / Time</span><span className="font-medium text-slate-800">{summary.closingDate ? new Date(summary.closingDate).toLocaleString('en-IN') : '—'}</span></div>
                      <div className="flex justify-between border-b border-slate-100 py-1.5"><span>Minimum Amount</span><span className="font-medium text-slate-800">{money(summary.minimumRequired)}</span></div>
                      <div className="flex justify-between border-b border-slate-100 py-1.5"><span>Total Transactions</span><span className="font-medium text-slate-800">{summary.totalTransactions}</span></div>
                      <div className="flex justify-between py-1.5"><span>Status</span><Badge text={summary.status} /></div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-slate-400 text-sm py-6 text-center">Select a Fund / Celebration to view its summary.</p>
              )}
            </div>
          )}
        </>
      )}

      <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-lg px-4 py-3 flex items-start gap-2">
        <Building2 size={16} className="mt-0.5 shrink-0" />
        Fund/Collection entries and Expenses must be added against a specific Fund/Celebration. Deleting a Fund/Celebration will not delete the associated transactions.
      </div>
    </div>
  );
};

const CARD_COLOR = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
  teal: 'bg-teal-50 text-teal-600',
};

const SummaryCard = ({ icon: Icon, label, value, color }) => (
  <div className="card !p-4 flex items-center gap-3">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${CARD_COLOR[color]}`}><Icon size={18} /></div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default CelebrationDonation;
