import React from 'react';
import logoImg from '../assets/logo.png';
import heroSkylineImg from '../assets/images/hero_skyline.jpg';
import { ChevronDown } from 'lucide-react';

interface LandingHeroProps {
  onExplorePackages?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onExplorePackages,
}) => {
  return (
    <div className="relative w-full min-h-[90vh] lg:min-h-screen text-white flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pb-24 overflow-hidden">
      {/* Background layer: High-end monochrome corporate skyline with organic gradient dissolve */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[#070707]" />
        <img
          src={heroSkylineImg}
          alt="Philippine Stock Exchange Centre Ortigas Corporate Skyline"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-25 filter grayscale contrast-125 scale-105"
        />
        {/* Soft corporate vignette */}
        <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-[#070707]/20 via-[#070707]/65 to-[#070707]" />

        {/* Multi-stage seamless gradient fade that dissolves down into the next section (no straight line) */}
        <div 
          className="absolute bottom-0 inset-x-0 h-48 sm:h-72 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(7, 7, 7, 0.4) 30%, rgba(7, 7, 7, 0.85) 60%, rgba(18, 14, 5, 0.95) 85%, #080808 100%)'
          }}
        />
        {/* Soft bottom ambient glow reflecting upward */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-36 bg-gradient-to-t from-[#d4af37]/20 via-[#f7e7a9]/08 to-transparent rounded-full blur-[65px] pointer-events-none" />
      </div>

      {/* Main Center Stage: Official Logo & Monochrome Typography */}
      <div className="relative z-10 w-full max-w-4xl mx-auto text-center flex flex-col items-center justify-center my-auto py-4 sm:py-6">
        {/* Official Alpha Premier Logo with crisp dark drop shadow */}
        <div className="relative mb-4 sm:mb-8 group">
          <div className="absolute -inset-4 bg-black/10 blur-xl rounded-full opacity-60 pointer-events-none" />
          <img
            src={logoImg}
            alt="Alpha Premier Realty and Construction Services"
            className="relative w-64 sm:w-80 md:w-[440px] lg:w-[500px] max-w-[88vw] h-auto object-contain mx-auto drop-shadow-[0_16px_28px_rgba(0,0,0,0.45)] select-none"
          />
        </div>

        {/* Corporate Title & Subhead with Gold Accents & High Contrast */}
        <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto px-2">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 rounded-full bg-black/90 text-[#d4af37] border border-[#d4af37]/50 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-widest shadow-xl backdrop-blur-md">
            <span>Corporate Business Registration &bull; Pasig City</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] text-balance drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            Executive Virtual Office &amp; Enterprise Headquarters
          </h1>
          
          <p className="text-xs sm:text-sm font-semibold text-zinc-200 max-w-xl mx-auto leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            SEC, BIR RDO 043 &amp; Pasig LGU Compliant Virtual Office at Philippine Stock Exchange Centre, Tektite East Tower.
          </p>
        </div>
      </div>

      {/* Bottom Scroll Cue with Gold Accent */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center pt-2">
        <button
          onClick={onExplorePackages}
          className="px-6 py-2.5 rounded-full bg-black text-[#d4af37] border border-[#d4af37]/40 hover:border-[#d4af37] hover:bg-zinc-950 transition-all shadow-xl flex items-center gap-2 text-xs uppercase font-bold tracking-widest cursor-pointer group hover:scale-105"
        >
          <span>Virtual Office Packages</span>
          <ChevronDown className="w-4 h-4 text-[#d4af37] group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
