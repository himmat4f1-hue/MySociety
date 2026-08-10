import React from 'react';
import { Video, Clock, CheckCircle2 } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Camera Check Requests',
  subtitle: 'Request security to check camera footage for any incident',
  endpoint: '/camera-requests',
  searchPlaceholder: 'Search by area or reason...',
  canWrite: () => true,
  statCards: [
    { label: 'Total Requests', icon: Video, color: 'blue', compute: (d, t) => t },
    { label: 'Pending', icon: Clock, color: 'amber', compute: (d) => d.filter((x) => x.status === 'Pending').length },
    { label: 'Completed', icon: CheckCircle2, color: 'green', compute: (d) => d.filter((x) => x.status === 'Completed').length },
  ],
  filters: [{ key: 'status', label: 'All Status', options: ['Pending', 'In Review', 'Completed'] }],
  columns: [
    { key: 'area', label: 'Area' },
    { key: 'date', label: 'Date', render: (i) => new Date(i.date).toLocaleDateString() },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'area', label: 'Area', type: 'select', options: ['Main Gate', 'Parking Area', 'Tower Entry', 'Club House', 'Garden'], required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'time', label: 'Time' },
    { name: 'flatNo', label: 'Flat No.' },
    { name: 'reason', label: 'Reason', type: 'textarea', required: true },
    { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'In Review', 'Completed'] },
  ],
};

const CameraRequests = () => <ModuleListPage config={config} />;
export default CameraRequests;
