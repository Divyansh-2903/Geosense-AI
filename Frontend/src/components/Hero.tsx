import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  ArrowRight, 
  Tractor, 
  Leaf, 
  Layers, 
  Bot, 
  Sprout, 
  TrendingUp, 
  Cloud, 
  ChevronDown 
} from "lucide-react";

const FieldScene = lazy(() => import("./3d/FieldScene"));

const SceneFallback = () => (
  <div className="absolute inset-0 z-0 flex items-center justify-center bg-radial-gradient">
    <div className="w-[400px] h-[400px] rounded-full border border-white/5 animate-pulse flex items-center justify-center">
      <div className="w-[300px] h-[300px] rounded-full border border-dashed border-[#cff068]/20 flex items-center justify-center">
        <div className="w-[100px] h-[100px] bg-gradient-to-tr from-[#1a3c22] to-[#cff068] opacity-20 blur-md rounded-full" />
      </div>
    </div>
  </div>
);

interface HeroProps {
  onScrollTo: (elementId: string) => void;
}

export default function Hero({ onScrollTo }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [webGLSupported, setWebGLSupported] = useState(true);

  // 1. Detect WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const supported = !!(
        window.WebGLRenderingContext && 
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setWebGLSupported(supported);
    } catch {
      setWebGLSupported(false);
    }
  }, []);

  const [isMobile, setIsMobile] = useState(false);

  // 1. Detect WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const supported = !!(
        window.WebGLRenderingContext && 
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setWebGLSupported(supported);
    } catch {
      setWebGLSupported(false);
    }
  }, []);

  // 1.5. Detect mobile viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Track scroll position inside the hero container (0.0 to 2.0)
  useEffect(() => {
    if (isMobile) return;
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = -rect.top;
      const viewportHeight = window.innerHeight;
      const totalScrollHeight = rect.height - viewportHeight;

      if (totalScrollHeight > 0) {
        // Map scrolling through 3 viewports (0 to 2 progress)
        const progress = Math.max(0, Math.min(2, (scrollTop / totalScrollHeight) * 2));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger initial run
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  // Calculate opacity levels for text/card overlays per chapter
  // Chapter 1 (Orbit): Fully visible at 0, fades out by 0.5
  const ch1Opacity = isMobile ? 1 : Math.max(0, 1 - scrollProgress * 2.2);
  // Chapter 2 (Field): Fully visible at 1, fades out by 0.5 & 1.5
  const ch2Opacity = isMobile ? 1 : Math.max(0, 1 - Math.abs(scrollProgress - 1) * 2.2);
  // Chapter 3 (Soil): Fully visible at 2, fades out by 1.5
  const ch3Opacity = isMobile ? 1 : Math.max(0, 1 - (2 - scrollProgress) * 2.2);

  // Auto-scroll utility between chapters
  const scrollToChapter = (chapterIndex: number) => {
    if (!containerRef.current) return;
    const viewportHeight = window.innerHeight;
    window.scrollTo({
      top: containerRef.current.offsetTop + (chapterIndex * viewportHeight),
      behavior: "smooth"
    });
  };

  if (isMobile) {
    return (
      <section className="relative bg-[#020603] px-5 py-24 space-y-20 selection:bg-emerald-400 selection:text-black">
        {/* Soft radial atmospheric glows */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-[40%] left-1/3 w-[250px] h-[250px] bg-lime-400/5 blur-[80px] rounded-full pointer-events-none" />
        
        {/* CHAPTER 1: SPACE ORBIT */}
        <div className="flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-md">
            <Sparkles className="text-emerald-400 w-4 h-4" />
            <span className="text-[10px] font-bold text-emerald-300 tracking-wider uppercase">
              Smart Space Satellite Farming
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-6 leading-tight tracking-tight">
            Grow More With{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-300 glow-text-emerald">
              Satellite Analytics
            </span>
          </h1>

          <p className="text-sm text-emerald-100/70 mb-8 leading-relaxed">
            Monitor crop health from space, track soil moisture levels, and get custom watering recommendations—all in one simple app.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => onScrollTo("pricing")}
              className="w-full bg-gradient-to-r from-emerald-400 to-lime-300 text-black text-xs font-bold px-6 py-4 rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              Try It Free
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <button
              onClick={() => onScrollTo("features")}
              className="w-full bg-white/5 text-white text-xs font-bold px-6 py-4 rounded-full flex items-center justify-center gap-2 cursor-pointer border border-white/10"
            >
              See Field Scan
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* CHAPTER 2: GROUND SCANNING */}
        <div className="flex flex-col gap-8 max-w-lg mx-auto text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              <Leaf className="text-emerald-400 w-4.5 h-4.5" />
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Crop Diagnostics</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Live Satellite <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300 glow-text-emerald">Crop Health Scan</span>
            </h2>
            
            <p className="text-emerald-100/70 text-xs sm:text-sm leading-relaxed">
              Our satellite scans your fields from space weekly, measuring plant greenness to spot diseases, nutrient loss, or dry patches before they become visible to the eye.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {/* Card 1: Crop Health */}
            <div className="glass-panel rounded-2xl p-5 shadow-lg w-full text-left">
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-4.5 h-4.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Crop Health</span>
              </div>
              <p className="text-3xl font-extrabold text-white">94%</p>
              <p className="text-[10px] text-emerald-400 font-bold">Good Greenness</p>
              
              <div className="border-t border-white/5 mt-3 pt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-white/70">Diseases: None Detected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-white/70">Growth Status: Optimal</span>
                </div>
              </div>
            </div>

            {/* Card 2: Yield Forecast */}
            <div className="glass-panel rounded-2xl p-5 shadow-lg w-full text-left overflow-hidden relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Yield Value</span>
                </div>
                <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded font-extrabold">+16.4%</span>
              </div>
              
              <p className="text-3xl font-extrabold text-white">₹1,20,000</p>
              <p className="text-[9px] text-white/40 font-semibold uppercase tracking-wider">Projected value / acre</p>

              <div className="h-10 w-full mt-3">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path d="M0 40 L0 30 Q 15 15, 30 25 T 60 10 T 80 18 T 100 5 L100 40 Z" fill="rgba(16,185,129,0.15)" />
                  <path d="M0 30 Q 15 15, 30 25 T 60 10 T 80 18 T 100 5" fill="none" stroke="#10b981" strokeWidth="2.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* CHAPTER 3: UNDERGROUND SOIL & WEATHER */}
        <div className="flex flex-col gap-8 max-w-lg mx-auto text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
              <Sprout className="text-amber-400 w-4.5 h-4.5" />
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Soil &amp; Water</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Soil Moisture &amp; <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300 glow-text-emerald">Water Deficits</span>
            </h2>
            
            <p className="text-emerald-100/70 text-xs sm:text-sm leading-relaxed">
              Track root-level soil water. We calculate evaporation and moisture metrics to tell you exactly how much water your fields need and when to irrigate.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {/* Card 3: Soil Moisture */}
            <div className="glass-panel rounded-2xl p-5 shadow-lg w-full text-left">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4.5 h-4.5 text-emerald-400" />
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Soil Moisture</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400">Adequate</span>
              </div>
              <p className="text-3xl font-extrabold text-white">78%</p>
              
              <div className="flex items-end justify-between gap-1 h-8 mt-3">
                {[35, 65, 80, 50, 95, 75].map((val, i) => (
                  <div key={i} className="w-full bg-white/5 rounded-t h-full flex flex-col justify-end">
                    <div style={{ height: `${val}%` }} className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t w-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: Weather & Evaporation */}
            <div className="glass-panel rounded-2xl p-5 shadow-lg w-full text-left">
              <div className="flex items-center gap-2 mb-3">
                <Cloud className="w-4.5 h-4.5 text-blue-400" />
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Weather</span>
              </div>
              <p className="text-3xl font-extrabold text-white">28°C</p>
              <p className="text-[10px] text-blue-400 font-bold">Expected rain: in 3 days</p>

              <div className="border-t border-white/5 mt-3 pt-3">
                <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Water Advice</p>
                <p className="text-xs font-bold text-[#cff068]">Need: Apply 12,000 Litres</p>
              </div>
            </div>
          </div>
        </div>

        {/* TRUSTED LOGO STRIP */}
        <div className="border-t border-white/10 pt-10 text-center">
          <p className="text-[9px] font-bold text-emerald-400/50 mb-6 uppercase tracking-[0.2em]">
            Trusted By Innovative Farms &amp; Enterprises
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 opacity-80 text-white">
            {[
              { name: "AgriCrop", icon: Tractor },
              { name: "GreenYield", icon: Leaf },
              { name: "SofTech", icon: Layers },
              { name: "PlaniAI", icon: Bot },
              { name: "HarvestG", icon: Sprout },
            ].map((logo, idx) => (
              <div key={idx} className="flex items-center gap-1.5 border border-white/8 py-1 px-3 rounded-lg bg-white/[0.01]">
                <logo.icon className="text-emerald-400 w-4 h-4" />
                <span className="text-xs font-bold text-white/70">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={containerRef} 
      className="relative h-[300vh] bg-[#020603] overflow-visible selection:bg-emerald-400 selection:text-black"
    >
      {/* ── STICKY VIEWPORT CONTAINER FOR 3D CANVAS ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden z-0">
        {/* Deep background gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#041a0b] via-[#020703] to-[#010301] z-0" />
        
        {/* Soft radial atmospheric glows */}
        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-[20%] left-1/3 w-[300px] h-[300px] bg-lime-400/5 blur-[100px] rounded-full pointer-events-none z-0" />

        {/* 3D Scene Background / Fallback */}
        {webGLSupported ? (
          <Suspense fallback={<SceneFallback />}>
            <FieldScene scrollProgress={scrollProgress} />
          </Suspense>
        ) : (
          <SceneFallback />
        )}

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020603]/95 via-transparent to-transparent pointer-events-none md:w-1/2 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020603] via-transparent to-transparent pointer-events-none h-44 bottom-0 z-10" />
      </div>

      {/* ── NARRATIVE CONTENT OVERLAYS ── */}
      <div className="absolute inset-0 z-20 flex flex-col pointer-events-none">
        
        {/* CHAPTER 1: SPACE ORBIT (PLANETARY PRECISION) */}
        <div 
          style={{ opacity: ch1Opacity, pointerEvents: ch1Opacity > 0.1 ? "auto" : "none" }}
          className="h-screen w-full flex flex-col justify-center items-center px-5 md:px-16 text-center transition-all duration-150 ease-out"
        >
          <div className="max-w-[1280px] mx-auto flex flex-col items-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-md"
            >
              <Sparkles className="text-emerald-400 w-4 h-4 animate-pulse" />
              <span className="text-xs font-bold text-emerald-300 tracking-wider uppercase">
                Smart Space Satellite Farming
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-[72px] font-black text-white mb-6 max-w-4xl leading-[1.05] tracking-tight">
              Grow More With{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-300 glow-text-emerald">
                Satellite Analytics
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-emerald-100/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Monitor crop health from space, track soil moisture levels, and get custom watering recommendations—all in one simple app.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => onScrollTo("pricing")}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-400 to-lime-300 hover:from-emerald-300 hover:to-lime-200 text-black text-sm font-bold px-8 py-4 rounded-full transition-all flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95"
              >
                Try It Free
                <span className="bg-black text-emerald-400 rounded-full w-6 h-6 flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </button>
              <button
                onClick={() => scrollToChapter(1)}
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white text-sm font-bold px-8 py-4 rounded-full transition-all flex items-center justify-center gap-3 cursor-pointer border border-white/10 backdrop-blur-sm hover:scale-[1.02] active:scale-95"
              >
                See Field Scan
                <span className="bg-white/10 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </button>
            </div>

            {/* Downward Scroll Hint */}
            <button 
              onClick={() => scrollToChapter(1)}
              className="group flex flex-col items-center gap-2 text-white/40 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100/50">Scroll to Scan</span>
              <ChevronDown className="w-5 h-5 animate-bounce text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* CHAPTER 2: GROUND SCANNING (CROP HEALTH DIAGNOSTICS) */}
        <div 
          style={{ opacity: ch2Opacity, pointerEvents: ch2Opacity > 0.1 ? "auto" : "none" }}
          className="h-screen w-full flex flex-col justify-center px-6 md:px-20 transition-all duration-150 ease-out"
        >
          <div className="max-w-[1280px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Description Text */}
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1">
                <Leaf className="text-emerald-400 w-4.5 h-4.5" />
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Crop Diagnostics</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Live Satellite <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300 glow-text-emerald">Crop Health Scan</span>
              </h2>
              
              <p className="text-emerald-100/70 text-sm md:text-base leading-relaxed max-w-lg">
                Our satellite scans your fields from space weekly, measuring plant greenness to spot diseases, nutrient loss, or dry patches before they become visible to the eye.
              </p>

              <button 
                onClick={() => scrollToChapter(2)}
                className="inline-flex items-center gap-2 text-sm text-emerald-400 font-bold hover:underline cursor-pointer group"
              >
                Inspect Soil &amp; Water levels
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Dashboard Cards side */}
            <div className="relative flex flex-col sm:flex-row gap-5 items-center justify-center lg:justify-end">
              
              {/* Card 1: Crop Health */}
              <div className="glass-panel glass-panel-hover rounded-3xl p-6 shadow-2xl w-full sm:w-64 text-left">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <Leaf className="w-4.5 h-4.5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Crop Health</span>
                </div>
                <p className="text-4xl font-extrabold text-white tracking-tight">94%</p>
                <p className="text-xs text-emerald-400 font-bold mt-1">Good Greenness</p>
                
                <div className="border-t border-white/5 mt-4 pt-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] text-white/70">Diseases: None Detected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] text-white/70">Growth Status: Optimal</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Yield Forecast */}
              <div className="glass-panel glass-panel-hover rounded-3xl p-6 shadow-2xl w-full sm:w-64 text-left relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Yield Value</span>
                  </div>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded font-extrabold">+16.4%</span>
                </div>
                
                <div className="mb-4">
                  <p className="text-4xl font-extrabold text-white tracking-tight">₹1,20,000</p>
                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mt-0.5">Projected value / acre</p>
                </div>

                {/* SVG Chart */}
                <div className="h-12 w-full mt-3">
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="yieldChart" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 40 L0 30 Q 15 15, 30 25 T 60 10 T 80 18 T 100 5 L100 40 Z"
                      fill="url(#yieldChart)"
                    />
                    <path
                      d="M0 30 Q 15 15, 30 25 T 60 10 T 80 18 T 100 5"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* CHAPTER 3: UNDERGROUND SOIL & WEATHER ADVISORY */}
        <div 
          style={{ opacity: ch3Opacity, pointerEvents: ch3Opacity > 0.1 ? "auto" : "none" }}
          className="h-screen w-full flex flex-col justify-center px-6 md:px-20 transition-all duration-150 ease-out"
        >
          <div className="max-w-[1280px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Description Text */}
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3.5 py-1">
                <Sprout className="text-amber-400 w-4.5 h-4.5" />
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Soil &amp; Water</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Soil Moisture &amp; <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300 glow-text-emerald">Water Deficits</span>
              </h2>
              
              <p className="text-emerald-100/70 text-sm md:text-base leading-relaxed max-w-lg">
                Track root-level soil water. We calculate evaporation and moisture metrics to tell you exactly how much water your fields need and when to irrigate.
              </p>

              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => onScrollTo("pricing")}
                  className="bg-gradient-to-r from-emerald-400 to-lime-300 hover:from-emerald-300 hover:to-lime-200 text-black text-xs font-bold px-6 py-3.5 rounded-full transition-all cursor-pointer hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  Irrigate My Farm
                </button>
                <button 
                  onClick={() => onScrollTo("features")}
                  className="bg-white/5 hover:bg-white/10 text-white text-xs font-bold px-6 py-3.5 rounded-full border border-white/10 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  View Features
                </button>
              </div>
            </div>

            {/* Dashboard Cards side */}
            <div className="relative flex flex-col sm:flex-row gap-5 items-center justify-center lg:justify-end">
              
              {/* Card 3: Soil Moisture Index */}
              <div className="glass-panel glass-panel-hover rounded-3xl p-6 shadow-2xl w-full sm:w-64 text-left">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <Layers className="w-4.5 h-4.5 text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Soil Moisture</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">Adequate</span>
                </div>
                <p className="text-4xl font-extrabold text-white tracking-tight">78% <span className="text-white/40 text-xs font-normal">Moisture</span></p>
                
                {/* Micro Bar Chart */}
                <div className="flex items-end justify-between gap-1.5 h-12 pt-3">
                  {[35, 65, 80, 50, 95, 75].map((val, i) => (
                    <div key={i} className="w-full bg-white/5 rounded-t h-full flex flex-col justify-end">
                      <div 
                        style={{ height: `${val}%` }} 
                        className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 4: Weather & Evaporation */}
              <div className="glass-panel glass-panel-hover rounded-3xl p-6 shadow-2xl w-full sm:w-64 text-left">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                    <Cloud className="w-4.5 h-4.5 text-blue-400" />
                  </div>
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Weather</span>
                </div>
                <p className="text-4xl font-extrabold text-white tracking-tight">28°C</p>
                <p className="text-xs text-blue-400 font-bold mt-1">Expected rain: in 3 days</p>

                <div className="border-t border-white/5 mt-4 pt-4">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1.5">Water Advice</p>
                  <p className="text-xs font-bold text-[#cff068]">Need: Apply 12,000 Litres</p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* ── TRUSTED LOGO STRIP / FLOATING FOOTER ── */}
      <AnimatePresence>
        {scrollProgress > 1.7 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-0 left-0 w-full py-8 bg-[#020603]/90 backdrop-blur-md border-t border-white/10 z-50 pointer-events-auto shadow-[0_-8px_32px_0_rgba(0,0,0,0.5)]"
          >
            <div className="max-w-[1280px] mx-auto px-5 md:px-16 text-center">
              <p className="text-[10px] font-bold text-emerald-400/50 mb-4 uppercase tracking-[0.25em]">
                Trusted By Innovative Farms &amp; Enterprises
              </p>
              <div className="flex flex-wrap justify-center items-center gap-5 sm:gap-8 md:gap-12 opacity-80 hover:opacity-100 transition-opacity duration-300 text-white">
                {[
                  { name: "AgriCrop", icon: Tractor },
                  { name: "GreenYield", icon: Leaf },
                  { name: "SofTech", icon: Layers },
                  { name: "PlaniAI", icon: Bot },
                  { name: "HarvestG", icon: Sprout },
                ].map((logo, idx) => (
                  <div key={idx} className="flex items-center gap-2 border border-white/8 py-1.5 px-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] hover:border-emerald-500/30 transition-all cursor-pointer group">
                    <logo.icon className="text-emerald-400 group-hover:text-emerald-300 w-4.5 h-4.5 transition-colors" />
                    <span className="text-xs md:text-sm font-bold tracking-tight text-white/70 group-hover:text-white transition-colors">{logo.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
