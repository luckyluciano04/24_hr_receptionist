import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Session required</h1>
          <p className="mt-3 text-slate-600">Please sign in to access your dashboard.</p>
          <Link href="/signup" className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const email = user.email ?? "unknown";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <main className="px-6 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-lg font-semibold text-white">
                {initials}
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
                <p className="mt-1 text-slate-600">{email}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="text-sm text-slate-500">Status</div>
                <div className="mt-2 text-lg font-semibold">Active session</div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="text-sm text-slate-500">Plan</div>
                <div className="mt-2 text-lg font-semibold">Free / Pending</div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="text-sm text-slate-500">Billing</div>
                <div className="mt-2 text-lg font-semibold">Not connected</div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pricing" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                Upgrade plan
              </Link>
              <Link href="/api/billing/portal" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                Open billing portal
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <h2 className="text-xl font-semibold">Enterprise setup checklist</h2>
            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">Auth: connected</div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">Landing page: live</div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">Checkout: wire next</div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">Webhook sync: wire next</div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
