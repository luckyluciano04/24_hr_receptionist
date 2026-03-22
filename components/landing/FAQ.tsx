'use client';

import { useState } from 'react';

const faqs = [
  {
    q: 'How does call forwarding work?',
    a: 'When you sign up, we\'ll give you a dedicated phone number. Simply set up a call forward from your existing business line to this number using your carrier\'s forwarding feature (we provide step-by-step instructions). The whole process takes about 2 minutes.',
  },
  {
    q: 'Can the AI handle my industry?',
    a: 'Yes! Our AI is trained to handle a wide range of industries including contractors, medical offices, law firms, salons, real estate, and more. During onboarding, you customize the greeting and key information the AI collects for your specific business.',
  },
  {
    q: 'What happens when I hit my call limit?',
    a: 'We\'ll notify you by email when you reach 80% of your monthly call limit. Once you hit the limit, calls are still answered but you\'re prompted to upgrade to continue receiving full service. We never drop your calls without warning.',
  },
  {
    q: 'Is there a setup fee?',
    a: 'No. There\'s no setup fee. You just choose a plan, start your 7-day free trial, and follow the simple onboarding steps. No contracts, no hidden charges.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. You can cancel your subscription at any time from your dashboard with one click. You\'ll continue to have access until the end of your billing period, and you won\'t be charged again.',
  },
  {
    q: 'How fast is setup?',
    a: 'Most customers are live in under 5 minutes. Our onboarding wizard walks you through every step, including call forwarding instructions specific to your phone carrier.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="px-4 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <button
                className="flex w-full items-center justify-between p-5 text-left text-white font-medium hover:bg-white/5 transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span>{faq.q}</span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 text-blue-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="border-t border-white/10 px-5 pb-5 pt-4">
                  <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
