import Link from "next/link";
import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-950">
            ← Back to Home
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link href="/pricing" className="text-slate-600 hover:text-slate-950">
              Pricing
            </Link>
            <Link href="/api/billing/portal" className="text-slate-600 hover:text-slate-950">
              Billing
            </Link>
            <Link
              href="/api/auth/logout"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Logout
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
