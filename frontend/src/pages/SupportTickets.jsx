import React from 'react';
import { LifeBuoy, CircleDot, Clock3, CheckCircle2 } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Helpdesk / Support Tickets',
  subtitle: 'Report a problem with this website/app (login issues, bugs, page not loading, etc.) - not for society facility complaints, use Complaints & Requests for those.',
  endpoint: '/support-tickets',
  searchPlaceholder: 'Search by subject, flat...',
  canWrite: () => true,
  statCards: [
    { label: 'Total Tickets', icon: LifeBuoy, color: 'blue', compute: (d, t) => t },
    { label: 'Open', icon: CircleDot, color: 'red', compute: (d) => d.filter((x) => x.status === 'Open').length },
    { label: 'In Progress', icon: Clock3, color: 'amber', compute: (d) => d.filter((x) => x.status === 'In Progress').length },
    { label: 'Resolved', icon: CheckCircle2, color: 'green', compute: (d) => d.filter((x) => ['Resolved', 'Closed'].includes(x.status)).length },
  ],
  filters: [{ key: 'status', label: 'All Status', options: ['Open', 'In Progress', 'Resolved', 'Closed'] }],
  columns: [
    { key: 'subject', label: 'Subject' },
    { key: 'flatId', label: 'Flat' },
    { key: 'assignedTo', label: 'Assigned To' },
    { key: 'raisedOn', label: 'Raised On', render: (i) => (i.raisedOn ? new Date(i.raisedOn).toLocaleDateString() : '—') },
    { key: 'resolvedOn', label: 'Resolved On', render: (i) => (i.resolvedOn ? new Date(i.resolvedOn).toLocaleDateString() : '—') },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'subject', label: 'Subject', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'flatId', label: 'Flat No.' },
    { name: 'assignedTo', label: 'Assigned To' },
    { name: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Resolved', 'Closed'] },
    { name: 'resolvedOn', label: 'Resolved On (if closing)', type: 'date' },
  ],
};

const SupportTickets = () => <ModuleListPage config={config} />;
export default SupportTickets;
