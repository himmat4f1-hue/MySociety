import React from 'react';
import TabbedPage from '../components/TabbedPage';
import VotingContent from './Voting';
import ElectionsContent from './Elections';

const VotingHub = () => (
  <TabbedPage
    title="Voting & Elections"
    subtitle="Society polls and committee/chairman elections - all in one place"
    tabs={[
      { label: 'Voting / Polls', component: VotingContent },
      { label: 'Elections', component: ElectionsContent },
    ]}
  />
);

export default VotingHub;
