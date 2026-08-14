import React from 'react';
import { History, Plus, Pencil, Trash2 } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const ACTION_ICON = { Create: Plus, Update: Pencil, Delete: Trash2 };
const ACTION_COLOR = { Create: 'bg-emerald-50 text-emerald-600', Update: 'bg-blue-50 text-blue-600', Delete: 'bg-red-50 text-red-600' };

const config = {
  title: 'Audit Log',
  subtitle: 'Every create, update, and delete action across the society - who, what, when, and from where',
  endpoint: '/audit-log',
  searchPlaceholder: 'Search by module or user name...',
  canWrite: () => false, // read-only - entries are written internally, never through the UI
  statCards: [
    { label: 'Total Logged Actions', icon: History, color: 'blue', compute: (d, t) => t },
    { label: 'Creates', icon: Plus, color: 'green', compute: (d) => d.filter((x) => x.action === 'Create').length },
    { label: 'Updates', icon: Pencil, color: 'amber', compute: (d) => d.filter((x) => x.action === 'Update').length },
    { label: 'Deletes', icon: Trash2, color: 'red', compute: (d) => d.filter((x) => x.action === 'Delete').length },
  ],
  filters: [
    { key: 'action', label: 'All Actions', options: ['Create', 'Update', 'Delete'] },
    { key: 'resourceType', label: 'All Modules', options: ['Invoice', 'Transaction', 'Complaint', 'Membership', 'Unit', 'Lease', 'Meeting', 'AgendaItem', 'Amenity', 'Pet', 'Vehicle'] },
  ],
  columns: [
    {
      key: 'action',
      label: 'Action',
      render: (i) => {
        const Icon = ACTION_ICON[i.action] || History;
        return (
          <span className={`badge flex items-center gap-1 w-fit ${ACTION_COLOR[i.action] || 'bg-slate-100 text-slate-600'}`}>
            <Icon size={12} /> {i.action}
          </span>
        );
      },
    },
    { key: 'resourceType', label: 'Module' },
    { key: 'userName', label: 'Performed By', render: (i) => i.userName || 'System' },
    { key: 'userRole', label: 'Role' },
    { key: 'ipAddress', label: 'IP Address', render: (i) => i.ipAddress || '—' },
    { key: 'createdAt', label: 'Timestamp', render: (i) => new Date(i.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
  ],
  formFields: [],
};

const AuditLog = () => <ModuleListPage config={config} />;
export default AuditLog;
