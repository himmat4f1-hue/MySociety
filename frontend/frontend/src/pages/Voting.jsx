import React from 'react';
import { Vote, CheckCircle2, XCircle } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Voting / Polls',
  subtitle: 'Create and manage society voting and polls',
  endpoint: '/polls',
  searchPlaceholder: 'Search polls by title...',
  canWrite: (role) => ['admin', 'secretary', 'chairman'].includes(role),
  statCards: [
    { label: 'Total Polls', icon: Vote, color: 'blue', compute: (d, t) => t },
    { label: 'Active', icon: CheckCircle2, color: 'green', compute: (d) => d.filter((x) => x.status === 'Active').length },
    { label: 'Closed', icon: XCircle, color: 'slate', compute: (d) => d.filter((x) => x.status === 'Closed').length },
  ],
  filters: [{ key: 'status', label: 'All Status', options: ['Active', 'Closed'] }],
  columns: [
    { key: 'title', label: 'Poll Title' },
    { key: 'endDate', label: 'Ends On', render: (i) => new Date(i.endDate).toLocaleDateString() },
    { key: 'votesYes', label: 'Yes Votes' },
    { key: 'votesNo', label: 'No Votes' },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'title', label: 'Poll Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'endDate', label: 'End Date', type: 'date', required: true },
    { name: 'totalEligible', label: 'Total Eligible Voters', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Closed'] },
  ],
};

const Voting = () => <ModuleListPage config={config} />;
export default Voting;
