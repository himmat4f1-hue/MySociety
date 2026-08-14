import React from 'react';
import { Building2, Home, HomeIcon, Wrench, Tag } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Units / Flats',
  subtitle: 'Manage all units in the society, including ownership details',
  endpoint: '/units',
  searchPlaceholder: 'Search by flat no., tower...',
  canWrite: (role) => ['secretary'].includes(role),
  statCards: [
    { label: 'Total Units', icon: Building2, color: 'blue', compute: (d, t) => t },
    { label: 'Occupied', icon: Home, color: 'green', compute: (d) => d.filter((x) => x.status === 'Occupied').length },
    { label: 'Vacant', icon: HomeIcon, color: 'amber', compute: (d) => d.filter((x) => x.status === 'Vacant').length },
    { label: 'Listed for Sale', icon: Tag, color: 'rose', compute: (d) => d.filter((x) => x.forSale).length },
  ],
  filters: [
    { key: 'tower', label: 'All Towers', options: ['Tower A', 'Tower B', 'Tower C', 'Tower D', 'Tower E'] },
    { key: 'status', label: 'All Status', options: ['Occupied', 'Vacant', 'Maintenance'] },
    { key: 'managedBy', label: 'All Managed By', options: ['Owner', 'Tenant', 'Society', 'None'] },
  ],
  columns: [
    { key: 'flatNo', label: 'Flat No.' },
    { key: 'tower', label: 'Tower' },
    { key: 'floor', label: 'Floor' },
    { key: 'type', label: 'Type' },
    { key: 'areaSqft', label: 'Area (sq.ft.)' },
    { key: 'ownersCount', label: 'No. of Owners', render: (i) => i.ownersCount ?? 1 },
    { key: 'managedBy', label: 'Managed By' },
    { key: 'status', label: 'Status', badge: true },
    {
      key: 'forSale',
      label: 'For Sale',
      render: (i) =>
        i.forSale ? (
          <span className="badge bg-rose-50 text-rose-600">
            Listed{i.askingPrice ? ` · ₹${Number(i.askingPrice).toLocaleString('en-IN')}` : ''}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
  ],
  formFields: [
    { name: 'flatNo', label: 'Flat No.', required: true },
    { name: 'tower', label: 'Tower', required: true },
    { name: 'floor', label: 'Floor', required: true },
    { name: 'type', label: 'Type (e.g. 2 BHK)', required: true },
    { name: 'areaSqft', label: 'Area (sq.ft.)', type: 'number', required: true },
    { name: 'status', label: 'Status', type: 'select', options: ['Occupied', 'Vacant', 'Maintenance'] },
    { name: 'ownersCount', label: 'No. of Owners', type: 'number' },
    { name: 'managedBy', label: 'Managed By', type: 'select', options: ['Owner', 'Tenant', 'Society', 'None'] },
  ],
};

const Units = () => <ModuleListPage config={config} />;
export default Units;
