import React from 'react';

export function Card({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = '',
  title,
  description,
  children,
}: {
  className?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 mb-5 ${className}`}>
      {title && <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>}
      {description && <p className="text-sm text-slate-500">{description}</p>}
      {children}
    </div>
  );
}
