import React from 'react';
import { Clock4, UserCheck2, UserX2, CalendarClock } from 'lucide-react';
import ModuleListPage from '../components/ModuleListPage';

const fmtTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

const config = {
  title: 'Staff Shifts & Attendance',
  subtitle: 'Manage security and housekeeping shift roster, actual in/out time, and leave records',
  endpoint: '/shifts',
  searchPlaceholder: 'Search by staff name...',
  canWrite: (role) => ['security', 'secretary', 'housekeeping'].includes(role),
  statCards: [
    { label: 'Total Shifts', icon: CalendarClock, color: 'blue', compute: (d, t) => t },
    { label: 'Present', icon: UserCheck2, color: 'green', compute: (d) => d.filter((x) => x.status === 'Present').length },
    { label: 'Absent', icon: UserX2, color: 'red', compute: (d) => d.filter((x) => x.status === 'Absent').length },
    { label: 'On Leave', icon: Clock4, color: 'amber', compute: (d) => d.filter((x) => x.status === 'On Leave').length },
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
    { key: 'startTime', label: 'Scheduled' },
    { key: 'actualInTime', label: 'Actual In', render: (i) => fmtTime(i.actualInTime) },
    { key: 'actualOutTime', label: 'Actual Out', render: (i) => fmtTime(i.actualOutTime) },
    {
      key: 'status',
      label: 'Status',
      render: (i) => (
        <div>
          <span
            className={`badge ${
              i.status === 'Present'
                ? 'bg-emerald-50 text-emerald-600'
                : i.status === 'Absent'
                ? 'bg-red-50 text-red-600'
                : i.status === 'On Leave'
                ? 'bg-amber-50 text-amber-600'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {i.status}
          </span>
          {i.status === 'On Leave' && i.leaveReason && <p className="text-[11px] text-slate-400 mt-0.5">{i.leaveReason}</p>}
        </div>
      ),
    },
  ],
  formFields: [
    { name: 'staffName', label: 'Staff Name', required: true },
    { name: 'role', label: 'Role', type: 'select', options: ['Security', 'Housekeeping'], required: true },
    { name: 'shiftType', label: 'Shift', type: 'select', options: ['Morning', 'Evening', 'Night'], required: true },
    { name: 'startTime', label: 'Scheduled Start (e.g. 6:00 AM)' },
    { name: 'endTime', label: 'Scheduled End (e.g. 2:00 PM)' },
    { name: 'actualInTime', label: 'Actual Check-In Time', type: 'datetime-local' },
    { name: 'actualOutTime', label: 'Actual Check-Out Time', type: 'datetime-local' },
    { name: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'Present', 'Absent', 'On Leave'] },
    { name: 'leaveReason', label: 'Leave Reason (if On Leave)' },
    { name: 'handoverNotes', label: 'Handover Notes', type: 'textarea' },
  ],
};

const Shifts = () => <ModuleListPage config={config} />;
export default Shifts;
