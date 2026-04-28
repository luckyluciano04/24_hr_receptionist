import Link from 'next/link';

const MONTHLY_STRIPE_URL = 'REPLACE_WITH_YOUR_MONTHLY_STRIPE_CHECKOUT_URL';

const plans = [
  {
    name: 'Starter',
    price: '$97/mo',
    desc: 'For solo operators who need calls answered and leads captured.',
    features: ['AI call answering', 'Lead capture', 'Basic routing'],
  },
  {
    name: 'Growth',
    price: '$197/mo',
    desc: 'For teams that need faster follow-up and more control.',
    features: ['Everything in Starter', 'Priority routing', 'Follow-up automation'],
  },
  {
    name: 'Scale',
    price: '$397/mo',
    desc: 'For higher volume businesses that cannot miss demand.',
    features: ['Everything in Growth', 'Advanced workflows', 'High-volume readiness'],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#04070b] px-6 py-16 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Pricing</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Monthly plans only.
          </h1>
          <p className="mt-4 text-lg text-white/65">
            Choose the level that fits your call volume. Annual pricing is not shown until it is live in Stripe.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            >
              <p className="text-sm uppercase tracking-[0.28em] text-white/45">{plan.name}</p>
              <p className="mt-3 text-4xl font-bold">{plan.price}</p>
              <p className="mt-3 text-sm leading-6 text-white/65">{plan.desc}</p>

              <ul className="mt-5 space-y-3 text-sm text-white/80">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={MONTHLY_STRIPE_URL}
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
              >
                Start this plan
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}