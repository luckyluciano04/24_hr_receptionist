"use client"

import { useState } from "react"

export default function PricingUpgrade() {
  const [annual, setAnnual] = useState(false)

  const tiers = [
    {
      name:"Starter",
      monthly:97,
      annual:79,
      features:[
        "24/7 AI Receptionist",
        "Lead Capture",
        "SMS Follow-Up",
        "Basic Analytics"
      ]
    },
    {
      name:"Growth",
      monthly:197,
      annual:167,
      features:[
        "Everything in Starter",
        "CRM Integrations",
        "Appointment Booking",
        "Advanced Automation"
      ]
    },
    {
      name:"Enterprise",
      monthly:397,
      annual:347,
      features:[
        "Everything in Growth",
        "Multi-Location Routing",
        "Priority Support",
        "Custom AI Workflows"
      ]
    }
  ]

  return (
    <section className="py-24 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-5xl font-bold text-white">
              Pricing
            </h2>
            <p className="text-zinc-400 mt-3">
              Deploy AI receptionist infrastructure in minutes.
            </p>
          </div>

          <button
            onClick={()=>setAnnual(!annual)}
            className="border border-white/10 rounded-full px-5 py-2 text-white"
          >
            {annual ? "Annual Billing Active" : "Monthly Billing Active"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier)=>(
            <div key={tier.name} className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8">
              <h3 className="text-3xl font-bold text-white">{tier.name}</h3>

              <div className="mt-6 text-6xl font-black text-white">
                ${annual ? tier.annual : tier.monthly}
              </div>

              <div className="text-zinc-400 mt-2">
                per month
              </div>

              <div className="mt-8 space-y-4">
                {tier.features.map((f)=>(
                  <div key={f} className="text-zinc-300">
                    ✓ {f}
                  </div>
                ))}
              </div>

              <button className="mt-10 w-full rounded-2xl bg-white text-black font-bold py-4 hover:opacity-90 transition">
                Start Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
