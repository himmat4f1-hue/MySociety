import React from 'react';
import { Megaphone, Pin, Clock, Archive } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Notice Board',
  subtitle: 'Publish and manage important notices and announcements',
  endpoint: '/notices',
  searchPlaceholder: 'Search notices by title...',
  canWrite: (role) => ['secretary'].includes(role),
  statCards: [
    { label: 'Total Notices', icon: Megaphone, color: 'blue', compute: (d, t) => t },
    { label: 'Published', icon: Pin, color: 'green', compute: (d) => d.filter((x) => x.status === 'Published').length },
    { label: 'Scheduled', icon: Clock, color: 'amber', compute: (d) => d.filter((x) => x.status === 'Scheduled').length },
    { label: 'Archived', icon: Archive, color: 'slate', compute: (d) => d.filter((x) => x.status === 'Archived').length },
  ],
  filters: [
    { key: 'status', label: 'All Status', options: ['Published', 'Scheduled', 'Archived'] },
    { key: 'category', label: 'All Category', options: ['Finance', 'Maintenance', 'Community', 'Rules & Regulations', 'Amenities', 'Security', 'General'] },
    { key: 'building', label: 'All Towers', options: ['All Towers', 'Tower A', 'Tower B', 'Tower C', 'Tower D', 'Tower E'] },
  ],
  columns: [
    { key: 'title', label: 'Notice' },
    { key: 'category', label: 'Category' },
    { key: 'building', label: 'Building / Tower' },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'category', label: 'Category', type: 'select', options: ['Finance', 'Maintenance', 'Community', 'Rules & Regulations', 'Amenities', 'Security', 'General'], required: true },
    { name: 'building', label: 'Building / Tower' },
    { name: 'status', label: 'Status', type: 'select', options: ['Published', 'Scheduled', 'Archived'] },
  ],
};

const Notices = () => <ModuleListPage config={config} />;
export default Notices;
