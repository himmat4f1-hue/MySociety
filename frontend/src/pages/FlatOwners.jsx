import React from 'react';
import { Users, ShieldCheck } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Personal Data (Owners)',
  subtitle: 'Registered flat owners - only Secretary can add/edit/delete. Visible to your own flat, Secretary and Chairman only.',
  endpoint: '/flat-owners',
  searchPlaceholder: 'Search by name, flat...',
  canWrite: (role) => ['secretary'].includes(role),
  statCards: [
    { label: 'Total Owner Records', icon: Users, color: 'blue', compute: (d, t) => t },
    { label: 'Secretary-managed', icon: ShieldCheck, color: 'green', compute: (d, t) => t },
  ],
  columns: [
    { key: 'flatId', label: 'Flat (Owner ID)' },
    { key: 'ownerNo', label: 'Owner No.' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'mobileNumber', label: 'Mobile' },
  ],
  formFields: [
    { name: 'flatId', label: 'Flat (Owner ID) e.g. "G 610"', required: true },
    { name: 'building', label: 'Building', required: true },
    { name: 'flatNo', label: 'Flat No.', required: true },
    { name: 'ownerNo', label: 'Owner No. (1, 2... for co-owners)', type: 'number', required: true },
    { name: 'firstName', label: 'First Name', required: true },
    { name: 'middleName', label: 'Middle Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'birthDate', label: 'Birth Date', type: 'date' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { name: 'religion', label: 'Religion' },
    { name: 'mobileNumber', label: 'Mobile Number' },
  ],
};

const FlatOwners = () => <ModuleListPage config={config} />;
export default FlatOwners;
