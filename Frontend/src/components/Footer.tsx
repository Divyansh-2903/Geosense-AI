import { motion } from "motion/react";

interface FooterProps {
  onScrollTo: (elementId: string) => void;
}

export default function Footer({ onScrollTo }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-[#010301] text-white w-full pt-24 pb-12 border-t border-white/5 relative z-30 font-sans">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16">
        
        {/* Top Grid Area with Left title and Right columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start mb-20">
          
          {/* Left Heading */}
          <div className="md:col-span-6">
            <h2 className="font-headline-sm text-3xl md:text-5xl font-black tracking-tight text-white leading-tight max-w-md">
              Experience the future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300 glow-text-emerald">precision.</span>
            </h2>
          </div>

          {/* Right links lists in clean aligned columns */}
          <div className="md:col-span-6 grid grid-cols-2 gap-8 md:justify-items-end">
            
            {/* Column 1 */}
            <div className="space-y-4 md:w-32">
              <a 
                onClick={() => onScrollTo("features")} 
                className="block text-sm font-semibold text-emerald-100/50 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Satellites
              </a>
              <a 
                onClick={() => onScrollTo("features")} 
                className="block text-sm font-semibold text-emerald-100/50 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Features
              </a>
              <a 
                onClick={() => onScrollTo("about")} 
                className="block text-sm font-semibold text-emerald-100/50 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Checklist
              </a>
              <a 
                href="#"
                className="block text-sm font-semibold text-emerald-100/50 hover:text-emerald-400 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                Changelog
              </a>
              <a 
                href="#"
                className="block text-sm font-semibold text-emerald-100/50 hover:text-emerald-400 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                Releases
              </a>
            </div>

            {/* Column 2 */}
            <div className="space-y-4 md:w-32">
              <a 
                href="#"
                className="block text-sm font-semibold text-emerald-100/50 hover:text-emerald-400 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                Blog
              </a>
              <a 
                onClick={() => onScrollTo("pricing")} 
                className="block text-sm font-semibold text-emerald-100/50 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Pricing
              </a>
              <a 
                onClick={() => onScrollTo("about")} 
                className="block text-sm font-semibold text-emerald-100/50 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Use Cases
              </a>
            </div>

          </div>
        </div>

        {/* Huge watermarked brand text */}
        <div className="text-center w-full select-none pointer-events-none mb-16 pb-12 overflow-hidden">
          <span className="font-display-lg text-[13vw] md:text-[14vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#0a2f14]/40 to-transparent tracking-tighter leading-[1] block py-6">
            GeoHarvest
          </span>
        </div>

        {/* Bottom standard trademark row */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-8 text-emerald-100/30 text-xs md:text-sm">
          {/* Logo brand label */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="font-display-lg text-lg font-bold text-white tracking-tight">
              GeoHarvest
            </span>
          </div>

          {/* Legal and about inline links */}
          <div className="flex flex-wrap items-center gap-6 md:gap-8 font-semibold text-emerald-100/50">
            <a 
              onClick={() => onScrollTo("about")} 
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              About GeoHarvest
            </a>
            <a 
              href="#" 
              onClick={(e) => e.preventDefault()}
              className="hover:text-emerald-400 transition-colors"
            >
              Privacy
            </a>
            <a 
              href="#" 
              onClick={(e) => e.preventDefault()}
              className="hover:text-emerald-400 transition-colors"
            >
              Terms
            </a>
          </div>
        </div>

        {/* Mini copyright row */}
        <div className="text-center md:text-left mt-6 pt-2 text-[11px] text-emerald-100/20">
          © {currentYear} GeoHarvest. Designed with absolute scientific precision.
        </div>

      </div>
    </footer>
  );
}
