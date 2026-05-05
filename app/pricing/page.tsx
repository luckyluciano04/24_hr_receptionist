import Link from "next/link";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 97,
    summary: "For solo operators who need live capture now.",
    features: ["100 calls/month", "Email delivery", "Call transcripts", "Dashboard access"],
    cta: "Start Starter",
  },
  {
    id: "professional",
    name: "Professional",
    price: 197,
    summary: "For teams turning missed calls into revenue.",
    features: ["500 calls/month", "SMS + Email delivery", "Call transcripts", "Full dashboard", "Priority support"],
    cta: "Start Professional",
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 397,
    summary: "For multi-location and higher-volume operations.",
    features: ["Unlimited calls", "Slack + SMS + Email + CRM push", "Call transcripts", "Full dashboard", "Dedicated account manager", "Custom integrations"],
    cta: "Start Enterprise",
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Pricing
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Choose the plan that matches your call volume.
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Every plan is designed to capture missed calls, qualify leads, and move the customer to the next action without manual work.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-sm ${plan.featured ? 'border-slate-950 ring-2 ring-slate-950' : 'border-slate-200'}`}
            >
              {plan.featured ? (
                <div className="absolute right-4 top-4 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Most popular
                </div>
              ) : null}

              <div className="p-8">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {plan.name}
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {plan.summary}
                </h2>

                <div className="mt-6 flex items-end gap-1">
                  <span className="text-5xl font-bold tracking-tight text-slate-950">${plan.price}</span>
                  <span className="pb-1 text-sm text-slate-500">/month</span>
                </div>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
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
                  className={`block rounded-full px-5 py-3 text-center text-sm font-semibold ${plan.featured ? 'bg-slate-950 text-white hover:bg-slate-800' : 'border border-slate-300 text-slate-800 hover:bg-slate-100'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
