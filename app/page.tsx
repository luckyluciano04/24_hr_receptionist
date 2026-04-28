import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-20">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">
          24hr Receptionist
        </p>
        <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-tight">
          Capture every call, route every lead, and never miss a customer again.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/70">
          AI receptionist, call handling, follow-up, and lead capture in one system.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-medium text-white"
          >
            Start now
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3 font-medium text-white"
          >
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
