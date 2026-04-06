import Link from 'next/link';

export default function UnsubscribePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-16 text-white">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-3">
          <Link href="/" className="text-sm text-blue-400 hover:underline">
            ← Back to home
          </Link>
          <h1 className="text-4xl font-bold">Email Preferences</h1>
        </div>

        <p className="text-gray-300">
          Transactional billing, onboarding, and call notification emails are part of the core
          service and cannot be fully disabled from this page.
        </p>
        <p className="text-gray-300">
          To change where notifications are delivered or to close your account, contact
          {' '}
          <a className="text-blue-400 hover:underline" href="mailto:support@24hrreceptionist.com">
            support@24hrreceptionist.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
