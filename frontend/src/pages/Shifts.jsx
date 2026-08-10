import React from 'react';
import { Clock4, UserCheck2, UserX2, CalendarClock } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const config = {
  title: 'Staff Shifts & Attendance',
  subtitle: 'Manage security and housekeeping shift roster, attendance and handover',
  endpoint: '/shifts',
  searchPlaceholder: 'Search by staff name...',
  canWrite: (role) => ['admin', 'security', 'secretary', 'housekeeping'].includes(role),
  statCards: [
    { label: 'Total Shifts', icon: CalendarClock, color: 'blue', compute: (d, t) => t },
    { label: 'Present', icon: UserCheck2, color: 'green', compute: (d) => d.filter((x) => x.status === 'Present').length },
    { label: 'Absent', icon: UserX2, color: 'red', compute: (d) => d.filter((x) => x.status === 'Absent').length },
    { label: 'Scheduled', icon: Clock4, color: 'amber', compute: (d) => d.filter((x) => x.status === 'Scheduled').length },
  ],
  filters: [
    { key: 'role', label: 'All Role', options: ['Security', 'Housekeeping'] },
    { key: 'shiftType', label: 'All Shift', options: ['Morning', 'Evening', 'Night'] },
    { key: 'status', label: 'All Status', options: ['Scheduled', 'Present', 'Absent', 'On Leave'] },
  ],
  columns: [
    { key: 'staffName', label: 'Staff Name' },
    { key: 'role', label: 'Role' },
    { key: 'shiftType', label: 'Shift' },
    { key: 'startTime', label: 'Start' },
    { key: 'endTime', label: 'End' },
    { key: 'status', label: 'Status', badge: true },
  ],
  formFields: [
    { name: 'staffName', label: 'Staff Name', required: true },
    { name: 'role', label: 'Role', type: 'select', options: ['Security', 'Housekeeping'], required: true },
    { name: 'shiftType', label: 'Shift', type: 'select', options: ['Morning', 'Evening', 'Night'], required: true },
    { name: 'startTime', label: 'Start Time (e.g. 6:00 AM)' },
    { name: 'endTime', label: 'End Time (e.g. 2:00 PM)' },
    { name: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'Present', 'Absent', 'On Leave'] },
    { name: 'handoverNotes', label: 'Handover Notes', type: 'textarea' },
  ],
};

const Shifts = () => <ModuleListPage config={config} />;
export default Shifts;
