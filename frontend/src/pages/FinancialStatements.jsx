import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Landmark, Info } from 'lucide-react';
import api from '../api/axios';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const todayISO = () => new Date().toISOString().slice(0, 10);
const yearAgoISO = () => new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);

const Row = ({ label, value, bold, tone }) => (
  <div className={`flex justify-between py-1.5 ${bold ? 'border-t border-slate-200 mt-1 pt-2' : 'border-b border-slate-50'}`}>
    <span className={bold ? 'font-semibold text-slate-800' : 'text-slate-600'}>{label}</span>
    <span className={`font-semibold ${tone === 'green' ? 'text-emerald-600' : tone === 'red' ? 'text-red-500' : bold ? 'text-slate-900' : 'text-slate-700'}`}>
      {inr(value)}
    </span>
  </div>
);

const FinancialStatements = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(yearAgoISO());
  const [endDate, setEndDate] = useState(todayISO());

  useEffect(() => {
    setLoading(true);
    api
      .get('/reports/financial-statements', { params: { startDate, endDate } })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <label className="text-sm text-slate-500">From</label>
        <input type="date" className="input w-auto" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <label className="text-sm text-slate-500">To</label>
        <input type="date" className="input w-auto" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg p-3 mb-6 flex items-start gap-2">
        <Info size={16} className="shrink-0 mt-0.5" />
        <p>
          This is a straightforward summary generated from actual income, expense, fund, and asset records - not a
          certified double-entry balance sheet. For statutory filing, please have your accountant review these figures.
        </p>
      </div>

      {loading || !data ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profit & Loss */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" /> Profit & Loss
            </h3>
            <p className="text-xs text-slate-400 mb-3">{data.period.startDate} to {data.period.endDate}</p>

            <p className="text-xs font-semibold text-slate-400 mb-1">Income</p>
            {data.profitAndLoss.income.length === 0 ? (
              <p className="text-sm text-slate-400 mb-2">No income recorded.</p>
            ) : (
              data.profitAndLoss.income.map((i) => <Row key={i.category} label={i.category} value={i.amount} />)
            )}
            <Row label="Total Income" value={data.profitAndLoss.totalIncome} bold tone="green" />

            <p className="text-xs font-semibold text-slate-400 mb-1 mt-4">Expense</p>
            {data.profitAndLoss.expense.length === 0 ? (
              <p className="text-sm text-slate-400 mb-2">No expense recorded.</p>
            ) : (
              data.profitAndLoss.expense.map((i) => <Row key={i.category} label={i.category} value={i.amount} />)
            )}
            <Row label="Total Expense" value={data.profitAndLoss.totalExpense} bold tone="red" />

            <div className="mt-4 pt-3 border-t-2 border-slate-200 flex justify-between">
              <span className="font-bold text-slate-800">Net {data.profitAndLoss.netProfit >= 0 ? 'Profit' : 'Loss'}</span>
              <span className={`font-bold text-lg ${data.profitAndLoss.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {inr(Math.abs(data.profitAndLoss.netProfit))}
              </span>
            </div>
          </div>

          {/* Cash Flow */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
              <Wallet size={18} className="text-blue-600" /> Cash Flow Statement
            </h3>
            <p className="text-xs text-slate-400 mb-3">{data.period.startDate} to {data.period.endDate}</p>

            <Row label="Opening Balance" value={data.cashFlow.openingBalance} />
            <Row label="Cash Inflows (Income)" value={data.cashFlow.inflows} tone="green" />
            <Row label="Cash Outflows (Expense)" value={data.cashFlow.outflows} tone="red" />
            <Row label="Closing Balance" value={data.cashFlow.closingBalance} bold />

            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm">
                {data.cashFlow.closingBalance >= data.cashFlow.openingBalance ? (
                  <TrendingUp size={16} className="text-emerald-600" />
                ) : (
                  <TrendingDown size={16} className="text-red-500" />
                )}
                <span className="text-slate-600">
                  Net change: <strong>{inr(data.cashFlow.closingBalance - data.cashFlow.openingBalance)}</strong> over this period
                </span>
              </div>
            </div>
          </div>

          {/* Balance Sheet */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
              <Landmark size={18} className="text-purple-600" /> Balance Sheet
            </h3>
            <p className="text-xs text-slate-400 mb-3">As of {data.balanceSheet.asOf}</p>

            <p className="text-xs font-semibold text-slate-400 mb-1">Assets</p>
            <Row label="Cash & Bank" value={data.balanceSheet.assets.cashAndBank} />
            <Row label="Investments (FDs, Mutual Funds)" value={data.balanceSheet.assets.investments} />
            <Row label="Fixed Assets (Land, Building, etc.)" value={data.balanceSheet.assets.fixedAssets} />
            <Row label="Total Assets" value={data.balanceSheet.assets.total} bold tone="green" />

            <p className="text-xs font-semibold text-slate-400 mb-1 mt-4">Liabilities</p>
            <Row label="Security Deposits Held (tenant/lease)" value={data.balanceSheet.liabilities.securityDepositsHeld} />
            <Row label="Total Liabilities" value={data.balanceSheet.liabilities.total} bold tone="red" />

            <p className="text-xs font-semibold text-slate-400 mb-1 mt-4">Equity / Reserves</p>
            <Row label="Accumulated Funds (Corpus, Sinking, etc.)" value={data.balanceSheet.equity.accumulatedFunds} />
            <Row label="Retained Surplus" value={data.balanceSheet.equity.retainedSurplus} />
            <Row label="Total Equity" value={data.balanceSheet.equity.total} bold />
          </div>
        </div>
      )}
    </>
  );
};

export default FinancialStatements;
