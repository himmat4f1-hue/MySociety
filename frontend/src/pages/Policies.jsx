import React from 'react';
import { ScrollText } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Society Policies',
  subtitle: 'View all society policies, rules and by-laws',
  endpoint: '/policies',
  searchPlaceholder: 'Search policies by title...',
  canWrite: (role) => ['admin', 'secretary', 'chairman'].includes(role),
  statCards: [{ label: 'Total Policies', icon: ScrollText, color: 'blue', compute: (d, t) => t }],
  columns: [
    { key: 'title', label: 'Policy' },
    { key: 'version', label: 'Version' },
    { key: 'publishedOn', label: 'Published On', render: (i) => new Date(i.publishedOn).toLocaleDateString() },
  ],
  formFields: [
    { name: 'title', label: 'Policy Title', required: true },
    { name: 'version', label: 'Version', required: true },
    { name: 'publishedOn', label: 'Published On', type: 'date', required: true },
  ],
};

const Policies = () => <ModuleListPage config={config} />;
export default Policies;
