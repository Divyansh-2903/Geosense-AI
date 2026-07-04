import { useState } from "react";
import { motion } from "motion/react";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");

  const plans = [
    {
      name: "Starter Plan",
      desc: "Perfect for single farmers wanting to monitor their plots from space.",
      monthlyPrice: 999,
      annualPrice: 899,
      popular: false,
      features: [
        "Map up to 5 fields",
        "Weekly satellite crop health scans",
        "Weather forecasts & Rain alerts",
        "WhatsApp / SMS support",
      ],
      ctaText: "Get started now",
    },
    {
      name: "Professional",
      desc: "Best for medium farms and cooperative growers needing daily updates.",
      monthlyPrice: 4999,
      annualPrice: 4499,
      popular: true,
      features: [
        "Map up to 50 fields",
        "Daily satellite crop scans",
        "Detailed soil water & moisture maps",
        "Priority support & Advisory",
      ],
      ctaText: "Get started now",
    },
    {
      name: "Enterprise",
      desc: "Custom packages for large farming cooperatives and agri-businesses.",
      monthlyPrice: 9999,
      annualPrice: 8999,
      popular: false,
      features: [
        "Unlimited fields",
        "Custom advisor accounts",
        "Yield estimation reports",
        "Dedicated phone support",
      ],
      ctaText: "Contact Sales",
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-[#020603] to-[#041006] border-t border-white/5 relative z-30">
      <div className="max-w-[1280px] mx-auto px-5 md:px-[64px]">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-headline-md text-3xl md:text-5xl font-black text-white mb-4 leading-[1.1] tracking-tight">
            Simple &amp; Transparent <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300 glow-text-emerald">Pricing Plans</span>
          </h2>
          <p className="font-body-md text-base text-emerald-100/60 mt-4 leading-relaxed">
            Choose the package tailored for farms of all sizes. Transparent billing, no hidden fees.
          </p>

          {/* Toggle Switch */}
          <div className="inline-flex items-center bg-white/5 border border-white/5 rounded-full p-1.5 mt-8 shadow-inner">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`font-label-md text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-full transition-all cursor-pointer ${
                billingPeriod === "monthly"
                  ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] font-extrabold"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annually")}
              className={`font-label-md text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                billingPeriod === "annually"
                  ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] font-extrabold"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <span>Annually</span>
              <span className="bg-black text-emerald-400 text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full">
                -10%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {plans.map((p) => {
            const currentPrice = billingPeriod === "monthly" ? p.monthlyPrice : p.annualPrice;
            
            return (
              <div
                key={p.name}
                className={`rounded-[32px] p-8 flex flex-col justify-between transition-all relative ${
                  p.popular
                    ? "bg-gradient-to-br from-[#0c3817] to-[#041c0b] border-2 border-emerald-400 shadow-[0_8px_32px_0_rgba(16,185,129,0.25)] md:-translate-y-4"
                    : "glass-panel glass-panel-hover"
                }`}
              >
                {/* Popular star badge glow */}
                {p.popular && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-2xl pointer-events-none"></div>
                )}

                <div>
                  <h3 className={`font-label-md text-xs font-bold mb-4 leading-none uppercase tracking-widest ${
                    p.popular ? "text-lime-300" : "text-emerald-400"
                  }`}>
                    {p.name}
                  </h3>

                  <div className="flex items-end mb-4">
                    <span className="font-display-lg text-4xl font-extrabold leading-none text-white tracking-tight">
                      ₹{currentPrice}
                    </span>
                    <span className="font-body-md text-sm ml-1.5 mb-1 text-white/50">
                      /month
                    </span>
                  </div>

                  <p className="font-body-md text-sm mb-8 min-h-[50px] leading-relaxed text-emerald-100/70">
                    {p.desc}
                  </p>
                </div>

                <div>
                  {/* Primary CTA button */}
                  <button
                    className={`w-full font-label-md text-xs font-bold uppercase tracking-wider py-4 rounded-full transition-all flex justify-center items-center group mb-8 cursor-pointer shadow-md ${
                      p.popular
                        ? "bg-gradient-to-r from-emerald-400 to-lime-300 hover:from-emerald-300 hover:to-lime-200 text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    }`}
                  >
                    {p.ctaText}
                    <span className={`ml-2 rounded-full p-0.5 leading-none flex items-center justify-center group-hover:translate-x-0.5 transition-transform ${
                      p.popular ? "bg-black text-emerald-400" : "bg-white/10 text-white"
                    }`}>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </span>
                  </button>

                  {/* Feature checklist */}
                  <ul className="space-y-4 font-body-md text-xs flex-grow">
                    {p.features.map((feature) => (
                      <li key={feature} className="flex items-start font-semibold">
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                          p.popular ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-white/70 border border-white/10"
                        }`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                        <span className="text-white/80">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
