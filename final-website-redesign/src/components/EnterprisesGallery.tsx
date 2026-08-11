import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Crown, Sparkles, Layers } from 'lucide-react';
import { Enterprise, NavTab } from '../types';

import realtyLogo from '../../assets/images/sstcompany-realty.png';
import swiftClearLogo from '../../assets/images/sstcompany-swiftclear1.png';
import dynamicTreeLogo from '../../assets/images/2. Dynamic Tree.png';
import luxePrimeLogo from '../../assets/images/7. LOGO LUXE PRIME-png.png';
import altaVentureLogo from '../../assets/images/3. Alta Venture - Logo.png';
import alphaConsLogo from '../../assets/images/construction.png';
import prime88Logo from '../../assets/images/sstcompany-88prime11.png';

const LOGO_MAP: Record<string, string> = {
  'realty': realtyLogo,
  'swift-clear': swiftClearLogo,
  'dynamic-tree': dynamicTreeLogo,
  'luxe-prime': luxePrimeLogo,
  'alta-venture': altaVentureLogo,
  'construction': alphaConsLogo,
  '88-prime': prime88Logo,
};

// Card dark background themes matching the enterprise identities
const CARD_THEMES: Record<string, { bg: string; border: string; accent: string }> = {
  realty: {
    bg: 'bg-gradient-to-b from-[#242B3E] via-[#171D2B] to-[#0F131D]',
    border: 'border-[#E2B857]/50 hover:border-[#E2B857]',
    accent: 'text-[#E2B857]',
  },
  'swift-clear': {
    bg: 'bg-gradient-to-b from-[#1E3366] via-[#132349] to-[#0E1A36]',
    border: 'border-blue-400/50 hover:border-blue-400',
    accent: 'text-blue-400',
  },
  'dynamic-tree': {
    bg: 'bg-gradient-to-b from-[#342746] via-[#221A30] to-[#161020]',
    border: 'border-rose-400/50 hover:border-rose-400',
    accent: 'text-rose-400',
  },
  'luxe-prime': {
    bg: 'bg-gradient-to-b from-[#332A1E] via-[#221B13] to-[#15100B]',
    border: 'border-[#D4AF37]/50 hover:border-[#D4AF37]',
    accent: 'text-[#D4AF37]',
  },
  'alta-venture': {
    bg: 'bg-gradient-to-b from-[#223B4C] via-[#152835] to-[#0E1A23]',
    border: 'border-teal-400/50 hover:border-teal-400',
    accent: 'text-teal-400',
  },
  construction: {
    bg: 'bg-gradient-to-b from-[#382E1E] via-[#241D12] to-[#16120B]',
    border: 'border-amber-400/50 hover:border-amber-400',
    accent: 'text-amber-400',
  },
  '88-prime': {
    bg: 'bg-gradient-to-b from-[#223E50] via-[#152B38] to-[#0E1C25]',
    border: 'border-cyan-400/50 hover:border-cyan-400',
    accent: 'text-cyan-400',
  },
};

interface EnterprisesGalleryProps {
  enterprises: Enterprise[];
  onSelectEnterprise?: (enterprise: Enterprise) => void;
  onNavigate?: (tab: NavTab) => void;
}

export const EnterprisesGallery: React.FC<EnterprisesGalleryProps> = ({
  enterprises,
  onSelectEnterprise,
  onNavigate,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter out parent company to leave the 7 core enterprises
  const items = enterprises.filter((e) => e.id !== 'parent');

  const handleClick = (enterprise: Enterprise) => {
    if (onSelectEnterprise) {
      onSelectEnterprise(enterprise);
    } else if (onNavigate) {
      onNavigate('enterprises');
    }
  };

  return (
    <section className="relative py-12 sm:py-16 px-4 sm:px-8 lg:px-16 bg-[#030406] overflow-hidden border-y border-[#181C26]">
      
      {/* Deep Space Background Particle / Star Web Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(226,184,87,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.06),transparent_60%)] pointer-events-none" />
      
      {/* Dotted Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* Heraldic Conglomerate Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative flex flex-col items-center text-center space-y-3 max-w-2xl mx-auto py-2"
        >
          {/* Radial Gold Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.25)_0%,_transparent_75%)] blur-2xl pointer-events-none" />

          {/* Filigree Wing Line Dividers with Star Nodes */}
          <div className="flex items-center justify-center w-full gap-3 z-10">
            <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#1A1408] border border-[#D4AF37] rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#FFF3D1] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
              <span>CONGLOMERATE PORTFOLIO</span>
            </div>
            <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
          </div>

          {/* Main Title - Multi-Tone Metallic Typography */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-widest text-white uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] z-10">
            OUR{' '}
            <span className="bg-gradient-to-r from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              ENTERPRISES
            </span>
          </h2>
        </motion.div>

        {/* Horizontal Expandable Accordion Container - Squeezable Center Gallery */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-row items-center justify-center gap-2 sm:gap-2.5 md:gap-3 w-full h-40 sm:h-48 md:h-52 lg:h-56 my-2"
        >
          {items.map((item, idx) => {
            const isHovered = hoveredId === item.id;
            const logoSrc = LOGO_MAP[item.id];
            const theme = CARD_THEMES[item.id] || CARD_THEMES.realty;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileTap={{ scale: 0.97 }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleClick(item)}
                className={`
                  relative h-full transition-all duration-500 ease-in-out cursor-pointer rounded-xl sm:rounded-2xl overflow-hidden border shrink-0 sm:shrink
                  ${theme.bg} ${theme.border}
                  ${isHovered 
                    ? 'flex-[3.5] min-w-[180px] sm:min-w-[240px] md:min-w-[300px] lg:min-w-[360px] shadow-[0_0_25px_rgba(0,0,0,0.85)] border-opacity-100 ring-1 ring-white/20' 
                    : 'aspect-square h-full flex-none sm:flex-1 max-w-[110px] sm:max-w-[140px] opacity-85 hover:opacity-100'
                  }
                `}
              >
                {/* Glossy Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/40 pointer-events-none" />

                {/* CARD CONTENT - IMAGE ONLY */}
                <div className="relative z-10 h-full w-full p-3 sm:p-4 flex items-center justify-center">
                  {logoSrc ? (
                    <img 
                      src={logoSrc} 
                      alt={item.name}
                      className={`object-contain transition-all duration-500 ${
                        isHovered 
                          ? 'h-14 sm:h-18 md:h-22 max-w-[85%] filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] scale-105' 
                          : 'h-10 sm:h-12 md:h-14 max-w-[85%] filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]'
                      }`}
                    />
                  ) : (
                    <div className={`font-black text-xs sm:text-sm uppercase text-center ${theme.accent}`}>
                      {item.name}
                    </div>
                  )}
                </div>

              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};

