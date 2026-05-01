import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-black">
          ← Back to Home
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/pricing" className="hover:text-black">
            Pricing
          </Link>
          <Link href="/dashboard" className="hover:text-black">
            Dashboard
          </Link>
          <Link
            href="/api/auth/logout"
            className="border px-3 py-1 rounded hover:bg-gray-100"
          >
            Logout
          </Link>
        </div>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}
