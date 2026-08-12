import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Role Checklist',
  subtitle: 'Responsibilities for each elected/appointed role in the society',
  endpoint: '/role-checklists',
  searchPlaceholder: 'Search by role...',
  canWrite: (role) => ['secretary'].includes(role),
  statCards: [{ label: 'Roles Documented', icon: ClipboardCheck, color: 'blue', compute: (d, t) => t }],
  columns: [
    { key: 'role', label: 'Role' },
    { key: 'responsibilities', label: 'Responsibilities' },
  ],
  formFields: [
    { name: 'role', label: 'Role', required: true },
    { name: 'responsibilities', label: 'Responsibilities', type: 'textarea', required: true },
  ],
};

const RoleChecklistPage = () => <ModuleListPage config={config} />;
export default RoleChecklistPage;
