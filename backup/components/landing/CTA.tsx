import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function CTA() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-blue-600/5 px-8 py-16">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Ready to never miss a lead again?
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-lg text-gray-400">
            Join thousands of small business owners who trust 24hr Receptionist to handle
            their calls 24/7. Start your free trial today.
          </p>
          <Link href="/signup">
            <Button size="lg">
              Start Your Free Trial →
            </Button>
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            7-day free trial · No credit card required · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
