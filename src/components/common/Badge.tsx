import React from 'react';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'indigo';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = '',
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    neutral: {
      container: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      dot: 'bg-slate-500',
    },
    success: {
      container: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500',
    },
    warning: {
      container: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500',
    },
    danger: {
      container: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      dot: 'bg-rose-500',
    },
    info: {
      container: 'bg-brand-50 text-brand-700 border-brand-200',
      dot: 'bg-brand-500',
    },
    indigo: {
      container: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      dot: 'bg-indigo-500',
    },
  };

  const selected = variantStyles[variant] || variantStyles.neutral;
  const sizeClasses = size === 'md' ? 'px-2.5 py-1 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs';


  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-medium border ${sizeClasses} ${selected.container} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selected.dot}`} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};
