import React from 'react';
import { Scale, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Legal Compliance Tracker',
  subtitle: 'Municipal, fire safety, labour, and tax compliance - renewal deadlines',
  endpoint: '/legal-compliance',
  searchPlaceholder: 'Search by title, authority...',
  canWrite: (role) => ['secretary', 'chairman'].includes(role),
  statCards: [
    { label: 'Total Items', icon: Scale, color: 'blue', compute: (d, t) => t },
    { label: 'Compliant', icon: CheckCircle2, color: 'green', compute: (d) => d.filter((x) => x.status === 'Compliant').length },
    { label: 'Due Soon', icon: AlertTriangle, color: 'amber', compute: (d) => d.filter((x) => x.status === 'Due Soon').length },
    { label: 'Overdue', icon: XCircle, color: 'red', compute: (d) => d.filter((x) => x.status === 'Overdue').length },
  ],
  filters: [
    { key: 'complianceType', label: 'All Type', options: ['Municipal', 'Fire Safety', 'Labour', 'Tax (GST/TDS)', 'Other'] },
    { key: 'status', label: 'All Status', options: ['Compliant', 'Due Soon', 'Overdue'] },
  ],
  columns: [
    { key: 'complianceType', label: 'Type' },
    { key: 'title', label: 'Title' },
    { key: 'authority', label: 'Authority' },
    { key: 'nextDueDate', label: 'Next Due', render: (i) => (i.nextDueDate ? new Date(i.nextDueDate).toLocaleDateString() : '—') },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'complianceType', label: 'Type', type: 'select', options: ['Municipal', 'Fire Safety', 'Labour', 'Tax (GST/TDS)', 'Other'], required: true },
    { name: 'title', label: 'Title', required: true },
    { name: 'authority', label: 'Issuing Authority' },
    { name: 'lastRenewedOn', label: 'Last Renewed On', type: 'date' },
    { name: 'nextDueDate', label: 'Next Due Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: ['Compliant', 'Due Soon', 'Overdue'] },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
};

const LegalCompliancePage = () => <ModuleListPage config={config} />;
export default LegalCompliancePage;
