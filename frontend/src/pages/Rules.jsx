import React from 'react';
import { Gavel } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Society Rules',
  subtitle: 'Complete list of all society rules and regulations',
  endpoint: '/rules',
  searchPlaceholder: 'Search rules by title or category...',
  canWrite: (role) => ['secretary'].includes(role),
  statCards: [{ label: 'Total Rules', icon: Gavel, color: 'blue', compute: (d, t) => t }],
  filters: [{ key: 'category', label: 'All Categories', options: ['Parking', 'Noise', 'Pets', 'Common Areas', 'Renovation'] }],
  columns: [
    { key: 'category', label: 'Category' },
    { key: 'title', label: 'Rule' },
    { key: 'description', label: 'Description' },
    { key: 'effectiveFrom', label: 'Effective From', render: (i) => new Date(i.effectiveFrom).toLocaleDateString() },
  ],
  formFields: [
    { name: 'category', label: 'Category', required: true },
    { name: 'title', label: 'Rule Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'effectiveFrom', label: 'Effective From', type: 'date' },
  ],
};

const Rules = () => <ModuleListPage config={config} bare />;
export default Rules;
