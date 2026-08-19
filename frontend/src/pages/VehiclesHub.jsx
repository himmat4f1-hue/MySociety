import React from 'react';
import TabbedPage from '../components/TabbedPage';
import VehiclesContent from './Vehicles';
import ParkingContent from './Parking';

const VehiclesHub = () => (
  <TabbedPage
    title="Vehicles & Parking"
    subtitle="Registered vehicles and parking slot allocation - all in one place"
    tabs={[
      { label: 'Vehicle Data', component: VehiclesContent },
      { label: 'Parking', component: ParkingContent },
    ]}
  />
);

export default VehiclesHub;
