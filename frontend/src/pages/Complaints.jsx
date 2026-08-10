import React from 'react';
import { MessageSquareWarning, CircleDot, Clock3, CheckCircle2 } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Complaints',
  subtitle: 'Track and manage all society complaints',
  endpoint: '/complaints',
  searchPlaceholder: 'Search by title, flat no., category...',
  canWrite: () => true,
  statCards: [
    { label: 'Total Complaints', icon: MessageSquareWarning, color: 'blue', compute: (d, t) => t },
    { label: 'Open', icon: CircleDot, color: 'red', compute: (d) => d.filter((x) => x.status === 'Open').length },
    { label: 'In Progress', icon: Clock3, color: 'amber', compute: (d) => d.filter((x) => x.status === 'In Progress').length },
    { label: 'Resolved', icon: CheckCircle2, color: 'green', compute: (d) => d.filter((x) => x.status === 'Resolved').length },
  ],
  filters: [
    { key: 'status', label: 'All Status', options: ['Open', 'In Progress', 'Resolved', 'Overdue'] },
    { key: 'priority', label: 'All Priority', options: ['Low', 'Medium', 'High'] },
  ],
  columns: [
    { key: 'title', label: 'Complaint' },
    { key: 'flatNo', label: 'Flat No.' },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority', badge: true },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'flatNo', label: 'Flat No.', required: true },
    { name: 'category', label: 'Category', type: 'select', options: ['Plumbing', 'Electrical', 'Lift', 'Housekeeping', 'Parking', 'Others'], required: true },
    { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
    { name: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Resolved', 'Overdue'] },
  ],
};

const Complaints = () => <ModuleListPage config={config} />;
export default Complaints;
