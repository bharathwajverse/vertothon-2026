import React from 'react';
import { MetricCardData } from '../../types';
import { TrendingUp, Users, CheckCircle2, AlertTriangle } from 'lucide-react';

interface MetricCardProps {
  data: MetricCardData;
}

export const MetricCard: React.FC<MetricCardProps> = ({ data }) => {
  const getIcon = () => {
    switch (data.id) {
      case 'registrations':
        return <Users className="w-5 h-5 text-brand-600" />;
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'teams':
        return <TrendingUp className="w-5 h-5 text-indigo-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusBadge = () => {
    if (data.status === 'positive') {
      return (
        <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
          Normal
        </span>
      );
    }
    if (data.status === 'warning') {
      return (
        <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
        Tracking
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {data.label}
        </span>
        <div className="p-2 rounded-md bg-slate-50 border border-slate-100">
          {getIcon()}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {typeof data.value === 'number' ? data.value.toLocaleString() : data.value}
        </span>
        {getStatusBadge()}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="truncate">{data.changeDescription}</span>
        {data.target && (
          <span className="font-mono text-[11px] text-slate-400 shrink-0 ml-2">
            {data.target}
          </span>
        )}
      </div>
    </div>
  );
};
