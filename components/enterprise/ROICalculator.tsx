"use client"

import { useState } from "react"

export default function ROICalculator() {
  const [calls, setCalls] = useState(50)

  const lost = calls * 0.35
  const revenue = Math.round(lost * 120)

  return (
    <section className="py-24 px-4 sm:px-6 bg-black">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
          Missed Call Revenue Calculator
        </h2>

        <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-10 max-w-full">
          <input
            type="range"
            min="10"
            max="500"
            value={calls}
            onChange={(e)=>setCalls(Number(e.target.value))}
            className="w-full"
          />

          <div className="mt-8 text-zinc-300 text-xl">
            Monthly inbound calls: <span className="text-white font-bold">{calls}</span>
          </div>

          <div className="mt-6 text-4xl sm:text-5xl lg:text-4xl sm:text-5xl lg:text-6xl font-black text-green-400">
            ${revenue.toLocaleString()}
          </div>

          <div className="mt-3 text-zinc-400">
            Estimated monthly revenue recoverable using AI call automation.
          </div>
        </div>
      </div>
    </section>
  )
}
