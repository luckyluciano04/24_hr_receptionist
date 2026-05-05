import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const metrics = [
  { label: "Answered calls", value: "24/7" },
  { label: "Leads captured", value: "Auto" },
  { label: "Billing status", value: "Ready" },
];

const actions = [
  {
    title: "Manage subscription",
    body: "Open the billing portal to update payment details, switch plans, or review invoices.",
  },
  {
    title: "Review plan options",
    body: "Compare tiers and move up when call volume or automation needs increase.",
  },
  {
    title: "Monitor operational setup",
    body: "Use this dashboard as the control center for auth, billing, and delivery status.",
  },
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
            The dashboard is your control center for billing, subscription status, and operational setup.
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
      <section className="mx-auto max-w-6xl">
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

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-sm text-slate-500">{metric.label}</div>
                  <div className="mt-2 text-xl font-semibold text-slate-950">{metric.value}</div>
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
              <h2 className="text-xl font-semibold">What this dashboard does</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {actions.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="text-base font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Operational checklist
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Revenue activation status</h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">Auth: connected</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">Pricing: visible</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">Checkout: wired</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">Webhook sync: next</div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
