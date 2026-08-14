import React from 'react';
import { HomeIcon, User } from 'lucide-react';
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
  title: 'Home Services',
  subtitle: 'Domestic staff & recurring services - visible only to your own flat, Secretary and Chairman',
  endpoint: '/home-services',
  searchPlaceholder: 'Search by name, type...',
  canWrite: (role) => ['secretary', 'resident', 'tenant'].includes(role),
  statCards: [{ label: 'Total Services', icon: HomeIcon, color: 'blue', compute: (d, t) => t }],
  filters: [{ key: 'type', label: 'All Type', optionsSource: 'homeServiceTypes', options: ['Personal Housekeeping', 'School Van', 'House Maid', 'Milk Supplier', 'News Paper Supplier', 'Other'] }],
  columns: [
    { key: 'photo', label: 'Photo', render: (i) => <PhotoOrPlaceholder src={i.photo} /> },
    { key: 'type', label: 'Type' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'mobileNumber', label: 'Mobile' },
    { key: 'vehicleNumber', label: 'Vehicle No.', render: (i) => i.vehicleNumber || '—' },
    { key: 'inTime', label: 'In Time' },
    { key: 'outTime', label: 'Out Time' },
  ],
  formFields: [
    { name: 'photo', label: 'Photo', type: 'photo' },
    { name: 'type', label: 'Type', type: 'select', optionsSource: 'homeServiceTypes', options: ['Personal Housekeeping', 'School Van', 'House Maid', 'Milk Supplier', 'News Paper Supplier', 'Other'], required: true },
    { name: 'firstName', label: 'First Name', required: true },
    { name: 'middleName', label: 'Middle Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { name: 'religion', label: 'Religion' },
    { name: 'mobileNumber', label: 'Mobile Number' },
    { name: 'vehicleType', label: 'Their Vehicle Type (if any)', type: 'select', options: ['Bike', 'Scooter', 'Car', 'Auto Rickshaw', 'Other'] },
    { name: 'vehicleNumber', label: 'Their Vehicle Number (if any)' },
    { name: 'inTime', label: 'In Time (e.g. 10:00 AM)' },
    { name: 'outTime', label: 'Out Time (e.g. 4:00 PM)' },
  ],
};

const HomeServices = () => <ModuleListPage config={config} />;
export default HomeServices;
