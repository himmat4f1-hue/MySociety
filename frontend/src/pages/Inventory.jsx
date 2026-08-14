import React from 'react';
import { Boxes, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Inventory Management',
  subtitle: 'Common-area equipment - fire extinguishers, CCTV, generators, pumps, etc.',
  endpoint: '/inventory',
  searchPlaceholder: 'Search by item name, category, location...',
  canWrite: (role) => ['secretary'].includes(role),
  statCards: [
    { label: 'Total Items', icon: Boxes, color: 'blue', compute: (d, t) => t },
    { label: 'Working', icon: CheckCircle2, color: 'green', compute: (d) => d.filter((x) => x.status === 'Working').length },
    { label: 'Needs Service', icon: AlertTriangle, color: 'amber', compute: (d) => d.filter((x) => x.status === 'Needs Service').length },
    { label: 'Out of Order', icon: XCircle, color: 'red', compute: (d) => d.filter((x) => x.status === 'Out of Order').length },
  ],
  filters: [
    { key: 'category', label: 'All Category', options: ['Fire Safety', 'Security', 'Electrical', 'Plumbing', 'Other'] },
    { key: 'status', label: 'All Status', options: ['Working', 'Needs Service', 'Out of Order'] },
  ],
  columns: [
    { key: 'itemName', label: 'Item' },
    { key: 'category', label: 'Category' },
    { key: 'location', label: 'Location' },
    { key: 'warrantyExpiry', label: 'Warranty Expiry', render: (i) => (i.warrantyExpiry ? new Date(i.warrantyExpiry).toLocaleDateString() : '—') },
    { key: 'nextServiceDue', label: 'Next Service Due', render: (i) => (i.nextServiceDue ? new Date(i.nextServiceDue).toLocaleDateString() : '—') },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'itemName', label: 'Item Name', required: true },
    { name: 'category', label: 'Category', type: 'select', options: ['Fire Safety', 'Security', 'Electrical', 'Plumbing', 'Other'], required: true },
    { name: 'location', label: 'Location' },
    { name: 'installationDate', label: 'Installation Date', type: 'date' },
    { name: 'warrantyExpiry', label: 'Warranty Expiry', type: 'date' },
    { name: 'lastServiceDate', label: 'Last Service Date', type: 'date' },
    { name: 'nextServiceDue', label: 'Next Service Due', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: ['Working', 'Needs Service', 'Out of Order'] },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
};

const Inventory = () => <ModuleListPage config={config} />;
export default Inventory;
