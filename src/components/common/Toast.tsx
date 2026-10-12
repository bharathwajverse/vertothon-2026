import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  const typeConfig: Record<
    ToastType,
    { icon: React.ReactNode; border: string; bg: string; titleColor: string }
  > = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      border: 'border-emerald-200',
      bg: 'bg-emerald-50',
      titleColor: 'text-emerald-900',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      border: 'border-rose-200',
      bg: 'bg-rose-50',
      titleColor: 'text-rose-900',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      border: 'border-amber-200',
      bg: 'bg-amber-50',
      titleColor: 'text-amber-900',
    },
    info: {
      icon: <Info className="w-5 h-5 text-brand-600 shrink-0" />,
      border: 'border-brand-200',
      bg: 'bg-brand-50',
      titleColor: 'text-brand-900',
    },
  };

  const current = typeConfig[toast.type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-md transition-all ${current.bg} ${current.border}`}
    >
      {current.icon}
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-semibold ${current.titleColor}`}>{toast.title}</h4>
        {toast.message && (
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
