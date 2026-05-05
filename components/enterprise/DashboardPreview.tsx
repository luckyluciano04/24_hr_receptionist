export default function DashboardPreview() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-gradient-to-b from-black to-zinc-950">
      <div className="container-shell">
        <div className="mb-10">
          <h2 className="text-4xl sm:text-5xl lg:text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Operational Intelligence Dashboard
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Monitor calls, bookings, lead recovery, AI transcripts,
            customer sentiment, and conversion analytics in real time.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl p-8 shadow-2xl max-w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[
              ["Calls Answered","4,281"],
              ["Booked Appointments","312"],
              ["Recovered Leads","91"],
              ["Revenue Captured","$48,920"]
            ].map(([title,val]) => (
              <div key={title} className="rounded-2xl bg-black/40 p-6 border border-white/5">
                <div className="text-zinc-400 text-sm">{title}</div>
                <div className="text-3xl font-bold text-white mt-2">{val}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-black/40 border border-white/5 p-8 h-[320px] flex items-center justify-center text-zinc-500">
            Live Analytics + AI Call Timeline Visualization
          </div>
        </div>
      </div>
    </section>
  )
}
