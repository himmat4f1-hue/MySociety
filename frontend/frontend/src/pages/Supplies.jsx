import React from 'react';
import { Boxes, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Supplies & Consumables',
  subtitle: 'Track cleaning supplies, safety gear and equipment stock',
  endpoint: '/supplies',
  searchPlaceholder: 'Search by item name...',
  canWrite: (role) => ['admin', 'secretary', 'housekeeping'].includes(role),
  statCards: [
    { label: 'Total Items', icon: Boxes, color: 'blue', compute: (d, t) => t },
    { label: 'In Stock', icon: CheckCircle2, color: 'green', compute: (d) => d.filter((x) => x.status === 'In Stock').length },
    { label: 'Low Stock', icon: AlertTriangle, color: 'amber', compute: (d) => d.filter((x) => x.status === 'Low Stock').length },
    { label: 'Out of Stock', icon: XCircle, color: 'red', compute: (d) => d.filter((x) => x.status === 'Out of Stock').length },
  ],
  filters: [
    { key: 'category', label: 'All Category', options: ['Cleaning', 'Safety', 'Equipment', 'Others'] },
    { key: 'status', label: 'All Status', options: ['In Stock', 'Low Stock', 'Out of Stock'] },
  ],
  columns: [
    { key: 'itemName', label: 'Item' },
    { key: 'category', label: 'Category' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unit', label: 'Unit' },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'itemName', label: 'Item Name', required: true },
    { name: 'category', label: 'Category', type: 'select', options: ['Cleaning', 'Safety', 'Equipment', 'Others'] },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true },
    { name: 'unit', label: 'Unit (e.g. pcs, bottles, packs)' },
    { name: 'status', label: 'Status', type: 'select', options: ['In Stock', 'Low Stock', 'Out of Stock'] },
    { name: 'requestedBy', label: 'Requested By' },
  ],
};

const Supplies = () => <ModuleListPage config={config} />;
export default Supplies;
