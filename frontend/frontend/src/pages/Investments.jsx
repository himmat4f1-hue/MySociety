import React from 'react';
import { TrendingUp, Landmark } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Investments & Assets',
  subtitle: 'Track society investments, assets and their current value',
  endpoint: '/investments',
  searchPlaceholder: 'Search investments...',
  canWrite: (role) => ['admin', 'accountant'].includes(role),
  statCards: [
    { label: 'Total Records', icon: Landmark, color: 'blue', compute: (d, t) => t },
    { label: 'Total Value', icon: TrendingUp, color: 'green', compute: (d) => `₹${d.reduce((s, x) => s + (x.amount || 0), 0).toLocaleString('en-IN')}` },
  ],
  filters: [{ key: 'kind', label: 'All Kind', options: ['Investment', 'Asset'] }],
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'kind', label: 'Kind' },
    { key: 'amount', label: 'Amount', render: (i) => `₹${Number(i.amount).toLocaleString('en-IN')}` },
    { key: 'maturityDate', label: 'Maturity', render: (i) => (i.maturityDate ? new Date(i.maturityDate).toLocaleDateString() : '—') },
  ],
  formFields: [
    { name: 'name', label: 'Name', required: true },
    { name: 'kind', label: 'Kind', type: 'select', options: ['Investment', 'Asset'] },
    { name: 'amount', label: 'Amount', type: 'number', required: true },
    { name: 'maturityDate', label: 'Maturity Date', type: 'date' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
};

const Investments = () => <ModuleListPage config={config} />;
export default Investments;
