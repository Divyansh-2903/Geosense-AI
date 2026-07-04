import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, ArrowRight } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQProps {
  onScrollTo: (elementId: string) => void;
}

export default function FAQ({ onScrollTo }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      q: "What data does the app use to track my farm?",
      a: "We use high-quality satellite images from space, combined with local weather stations and rain forecasts, to check your crops. You do not need to install any hardware or sensors on your farm."
    },
    {
      q: "How accurate is the crop growth and yield estimation?",
      a: "By tracking plant greenness, soil water history, and temperature changes over the season, our smart AI system estimates your crop growth and final harvest value with high accuracy."
    },
    {
      q: "Can I print or share my farm reports?",
      a: "Yes! You can download clear PDF reports showing your field boundaries, soil health, crop growth, and water needs. These are perfect to share with banks for crop loans or agricultural advisors."
    },
    {
      q: "What support do I get during sowing or harvest?",
      a: "All users have access to our 24/7 AI Farming Assistant to ask questions about fertilizer plans, watering, or pests. Premium plans also receive phone support to talk directly to farming advisors."
    }
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-[#041006] to-[#020603] border-t border-white/5 relative z-30">
      <div className="max-w-[1280px] mx-auto px-5 md:px-[64px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column Text details */}
          <div className="lg:col-span-4 flex flex-col justify-start space-y-6">
            <h2 className="font-headline-md text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tight">
              Frequently Asked <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300 glow-text-emerald">Questions</span>
            </h2>
            <p className="font-body-md text-sm text-emerald-100/70 leading-relaxed max-w-sm">
              Have questions about data accuracy, integration, or custom support? We've got you covered.
            </p>
            <button
              onClick={() => onScrollTo("pricing")}
              className="bg-gradient-to-r from-emerald-400 to-lime-300 hover:from-emerald-300 hover:to-lime-200 text-black font-bold text-xs uppercase px-6 py-3.5 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center group w-max cursor-pointer transition-colors"
            >
              Book a Demo
              <span className="ml-2 bg-black text-emerald-400 rounded-full p-1 leading-none flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </button>
          </div>

          {/* Right Column Accordions with smooth animations */}
          <div className="lg:col-span-8 space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="glass-panel rounded-2xl overflow-hidden border border-white/5 transition-all hover:border-emerald-500/20"
                >
                  <button
                    onClick={() => handleToggle(idx)}
                    className="w-full text-left p-6 flex justify-between items-center transition-colors hover:bg-white/[0.02] cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <h4 className="font-headline-sm text-base md:text-lg font-bold text-white flex-grow pr-4">
                      {faq.q}
                    </h4>
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 transition-transform">
                      {isOpen ? (
                        <Minus className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                      ) : (
                        <Plus className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 pt-2 text-sm leading-relaxed text-emerald-100/70 max-w-3xl border-t border-white/5 font-medium">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
