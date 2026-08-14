const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const Membership = require('../models/Membership');
const Transaction = require('../models/Transaction');
const AgendaItem = require('../models/AgendaItem');
const Meeting = require('../models/Meeting');
const { ALL_MANAGEMENT } = require('../config/permissions');

// @desc  "Management Performance" (#10) - for a given period: active
// management count, total collection/expenditure, pending vs completed
// agendas, decisions made and total votes cast. All computed from real data
// (no placeholder numbers) - defaults to the last 90 days if no range given.
// @route GET /api/reports/management-performance?startDate=&endDate=
const getManagementPerformance = asyncHandler(async (req, res) => {
  const sid = req.societyId;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
  const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(endDate.getTime() - 90 * 86400000);

  const [
    activeManagementCount,
    collection,
    expenditure,
    agendaItemsInPeriod,
    meetingsInPeriod,
  ] = await Promise.all([
    Membership.count({ where: { society: sid, role: { [Op.in]: ALL_MANAGEMENT }, status: 'active', terminatedAt: null } }),
    Transaction.sum('amount', { where: { society: sid, type: 'Income', date: { [Op.between]: [startDate, endDate] } } }),
    Transaction.sum('amount', { where: { society: sid, type: 'Expense', date: { [Op.between]: [startDate, endDate] } } }),
    AgendaItem.findAll({ where: { society: sid, createdAt: { [Op.between]: [startDate, endDate] } } }),
    Meeting.count({ where: { society: sid, date: { [Op.between]: [startDate, endDate] } } }),
  ]);

  const pendingAgendas = agendaItemsInPeriod.filter((a) => !['Resolved', 'Rejected'].includes(a.agendaStatus)).length;
  const completedAgendas = agendaItemsInPeriod.filter((a) => ['Resolved', 'Rejected'].includes(a.agendaStatus)).length;
  const decisionsMade = agendaItemsInPeriod.filter((a) => a.managementDecision).length;
  const totalVotesCast = agendaItemsInPeriod.reduce((s, a) => s + (a.noOfVotes || 0), 0);

  // Per-management-member breakdown - who's actually active right now.
  const managementMembers = await Membership.findAll({
    where: { society: sid, role: { [Op.in]: ALL_MANAGEMENT }, status: 'active', terminatedAt: null },
  });
  const userIds = [...new Set(managementMembers.map((m) => m.user))];
  const User = require('../models/User');
  const users = await User.findAll({ where: { id: { [Op.in]: userIds } }, attributes: ['id', 'name'] });
  const nameById = new Map(users.map((u) => [u.id, u.name]));
  const roster = managementMembers.map((m) => ({ role: m.role, name: nameById.get(m.user) || '—' }));

  res.json({
    period: { startDate: startDate.toISOString().slice(0, 10), endDate: endDate.toISOString().slice(0, 10) },
    activeManagementCount,
    collection: collection || 0,
    expenditure: expenditure || 0,
    netBalance: (collection || 0) - (expenditure || 0),
    meetingsHeld: meetingsInPeriod,
    agendas: { total: agendaItemsInPeriod.length, pending: pendingAgendas, completed: completedAgendas },
    decisionsMade,
    totalVotesCast,
    roster,
  });
});

// @desc  Financial Statements (#2) - Profit & Loss, Cash Flow, and a
// simplified Balance Sheet, all computed from real Transaction/Fund/
// Investment/Lease data (no placeholder numbers). This is NOT a certified
// double-entry balance sheet (the app doesn't do full double-entry
// bookkeeping) - it's a straightforward, clearly-labeled summary suitable
// for a housing society's day-to-day transparency needs.
// @route GET /api/reports/financial-statements?startDate=&endDate=
const getFinancialStatements = asyncHandler(async (req, res) => {
  const sid = req.societyId;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
  const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(endDate.getTime() - 365 * 86400000);

  const Fund = require('../models/Fund');
  const Investment = require('../models/Investment');
  const Lease = require('../models/Lease');

  const [periodTransactions, allTransactionsUpToEnd, requiredFunds, investments, leases] = await Promise.all([
    Transaction.findAll({ where: { society: sid, date: { [Op.between]: [startDate, endDate] } } }),
    Transaction.findAll({ where: { society: sid, date: { [Op.lte]: endDate } } }),
    Fund.findAll({ where: { society: sid, type: 'Required' } }),
    Investment.findAll({ where: { society: sid } }),
    Lease.findAll({ where: { society: sid } }),
  ]);

  // --- Profit & Loss (for the period) ---
  const incomeByCategory = {};
  const expenseByCategory = {};
  periodTransactions.forEach((t) => {
    const bucket = t.type === 'Income' ? incomeByCategory : expenseByCategory;
    bucket[t.category] = (bucket[t.category] || 0) + Number(t.amount);
  });
  const totalIncome = Object.values(incomeByCategory).reduce((a, b) => a + b, 0);
  const totalExpense = Object.values(expenseByCategory).reduce((a, b) => a + b, 0);

  // --- Cash Flow (for the period) ---
  const openingBalance = allTransactionsUpToEnd
    .filter((t) => new Date(t.date) < startDate)
    .reduce((s, t) => s + (t.type === 'Income' ? Number(t.amount) : -Number(t.amount)), 0);
  const closingBalance = allTransactionsUpToEnd.reduce((s, t) => s + (t.type === 'Income' ? Number(t.amount) : -Number(t.amount)), 0);

  // --- Simplified Balance Sheet (as of endDate) ---
  const cashAndBank = closingBalance;
  const investmentsTotal = investments.filter((i) => i.kind === 'Investment').reduce((s, i) => s + Number(i.amount), 0);
  const fixedAssetsTotal = investments.filter((i) => i.kind === 'Asset').reduce((s, i) => s + Number(i.amount), 0);
  const totalAssets = cashAndBank + investmentsTotal + fixedAssetsTotal;

  const securityDepositsHeld = leases.reduce((s, l) => s + Number(l.securityDeposit || 0), 0);
  const totalLiabilities = securityDepositsHeld;

  const accumulatedFunds = requiredFunds.reduce((s, f) => s + Number(f.collectedAmount || 0), 0);
  const retainedSurplus = totalAssets - totalLiabilities - accumulatedFunds;

  res.json({
    period: { startDate: startDate.toISOString().slice(0, 10), endDate: endDate.toISOString().slice(0, 10) },
    profitAndLoss: {
      income: Object.entries(incomeByCategory).map(([category, amount]) => ({ category, amount })),
      expense: Object.entries(expenseByCategory).map(([category, amount]) => ({ category, amount })),
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
    },
    cashFlow: {
      openingBalance,
      inflows: totalIncome,
      outflows: totalExpense,
      closingBalance,
    },
    balanceSheet: {
      asOf: endDate.toISOString().slice(0, 10),
      assets: { cashAndBank, investments: investmentsTotal, fixedAssets: fixedAssetsTotal, total: totalAssets },
      liabilities: { securityDepositsHeld, total: totalLiabilities },
      equity: { accumulatedFunds, retainedSurplus, total: accumulatedFunds + retainedSurplus },
    },
  });
});

module.exports = { getManagementPerformance, getFinancialStatements };