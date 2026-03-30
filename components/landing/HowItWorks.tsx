const steps = [
  {
    number: '01',
    title: 'Point your calls to us',
    description:
      'Set up a simple call forward from your business number to your dedicated 24hr Receptionist line. Takes 2 minutes with any carrier.',
    icon: '📲',
  },
  {
    number: '02',
    title: 'We answer, every time',
    description:
      'Our AI receptionist answers every call professionally, using your business name and collecting the caller\'s details.',
    icon: '🤖',
  },
  {
    number: '03',
    title: 'You get the details instantly',
    description:
      'Receive a text and email with the caller\'s name, phone number, and reason for calling — within seconds of the call ending.',
    icon: '⚡',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-xl text-gray-400">
            Get up and running in under 5 minutes. No technical skills required.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-full top-12 hidden w-full -translate-y-1/2 border-t-2 border-dashed border-white/10 md:block" />
              )}
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                <div className="mb-4 text-4xl">{step.icon}</div>
                <div className="mb-2 text-sm font-bold text-blue-400">STEP {step.number}</div>
                <h3 className="mb-3 text-xl font-semibold text-white">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
