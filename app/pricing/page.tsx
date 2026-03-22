import Link from 'next/link';
import { Pricing } from '@/components/landing/Pricing';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <nav className="border-b border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-lg font-bold text-white">
            24hr Receptionist
          </Link>
          <Link href="/signup" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>
      <main className="pt-8">
        <div className="mx-auto max-w-6xl px-4 pb-8 text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Pricing</h1>
          <p className="mt-4 text-gray-400">Start your 7-day free trial. No credit card required.</p>
        </div>
        <Pricing />
      </main>
    </div>
  );
}
