import React from 'react';
import { SquareParking } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Parking Allotment',
  subtitle: 'Full details of parking space allocation',
  endpoint: '/parking',
  searchPlaceholder: 'Search by spot number or flat...',
  canWrite: (role) => ['secretary'].includes(role),
  statCards: [{ label: 'Total Spots', icon: SquareParking, color: 'blue', compute: (d, t) => t }],
  filters: [{ key: 'status', label: 'All Status', options: ['Allotted', 'Vacant', 'Reserved'] }],
  columns: [
    { key: 'spotNumber', label: 'Spot No.' },
    { key: 'spotType', label: 'Type' },
    { key: 'flatId', label: 'Flat' },
    { key: 'vehicleNumber', label: 'Vehicle No.' },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'spotNumber', label: 'Spot Number', required: true },
    { name: 'spotType', label: 'Spot Type' },
    { name: 'flatId', label: 'Allotted to Flat' },
    { name: 'vehicleNumber', label: 'Vehicle Number' },
    { name: 'status', label: 'Status' },
  ],
};

const Parking = () => <ModuleListPage config={config} bare />;
export default Parking;
