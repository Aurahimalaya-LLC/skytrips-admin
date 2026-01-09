import React from 'react';

interface FinancialCardProps {
  label: string;
  amount: string;
  subtext?: string;
  icon?: string;
  trend?: 'up' | 'down';
  className?: string;
}

export function FinancialCard({ label, amount, subtext, icon, trend, className = "" }: FinancialCardProps) {
  return (
    <div className={`bg-slate-50 rounded-xl p-5 border border-slate-100 ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        {icon && <span className="material-symbols-outlined text-slate-300">{icon}</span>}
        {trend && (
          <span className={`material-symbols-outlined ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? 'trending_up' : 'trending_down'}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-1">{amount}</h3>
      {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
    </div>
  );
}
