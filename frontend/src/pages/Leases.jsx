import React from 'react';
import { FileSignature, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const POLICE_BADGE = {
  'Not Submitted': 'bg-slate-100 text-slate-600',
  Submitted: 'bg-amber-50 text-amber-600',
  Verified: 'bg-emerald-50 text-emerald-600',
  Rejected: 'bg-red-50 text-red-600',
};

const config = {
  title: 'Lease Management',
  subtitle: 'Track tenant lease agreements, rent, expiry and police verification',
  endpoint: '/leases',
  searchPlaceholder: 'Search by flat no., tenant name...',
  canWrite: (role) => ['secretary'].includes(role),
  statCards: [
    { label: 'Total Leases', icon: FileSignature, color: 'blue', compute: (d, t) => t },
    { label: 'Active', icon: CheckCircle2, color: 'green', compute: (d) => d.filter((x) => x.status === 'Active').length },
    { label: 'Expiring Soon', icon: AlertTriangle, color: 'amber', compute: (d) => d.filter((x) => x.status === 'Expiring Soon').length },
    { label: 'Police Verification Pending', icon: ShieldCheck, color: 'red', compute: (d) => d.filter((x) => x.policeVerificationStatus !== 'Verified').length },
  ],
  filters: [
    { key: 'status', label: 'All Status', options: ['Active', 'Expiring Soon', 'Expired', 'Renewed', 'Pending'] },
    { key: 'policeVerificationStatus', label: 'All Verification', options: ['Not Submitted', 'Submitted', 'Verified', 'Rejected'] },
  ],
  columns: [
    { key: 'flatNo', label: 'Flat No.' },
    { key: 'tenantName', label: 'Tenant' },
    { key: 'leaseEnd', label: 'Lease End', render: (i) => new Date(i.leaseEnd).toLocaleDateString() },
    { key: 'monthlyRent', label: 'Monthly Rent', render: (i) => `₹${Number(i.monthlyRent).toLocaleString('en-IN')}` },
    { key: 'maintenanceCharges', label: 'Maintenance', render: (i) => (i.maintenanceCharges ? `₹${Number(i.maintenanceCharges).toLocaleString('en-IN')}` : '—') },
    { key: 'status', label: 'Lease Status', badge: true },
    {
      key: 'policeVerificationStatus',
      label: 'Police Verification',
      render: (i) => (
        <span className={`badge ${POLICE_BADGE[i.policeVerificationStatus] || POLICE_BADGE['Not Submitted']}`}>
          {i.policeVerificationStatus || 'Not Submitted'}
        </span>
      ),
    },
  ],
  formFields: [
    { name: 'flatNo', label: 'Flat No.', required: true },
    { name: 'tower', label: 'Tower' },
    { name: 'tenantName', label: 'Tenant Name', required: true },
    { name: 'ownerName', label: 'Owner Name' },
    { name: 'leaseStart', label: 'Lease Start', type: 'date', required: true },
    { name: 'leaseEnd', label: 'Lease End', type: 'date', required: true },
    { name: 'monthlyRent', label: 'Monthly Rent', type: 'number' },
    { name: 'maintenanceCharges', label: 'Monthly Maintenance Charges', type: 'number' },
    { name: 'securityDeposit', label: 'Security Deposit', type: 'number' },
    { name: 'status', label: 'Lease Status', type: 'select', options: ['Active', 'Expiring Soon', 'Expired', 'Renewed', 'Pending'] },
    { name: 'policeVerificationStatus', label: 'Police Verification Status', type: 'select', options: ['Not Submitted', 'Submitted', 'Verified', 'Rejected'] },
  ],
};

const Leases = () => <ModuleListPage config={config} />;
export default Leases;
