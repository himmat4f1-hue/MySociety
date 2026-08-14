import React from 'react';
import { Star, MessageCircle } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const Stars = ({ n }) => (
  <span className="text-amber-500">{'★'.repeat(n)}<span className="text-slate-200">{'★'.repeat(5 - n)}</span></span>
);

const config = {
  title: 'Member Feedback & Ratings',
  subtitle: 'Ratings and comments on management, amenities, meetings, and staff',
  endpoint: '/feedback',
  searchPlaceholder: 'Search by category, target, comments...',
  canWrite: () => true,
  statCards: [
    { label: 'Total Feedback', icon: MessageCircle, color: 'blue', compute: (d, t) => t },
    { label: 'Average Rating', icon: Star, color: 'amber', compute: (d) => (d.length ? (d.reduce((s, x) => s + x.rating, 0) / d.length).toFixed(1) : '—') },
  ],
  filters: [{ key: 'category', label: 'All Category', options: ['Management', 'Amenities', 'Meeting', 'Staff', 'Other'] }],
  columns: [
    { key: 'category', label: 'Category' },
    { key: 'targetName', label: 'About' },
    { key: 'rating', label: 'Rating', render: (i) => <Stars n={i.rating} /> },
    { key: 'comments', label: 'Comments' },
    { key: 'flatId', label: 'Flat' },
  ],
  formFields: [
    { name: 'category', label: 'Category', type: 'select', options: ['Management', 'Amenities', 'Meeting', 'Staff', 'Other'], required: true },
    { name: 'targetName', label: 'About (e.g. amenity or meeting name)' },
    { name: 'rating', label: 'Rating (1-5)', type: 'number', required: true },
    { name: 'comments', label: 'Comments', type: 'textarea' },
  ],
};

const FeedbackPage = () => <ModuleListPage config={config} />;
export default FeedbackPage;
