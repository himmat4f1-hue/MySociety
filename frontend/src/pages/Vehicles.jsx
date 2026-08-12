import React from 'react';
import { Car } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Vehicle Data',
  subtitle: 'Registered vehicles - visible only to your own flat, Secretary and Chairman',
  endpoint: '/vehicles',
  searchPlaceholder: 'Search by registration no...',
  canWrite: (role) => ['secretary', 'resident', 'tenant'].includes(role),
  statCards: [{ label: 'Total Vehicles', icon: Car, color: 'blue', compute: (d, t) => t }],
  filters: [
    { key: 'vehicleType', label: 'All Vehicle Type', options: ['Lauri', 'Truck', 'Bike', 'Scooter', 'Auto Rickshaw', 'Car', 'Tempo'] },
    { key: 'fuelType', label: 'All Fuel Type', options: ['CNG', 'Petrol', 'Electric'] },
  ],
  columns: [
    { key: 'vehicleType', label: 'Vehicle Type' },
    { key: 'fuelType', label: 'Fuel Type' },
    { key: 'color', label: 'Color' },
    { key: 'registrationNo', label: 'Registration No.' },
  ],
  formFields: [
    { name: 'vehicleType', label: 'Vehicle Type', type: 'select', options: ['Lauri', 'Truck', 'Bike', 'Scooter', 'Auto Rickshaw', 'Car', 'Tempo'], required: true },
    { name: 'fuelType', label: 'Fuel Type', type: 'select', options: ['CNG', 'Petrol', 'Electric'] },
    { name: 'color', label: 'Color' },
    { name: 'registrationNo', label: 'Registration No.' },
  ],
};

const Vehicles = () => <ModuleListPage config={config} />;
export default Vehicles;
