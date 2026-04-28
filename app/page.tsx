import Link from 'next/link';

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      {/* HEADER (UPDATED) */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white/70 sm:text-xs">
              24hrReceptionist.com
            </p>
            <p className="text-xs text-white/40">
              AI receptionist for inbound revenue
            </p>
          </div>
        </div>

        <Link
          href="/pricing"
          className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/85 transition hover:bg-white/10 sm:px-4 sm:py-2 sm:text-sm whitespace-nowrap"
        >
          Pricing
        </Link>
      </header>

      {/* HERO */}
      <section className="mx-auto mt-20 max-w-5xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-widest text-white/60">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          Answer every call. Capture every lead.
        </p>

        <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight sm:text-7xl">
          Turn every missed call into{' '}
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            booked revenue.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
          AI answers instantly, qualifies the caller, routes the lead, and follows up automatically.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-xl bg-blue-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-600"
          >
            Start capturing calls now
          </Link>

          <Link
            href="/pricing"
            className="rounded-xl border border-white/15 px-8 py-4 text-lg font-medium text-white/80 transition hover:bg-white/10"
          >
            See pricing
          </Link>
        </div>
      </section>
    </main>
  );
}