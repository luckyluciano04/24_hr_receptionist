import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-16 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-3">
          <Link href="/" className="text-sm text-blue-400 hover:underline">
            ← Back to home
          </Link>
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: April 6, 2026</p>
        </div>

        <section className="space-y-3 text-gray-300">
          <p>
            24hr Receptionist collects the information required to answer calls, manage billing,
            and deliver notifications to customers.
          </p>
          <p>
            We process contact details, call metadata, call recordings or transcripts, billing
            identifiers, and account settings to operate the service and support your business.
          </p>
          <p>
            Third-party processors used by the platform include Vercel, Supabase, Stripe, Twilio,
            OpenAI, Resend, and Google APIs. Data is shared with them only as needed to provide the
            service.
          </p>
          <p>
            If you need access, correction, or deletion assistance, email
            {' '}
            <a className="text-blue-400 hover:underline" href="mailto:support@24hrreceptionist.com">
              support@24hrreceptionist.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
