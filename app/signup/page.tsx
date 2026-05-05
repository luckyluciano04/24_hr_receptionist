import SignupForm from './SignupForm';

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <section className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
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
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">Secure login</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">Instant access</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">Revenue ready</div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <SignupForm />
        </div>
      </section>
    </main>
  );
}
