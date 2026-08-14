import React from 'react';
import { UserCheck, LogIn, LogOut, Clock, Users } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Visitors',
  subtitle: 'Track and manage all society visitors, including group size',
  endpoint: '/visitors',
  searchPlaceholder: 'Search by visitor name, mobile, flat no...',
  canWrite: (role) => ['security', 'secretary'].includes(role),
  statCards: [
    { label: 'Total Visitors', icon: UserCheck, color: 'blue', compute: (d, t) => t },
    { label: 'Currently Inside', icon: LogIn, color: 'green', compute: (d) => d.filter((x) => x.status === 'Inside').length },
    { label: 'Checked Out', icon: LogOut, color: 'slate', compute: (d) => d.filter((x) => x.status === 'Checked Out').length },
    { label: 'Total People (incl. groups)', icon: Users, color: 'purple', compute: (d) => d.reduce((s, x) => s + (x.personsCount || 1), 0) },
  ],
  filters: [{ key: 'status', label: 'All Status', options: ['Inside', 'Checked Out', 'Pre-Approved'] }],
  columns: [
    { key: 'name', label: 'Visitor' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'flatNo', label: 'Flat No.' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'personsCount', label: 'No. of People', render: (i) => i.personsCount ?? 1 },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'name', label: 'Visitor Name', required: true },
    { name: 'mobile', label: 'Mobile', required: true },
    { name: 'flatNo', label: 'Flat No.', required: true },
    { name: 'residentName', label: 'Resident Name' },
    { name: 'purpose', label: 'Purpose', type: 'select', options: ['Personal Visit', 'Courier Delivery', 'Service Person', 'Grocery Delivery', 'Meeting'], required: true },
    { name: 'personsCount', label: 'No. of People (group size)', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: ['Inside', 'Checked Out', 'Pre-Approved'] },
  ],
};

const Visitors = () => <ModuleListPage config={config} />;
export default Visitors;
