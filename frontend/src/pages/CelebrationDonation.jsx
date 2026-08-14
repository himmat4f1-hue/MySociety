import React from 'react';
import { Gift, IndianRupee, TrendingDown } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Celebration & Donation',
  subtitle: 'Festival and event funds - donor contributions and expenditure breakdown',
  endpoint: '/funds', // Fund model, pre-scoped to Celebration-type entries via fixedParams below
  fixedParams: { type: 'Celebration' },
  searchPlaceholder: 'Search by celebration/event title...',
  canWrite: (role) => ['secretary', 'treasurer'].includes(role),
  statCards: [
    { label: 'Total Celebrations/Events', icon: Gift, color: 'purple', compute: (d, t) => t },
    { label: 'Total Collected', icon: IndianRupee, color: 'green', compute: (d) => `₹${d.reduce((s, x) => s + Number(x.collectedAmount || 0), 0).toLocaleString('en-IN')}` },
    { label: 'Total Spent', icon: TrendingDown, color: 'red', compute: (d) => `₹${d.reduce((s, x) => s + Number(x.expenseAmount || 0), 0).toLocaleString('en-IN')}` },
  ],
  columns: [
    { key: 'title', label: 'Event / Celebration' },
    { key: 'collectedAmount', label: 'Collected', render: (i) => `₹${Number(i.collectedAmount || 0).toLocaleString('en-IN')}` },
    { key: 'expenseAmount', label: 'Spent', render: (i) => `₹${Number(i.expenseAmount || 0).toLocaleString('en-IN')}` },
    { key: 'balance', label: 'Balance', render: (i) => `₹${(Number(i.collectedAmount || 0) - Number(i.expenseAmount || 0)).toLocaleString('en-IN')}` },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'title', label: 'Event / Celebration Title', required: true },
    { name: 'collectedAmount', label: 'Amount Collected (Donations)', type: 'number' },
    { name: 'expenseAmount', label: 'Amount Spent', type: 'number' },
    { name: 'dueDate', label: 'Event Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: ['Open', 'Closed'] },
  ],
};

const CelebrationDonation = () => <ModuleListPage config={config} />;
export default CelebrationDonation;
