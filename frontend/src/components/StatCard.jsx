import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, trend, isPositive, icon: Icon, color = 'blue' }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 stat-card-hover relative overflow-hidden">
      {color === 'blue' && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
      {color === 'green' && <div className="absolute top-0 left-0 w-1 h-full bg-success" />}
      {color === 'amber' && <div className="absolute top-0 left-0 w-1 h-full bg-warning" />}
      {color === 'purple' && <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />}
      
      <div className="flex justify-between items-start mb-2">
        <div className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider">{label}</div>
        {Icon && <div className={`p-1.5 rounded-md bg-blue-50 text-primary`}><Icon size={16} /></div>}
      </div>
      <div className="text-3xl font-bold text-textPrimary mb-2">{value}</div>
      
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trend}</span>
          <span className="text-textSecondary ml-1 font-normal">vs last month</span>
        </div>
      )}
    </div>
  );
}
