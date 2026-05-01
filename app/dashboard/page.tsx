import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <Link href="/" className="text-sm font-medium text-slate-700 hover:text-slate-950">
          ← Back to home
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/pricing" className="text-slate-600 hover:text-slate-950">
            Pricing
          </Link>
          <Link href="/dashboard" className="text-slate-600 hover:text-slate-950">
            Dashboard
          </Link>
          <Link
            href="/api/auth/logout"
            className="rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-800 hover:bg-slate-50"
          >
            Logout
          </Link>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}