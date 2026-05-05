const testimonials = [
  {
    quote:
      'I was losing jobs because I couldn\'t answer my phone on the job site. Now every lead gets captured and I call them back on my schedule. Paid for itself in the first week.',
    name: 'Mike Torres',
    business: 'Torres Plumbing & HVAC',
    location: 'Phoenix, AZ',
    avatar: 'MT',
  },
  {
    quote:
      'My salon books 30% more appointments now. The AI is incredibly polite and professional — clients actually compliment how quickly their calls are handled.',
    name: 'Priya Sharma',
    business: 'Luxe Hair Studio',
    location: 'Atlanta, GA',
    avatar: 'PS',
  },
  {
    quote:
      'As a solo attorney I couldn\'t afford a full-time receptionist. This is exactly what I needed. Every potential client call is captured, and I follow up when I\'m available.',
    name: 'James Whitfield',
    business: 'Whitfield Law Firm',
    location: 'Nashville, TN',
    avatar: 'JW',
  },
];

export function SocialProof() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Stats */}
        <div className="mb-16 grid gap-8 rounded-xl border border-white/10 bg-white/5 p-8 text-center sm:grid-cols-3">
          {[
            { stat: '2,400+', label: 'Calls Answered' },
            { stat: '98.7%', label: 'Satisfaction Rate' },
            { stat: '47', label: 'States Served' },
          ].map(({ stat, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold text-blue-400 sm:text-4xl">{stat}</div>
              <div className="mt-1 text-gray-400">{label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Trusted by Small Business Owners
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-4 flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mb-6 flex-1 text-gray-300 italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-sm text-gray-500">
                    {t.business} · {t.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
