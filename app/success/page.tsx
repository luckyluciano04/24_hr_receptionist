import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-semibold">Payment successful</h1>
      <p className="mt-4 text-slate-600">Your AI receptionist is now active.</p>
      <Link href="/dashboard" className="mt-6 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white">
        Go to dashboard
      </Link>
    </main>
  );
}
