import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Sprout, Droplets, ShieldAlert, Check } from "lucide-react";

interface ZoneData {
  name: string;
  ndvi: number;
  vigor: number;
  moisture: number;
  stress: number;
  statusText: string;
  insights: string[];
}

export default function CropHealthDashboard() {
  const [selectedZone, setSelectedZone] = useState<string>("Zone A");

  const zones: Record<string, ZoneData> = {
    "Zone A": {
      name: "Zone A - North Field (Corn)",
      ndvi: 0.82,
      vigor: 85,
      moisture: 62,
      stress: 12,
      statusText: "Very Healthy",
      insights: [
        "Crop growth is at its maximum height and strength in Zone A",
        "Leaves look highly green, indicating excellent plant health",
        "Crops are absorbing soil nutrients properly"
      ]
    },
    "Zone B": {
      name: "Zone B - South Field (Soybean)",
      ndvi: 0.58,
      vigor: 60,
      moisture: 45,
      stress: 28,
      statusText: "Needs Water Soon",
      insights: [
        "Soil water levels are moderate, monitor closely",
        "Plants show early signs of needing water",
        "Watering is recommended within the next 36 hours"
      ]
    },
    "Zone C": {
      name: "Zone C - West Field (Wheat)",
      ndvi: 0.74,
      vigor: 76,
      moisture: 58,
      stress: 18,
      statusText: "Steady Growth",
      insights: [
        "Growth is steady and healthy across the western section",
        "Foliage and leaves are expanding well",
        "No major dry spots or pest attacks spotted by satellite"
      ]
    }
  };

  const current = zones[selectedZone];

  // Calculate rotation for fake donut outline chart based on NDVI (0 to 1 scaling -> degree rotation)
  // Max NDVI is 1.0, represented by a 180deg filled curve
  const fillRotation = (current.ndvi / 1.0) * 180 - 135; // centered adjusted rotation

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-[#041006] to-[#020603] border-t border-white/5 relative z-30">
      <div className="max-w-[1280px] mx-auto px-5 md:px-[64px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Card Graphic Side (Interactive Farm Console Preview) */}
          <div className="glass-panel rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 md:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
            
            {/* Ambient highlight in backdrop */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h4 className="font-label-md text-xs font-bold text-emerald-400 tracking-widest uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Live Field Console
                </h4>
                <p className="text-xs text-white/50 font-mono mt-1 font-semibold tracking-wide uppercase">{current.name}</p>
              </div>

              {/* Zone selectors */}
              <div className="flex gap-1 bg-white/5 border border-white/5 rounded-xl p-1 text-[11px] font-bold shadow-inner flex-wrap">
                {Object.keys(zones).map((z) => (
                  <button
                    key={z}
                    onClick={() => setSelectedZone(z)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedZone === z 
                        ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] font-extrabold scale-102" 
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>

            {/* Faux Donut Chart */}
            <div className="relative w-64 h-32 mx-auto overflow-hidden mb-8">
              {/* Outer stroke path (grey static background track) */}
              <div className="absolute top-0 left-0 w-64 h-64 rounded-full border-[24px] border-white/5"></div>
              
              {/* Outer active colored filled rotation */}
              <motion.div
                animate={{ rotate: fillRotation }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute top-0 left-0 w-64 h-64 rounded-full border-[24px] border-emerald-400 border-b-transparent border-l-transparent"
              ></motion.div>

              {/* Central text display */}
              <div className="absolute bottom-0 left-0 w-full text-center pb-2">
                <motion.span 
                  key={current.ndvi}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display-lg text-white block leading-none font-black text-4xl glow-text-emerald"
                >
                  {current.ndvi.toFixed(2)}
                </motion.span>
                <span className="font-label-md text-emerald-300 text-[10px] font-bold uppercase tracking-wider block mt-1">
                  {current.statusText}
                </span>
              </div>
            </div>

            {/* Tri-metrics Dashboard Footer */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-white/5 pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1.5 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  <Sprout className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="font-label-md text-xs text-white/50 font-bold uppercase tracking-wider">
                    Vigor
                  </span>
                </div>
                <motion.span 
                  key={current.vigor}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-display-lg text-2xl font-bold text-white mt-1 block"
                >
                  {current.vigor}%
                </motion.span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1.5 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]"></span>
                  <Droplets className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="font-label-md text-xs text-white/50 font-bold uppercase tracking-wider">
                    Moisture
                  </span>
                </div>
                <motion.span
                  key={current.moisture}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-display-lg text-2xl font-bold text-white mt-1 block"
                >
                  {current.moisture}%
                </motion.span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1.5 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                  <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="font-label-md text-xs text-white/50 font-bold uppercase tracking-wider">
                    Stress
                  </span>
                </div>
                <motion.span
                  key={current.stress}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-display-lg text-2xl font-bold text-white mt-1 block"
                >
                  {current.stress}%
                </motion.span>
              </div>
            </div>
          </div>

          {/* Text Content and Dynamic Checklist list */}
          <div className="space-y-6">
            <h2 className="font-headline-md text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
              Monitoring Field Health <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300 glow-text-emerald">Made Simple</span>
            </h2>
            <p className="font-body-lg text-emerald-100/70 leading-relaxed">
              Your overall field health is rated at <span className="font-bold text-white">{current.ndvi.toFixed(2)}</span>, showing stable growing patterns. Switch between zones to see specific updates for each field.
            </p>

            {/* Checklist panel */}
            <div className="space-y-4">
              {current.insights.map((insight, idx) => {
                const colors = [
                  "bg-emerald-500",
                  "bg-lime-400",
                  "bg-amber-500"
                ];
                return (
                  <motion.div
                    key={insight}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center p-5 bg-white/[0.02] border border-white/5 rounded-2xl shadow-lg group hover:border-emerald-500/30 transition-all cursor-pointer"
                  >
                    <div className={`w-1 h-6 ${colors[idx % colors.length]} rounded-full mr-4 flex-shrink-0`}></div>
                    <span className="font-body-md text-sm text-white/80 group-hover:text-white transition-colors flex-grow">
                      {insight}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
