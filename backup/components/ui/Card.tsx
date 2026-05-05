import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlight';
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] border p-6 backdrop-blur-xl transition-all duration-200',
        variant === 'default' && 'border-slate-200 bg-white shadow-[0_20px_70px_-40px_rgba(15,23,42,0.35)] hover:-translate-y-0.5',
        variant === 'highlight' && 'border-slate-950/15 bg-white shadow-[0_28px_80px_-38px_rgba(15,23,42,0.45)] hover:-translate-y-0.5',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold text-slate-950', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-slate-600', className)} {...props} />;
}
