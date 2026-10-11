import React from 'react';
import { motion } from 'motion/react';
import { Building2, Check, Award, Shield, Globe, Briefcase, Compass } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { RichText } from '../RichText';

interface AboutUsSectionProps {
  onNavigateToEnterprises?: () => void;
}

interface Pillar { title?: string; desc?: string }

const PILLAR_ICONS = [Building2, Briefcase, Shield, Globe];

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({
  onNavigateToEnterprises
}) => {
  /* Admin-editable copy: content page 'about' (src/data/contentSchema.js); defaults = original copy. */
  const { content } = useContent('about');
  const pillars = content.about_pillars as Pillar[];
  const highlights = (content.ceo_highlights as string[]).filter((h) => h.trim() !== '');

  return (
    <section id="about-us" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden">
      
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#D4AF37]/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16 relative">
        
        {/* SECTION HEADER - Executive Conglomerate Heritage Heraldic Frame */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="relative flex flex-col items-center text-center space-y-4 max-w-4xl mx-auto py-6 px-6"
        >
          {/* Radial Gold Ambient Backdrop Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.22)_0%,_transparent_75%)] pointer-events-none" />

          {/* Filigree Wing Line Dividers with Gold Diamond Stars */}
          <div className="flex items-center justify-center w-full max-w-xl gap-3 z-10">
            <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#1A1408] border border-[#D4AF37] rounded-full text-xs font-mono font-bold tracking-[0.25em] text-[#FFF3D1] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
              <span>CONGLOMERATE OVERVIEW</span>
            </div>
            <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
          </div>

          {/* Main Title - Metallic Gold Multi-Tone Gradient */}
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase leading-tight font-sans z-10">
            Alpha Premier Group{' '}
            <span className="bg-gradient-to-r from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]">
              of Companies
            </span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed max-w-3xl z-10 pt-1">
            {content.about_intro as string}
          </p>
        </motion.div>

        {/* MAIN ABOUT US CONTENT GRID: Division Pillars + CEO Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Core Business Pillars (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#D4AF37]" />
                  CORE CONGLOMERATE PILLARS
                </span>
                <span className="text-xs text-neutral-400 font-mono font-semibold">{content.pillars_label as string}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {pillars.map((p, i) => {
                  const Icon = PILLAR_ICONS[i % PILLAR_ICONS.length];
                  return (
                  <div key={i} className="p-5 bg-[#120E05]/95 border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-2xl transition-all duration-300 shadow-xl flex flex-col justify-between group hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-xs font-mono font-bold text-neutral-400 uppercase">PILLAR {String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight group-hover:text-[#D4AF37] transition-colors leading-snug">
                        {p.title}
                      </h3>
                      <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                        <RichText text={p.desc} strongClassName="text-white font-semibold" />
                      </p>
                    </div>
                    <div className="w-full h-0.5 bg-[#D4AF37]/30 group-hover:bg-[#D4AF37] transition-colors rounded-full mt-4" />
                  </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Executive Leadership Card (5 Cols) */}
          <div className="lg:col-span-5 bg-[#120E05]/95 border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
            
            {/* Top Badge */}
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                EXECUTIVE LEADERSHIP
              </span>
            </div>

            {/* CEO Profile Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-2xl bg-black relative z-10">
                  <img 
                    src={content.ceo_photo as string}
                    alt={content.ceo_name as string}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                {/* Decorative Frame Blur */}
                <div className="absolute inset-0 bg-[#D4AF37]/20 blur-xl rounded-2xl pointer-events-none" />
              </div>

              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight leading-snug font-sans">
                  {content.ceo_name as string}
                </h3>
                <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                  {content.ceo_title as string}
                </p>
                <div className="pt-2">
                  <span className="inline-block text-xs text-neutral-300 bg-black/60 border border-neutral-800 px-3 py-1 rounded-full">
                    {content.ceo_company as string}
                  </span>
                </div>
              </div>
            </div>

            {/* CEO Quote & Mandate */}
            <div className="p-4 bg-black/60 border border-[#D4AF37]/30 rounded-2xl space-y-2 relative">
              <p className="text-sm text-neutral-200 italic leading-relaxed font-normal">
                {content.ceo_statement as string}
              </p>
            </div>

            {/* Executive Pillars List */}
            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300 pt-1">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>


    </section>
  );
};
