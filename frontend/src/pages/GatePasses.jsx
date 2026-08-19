import React from 'react';
import { KeyRound, CheckCircle2, XCircle, Clock } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Gate Passes',
  subtitle: 'Issue and track temporary visitor, vendor and vehicle passes',
  endpoint: '/gate-passes',
  searchPlaceholder: 'Search by name, flat no., vehicle no...',
  canWrite: (role) => ['security', 'secretary'].includes(role),
  statCards: [
    { label: 'Total Passes', icon: KeyRound, color: 'blue', compute: (d, t) => t },
    { label: 'Active', icon: CheckCircle2, color: 'green', compute: (d) => d.filter((x) => x.status === 'Active').length },
    { label: 'Expired', icon: Clock, color: 'amber', compute: (d) => d.filter((x) => x.status === 'Expired').length },
    { label: 'Revoked', icon: XCircle, color: 'red', compute: (d) => d.filter((x) => x.status === 'Revoked').length },
  ],
  filters: [
    { key: 'type', label: 'All Type', options: ['Visitor', 'Vendor', 'Vehicle', 'Service Staff'] },
    { key: 'status', label: 'All Status', options: ['Active', 'Expired', 'Revoked'] },
  ],
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'flatNo', label: 'Flat No.' },
    { key: 'validTill', label: 'Valid Till', render: (i) => new Date(i.validTill).toLocaleString() },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'name', label: 'Name', required: true },
    { name: 'type', label: 'Type', type: 'select', options: ['Visitor', 'Vendor', 'Vehicle', 'Service Staff'], required: true },
    { name: 'mobile', label: 'Mobile' },
    { name: 'flatNo', label: 'Flat No.', required: true },
    { name: 'vehicleNumber', label: 'Vehicle Number (if applicable)' },
    { name: 'validTill', label: 'Valid Till', type: 'datetime-local', required: true },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Expired', 'Revoked'] },
  ],
};

const GatePasses = () => <ModuleListPage config={config} bare />;
export default GatePasses;
