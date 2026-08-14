import React from 'react';
import { ShieldCheck, IndianRupee } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Insurance Management',
  subtitle: 'Society insurance policies - coverage, dates, and claim history',
  endpoint: '/insurance',
  searchPlaceholder: 'Search by provider, policy number...',
  canWrite: (role) => ['secretary', 'treasurer'].includes(role),
  statCards: [
    { label: 'Total Policies', icon: ShieldCheck, color: 'blue', compute: (d, t) => t },
    { label: 'Active', icon: ShieldCheck, color: 'green', compute: (d) => d.filter((x) => x.status === 'Active').length },
    { label: 'Total Coverage', icon: IndianRupee, color: 'purple', compute: (d) => `₹${d.reduce((s, x) => s + Number(x.coverageAmount || 0), 0).toLocaleString('en-IN')}` },
  ],
  filters: [
    { key: 'policyType', label: 'All Type', options: ['Fire', 'Burglary', 'Public Liability', 'Structure', 'Other'] },
    { key: 'status', label: 'All Status', options: ['Active', 'Expired', 'Cancelled'] },
  ],
  columns: [
    { key: 'policyType', label: 'Type' },
    { key: 'provider', label: 'Provider' },
    { key: 'policyNumber', label: 'Policy No.' },
    { key: 'coverageAmount', label: 'Coverage', render: (i) => `₹${Number(i.coverageAmount || 0).toLocaleString('en-IN')}` },
    { key: 'policyEnd', label: 'Expires On', render: (i) => (i.policyEnd ? new Date(i.policyEnd).toLocaleDateString() : '—') },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'policyType', label: 'Policy Type', type: 'select', options: ['Fire', 'Burglary', 'Public Liability', 'Structure', 'Other'], required: true },
    { name: 'provider', label: 'Provider', required: true },
    { name: 'policyNumber', label: 'Policy Number' },
    { name: 'coverageAmount', label: 'Coverage Amount', type: 'number' },
    { name: 'premiumAmount', label: 'Premium Amount', type: 'number' },
    { name: 'policyStart', label: 'Policy Start', type: 'date' },
    { name: 'policyEnd', label: 'Policy End', type: 'date' },
    { name: 'claimHistory', label: 'Claim History', type: 'textarea' },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Expired', 'Cancelled'] },
  ],
};

const InsurancePolicies = () => <ModuleListPage config={config} />;
export default InsurancePolicies;
