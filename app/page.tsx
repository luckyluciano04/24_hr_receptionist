import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center">
      <section className="mx-auto max-w-5xl px-6 w-full">
        
        {/* BRAND */}
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          24hrReceptionist.com
        </h1>

        {/* CORE VALUE */}
        <h2 className="mt-6 text-3xl sm:text-4xl font-semibold leading-tight max-w-3xl">
          Never miss another call. Never lose another lead.
        </h2>

        {/* HARD BENEFIT */}
        <p className="mt-6 text-lg text-white/70 max-w-2xl">
          AI answers every call, qualifies every lead, and routes every opportunity —
          automatically, instantly, 24/7.
        </p>

        {/* CTA BLOCK */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/pricing"
            className="bg-blue-600 hover:bg-blue-700 transition px-8 py-4 rounded-xl text-lg font-semibold text-center"
          >
            Start capturing calls now
          </Link>

          <Link
            href="/login"
            className="border border-white/20 px-8 py-4 rounded-xl text-lg font-medium text-center"
          >
            Sign in
          </Link>
        </div>

        {/* TRUST / URGENCY */}
        <p className="mt-6 text-sm text-white/50">
          Setup in minutes • No missed calls • Immediate ROI
        </p>

      </section>
    </main>
  );
}
