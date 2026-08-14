import React from 'react';
import { Droplets, Zap, AlertTriangle } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Water & Electricity Usage',
  subtitle: 'Per flat/tower utility consumption - track trends and flag abnormal usage',
  endpoint: '/utility-readings',
  searchPlaceholder: 'Search by flat, tower...',
  canWrite: (role) => ['secretary'].includes(role),
  statCards: [
    { label: 'Total Readings', icon: Droplets, color: 'blue', compute: (d, t) => t },
    { label: 'Water Readings', icon: Droplets, color: 'blue', compute: (d) => d.filter((x) => x.utilityType === 'Water').length },
    { label: 'Electricity Readings', icon: Zap, color: 'amber', compute: (d) => d.filter((x) => x.utilityType === 'Electricity').length },
    { label: 'Flagged Abnormal', icon: AlertTriangle, color: 'red', compute: (d) => d.filter((x) => x.isAbnormal).length },
  ],
  filters: [
    { key: 'utilityType', label: 'All Utility', options: ['Water', 'Electricity'] },
    { key: 'scope', label: 'All Scope', options: ['Flat', 'Tower', 'Common Area'] },
  ],
  columns: [
    { key: 'utilityType', label: 'Utility' },
    { key: 'scope', label: 'Scope' },
    { key: 'flatId', label: 'Flat', render: (i) => i.flatId || '—' },
    { key: 'tower', label: 'Tower', render: (i) => i.tower || '—' },
    { key: 'month', label: 'Month', render: (i) => new Date(i.month).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) },
    { key: 'unitsConsumed', label: 'Units Consumed' },
    {
      key: 'isAbnormal',
      label: 'Flag',
      render: (i) =>
        i.isAbnormal ? (
          <span className="badge bg-red-50 text-red-600 flex items-center gap-1 w-fit">
            <AlertTriangle size={11} /> Abnormal
          </span>
        ) : (
          <span className="text-slate-400 text-xs">Normal</span>
        ),
    },
  ],
  formFields: [
    { name: 'utilityType', label: 'Utility Type', type: 'select', options: ['Water', 'Electricity'], required: true },
    { name: 'scope', label: 'Scope', type: 'select', options: ['Flat', 'Tower', 'Common Area'], required: true },
    { name: 'flatId', label: 'Flat No. (if scope = Flat)' },
    { name: 'tower', label: 'Tower' },
    { name: 'month', label: 'Billing Month', type: 'date', required: true },
    { name: 'unitsConsumed', label: 'Units Consumed (kWh or KL)', type: 'number', required: true },
    { name: 'isAbnormal', label: 'Flag as Abnormal', type: 'select', options: ['true', 'false'] },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
};

const UtilityReadings = () => <ModuleListPage config={config} />;
export default UtilityReadings;
