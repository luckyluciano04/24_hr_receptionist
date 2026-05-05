export default function TrustBar() {
  const items = [
    "24/7 AI Coverage",
    "Instant Lead Capture",
    "Missed Call Recovery",
    "CRM Integration",
    "Appointment Booking",
    "Enterprise Routing"
  ]

  return (
    <section className="border-y border-white/10 bg-black py-6 overflow-hidden">
      <div className="flex gap-10 animate-pulse whitespace-normal sm:whitespace-nowrap text-sm text-zinc-300 px-4 sm:px-6">
        {items.concat(items).map((item, i) => (
          <div key={i} className="font-medium tracking-wide">
            ✓ {item}
          </div>
        ))}
      </div>
    </section>
  )
}
