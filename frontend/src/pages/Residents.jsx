import React from 'react';
import { Users, Home, UserCheck2, Car } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Residents',
  subtitle: 'Manage all residents and their details',
  endpoint: '/residents',
  searchPlaceholder: 'Search residents, flat no...',
  canWrite: (role) => ['admin', 'secretary'].includes(role),
  statCards: [
    { label: 'Total Residents', icon: Users, color: 'blue', compute: (d, t) => t },
    { label: 'Owners', icon: Home, color: 'green', compute: (d) => d.filter((x) => x.type === 'Owner').length },
    { label: 'Tenants', icon: UserCheck2, color: 'purple', compute: (d) => d.filter((x) => x.type === 'Tenant').length },
    { label: 'Vehicles', icon: Car, color: 'amber', compute: (d) => d.reduce((s, x) => s + (x.vehicles?.length || 0), 0) },
  ],
  filters: [
    { key: 'type', label: 'All Type', options: ['Owner', 'Tenant'] },
    { key: 'status', label: 'All Status', options: ['Active', 'Inactive'] },
  ],
  columns: [
    { key: 'name', label: 'Resident', render: (i) => i.user?.name || i.name || '—' },
    { key: 'flatNo', label: 'Flat No.' },
    { key: 'tower', label: 'Tower' },
    { key: 'type', label: 'Type', badge: true },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'flatNo', label: 'Flat No.', required: true },
    { name: 'tower', label: 'Tower', required: true },
    { name: 'type', label: 'Type', type: 'select', options: ['Owner', 'Tenant'], required: true },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
  ],
};

const Residents = () => <ModuleListPage config={config} />;
export default Residents;
