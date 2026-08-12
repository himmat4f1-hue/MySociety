import React from 'react';
import { PawPrint, CheckCircle2, AlertCircle } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Pets',
  subtitle: 'Registered pets - visible only to your own flat, Secretary and Chairman',
  endpoint: '/pets',
  searchPlaceholder: 'Search by pet name...',
  canWrite: (role) => ['secretary', 'resident', 'tenant'].includes(role),
  statCards: [
    { label: 'Total Pets', icon: PawPrint, color: 'blue', compute: (d, t) => t },
    { label: 'Vaccinated', icon: CheckCircle2, color: 'green', compute: (d) => d.filter((x) => x.vaccinated).length },
    { label: 'Not Vaccinated', icon: AlertCircle, color: 'amber', compute: (d) => d.filter((x) => !x.vaccinated).length },
  ],
  filters: [{ key: 'type', label: 'All Type', options: ['Dog', 'Cat', 'Bird', 'Fish', 'Other'] }],
  columns: [
    { key: 'name', label: 'Pet Name' },
    { key: 'type', label: 'Type' },
    { key: 'breed', label: 'Breed' },
    { key: 'flatId', label: 'Flat' },
    { key: 'vaccinated', label: 'Vaccinated', render: (i) => (i.vaccinated ? 'Yes' : 'No') },
  ],
  formFields: [
    { name: 'name', label: 'Pet Name', required: true },
    { name: 'type', label: 'Type', type: 'select', options: ['Dog', 'Cat', 'Bird', 'Fish', 'Other'] },
    { name: 'breed', label: 'Breed' },
    { name: 'flatId', label: 'Flat (e.g. G 610) - only needed if you are Secretary/Chairman adding for another flat' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
};

const Pets = () => <ModuleListPage config={config} />;
export default Pets;
