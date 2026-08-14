import React from 'react';
import { Wrench } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Service Provider Contacts',
  subtitle: 'Contact details for all society service providers/vendors',
  endpoint: '/service-providers',
  searchPlaceholder: 'Search by name or service type...',
  canWrite: (role) => ['secretary'].includes(role),
  statCards: [{ label: 'Total Contacts', icon: Wrench, color: 'blue', compute: (d, t) => t }],
  columns: [
    { key: 'serviceType', label: 'Service Type' },
    { key: 'name', label: 'Name' },
    { key: 'companyName', label: 'Company' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
  ],
  formFields: [
    { name: 'serviceType', label: 'Service Type', required: true },
    { name: 'name', label: 'Contact Name', required: true },
    { name: 'companyName', label: 'Company Name' },
    { name: 'phone', label: 'Phone', required: true },
    { name: 'email', label: 'Email' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
};

const ServiceProviders = () => <ModuleListPage config={config} />;
export default ServiceProviders;
