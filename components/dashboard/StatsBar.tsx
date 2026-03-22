import { Badge } from '@/components/ui/Badge';
import { TIER_LIMITS } from '@/lib/constants';
import type { Tier } from '@/lib/constants';

interface StatsBarProps {
  tier: Tier;
  callsThisMonth: number;
  subscriptionStatus: string;
}

export function StatsBar({ tier, callsThisMonth, subscriptionStatus }: StatsBarProps) {
  const limit = TIER_LIMITS[tier];
  const remaining = limit === null ? null : Math.max(0, limit - callsThisMonth);
  const usagePercent = limit === null ? 0 : Math.min(100, (callsThisMonth / limit) * 100);

  const statusVariant =
    subscriptionStatus === 'active'
      ? 'success'
      : subscriptionStatus === 'trialing'
        ? 'blue'
        : 'warning';

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <p className="mb-1 text-sm text-gray-400">Calls This Month</p>
        <p className="text-3xl font-bold text-white">{callsThisMonth}</p>
        {limit !== null && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>{callsThisMonth} used</span>
              <span>{limit} total</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <p className="mb-1 text-sm text-gray-400">Calls Remaining</p>
        <p className="text-3xl font-bold text-white">
          {remaining === null ? '∞' : remaining}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {remaining === null ? 'Unlimited' : `${remaining} left this month`}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <p className="mb-1 text-sm text-gray-400">Plan</p>
        <p className="text-2xl font-bold capitalize text-white">{tier}</p>
        <div className="mt-2">
          <Badge variant={statusVariant} className="capitalize">
            {subscriptionStatus}
          </Badge>
        </div>
      </div>
    </div>
  );
}
