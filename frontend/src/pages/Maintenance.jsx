import React from 'react';
import { Wrench, CircleDot, Clock3, CheckCircle2 } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Maintenance',
  subtitle: 'Manage and track all maintenance requests',
  endpoint: '/maintenance',
  searchPlaceholder: 'Search by request title, flat no...',
  canWrite: () => true,
  statCards: [
    { label: 'Total Requests', icon: Wrench, color: 'blue', compute: (d, t) => t },
    { label: 'Open', icon: CircleDot, color: 'red', compute: (d) => d.filter((x) => x.status === 'Open').length },
    { label: 'In Progress', icon: Clock3, color: 'amber', compute: (d) => d.filter((x) => x.status === 'In Progress').length },
    { label: 'Completed', icon: CheckCircle2, color: 'green', compute: (d) => d.filter((x) => x.status === 'Completed').length },
  ],
  filters: [
    { key: 'status', label: 'All Status', options: ['Open', 'In Progress', 'Completed', 'Overdue'] },
    { key: 'category', label: 'All Category', options: ['Plumbing', 'Electrical', 'Lift', 'AC/HVAC', 'Gardening', 'Others'] },
  ],
  columns: [
    { key: 'title', label: 'Request' },
    { key: 'flatNo', label: 'Flat No.' },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority', badge: true },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'flatNo', label: 'Flat No.', required: true },
    { name: 'category', label: 'Category', type: 'select', options: ['Plumbing', 'Electrical', 'Lift', 'AC/HVAC', 'Gardening', 'Others'], required: true },
    { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
    { name: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Completed', 'Overdue'] },
  ],
};

const Maintenance = () => <ModuleListPage config={config} />;
export default Maintenance;
