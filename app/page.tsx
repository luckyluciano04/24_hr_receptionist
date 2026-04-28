import Link from 'next/link';

const proofPoints = [
  { label: 'Answers in', value: '<1s' },
  { label: 'Missed calls', value: '0' },
  { label: 'Lead capture', value: 'Automatic' },
];

const featureCards = [
  {
    title: 'Instant answer',
    desc: 'No rings. No voicemail. No missed demand.',
  },
  {
    title: 'Qualify fast',
    desc: 'Capture intent, urgency, and contact details.',
  },
  {
    title: 'Route instantly',
    desc: 'Send the right caller to the right place.',
  },
];

const flowSteps = [
  'Incoming call',
  'AI answers',
  'Lead qualified',
  'Booked or routed',
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070c] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute right-[-10%] top-[10%] h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-[-8%] left-[20%] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_45px_rgba(59,130,246,0.25)]">
              <span className="text-sm font-bold tracking-[0.35em]">24</span>
            </div>
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white/70 sm:text-xs">
                24hrReceptionist.com
              </p>
              <p className="text-xs text-white/40">AI phone layer for inbound demand</p>
            </div>
          </Link>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/login"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(59,130,246,0.35)] transition hover:bg-blue-400"
            >
              Start now
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-14 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:py-18">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.68rem] uppercase tracking-[0.32em] text-white/60 sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Answer calls. Capture leads. Close faster.
            </div>

            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
              Turn every missed call into{' '}
              <span className="bg-gradient-to-r from-sky-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                booked revenue.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
              An AI receptionist that answers instantly, qualifies the caller, routes the lead, and follows up automatically.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-500 px-7 py-4 text-base font-semibold text-white shadow-[0_18px_60px_rgba(59,130,246,0.35)] transition hover:bg-blue-400"
              >
                Start capturing calls now
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-base font-medium text-white/90 transition hover:bg-white/8"
              >
                Access your account
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {proofPoints.map((item) => (
                <div
                  key={item.label}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2"
                >
                  <span className="text-xs uppercase tracking-[0.28em] text-white/45">
                    {item.label}
                  </span>
                  <span className="ml-2 text-sm font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-3">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                >
                  <p className="text-base font-semibold">{card.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 rounded-[3rem] bg-blue-500/10 blur-3xl" />

            <div className="relative mx-auto max-w-[560px]">
              <div className="absolute left-8 top-8 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
              <div className="absolute right-4 top-24 h-44 w-44 rounded-full bg-violet-400/15 blur-3xl" />

              <div className="relative rotate-[-1.5deg] rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_40px_140px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
                <div className="rounded-[1.6rem] border border-white/10 bg-[#070b12] p-5">
                  <div className="flex items-start justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-white/40">
                        Live call flow
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold">
                        One call becomes one action.
                      </h2>
                    </div>
                    <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                      Live
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(59,130,246,0.22),rgba(255,255,255,0.04))] p-5">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                        Incoming
                      </p>
                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                        <p className="text-sm text-white/50">Caller</p>
                        <p className="mt-1 text-lg font-semibold">“I need someone now.”</p>
                      </div>

                      <div className="mt-4 grid gap-3">
                        <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                            AI response
                          </p>
                          <p className="mt-1 text-sm text-white/75">
                            Answers instantly. Captures intent. Starts routing.
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                            Outcome
                          </p>
                          <p className="mt-1 text-sm text-white/75">
                            Lead qualified and moved forward without delay.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(168,85,247,0.18),rgba(255,255,255,0.04))] p-5">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                        Action chain
                      </p>

                      <div className="mt-4 space-y-3">
                        {flowSteps.map((step, index) => (
                          <div
                            key={step}
                            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/80">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{step}</p>
                              <p className="text-xs text-white/45">
                                {index === 0
                                  ? 'No voicemail. No missed opportunity.'
                                  : index === 1
                                    ? 'Immediate response.'
                                    : index === 2
                                      ? 'Capture the right data.'
                                      : 'Close the loop fast.'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-blue-200/70">
                          Conversion impact
                        </p>
                        <p className="mt-1 text-sm text-white/80">
                          Faster response. Higher trust. More booked conversations.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                        Answer speed
                      </p>
                      <p className="mt-2 text-2xl font-bold">&lt; 1 sec</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                        Missed calls
                      </p>
                      <p className="mt-2 text-2xl font-bold">0</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                        Follow-up
                      </p>
                      <p className="mt-2 text-2xl font-bold">Automatic</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/40">
                  Built for
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  Service businesses, agencies, and teams that cannot afford missed calls.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/pricing"
                  className="rounded-xl bg-blue-500 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-400"
                >
                  See plans
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-white/15 px-5 py-3 text-center text-sm font-medium text-white/85 transition hover:bg-white/5"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
