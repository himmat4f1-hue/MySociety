import React from 'react';
import { Users2, User } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const PhotoOrPlaceholder = ({ src, alt }) =>
  src ? (
    <img src={src} alt={alt} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
      <User size={16} />
    </div>
  );

const config = {
  title: 'Family Data',
  subtitle: 'Your household members - visible only to your own flat, Secretary and Chairman',
  endpoint: '/family-members',
  searchPlaceholder: 'Search by name...',
  canWrite: (role) => ['secretary', 'resident', 'tenant'].includes(role),
  statCards: [{ label: 'Family Members', icon: Users2, color: 'blue', compute: (d, t) => t }],
  columns: [
    { key: 'photo', label: 'Photo', render: (i) => <PhotoOrPlaceholder src={i.photo} alt={i.firstName} /> },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'birthDate', label: 'Birth Date', render: (i) => (i.birthDate ? new Date(i.birthDate).toLocaleDateString() : '—') },
    { key: 'mobileNumber', label: 'Mobile' },
    { key: 'isAutoAddedOwner', label: 'Type', render: (i) => (i.isAutoAddedOwner ? 'Owner (auto-added)' : 'Family Member') },
  ],
  formFields: [
    { name: 'photo', label: 'Photo', type: 'photo' },
    { name: 'firstName', label: 'First Name', required: true },
    { name: 'middleName', label: 'Middle Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'birthDate', label: 'Birth Date', type: 'date' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { name: 'religion', label: 'Religion' },
    { name: 'mobileNumber', label: 'Mobile Number' },
  ],
};

const FamilyMembers = () => <ModuleListPage config={config} />;
export default FamilyMembers;
