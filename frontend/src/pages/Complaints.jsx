import React from 'react';
import { MessageSquareWarning, CircleDot, Clock3, CheckCircle2 } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Complaints & Requests',
  subtitle: 'Track and manage all society complaints - visible to every member',
  endpoint: '/complaints',
  searchPlaceholder: 'Search by title, flat no., category...',
  canWrite: () => true,
  statCards: [
    { label: 'Total Complaints', icon: MessageSquareWarning, color: 'blue', compute: (d, t) => t },
    { label: 'Open', icon: CircleDot, color: 'red', compute: (d) => d.filter((x) => x.status === 'Open').length },
    { label: 'In Process', icon: Clock3, color: 'amber', compute: (d) => d.filter((x) => x.status === 'In Process').length },
    { label: 'Resolved', icon: CheckCircle2, color: 'green', compute: (d) => d.filter((x) => x.status === 'Resolved').length },
  ],
  filters: [
    { key: 'status', label: 'All Status', options: ['Open', 'In Process', 'Resolved'] },
    { key: 'priority', label: 'All Priority', options: ['High', 'Medium', 'Low'] },
    { key: 'category', label: 'All Type', options: ['Housekeeping', 'Lift', 'Camera', 'Electrical', 'Plumbing', 'Other'] },
  ],
  columns: [
    { key: 'title', label: 'Complaint' },
    { key: 'flatNo', label: 'Flat No.' },
    { key: 'category', label: 'Type' },
    { key: 'priority', label: 'Priority', badge: true },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description (Detail)', type: 'textarea', required: true },
    { name: 'flatNo', label: 'Flat No.', required: true },
    { name: 'category', label: 'Type', type: 'select', options: ['Housekeeping', 'Lift', 'Camera', 'Electrical', 'Plumbing', 'Other'], required: true },
    { name: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
    { name: 'status', label: 'Status', type: 'select', options: ['Open', 'In Process', 'Resolved'] },
  ],
};

const Complaints = () => <ModuleListPage config={config} />;
export default Complaints;
