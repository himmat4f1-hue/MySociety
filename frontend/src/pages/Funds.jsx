import React from 'react';
import { PiggyBank, IndianRupee } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Funds',
  subtitle: 'Required funds & public celebration fund tracking',
  endpoint: '/funds',
  searchPlaceholder: 'Search funds by title...',
  canWrite: (role) => ['accountant'].includes(role),
  statCards: [
    { label: 'Total Funds', icon: PiggyBank, color: 'blue', compute: (d, t) => t },
    { label: 'Total Collected', icon: IndianRupee, color: 'green', compute: (d) => `₹${d.reduce((s, x) => s + (x.collectedAmount || 0), 0).toLocaleString('en-IN')}` },
  ],
  filters: [{ key: 'type', label: 'All Type', options: ['Required', 'Celebration'] }],
  columns: [
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type' },
    { key: 'targetAmount', label: 'Target', render: (i) => (i.targetAmount ? `₹${Number(i.targetAmount).toLocaleString('en-IN')}` : '—') },
    { key: 'collectedAmount', label: 'Collected', render: (i) => `₹${Number(i.collectedAmount || 0).toLocaleString('en-IN')}` },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'title', label: 'Title', required: true },
    { name: 'type', label: 'Type', type: 'select', options: ['Required', 'Celebration'], required: true },
    { name: 'targetAmount', label: 'Target Amount', type: 'number' },
    { name: 'collectedAmount', label: 'Collected Amount', type: 'number' },
    { name: 'expenseAmount', label: 'Expense Amount', type: 'number' },
    { name: 'dueDate', label: 'Due Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: ['Open', 'Closed'] },
  ],
};

const Funds = () => <ModuleListPage config={config} />;
export default Funds;
