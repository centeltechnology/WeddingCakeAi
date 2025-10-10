import * as React from 'react';

export function Card({
  title,
  subtitle,
  action,
  children,
  className = ''
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-[var(--accent-2)] bg-white shadow-sm ${className}`}>
      {(title || action || subtitle) && (
        <div className="px-4 py-3 border-b border-[var(--accent-2)] flex items-center justify-between">
          <div>
            {title && <div className="font-semibold">{title}</div>}
            {subtitle && <div className="text-xs text-[color:var(--brand-500)]">{subtitle}</div>}
          </div>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
