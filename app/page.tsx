import Link from 'next/link';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { SocialProof } from '@/components/landing/SocialProof';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold text-white">
            24hr Receptionist
          </Link>
          <div className="hidden items-center gap-6 sm:flex">
            <Link href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">
              FAQ
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <Hero />
        <HowItWorks />
        <SocialProof />
        <Pricing />
        <FAQ />
        <CTA />
      </main>

      <footer className="border-t border-white/10 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm font-bold text-white">24hr Receptionist</p>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} 24hrreceptionist.com. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
