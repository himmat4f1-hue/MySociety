import React from 'react';

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
  slate: 'bg-slate-100 text-slate-600',
};

const StatCard = ({ icon: Icon, label, value, color = 'blue', trend }) => {
  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
      </div>
      {Icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
