import React from 'react';
import TabbedPage from '../components/TabbedPage';
import RulesContent from './Rules';
import PoliciesContent from './Policies';
import DocumentsContent from './Documents';

// Society Rules, Society Policies, and Documents used to be three separate
// menu items - merged into one, as tabs, since they're all "governance
// reference material" someone browses together.
const GovernanceHub = () => (
  <TabbedPage
    title="Rules, Policies & Documents"
    subtitle="Society rules, policies, and shared documents - all in one place"
    tabs={[
      { label: 'Society Rules', component: RulesContent },
      { label: 'Society Policies', component: PoliciesContent },
      { label: 'Documents', component: DocumentsContent },
    ]}
  />
);

export default GovernanceHub;
