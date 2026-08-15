import React from 'react';
import { Dumbbell, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const PhotoOrPlaceholder = ({ src }) =>
  src ? (
    <img src={src} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-300 flex items-center justify-center">
      <Dumbbell size={16} />
    </div>
  );

const config = {
  title: 'Amenities',
  subtitle: 'Manage and monitor all amenities and facilities',
  endpoint: '/amenities',
  searchPlaceholder: 'Search amenities by name or type...',
  canWrite: (role) => ['secretary'].includes(role),
  statCards: [
    { label: 'Total Amenities', icon: Dumbbell, color: 'blue', compute: (d, t) => t },
    { label: 'Available', icon: CheckCircle2, color: 'green', compute: (d) => d.filter((x) => x.status === 'Available').length },
    { label: 'Under Maintenance', icon: AlertTriangle, color: 'amber', compute: (d) => d.filter((x) => x.status === 'Under Maintenance').length },
    { label: 'Out of Service', icon: XCircle, color: 'red', compute: (d) => d.filter((x) => x.status === 'Out of Service').length },
  ],
  filters: [
    { key: 'status', label: 'All Status', options: ['Available', 'Under Maintenance', 'Out of Service'] },
    { key: 'type', label: 'All Type', options: ['Fitness', 'Recreation', 'Community', 'Sports', 'Entertainment', 'Utility'] },
  ],
  columns: [
    { key: 'photo', label: 'Photo', render: (i) => <PhotoOrPlaceholder src={i.photo} /> },
    { key: 'name', label: 'Amenity Name' },
    { key: 'type', label: 'Type' },
    { key: 'building', label: 'Building / Tower' },
    { key: 'availability', label: 'Availability' },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'photo', label: 'Photo', type: 'photo' },
    { name: 'name', label: 'Amenity Name', required: true },
    { name: 'type', label: 'Type', type: 'select', options: ['Fitness', 'Recreation', 'Community', 'Sports', 'Entertainment', 'Utility'], required: true },
    { name: 'building', label: 'Building / Tower' },
    { name: 'availability', label: 'Availability (e.g. 6:00 AM - 10:00 PM)' },
    { name: 'status', label: 'Status', type: 'select', options: ['Available', 'Under Maintenance', 'Out of Service'] },
    { name: 'capacity', label: 'Capacity', type: 'number' },
    { name: 'used', label: 'Currently Used', type: 'number' },
  ],
};

const Amenities = () => <ModuleListPage config={config} />;
export default Amenities;
