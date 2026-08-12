import React from 'react';
import { ClipboardList, Clock3, CheckCircle2, CircleDot } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Daily Tasks',
  subtitle: 'Housekeeping task checklist - cleaning, upkeep and area assignments',
  endpoint: '/tasks',
  searchPlaceholder: 'Search by task title, area...',
  canWrite: (role) => ['secretary', 'housekeeping'].includes(role),
  statCards: [
    { label: 'Total Tasks', icon: ClipboardList, color: 'blue', compute: (d, t) => t },
    { label: 'Pending', icon: CircleDot, color: 'red', compute: (d) => d.filter((x) => x.status === 'Pending').length },
    { label: 'In Progress', icon: Clock3, color: 'amber', compute: (d) => d.filter((x) => x.status === 'In Progress').length },
    { label: 'Completed', icon: CheckCircle2, color: 'green', compute: (d) => d.filter((x) => x.status === 'Completed').length },
  ],
  filters: [
    { key: 'frequency', label: 'All Frequency', options: ['Daily', 'Weekly', 'One-time'] },
    { key: 'status', label: 'All Status', options: ['Pending', 'In Progress', 'Completed'] },
  ],
  columns: [
    { key: 'title', label: 'Task' },
    { key: 'area', label: 'Area' },
    { key: 'assignedTo', label: 'Assigned To' },
    { key: 'frequency', label: 'Frequency' },
    { key: 'priority', label: 'Priority', badge: true },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'title', label: 'Task Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'area', label: 'Area', required: true },
    { name: 'assignedTo', label: 'Assigned To' },
    { name: 'frequency', label: 'Frequency', type: 'select', options: ['Daily', 'Weekly', 'One-time'] },
    { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
    { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'In Progress', 'Completed'] },
    { name: 'dueDate', label: 'Due Date', type: 'date' },
  ],
};

const Tasks = () => <ModuleListPage config={config} />;
export default Tasks;
