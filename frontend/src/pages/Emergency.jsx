import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Emergency (SOS)',
  subtitle: 'Declare an emergency and notify security & management',
  endpoint: '/emergencies',
  searchPlaceholder: 'Search by flat no...',
  canWrite: () => true,
  statCards: [
    { label: 'Total Alerts', icon: ShieldAlert, color: 'red', compute: (d, t) => t },
    { label: 'Resolved', icon: CheckCircle2, color: 'green', compute: (d) => d.filter((x) => x.status === 'Resolved').length },
  ],
  filters: [
    { key: 'status', label: 'All Status', options: ['Active', 'Resolved'] },
    { key: 'type', label: 'All Type', options: ['Medical', 'Security', 'Fire/Safety', 'Other'] },
  ],
  columns: [
    { key: 'type', label: 'Type', badge: true },
    { key: 'flatNo', label: 'Flat No.' },
    { key: 'notes', label: 'Notes' },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'type', label: 'Emergency Type', type: 'select', options: ['Medical', 'Security', 'Fire/Safety', 'Other'], required: true },
    { name: 'flatNo', label: 'Flat No.', required: true },
    { name: 'notes', label: 'Notes / Reason', type: 'textarea' },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Resolved'] },
  ],
};

const Emergency = () => <ModuleListPage config={config} />;
export default Emergency;
