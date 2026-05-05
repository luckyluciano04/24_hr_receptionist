import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { TIER_FEATURES, TIER_PRICES, type Tier } from "@/lib/constants";

const plans: { id: Tier; name: string; featured?: boolean }[] = [
  { id: "starter", name: "Starter" },
  { id: "professional", name: "Professional", featured: true },
  { id: "enterprise", name: "Enterprise" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 sm:px-6 py-16 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="section-label mx-auto">Pricing</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-4xl sm:text-5xl lg:text-4xl sm:text-5xl lg:text-6xl">
            Choose the plan that matches your call volume.
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Every plan is designed to capture missed calls, qualify leads, and move the customer to the next action without manual work.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              variant={plan.featured ? "highlight" : "default"}
              className={`relative flex h-full flex-col overflow-hidden ${plan.featured ? "ring-2 ring-slate-950" : ""}`}
            >
              {plan.featured ? (
                <div className="absolute right-4 top-4 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Most Popular
                </div>
              ) : null}

              <div className="p-8">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {plan.name}
                </div>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl sm:text-5xl lg:text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950">
                    ${TIER_PRICES[plan.id]}
                  </span>
                  <span className="pb-1 text-sm text-slate-500">/month</span>
                </div>

                <ul className="mt-8 space-y-3">
                  {TIER_FEATURES[plan.id].map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                      <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[11px] font-bold text-white">
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto border-t border-slate-200 bg-slate-50 p-6">
                <Link
                  href={`/api/stripe/checkout?plan=${plan.id}`}
                  className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_-18px_rgba(15,23,42,0.55)] hover:bg-slate-800"
                >
                  Start now
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
