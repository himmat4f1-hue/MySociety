import React from 'react';
import { Car, User as CarIcon } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const PhotoOrPlaceholder = ({ src }) =>
  src ? (
    <img src={src} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
      <Car size={16} />
    </div>
  );

const config = {
  title: 'Vehicle Data',
  subtitle: 'Registered vehicles - visible only to your own flat, Secretary and Chairman',
  endpoint: '/vehicles',
  searchPlaceholder: 'Search by registration no...',
  canWrite: (role) => ['secretary', 'resident', 'tenant'].includes(role),
  statCards: [{ label: 'Total Vehicles', icon: Car, color: 'blue', compute: (d, t) => t }],
  filters: [
    { key: 'vehicleType', label: 'All Vehicle Type', optionsSource: 'vehicleTypes', options: ['Lauri', 'Truck', 'Bike', 'Scooter', 'Auto Rickshaw', 'Car', 'Tempo'] },
    { key: 'fuelType', label: 'All Fuel Type', options: ['CNG', 'Petrol', 'Electric'] },
  ],
  columns: [
    { key: 'photo', label: 'Photo', render: (i) => <PhotoOrPlaceholder src={i.photo} /> },
    { key: 'vehicleType', label: 'Vehicle Type' },
    { key: 'fuelType', label: 'Fuel Type' },
    { key: 'color', label: 'Color' },
    { key: 'registrationNo', label: 'Registration No.' },
  ],
  formFields: [
    { name: 'photo', label: 'Photo', type: 'photo' },
    { name: 'vehicleType', label: 'Vehicle Type', type: 'select', optionsSource: 'vehicleTypes', options: ['Lauri', 'Truck', 'Bike', 'Scooter', 'Auto Rickshaw', 'Car', 'Tempo'], required: true },
    { name: 'fuelType', label: 'Fuel Type', type: 'select', options: ['CNG', 'Petrol', 'Electric'] },
    { name: 'color', label: 'Color' },
    { name: 'registrationNo', label: 'Registration No.' },
  ],
};

const Vehicles = () => <ModuleListPage config={config} bare />;
export default Vehicles;
