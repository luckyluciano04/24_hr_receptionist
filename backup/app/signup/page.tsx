import SignupForm from './SignupForm';

export default function Page() {
  return (
    <main className="relative overflow-hidden min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_24%),radial-gradient(circle_at_left,rgba(255,255,255,0.08),transparent_20%)]" />
      <section className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Secure access
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Activate your account and enter the dashboard.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-300">
            Use a secure magic link to sign in. Once verified, you can manage billing, review outcomes, and move forward with the live subscription flow.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-[0_24px_60px_-40px_rgba(255,255,255,0.25)]">Secure login</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-[0_24px_60px_-40px_rgba(255,255,255,0.25)]">Instant access</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-[0_24px_60px_-40px_rgba(255,255,255,0.25)]">Revenue ready</div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_-36px_rgba(15,23,42,0.75)] backdrop-blur-xl">
          <SignupForm />
        </div>
      </section>
    </main>
  );
}
