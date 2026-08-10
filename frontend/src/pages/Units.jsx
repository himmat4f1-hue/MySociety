import React from 'react';
import { Building2, Home, HomeIcon, Wrench } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Units / Flats',
  subtitle: 'Manage all units in the society',
  endpoint: '/units',
  searchPlaceholder: 'Search by flat no., tower...',
  canWrite: (role) => ['admin', 'secretary'].includes(role),
  statCards: [
    { label: 'Total Units', icon: Building2, color: 'blue', compute: (d, t) => t },
    { label: 'Occupied', icon: Home, color: 'green', compute: (d) => d.filter((x) => x.status === 'Occupied').length },
    { label: 'Vacant', icon: HomeIcon, color: 'amber', compute: (d) => d.filter((x) => x.status === 'Vacant').length },
    { label: 'Maintenance', icon: Wrench, color: 'purple', compute: (d) => d.filter((x) => x.status === 'Maintenance').length },
  ],
  filters: [
    { key: 'tower', label: 'All Towers', options: ['Tower A', 'Tower B', 'Tower C', 'Tower D'] },
    { key: 'status', label: 'All Status', options: ['Occupied', 'Vacant', 'Maintenance'] },
  ],
  columns: [
    { key: 'flatNo', label: 'Flat No.' },
    { key: 'tower', label: 'Tower' },
    { key: 'floor', label: 'Floor' },
    { key: 'type', label: 'Type' },
    { key: 'areaSqft', label: 'Area (sq.ft.)' },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'flatNo', label: 'Flat No.', required: true },
    { name: 'tower', label: 'Tower', required: true },
    { name: 'floor', label: 'Floor', required: true },
    { name: 'type', label: 'Type (e.g. 2 BHK)', required: true },
    { name: 'areaSqft', label: 'Area (sq.ft.)', type: 'number', required: true },
    { name: 'status', label: 'Status', type: 'select', options: ['Occupied', 'Vacant', 'Maintenance'] },
  ],
};

const Units = () => <ModuleListPage config={config} />;
export default Units;
