import React from 'react';
import { Users, Home, UserCheck2, Car, Lock, Phone } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';
import { useAuth } from '../context/AuthContext';

// "Resident Directory" (#52) - contact info is hidden unless the resident
// opted into directoryVisible, or the viewer is Secretary/Chairman (who
// always need it for society administration).
const ContactCell = ({ resident }) => {
  const { user } = useAuth();
  const canAlwaysSee = ['secretary', 'chairman'].includes(user?.role);
  const visible = resident.directoryVisible !== false || canAlwaysSee;
  if (!visible) {
    return (
      <span className="text-xs text-slate-400 flex items-center gap-1">
        <Lock size={11} /> Private
      </span>
    );
  }
  return (
    <span className="text-xs text-slate-600 flex items-center gap-1">
      <Phone size={11} /> {resident.user?.phone || '—'}
    </span>
  );
};

const checklistProgress = (list) => {
  if (!list || !list.length) return '—';
  const done = list.filter((c) => c.completed).length;
  return `${done}/${list.length}`;
};

const config = {
  title: 'Residents',
  subtitle: 'Resident directory - onboarding/offboarding status and privacy-controlled contact info',
  endpoint: '/residents',
  searchPlaceholder: 'Search residents, flat no...',
  canWrite: (role) => ['secretary'].includes(role),
  statCards: [
    { label: 'Total Residents', icon: Users, color: 'blue', compute: (d, t) => t },
    { label: 'Owners', icon: Home, color: 'green', compute: (d) => d.filter((x) => x.type === 'Owner').length },
    { label: 'Tenants', icon: UserCheck2, color: 'purple', compute: (d) => d.filter((x) => x.type === 'Tenant').length },
    { label: 'Vehicles', icon: Car, color: 'amber', compute: (d) => d.reduce((s, x) => s + (x.vehicles?.length || 0), 0) },
  ],
  filters: [
    { key: 'type', label: 'All Type', options: ['Owner', 'Tenant'] },
    { key: 'status', label: 'All Status', options: ['Active', 'Inactive'] },
  ],
  columns: [
    { key: 'name', label: 'Resident', render: (i) => i.user?.name || i.name || '—' },
    { key: 'flatNo', label: 'Flat No.' },
    { key: 'tower', label: 'Tower' },
    { key: 'type', label: 'Type', badge: true },
    { key: 'contact', label: 'Contact', render: (i) => <ContactCell resident={i} /> },
    { key: 'moveInDate', label: 'Move-In', render: (i) => (i.moveInDate ? new Date(i.moveInDate).toLocaleDateString() : '—') },
    { key: 'onboardingChecklist', label: 'Onboarding', render: (i) => checklistProgress(i.onboardingChecklist) },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'flatNo', label: 'Flat No.', required: true },
    { name: 'tower', label: 'Tower', required: true },
    { name: 'type', label: 'Type', type: 'select', options: ['Owner', 'Tenant'], required: true },
    { name: 'moveInDate', label: 'Move-In Date', type: 'date' },
    { name: 'moveOutDate', label: 'Move-Out Date (if offboarding)', type: 'date' },
    { name: 'directoryVisible', label: 'Show Contact Info in Directory', type: 'select', options: ['true', 'false'] },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
  ],
};

const Residents = () => <ModuleListPage config={config} />;
export default Residents;
