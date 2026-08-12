import React from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Meetings',
  subtitle: 'Schedule and manage all society meetings',
  endpoint: '/meetings',
  searchPlaceholder: 'Search meetings by title...',
  canWrite: (role) => ['secretary'].includes(role),
  statCards: [
    { label: 'Total Meetings', icon: CalendarDays, color: 'blue', compute: (d, t) => t },
    { label: 'Upcoming', icon: Clock, color: 'green', compute: (d) => d.filter((x) => new Date(x.date) >= new Date()).length },
  ],
  filters: [{ key: 'type', label: 'All Type', options: ['General', 'Committee', 'Internal'] }],
  columns: [
    { key: 'title', label: 'Meeting Title' },
    { key: 'type', label: 'Type' },
    { key: 'date', label: 'Date', render: (i) => new Date(i.date).toLocaleString() },
    { key: 'location', label: 'Location' },
  ],
  formFields: [
    { name: 'title', label: 'Meeting Title', required: true },
    { name: 'type', label: 'Type', type: 'select', options: ['General', 'Committee', 'Internal'] },
    { name: 'date', label: 'Date & Time', type: 'datetime-local', required: true },
    { name: 'location', label: 'Location' },
    { name: 'agenda', label: 'Agenda', type: 'textarea' },
  ],
};

const Meetings = () => <ModuleListPage config={config} />;
export default Meetings;
