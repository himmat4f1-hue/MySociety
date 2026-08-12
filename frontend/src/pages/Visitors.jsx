import React from 'react';
import { UserCheck, LogIn, LogOut, Clock } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Visitors',
  subtitle: 'Track and manage all society visitors',
  endpoint: '/visitors',
  searchPlaceholder: 'Search by visitor name, mobile, flat no...',
  canWrite: (role) => ['security', 'secretary'].includes(role),
  statCards: [
    { label: 'Total Visitors', icon: UserCheck, color: 'blue', compute: (d, t) => t },
    { label: 'Currently Inside', icon: LogIn, color: 'green', compute: (d) => d.filter((x) => x.status === 'Inside').length },
    { label: 'Checked Out', icon: LogOut, color: 'slate', compute: (d) => d.filter((x) => x.status === 'Checked Out').length },
    { label: 'Pre-Approved', icon: Clock, color: 'purple', compute: (d) => d.filter((x) => x.status === 'Pre-Approved').length },
  ],
  filters: [{ key: 'status', label: 'All Status', options: ['Inside', 'Checked Out', 'Pre-Approved'] }],
  columns: [
    { key: 'name', label: 'Visitor' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'flatNo', label: 'Flat No.' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'name', label: 'Visitor Name', required: true },
    { name: 'mobile', label: 'Mobile', required: true },
    { name: 'flatNo', label: 'Flat No.', required: true },
    { name: 'residentName', label: 'Resident Name' },
    { name: 'purpose', label: 'Purpose', type: 'select', options: ['Personal Visit', 'Courier Delivery', 'Service Person', 'Grocery Delivery', 'Meeting'], required: true },
    { name: 'status', label: 'Status', type: 'select', options: ['Inside', 'Checked Out', 'Pre-Approved'] },
  ],
};

const Visitors = () => <ModuleListPage config={config} />;
export default Visitors;
