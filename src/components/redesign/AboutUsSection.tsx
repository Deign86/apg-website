import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, ArrowRight, FileText, X, Check, Award, Shield, Users, Globe, Briefcase, Sparkles, ChevronRight, Compass, Crown } from 'lucide-react';
const aboutUsPic = '/assets/images/aboutuspic.png';

interface AboutUsSectionProps {
  onOpenInquire?: () => void;
  onNavigateToEnterprises?: () => void;
}

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({
  onOpenInquire,
  onNavigateToEnterprises
}) => {
  const [showFullStoryModal, setShowFullStoryModal] = useState<boolean>(false);

  const fullTextParagraphs = [
    {
      heading: 'Group Overview',
      content: 'Alpha Premier Group of Companies is a diversified Philippine-based business group serving as the parent organization of several companies operating across real estate, business support, construction, and professional services. With a commitment to innovation, professionalism, and service excellence, the group provides integrated solutions that support businesses, investors, and entrepreneurs in achieving sustainable growth.'
    },
    {
      heading: 'Executive Leadership',
      content: 'Leading the organization is Mr. Mark Anthony Abito-Santos, President and Chief Executive Officer, whose vision and leadership continue to drive the expansion of the group across multiple industries. Under his guidance, Alpha Premier Group has developed a strong network of partnerships and business opportunities throughout the Philippines.'
    },
    {
      heading: 'Flagship Realty Division',
      content: 'At the forefront of the organization is Alpha Premier Realty, the flagship company of the group and one of the leading brokerage firms in the Philippines. The company specializes in residential, commercial, and industrial real estate, offering brokerage and advisory services for commercial spaces, warehouses, office buildings, and residential properties. Through its extensive market knowledge and strong industry network, Alpha Premier Realty connects property owners, developers, and investors with strategic real estate opportunities across the country.'
    },
    {
      heading: 'Virtual Office & Workspaces',
      content: 'Expanding beyond real estate, Alpha Premier Group of Companies also operates a range of complementary businesses designed to support the operational and growth needs of modern enterprises. These include Alpha Premier Virtual Office – Ortigas Business Center, strategically located at the Philippine Stock Exchange Centre, Tektite East Tower, Ortigas Center, Pasig City, providing premium virtual office services, prestigious business addresses, and flexible workspace solutions for startups, entrepreneurs, and expanding companies.'
    },
    {
      heading: 'Integrated Service Ecosystem',
      content: 'The group\'s portfolio also includes companies providing business solutions and corporate support services, professional cleaning and facility services, modeling and talent management, as well as construction services and construction materials supply. By bringing together these specialized services under one organization, Alpha Premier Group is able to deliver comprehensive solutions tailored to the needs of its diverse clientele.'
    },
    {
      heading: 'Vision for Long-Term Growth',
      content: 'Guided by a strong vision for growth and excellence, Alpha Premier Group of Companies continues to expand its network and strengthen its presence across key industries. Through its companies and partnerships, the group remains committed to building long-term relationships with businesses, developers, investors, and communities throughout the Philippines.'
    }
  ];

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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.22)_0%,_transparent_75%)] blur-2xl pointer-events-none" />

          {/* Filigree Wing Line Dividers with Gold Diamond Stars */}
          <div className="flex items-center justify-center w-full max-w-xl gap-3 z-10">
            <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#1A1408] border border-[#D4AF37] rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#FFF3D1] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
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

          <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed max-w-3xl z-10 pt-1">
            A premier Philippine holding group uniting leading enterprises in real estate brokerage, Ortigas virtual office hubs, construction engineering, professional sanitation, and corporate outsourcing.
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
                <span className="text-[10px] text-neutral-400 font-mono font-semibold">04 INTEGRATED DIVISIONS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                
                {/* Pillar 1 */}
                <div className="p-5 bg-[#120E05]/95 border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-2xl transition-all duration-300 shadow-xl flex flex-col justify-between backdrop-blur-md group hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                        <Building2 className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase">PILLAR 01</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight group-hover:text-[#D4AF37] transition-colors leading-snug">
                      Flagship Realty & Brokerage
                    </h4>
                    <p className="text-[11px] text-neutral-300 leading-relaxed font-light">
                      <strong className="text-white font-semibold">Alpha Premier Realty</strong> delivers commercial office leasing, warehouse logistics, and luxury residential brokerage nationwide.
                    </p>
                  </div>
                  <div className="w-full h-0.5 bg-[#D4AF37]/30 group-hover:bg-[#D4AF37] transition-colors rounded-full mt-4" />
                </div>

                {/* Pillar 2 */}
                <div className="p-5 bg-[#120E05]/95 border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-2xl transition-all duration-300 shadow-xl flex flex-col justify-between backdrop-blur-md group hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                        <Briefcase className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase">PILLAR 02</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight group-hover:text-[#D4AF37] transition-colors leading-snug">
                      Ortigas Virtual Workspaces
                    </h4>
                    <p className="text-[11px] text-neutral-300 leading-relaxed font-light">
                      Operating at Tektite East Tower, Ortigas Center—providing prestigious CBD addresses, SEC registration, and executive virtual offices.
                    </p>
                  </div>
                  <div className="w-full h-0.5 bg-[#D4AF37]/30 group-hover:bg-[#D4AF37] transition-colors rounded-full mt-4" />
                </div>

                {/* Pillar 3 */}
                <div className="p-5 bg-[#120E05]/95 border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-2xl transition-all duration-300 shadow-xl flex flex-col justify-between backdrop-blur-md group hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                        <Shield className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase">PILLAR 03</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight group-hover:text-[#D4AF37] transition-colors leading-snug">
                      Integrated Enterprise Services
                    </h4>
                    <p className="text-[11px] text-neutral-300 leading-relaxed font-light">
                      Encompassing BPO outsourcing, facility sanitation, multimedia creative agency, talent management, and construction contracting.
                    </p>
                  </div>
                  <div className="w-full h-0.5 bg-[#D4AF37]/30 group-hover:bg-[#D4AF37] transition-colors rounded-full mt-4" />
                </div>

                {/* Pillar 4 */}
                <div className="p-5 bg-[#120E05]/95 border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-2xl transition-all duration-300 shadow-xl flex flex-col justify-between backdrop-blur-md group hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                        <Globe className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase">PILLAR 04</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight group-hover:text-[#D4AF37] transition-colors leading-snug">
                      Nationwide Service Network
                    </h4>
                    <p className="text-[11px] text-neutral-300 leading-relaxed font-light">
                      Connecting property owners, corporate investors, developers, and enterprise clients across Metro Manila and key economic hubs nationwide.
                    </p>
                  </div>
                  <div className="w-full h-0.5 bg-[#D4AF37]/30 group-hover:bg-[#D4AF37] transition-colors rounded-full mt-4" />
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Executive Leadership Card (5 Cols) */}
          <div className="lg:col-span-5 bg-[#120E05]/95 border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
            
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
                    src={aboutUsPic} 
                    alt="Mr. Mark Anthony Abito-Santos" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                {/* Decorative Frame Blur */}
                <div className="absolute inset-0 bg-[#D4AF37]/20 blur-xl rounded-2xl pointer-events-none" />
              </div>

              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight leading-snug font-sans">
                  Mr. Mark Anthony Abito-Santos
                </h3>
                <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                  President & Chief Executive Officer
                </p>
                <div className="pt-2">
                  <span className="inline-block text-[10px] text-neutral-300 bg-black/60 border border-neutral-800 px-3 py-1 rounded-full">
                    Alpha Premier Group of Companies
                  </span>
                </div>
              </div>
            </div>

            {/* CEO Quote & Mandate */}
            <div className="p-4 bg-black/60 border border-[#D4AF37]/30 rounded-2xl space-y-2 relative">
              <p className="text-xs text-neutral-200 italic leading-relaxed font-normal">
                "We don't just close deals or offer services. Under our vision, Alpha Premier Group designs integrated solutions that transform ambitious opportunities into sustainable, long-term Philippine success."
              </p>
            </div>

            {/* Executive Pillars List */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-300 pt-1">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>Strategic Expansion</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>Service Excellence</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>National Alliances</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>Sustainable Growth</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* FULL CORPORATE STORY READER MODAL */}
      {showFullStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
          <div className="bg-[#120E05] border border-[#D4AF37]/40 max-w-3xl w-full max-h-[85vh] flex flex-col justify-between shadow-2xl relative text-white rounded-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#D4AF37]/30 flex items-center justify-between bg-[#1A1408]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#D4AF37] text-black font-bold rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                    Alpha Premier Group of Companies
                  </h3>
                  <p className="text-[11px] text-[#D4AF37] font-bold tracking-wide">
                    Official Corporate Statement & Group Profile
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowFullStoryModal(false)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-black/50 transition-colors rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-neutral-300 leading-relaxed divide-y divide-neutral-800/80">
              {fullTextParagraphs.map((para, pIdx) => (
                <div key={pIdx} className={pIdx > 0 ? 'pt-6 space-y-2' : 'space-y-2'}>
                  <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-xs uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                    <span>{para.heading}</span>
                  </div>
                  <p className="text-neutral-200 leading-relaxed font-normal">
                    {para.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-[#D4AF37]/30 bg-[#1A1408] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[11px] text-neutral-300">
                President & CEO: <strong className="text-white">Mr. Mark Anthony Abito-Santos</strong>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFullStoryModal(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white uppercase transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowFullStoryModal(false);
                    if (onOpenInquire) onOpenInquire();
                  }}
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#FFDF73] text-black font-extrabold text-xs tracking-wider uppercase transition-colors rounded-lg"
                >
                  Inquire / Consult
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
