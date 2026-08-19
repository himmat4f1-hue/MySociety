import React from 'react';
import { UserCheck, LogIn, LogOut, Users, User } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const PhotoOrPlaceholder = ({ src }) =>
  src ? (
    <img src={src} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
      <User size={16} />
    </div>
  );

const config = {
  title: 'Visitors',
  subtitle: 'Track and manage all society visitors, including group size and vehicle',
  endpoint: '/visitors',
  searchPlaceholder: 'Search by visitor name, mobile, flat no...',
  canWrite: (role) => ['security', 'secretary'].includes(role),
  statCards: [
    { label: 'Total Visitors', icon: UserCheck, color: 'blue', compute: (d, t) => t },
    { label: 'Currently Inside', icon: LogIn, color: 'green', compute: (d) => d.filter((x) => x.status === 'Inside').length },
    { label: 'Checked Out', icon: LogOut, color: 'slate', compute: (d) => d.filter((x) => x.status === 'Checked Out').length },
    { label: 'Total People (incl. groups)', icon: Users, color: 'purple', compute: (d) => d.reduce((s, x) => s + (x.personsCount || 1), 0) },
  ],
  filters: [{ key: 'status', label: 'All Status', options: ['Inside', 'Checked Out', 'Pre-Approved'] }],
  columns: [
    { key: 'photo', label: 'Photo', render: (i) => <PhotoOrPlaceholder src={i.photo} /> },
    { key: 'name', label: 'Visitor' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'flatNo', label: 'Flat No.' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'personsCount', label: 'No. of People', render: (i) => i.personsCount ?? 1 },
    { key: 'vehicleNumber', label: 'Vehicle No.', render: (i) => i.vehicleNumber || '—' },
    {
      key: 'preApproved',
      label: 'Pre-Approved',
      render: (i) => (i.preApproved ? <span className="badge bg-emerald-50 text-emerald-600">Yes</span> : <span className="text-slate-400 text-xs">No</span>),
    },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'photo', label: 'Photo (captured at gate)', type: 'photo' },
    { name: 'name', label: 'Visitor Name', required: true },
    { name: 'mobile', label: 'Mobile', required: true },
    { name: 'flatNo', label: 'Flat No.', required: true },
    { name: 'residentName', label: 'Resident Name' },
    { name: 'purpose', label: 'Purpose', type: 'select', options: ['Personal Visit', 'Courier Delivery', 'Service Person', 'Grocery Delivery', 'Meeting'], required: true },
    { name: 'personsCount', label: 'No. of People (group size)', type: 'number' },
    { name: 'vehicleType', label: 'Vehicle Type (if any)', type: 'select', options: ['Bike', 'Scooter', 'Car', 'Auto Rickshaw', 'Cab/Taxi', 'Other'] },
    { name: 'vehicleNumber', label: 'Vehicle Number (if any)' },
    { name: 'preApproved', label: 'Pre-Approved by Resident', type: 'select', options: ['true', 'false'] },
    { name: 'status', label: 'Status', type: 'select', options: ['Inside', 'Checked Out', 'Pre-Approved'] },
  ],
};

const Visitors = () => <ModuleListPage config={config} bare />;
export default Visitors;
