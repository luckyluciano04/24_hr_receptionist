import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const outcomes = [
  { label: "24/7 Answering", value: "Never miss the call" },
  { label: "Lead Capture", value: "Name, intent, routing" },
  { label: "Follow-Up", value: "Auto handoff and next step" },
  { label: "Transcripts", value: "Call summary and context" },
];

const controls = [
  "Manage subscription and billing",
  "Review captured leads and call outcomes",
  "Monitor delivery status and account health",
  "Move between plans as volume changes",
];

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Access required
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Sign in to access the dashboard
          </h1>
          <p className="mt-3 text-slate-600">
            This is the customer control center for billing, outcomes, and subscription management.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const email = user.email ?? "unknown";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
                {initials}
              </div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Account overview
                </div>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">Dashboard</h1>
                <p className="mt-1 text-slate-600">{email}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {outcomes.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-sm text-slate-500">{item.label}</div>
                  <div className="mt-2 text-lg font-semibold text-slate-950">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pricing" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                Upgrade plan
              </Link>
              <Link href="/api/billing/portal" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">
                Open billing portal
              </Link>
            </div>

            <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold">What the customer gets</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {controls.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Account status
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Revenue control center</h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">Auth: connected</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">Pricing: live</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">Checkout: wired</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">Webhook sync: next</div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
