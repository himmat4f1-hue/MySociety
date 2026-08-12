import React from 'react';
import { HomeIcon } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Home Services',
  subtitle: 'Domestic staff & recurring services - visible only to your own flat, Secretary and Chairman',
  endpoint: '/home-services',
  searchPlaceholder: 'Search by name, type...',
  canWrite: (role) => ['secretary', 'resident', 'tenant'].includes(role),
  statCards: [{ label: 'Total Services', icon: HomeIcon, color: 'blue', compute: (d, t) => t }],
  filters: [{ key: 'type', label: 'All Type', options: ['Personal Housekeeping', 'School Van', 'House Maid', 'Milk Supplier', 'News Paper Supplier', 'Other'] }],
  columns: [
    { key: 'type', label: 'Type' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'mobileNumber', label: 'Mobile' },
    { key: 'inTime', label: 'In Time' },
    { key: 'outTime', label: 'Out Time' },
  ],
  formFields: [
    { name: 'type', label: 'Type', type: 'select', options: ['Personal Housekeeping', 'School Van', 'House Maid', 'Milk Supplier', 'News Paper Supplier', 'Other'], required: true },
    { name: 'firstName', label: 'First Name', required: true },
    { name: 'middleName', label: 'Middle Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { name: 'religion', label: 'Religion' },
    { name: 'mobileNumber', label: 'Mobile Number' },
    { name: 'inTime', label: 'In Time (e.g. 10:00 AM)' },
    { name: 'outTime', label: 'Out Time (e.g. 4:00 PM)' },
  ],
};

const HomeServices = () => <ModuleListPage config={config} />;
export default HomeServices;
