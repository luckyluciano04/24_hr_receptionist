import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title = 'No calls yet',
  description = 'Your calls will appear here once your phone number is set up.',
  actionLabel = 'Complete Setup',
  actionHref = '/onboarding',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 px-8 py-16 text-center">
      <div className="mb-4 text-5xl">📞</div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="mb-6 max-w-sm text-gray-400">{description}</p>
      <Link href={actionHref}>
        <Button variant="outline">{actionLabel}</Button>
      </Link>
    </div>
  );
}
