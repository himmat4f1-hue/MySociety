import React from 'react';

const STATUS_STYLES = {
  Open: 'bg-red-100 text-red-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Completed: 'bg-green-100 text-green-700',
  Resolved: 'bg-green-100 text-green-700',
  Overdue: 'bg-red-100 text-red-700',
  Occupied: 'bg-green-100 text-green-700',
  Vacant: 'bg-amber-100 text-amber-700',
  Maintenance: 'bg-blue-100 text-blue-700',
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-slate-200 text-slate-600',
  Inside: 'bg-green-100 text-green-700',
  'Checked Out': 'bg-slate-200 text-slate-600',
  'Pre-Approved': 'bg-blue-100 text-blue-700',
  Published: 'bg-green-100 text-green-700',
  Scheduled: 'bg-amber-100 text-amber-700',
  Archived: 'bg-slate-200 text-slate-600',
  Available: 'bg-green-100 text-green-700',
  'Under Maintenance': 'bg-amber-100 text-amber-700',
  'Out of Service': 'bg-red-100 text-red-700',
  Paid: 'bg-green-100 text-green-700',
  Pending: 'bg-amber-100 text-amber-700',
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-slate-200 text-slate-600',
};

const Badge = ({ text }) => {
  const style = STATUS_STYLES[text] || 'bg-slate-100 text-slate-600';
  return <span className={`badge ${style}`}>{text}</span>;
};

export default Badge;
