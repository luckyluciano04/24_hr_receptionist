import Link from "next/link";

const features = [
  {
    title: "Answers every call 24/7",
    body: "Never miss a lead after hours, on weekends, or during peak call volume.",
  },
  {
    title: "Qualifies the caller",
    body: "Captures intent, filters noise, and routes serious prospects faster.",
  },
  {
    title: "Books and follows up",
    body: "Moves the lead toward a booked call or next step without manual work.",
  },
];

const steps = [
  {
    title: "Connect your business",
    body: "Set up your receptionist flow and key routing rules in minutes.",
  },
  {
    title: "Let AI handle intake",
    body: "Calls are answered instantly with a consistent, professional experience.",
  },
  {
    title: "Convert more revenue",
    body: "Qualified leads are captured, tracked, and handed off without friction.",
  },
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-slate-50 text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_25%),radial-gradient(circle_at_left,rgba(59,130,246,0.08),transparent_22%)]" />
      <section className="page-shell relative py-6">
        <div className="premium-surface flex items-center justify-between px-6 py-4">
          <div>
            <div className="text-sm font-semibold tracking-wide text-slate-600">
              24hrReceptionist.com
            </div>
            <div className="text-sm text-slate-500">
              AI receptionist for inbound revenue
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Pricing
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-[0_18px_50px_-18px_rgba(15,23,42,0.55)] hover:bg-slate-800"
            >
              Activate AI Receptionist
            </Link>
          </div>
        </div>

        <div className="grid gap-12 py-16 lg:grid-cols-2 lg:items-center lg:py-20">
          <div className="relative">
            <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 shadow-sm">
              Never miss another call
            </div>
            <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-6xl">
              Turn every missed call into booked revenue.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              AI answers instantly, qualifies the caller, routes the lead, and follows up automatically.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_-18px_rgba(15,23,42,0.55)] hover:bg-slate-800"
              >
                Activate AI Receptionist
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                See pricing
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">Answers 24/7</div>
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">Captures every lead</div>
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">Setup in minutes</div>
            </div>
          </div>

          <div className="premium-surface p-6">
            <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-[0_30px_80px_-36px_rgba(15,23,42,0.75)]">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Live workflow</div>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-sm font-medium text-slate-300">Incoming call</div>
                  <div className="mt-1 text-base font-semibold">“Hi, I need help today.”</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-sm font-medium text-slate-300">AI response</div>
                  <div className="mt-1 text-base font-semibold">
                    Answers instantly, qualifies need, and captures contact details.
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-sm font-medium text-slate-300">Outcome</div>
                  <div className="mt-1 text-base font-semibold">
                    Lead routed, booked, and ready for follow-up.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="py-6">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((item) => (
              <div key={item.title} className="premium-surface p-6">
                <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">How it works</h2>
            <p className="mt-3 text-slate-600">
              Minimal setup. Fast deployment. Built to reduce missed opportunities.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="premium-surface p-6">
                <div className="text-sm font-semibold text-slate-500">0{index + 1}</div>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-8">
          <div className="rounded-[2rem] bg-slate-950 px-8 py-10 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.8)]">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight">
                Start capturing calls now.
              </h2>
              <p className="mt-3 text-slate-300">
                Convert missed calls into qualified leads without hiring a full-time receptionist.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100"
              >
                Activate AI Receptionist
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                View pricing
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
