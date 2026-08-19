import React from 'react';
import TabbedPage from '../components/TabbedPage';
import VisitorsContent from './Visitors';
import GatePassesContent from './GatePasses';

const VisitorsHub = () => (
  <TabbedPage
    title="Visitors & Gate Passes"
    subtitle="Log visitor entries and manage pre-approved gate passes - all in one place"
    tabs={[
      { label: 'Visitors', component: VisitorsContent },
      { label: 'Gate Passes', component: GatePassesContent },
    ]}
  />
);

export default VisitorsHub;
