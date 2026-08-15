const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../utils/auditLog');
const Fund = require('../models/Fund');
const Transaction = require('../models/Transaction');
const Unit = require('../models/Unit');

// Backs the "Fund / Celebration Management" wizard (CelebrationDonation.jsx):
// panel 1 (Fund/Celebration CRUD) is still the plain Fund CRUD router, but
// panels 2-4 (per-flat collections, expenses, and the rollup summary) need
// custom logic - keeping Fund.collectedAmount/expenseAmount in sync with the
// individual Transaction rows, and computing flat participation stats that
// no generic CRUD endpoint can produce on its own.

// Combines a "dd-mm-yyyy"-ish date input value and a separate time input
// value into a single JS Date. Falls back to "now" if either is missing so a
// bad/partial payload still records something sensible instead of failing.
const combineDateTime = (dateStr, timeStr) => {
  if (!dateStr) return new Date();
  const d = new Date(dateStr);
  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    if (!Number.isNaN(h)) d.setHours(h, Number.isNaN(m) ? 0 : m, 0, 0);
  }
  return d;
};

const findOwnFund = async (req) => {
  return Fund.findOne({ where: { id: req.params.id, society: req.societyId, type: 'Celebration' } });
};

// GET /api/funds/celebrations - list for the panel 1/2/3/4 dropdowns
const listCelebrations = asyncHandler(async (req, res) => {
  const funds = await Fund.findAll({
    where: { society: req.societyId, type: 'Celebration' },
    order: [['createdAt', 'DESC']],
  });
  res.json(funds.map((f) => f.toJSON()));
});

// GET /api/funds/:id/collections
const listCollections = asyncHandler(async (req, res) => {
  const fund = await findOwnFund(req);
  if (!fund) return res.status(404).json({ message: 'Fund/Celebration not found' });
  const rows = await Transaction.findAll({
    where: { society: req.societyId, fund: fund.id, type: 'Income' },
    order: [['date', 'DESC']],
  });
  res.json(rows.map((r) => r.toJSON()));
});

// POST /api/funds/:id/collections { date, time, flatNo, amount }
const addCollection = asyncHandler(async (req, res) => {
  const fund = await findOwnFund(req);
  if (!fund) return res.status(404).json({ message: 'Fund/Celebration not found' });

  const { date, time, flatNo, amount } = req.body;
  if (!flatNo || !amount) {
    return res.status(400).json({ message: 'Flat No. and Amount are required' });
  }

  const txn = await Transaction.create({
    society: req.societyId,
    type: 'Income',
    category: 'Fund Collection',
    description: `${fund.title} - Collection from ${flatNo}`,
    amount,
    flatNo,
    date: combineDateTime(date, time),
    status: 'Collected',
    fund: fund.id,
  });

  await fund.increment('collectedAmount', { by: Number(amount) });
  logActivity(req, { action: 'Create', resourceType: 'FundCollection', resourceId: txn.id, details: { fund: fund.id, flatNo, amount } });

  res.status(201).json(txn);
});

// DELETE /api/funds/:id/collections/:txnId
const deleteCollection = asyncHandler(async (req, res) => {
  const fund = await findOwnFund(req);
  if (!fund) return res.status(404).json({ message: 'Fund/Celebration not found' });

  const txn = await Transaction.findOne({ where: { id: req.params.txnId, society: req.societyId, fund: fund.id, type: 'Income' } });
  if (!txn) return res.status(404).json({ message: 'Collection entry not found' });

  await fund.decrement('collectedAmount', { by: Number(txn.amount) });
  await txn.destroy();
  logActivity(req, { action: 'Delete', resourceType: 'FundCollection', resourceId: req.params.txnId });

  res.json({ message: 'Deleted successfully' });
});

// GET /api/funds/:id/expenses
const listExpenses = asyncHandler(async (req, res) => {
  const fund = await findOwnFund(req);
  if (!fund) return res.status(404).json({ message: 'Fund/Celebration not found' });
  const rows = await Transaction.findAll({
    where: { society: req.societyId, fund: fund.id, type: 'Expense' },
    order: [['date', 'DESC']],
  });
  res.json(rows.map((r) => r.toJSON()));
});

// POST /api/funds/:id/expenses { date, time, description, amount }
const addExpense = asyncHandler(async (req, res) => {
  const fund = await findOwnFund(req);
  if (!fund) return res.status(404).json({ message: 'Fund/Celebration not found' });

  const { date, time, description, amount } = req.body;
  if (!description || !amount) {
    return res.status(400).json({ message: 'Description and Amount are required' });
  }

  const txn = await Transaction.create({
    society: req.societyId,
    type: 'Expense',
    category: 'Fund Expense',
    description,
    amount,
    date: combineDateTime(date, time),
    status: 'Paid',
    fund: fund.id,
  });

  await fund.increment('expenseAmount', { by: Number(amount) });
  logActivity(req, { action: 'Create', resourceType: 'FundExpense', resourceId: txn.id, details: { fund: fund.id, description, amount } });

  res.status(201).json(txn);
});

// DELETE /api/funds/:id/expenses/:txnId
const deleteExpense = asyncHandler(async (req, res) => {
  const fund = await findOwnFund(req);
  if (!fund) return res.status(404).json({ message: 'Fund/Celebration not found' });

  const txn = await Transaction.findOne({ where: { id: req.params.txnId, society: req.societyId, fund: fund.id, type: 'Expense' } });
  if (!txn) return res.status(404).json({ message: 'Expense entry not found' });

  await fund.decrement('expenseAmount', { by: Number(txn.amount) });
  await txn.destroy();
  logActivity(req, { action: 'Delete', resourceType: 'FundExpense', resourceId: req.params.txnId });

  res.json({ message: 'Deleted successfully' });
});

// GET /api/funds/:id/summary - powers panel 4 (Report/Summary)
const summary = asyncHandler(async (req, res) => {
  const fund = await findOwnFund(req);
  if (!fund) return res.status(404).json({ message: 'Fund/Celebration not found' });

  const [totalFlats, contributedFlats, totalTransactions] = await Promise.all([
    Unit.count({ where: { society: req.societyId } }),
    Transaction.count({
      where: { society: req.societyId, fund: fund.id, type: 'Income', flatNo: { [Op.ne]: null } },
      distinct: true,
      col: 'flatNo',
    }),
    Transaction.count({ where: { society: req.societyId, fund: fund.id } }),
  ]);

  const minimumRequired = Number(fund.targetAmount || 0);
  const totalCollected = Number(fund.collectedAmount || 0);
  const totalExpenses = Number(fund.expenseAmount || 0);
  const totalPending = Math.max(minimumRequired - totalCollected, 0);
  const balanceAmount = totalCollected - totalExpenses;
  const collectionPercent = minimumRequired > 0 ? Math.min((totalCollected / minimumRequired) * 100, 100) : 0;

  res.json({
    fund: fund.toJSON(),
    minimumRequired,
    totalCollected,
    totalPending,
    totalExpenses,
    balanceAmount,
    collectionPercent: Number(collectionPercent.toFixed(2)),
    totalFlats,
    contributedFlats,
    pendingFlats: Math.max(totalFlats - contributedFlats, 0),
    totalTransactions,
    startDate: fund.startDate,
    closingDate: fund.dueDate,
    status: fund.status,
  });
});

module.exports = {
  listCelebrations,
  listCollections,
  addCollection,
  deleteCollection,
  listExpenses,
  addExpense,
  deleteExpense,
  summary,
};
