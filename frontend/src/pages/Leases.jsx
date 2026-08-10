import React from 'react';
import { FileSignature, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Lease Management',
  subtitle: 'Track tenant lease agreements, rent and expiry',
  endpoint: '/leases',
  searchPlaceholder: 'Search by flat no., tenant name...',
  canWrite: (role) => ['admin', 'secretary'].includes(role),
  statCards: [
    { label: 'Total Leases', icon: FileSignature, color: 'blue', compute: (d, t) => t },
    { label: 'Active', icon: CheckCircle2, color: 'green', compute: (d) => d.filter((x) => x.status === 'Active').length },
    { label: 'Expiring Soon', icon: AlertTriangle, color: 'amber', compute: (d) => d.filter((x) => x.status === 'Expiring Soon').length },
    { label: 'Expired', icon: XCircle, color: 'red', compute: (d) => d.filter((x) => x.status === 'Expired').length },
  ],
  filters: [{ key: 'status', label: 'All Status', options: ['Active', 'Expiring Soon', 'Expired', 'Renewed'] }],
  columns: [
    { key: 'flatNo', label: 'Flat No.' },
    { key: 'tenantName', label: 'Tenant' },
    { key: 'leaseEnd', label: 'Lease End', render: (i) => new Date(i.leaseEnd).toLocaleDateString() },
    { key: 'monthlyRent', label: 'Monthly Rent', render: (i) => `₹${Number(i.monthlyRent).toLocaleString('en-IN')}` },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'flatNo', label: 'Flat No.', required: true },
    { name: 'tower', label: 'Tower' },
    { name: 'tenantName', label: 'Tenant Name', required: true },
    { name: 'ownerName', label: 'Owner Name' },
    { name: 'leaseStart', label: 'Lease Start', type: 'date', required: true },
    { name: 'leaseEnd', label: 'Lease End', type: 'date', required: true },
    { name: 'monthlyRent', label: 'Monthly Rent', type: 'number' },
    { name: 'securityDeposit', label: 'Security Deposit', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Expiring Soon', 'Expired', 'Renewed'] },
  ],
};

const Leases = () => <ModuleListPage config={config} />;
export default Leases;
