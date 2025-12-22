'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'pending' | 'accepted' | 'denied' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    denied: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function LoadStatusBadge({ status }: { status: 'PENDING' | 'ACCEPTED' | 'DENIED' }) {
  const variants: Record<string, 'pending' | 'accepted' | 'denied'> = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    DENIED: 'denied',
  };

  return <Badge variant={variants[status]}>{status}</Badge>;
}
