import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MoveRight, Cloud, ShieldCheck, TrendingUp, Map, Laptop, Sparkles, AlertCircle } from "lucide-react";

export default function Features() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [techTab, setTechTab] = useState<"ndvi" | "ndwi" | "rgb">("ndvi");

  // Mock intelligence data for full-fidelity interactive feature demonstration
  const satelliteSimulationData = {
    ndvi: {
      title: "Crop Health Monitor",
      desc: "Checks how green and healthy your crop leaves are from space. Dark green shows excellent health, while light green or yellow signals crops need water, fertilizer, or pest management.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDU2p7m8d0Fq1Olr8vLwRYE567qr1h92cr1QJk4CSAjp-E95TLBEIOukyOIGteH_9xfUVbI081HKp9ilEfbGiyF9u2pGIRmYX8ShcmW30HnrQBXsCAgCtZb8nzk8rH7evrbLXl14soOxd9pmVi33HIsacbXMQPX87jDKH4_IA5ArkcYD0AgyHKEqrcI8mDWgQ-gBqgn0Im3g9a9Bq3-rv97MPEGYjplGjYOFO3qU9PvmqdKDTr4Vu2jHBIwy0o6VhmaIHjBuOXLQ1MZ",
      metrics: { cover: "86.2%", health: "Very Healthy", scale: "0.2 to 0.8" }
    },
    ndwi: {
      title: "Soil Moisture Tracker",
      desc: "Measures the water content inside the plants and soil. This serves as an early warning to tell you if your crops need irrigation before the leaves actually dry up and turn brown.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDU2p7m8d0Fq1Olr8vLwRYE567qr1h92cr1QJk4CSAjp-E95TLBEIOukyOIGteH_9xfUVbI081HKp9ilEfbGiyF9u2pGIRmYX8ShcmW30HnrQBXsCAgCtZb8nzk8rH7evrbLXl14soOxd9pmVi33HIsacbXMQPX87jDKH4_IA5ArkcYD0AgyHKEqrcI8mDWgQ-gBqgn0Im3g9a9Bq3-rv97MPEGYjplGjYOFO3qU9PvmqdKDTr4Vu2jHBIwy0o6VhmaIHjBuOXLQ1MZ", // Fallback to safe CDN URLs
      metrics: { cover: "71.4%", health: "Good Water Levels", scale: "-0.1 to 0.4" }
    },
    rgb: {
      title: "Real Color Satellite View",
      desc: "Shows your fields exactly as they look to the human eye from space, allowing you to visually verify planting rows, farm roads, and borders.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDU2p7m8d0Fq1Olr8vLwRYE567qr1h92cr1QJk4CSAjp-E95TLBEIOukyOIGteH_9xfUVbI081HKp9ilEfbGiyF9u2pGIRmYX8ShcmW30HnrQBXsCAgCtZb8nzk8rH7evrbLXl14soOxd9pmVi33HIsacbXMQPX87jDKH4_IA5ArkcYD0AgyHKEqrcI8mDWgQ-gBqgn0Im3g9a9Bq3-rv97MPEGYjplGjYOFO3qU9PvmqdKDTr4Vu2jHBIwy0o6VhmaIHjBuOXLQ1MZ",
      metrics: { cover: "100%", health: "Standard Photo", scale: "Normal Color" }
    }
  };

  return (
    <section
      id="features"
      className="py-24 bg-gradient-to-b from-[#020603] to-[#041006] rounded-t-[40px] md:rounded-t-[80px] -mt-12 relative z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/5"
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-[64px]">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="font-headline-md text-3xl md:text-5xl font-black text-white mb-4 leading-[1.1] tracking-tight">
            Precision Telemetry &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300 glow-text-emerald">Advanced Features</span>
          </h2>
          <p className="font-body-md text-base text-emerald-100/60 max-w-2xl mx-auto mt-4 leading-relaxed">
            Standout agricultural features designed to put you in control of your fields. 
            From smart mapping to seamless weather data fusion.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Boundary Input (Interactive) */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="md:col-span-1 glass-panel glass-panel-hover rounded-3xl p-8 shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6 shadow-md">
                <Map className="text-emerald-400 w-6 h-6" />
              </div>
              <h3 className="font-headline-sm text-2xl font-bold text-white mb-3 tracking-tight">Easy Boundary Mapping</h3>
              <p className="font-body-md text-sm text-emerald-100/70 mb-6 leading-relaxed">
                Draw your farm boundary on our Google Maps interface. It only takes a few clicks to map irregular shapes.
              </p>
            </div>
            
            {/* Interactive Drawing Sandbox */}
            <div className="relative h-48 bg-black/40 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-white/5 shadow-inner">
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
              
              <div className="relative w-full h-full flex flex-col items-center justify-center p-4 z-10">
                <motion.div
                  animate={{ 
                    scale: [1, 1.04, 1],
                    rotate: [0, 3, -3, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-xl bg-emerald-500/10 flex items-center justify-center border-2 border-dashed border-emerald-500/50 text-emerald-400 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                >
                  <Map className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <div className="text-xs text-white font-bold uppercase tracking-wider text-center">
                  Boundary Mapping Grid
                </div>
                <div className="text-[10px] text-emerald-300/60 font-semibold tracking-wide text-center mt-1 uppercase">
                  GeoJSON &amp; KML Imports Ready
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Large Highlight Card (Interactive) */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#0c3817] to-[#041c0b] rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(16,185,129,0.15)] relative overflow-hidden group border border-emerald-500/20 flex flex-col justify-between">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 h-full items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-3 py-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Top Intelligence</span>
                </div>
                <h3 className="font-headline-sm text-3xl font-black text-white leading-tight tracking-tight">
                  Satellite Field Scanner
                </h3>
                <p className="font-body-md text-sm text-emerald-100/70 leading-relaxed">
                  We monitor your crops from space using Sentinel satellites, identifying dry patches or low growth health instantly.
                </p>
                <button 
                  onClick={() => setActiveFeature("satellite-tech")}
                  className="bg-gradient-to-r from-emerald-400 to-lime-300 hover:from-emerald-300 hover:to-lime-200 text-black font-bold text-xs uppercase px-6 py-3 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                >
                  <span>Explore Command Center</span>
                  <MoveRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
              
              <div className="relative h-full min-h-[220px] rounded-2xl overflow-hidden border border-white/5">
                <img
                  alt="Satellite Extraction crop heat-map visualization"
                  className="absolute right-0 bottom-0 w-full h-[120%] object-cover rounded-tl-3xl shadow-2xl transform translate-y-8 group-hover:translate-y-4 transition-transform duration-500 hover:scale-102"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU2p7m8d0Fq1Olr8vLwRYE567qr1h92cr1QJk4CSAjp-E95TLBEIOukyOIGteH_9xfUVbI081HKp9ilEfbGiyF9u2pGIRmYX8ShcmW30HnrQBXsCAgCtZb8nzk8rH7evrbLXl14soOxd9pmVi33HIsacbXMQPX87jDKH4_IA5ArkcYD0AgyHKEqrcI8mDWgQ-gBqgn0Im3g9a9Bq3-rv97MPEGYjplGjYOFO3qU9PvmqdKDTr4Vu2jHBIwy0o6VhmaIHjBuOXLQ1MZ"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row of Small Cards */}
          {/* Card 3: Weather Data Fusion */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="glass-panel glass-panel-hover rounded-3xl p-8 shadow-2xl"
          >
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6 shadow-md">
              <Cloud className="text-emerald-400 w-6 h-6" />
            </div>
            <h3 className="font-headline-sm text-xl font-bold text-white mb-3 tracking-tight">Weather Forecast</h3>
            <p className="font-body-md text-sm text-emerald-100/70 leading-relaxed">
              Get hyper-local rain alerts and temperature forecasts to plan your irrigation and sowing days.
            </p>
          </motion.div>

          {/* Card 4: Data Protection */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="glass-panel glass-panel-hover rounded-3xl p-8 shadow-2xl"
          >
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6 shadow-md">
              <ShieldCheck className="text-emerald-400 w-6 h-6" />
            </div>
            <h3 className="font-headline-sm text-xl font-bold text-white mb-3 tracking-tight">Data Protection</h3>
            <p className="font-body-md text-sm text-emerald-100/70 leading-relaxed">
              Your proprietary farm data is kept secure, private, and used responsibly with end-to-end encryption.
            </p>
          </motion.div>

          {/* Card 5: Yield Prediction */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="glass-panel glass-panel-hover rounded-3xl p-8 shadow-2xl"
          >
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6 shadow-md">
              <TrendingUp className="text-emerald-400 w-6 h-6" />
            </div>
            <h3 className="font-headline-sm text-xl font-bold text-white mb-3 tracking-tight">Smart Yield Estimation</h3>
            <p className="font-body-md text-sm text-emerald-100/70 leading-relaxed">
              Our AI models analyze weather, greenness indices, and soil health to estimate your crop yield values.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Satellite Feature interactive overlay modal to provide stellar developer craftsmanship */}
      <AnimatePresence>
        {activeFeature === "satellite-tech" && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#041006] max-w-3xl w-[calc(100%-16px)] sm:w-full rounded-[24px] sm:rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.25)] relative mx-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveFeature(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg cursor-pointer transition-colors z-10"
              >
                ✕
              </button>

              <div className="p-5 sm:p-8">
                <div className="flex items-center space-x-2 text-emerald-400 mb-3 sm:mb-4">
                  <Laptop className="w-5 h-5 flex-shrink-0" />
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold font-mono">
                    Satellite Telemetry Command Simulator
                  </span>
                </div>

                <h3 className="font-headline-md text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                  {satelliteSimulationData[techTab].title}
                </h3>
                <p className="font-body-md text-xs sm:text-sm text-emerald-100/70 mb-5 sm:mb-6 leading-relaxed">
                  {satelliteSimulationData[techTab].desc}
                </p>

                <div className="flex border-b border-white/10 pb-px mb-5 sm:mb-6 gap-4 sm:gap-6 overflow-x-auto scrollbar-none">
                  {([
                    { id: "ndvi", label: "Crop Health" },
                    { id: "ndwi", label: "Soil Water" },
                    { id: "rgb", label: "Normal Photo" }
                  ] as const).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTechTab(tab.id)}
                      className={`pb-3 text-xs font-bold uppercase tracking-wider relative cursor-pointer transition-colors flex-shrink-0 ${
                        techTab === tab.id ? "text-emerald-400 font-extrabold" : "text-white/40 hover:text-white"
                      }`}
                    >
                      {tab.label}
                      {techTab === tab.id && (
                        <motion.div
                          layoutId="activeTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* View simulation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-white/10 shadow-2xl">
                    <img
                      src={satelliteSimulationData[techTab].image}
                      alt={techTab}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/80 border border-white/10 text-emerald-400 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      L2A Satellite Feed
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3 shadow-inner">
                    <div className="text-[10px] font-bold text-white uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      Ground Analytics
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-100/50">Vegetation Cover:</span>
                      <span className="font-bold text-white">{satelliteSimulationData[techTab].metrics.cover}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-100/50">Field Status:</span>
                      <span className="font-bold text-emerald-400">{satelliteSimulationData[techTab].metrics.health}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-100/50">Index Type:</span>
                      <span className="font-bold text-lime-300 font-mono">{satelliteSimulationData[techTab].metrics.scale}</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/5 flex gap-2 text-[10px] text-emerald-100/40 items-start leading-relaxed">
                      <AlertCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        Calculated using European Space Agency satellite data.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 flex justify-end">
                  <button
                    onClick={() => setActiveFeature(null)}
                    className="bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase px-6 py-3 rounded-full border border-white/10 transition-all cursor-pointer"
                  >
                    Close Explorer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
