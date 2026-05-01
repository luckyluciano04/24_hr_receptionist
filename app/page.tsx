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
    <main className="min-h-screen bg-white text-slate-950">
      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
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
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Pricing
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Activate AI Receptionist
            </Link>
          </div>
        </div>

        <div className="grid gap-16 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
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
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Activate AI Receptionist
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                See pricing
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
              <div>Answers 24/7</div>
              <div>Captures every lead</div>
              <div>Setup in minutes</div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="rounded-2xl bg-white p-6">
              <div className="text-sm font-semibold text-slate-500">Live workflow</div>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-sm font-medium text-slate-500">Incoming call</div>
                  <div className="mt-1 text-base font-semibold">“Hi, I need help today.”</div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-sm font-medium text-slate-500">AI response</div>
                  <div className="mt-1 text-base font-semibold">
                    Answers instantly, qualifies need, and captures contact details.
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-sm font-medium text-slate-500">Outcome</div>
                  <div className="mt-1 text-base font-semibold">
                    Lead routed, booked, and ready for follow-up.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="py-8">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
            <p className="mt-3 text-slate-600">
              Minimal setup. Fast deployment. Built to reduce missed opportunities.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 p-6">
                <div className="text-sm font-semibold text-slate-500">0{index + 1}</div>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-8">
          <div className="rounded-3xl bg-slate-950 px-8 py-10 text-white">
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
                className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-900"
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