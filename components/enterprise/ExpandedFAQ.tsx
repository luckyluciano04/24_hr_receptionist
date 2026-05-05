const faqs = [
  ["Can I use my existing business number?","Yes. Numbers can be ported or forwarded."],
  ["Does the AI sound human?","Yes. Enterprise-grade conversational voice models are used."],
  ["Can appointments be booked automatically?","Yes. Calendar integrations and booking workflows are supported."],
  ["What happens after hours?","The AI receptionist remains active 24/7."],
  ["Can calls transfer to staff?","Yes. Intelligent escalation and routing are supported."],
  ["Which CRMs integrate?","HubSpot, Salesforce, GoHighLevel and custom integrations."],
  ["How fast is onboarding?","Most businesses can launch same day."],
  ["Can scripts be customized?","Yes. Full conversational control and workflow customization available."]
]

export default function ExpandedFAQ() {
  return (
    <section className="py-24 px-6 bg-zinc-950">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-5xl font-bold text-white mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {faqs.map(([q,a])=>(
            <div key={q} className="rounded-2xl border border-white/10 bg-black/40 p-8">
              <h3 className="text-white text-xl font-semibold mb-3">{q}</h3>
              <p className="text-zinc-400">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
