import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-16 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-3">
          <Link href="/" className="text-sm text-blue-400 hover:underline">
            ← Back to home
          </Link>
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="text-sm text-gray-400">Last updated: April 6, 2026</p>
        </div>

        <section className="space-y-3 text-gray-300">
          <p>
            24hr Receptionist provides hosted AI-assisted call intake, messaging, billing, and
            reporting tools for business customers.
          </p>
          <p>
            You are responsible for using the service lawfully, maintaining accurate account
            details, and securing access to your account and connected services.
          </p>
          <p>
            Availability may depend on third-party providers including Vercel, Supabase, Stripe,
            Twilio, OpenAI, Resend, and Google. We may update the service as needed to preserve
            reliability and security.
          </p>
          <p>
            For support or legal notices, contact
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
