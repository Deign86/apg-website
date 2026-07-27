import React, { useState } from 'react';
import { Building2, ArrowRight, FileText, X, Check, Award } from 'lucide-react';

const aboutUsPic = '/assets/images/aboutuspic.png';

export const AboutUsSection = ({
  onOpenInquire,
  onNavigateToEnterprises
}) => {
  const [showFullStoryModal, setShowFullStoryModal] = useState(false);

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
    <section id="about-us" className="py-24 px-4 sm:px-6 lg:px-8 bg-black text-white border-t border-b border-[#1C1C1E] relative">
      
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* SECTION HEADER - Clean & Unboxed */}
        <div className="space-y-3 text-left border-l-2 border-[#E2B857] pl-5 sm:pl-6">
          <span className="text-[11px] font-bold tracking-[0.3em] text-[#E2B857] uppercase block">
            ABOUT US
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white uppercase leading-tight font-serif">
            Alpha Premier Group <span className="text-[#E2B857]">of Companies</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed max-w-3xl">
            A diversified Philippine-based business group serving as the parent organization of several companies operating across real estate, business support, construction, and professional services. With a commitment to innovation, professionalism, and service excellence, the group provides integrated solutions that support businesses, investors, and entrepreneurs in achieving sustainable growth.
          </p>
        </div>

        {/* TOP: Core Business Pillars in Box Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          <div className="bg-[#0A0A0D] border border-[#1F1F24] hover:border-[#E2B857]/50 p-6 flex flex-col items-center text-center space-y-2 transition-colors shadow-lg">
            <h4 className="text-sm font-bold text-[#E2B857] uppercase tracking-tight">
              Flagship Realty & Advisory
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              <strong className="text-white">Alpha Premier Realty</strong> specializes in commercial offices, warehouses, industrial properties, and residential investments nationwide.
            </p>
          </div>

          <div className="bg-[#0A0A0D] border border-[#1F1F24] hover:border-[#E2B857]/50 p-6 flex flex-col items-center text-center space-y-2 transition-colors shadow-lg">
            <h4 className="text-sm font-bold text-[#E2B857] uppercase tracking-tight">
              Ortigas Virtual Office Hub
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Providing prestigious business addresses, SEC registration support, and flexible workspaces at Tektite East Tower, Ortigas Center.
            </p>
          </div>

          <div className="bg-[#0A0A0D] border border-[#1F1F24] hover:border-[#E2B857]/50 p-6 flex flex-col items-center text-center space-y-2 transition-colors shadow-lg">
            <h4 className="text-sm font-bold text-[#E2B857] uppercase tracking-tight">
              Integrated Enterprise Services
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Delivering corporate support, facility sanitation, talent management, and construction materials supply under one organization.
            </p>
          </div>

        </div>

        {/* BOTTOM: Executive Leadership (CEO Part) */}
        <div className="pt-6 space-y-4 flex flex-col items-center text-center">
          <span className="text-xs font-bold text-[#E2B857] uppercase tracking-widest flex items-center justify-center gap-2">
            <Award className="w-4 h-4 text-[#E2B857]" />
            EXECUTIVE LEADERSHIP
          </span>

          <div className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-5 pt-1 max-w-3xl mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#E2B857] shrink-0 bg-[#121215] shadow-xl">
              <img 
                src={aboutUsPic} 
                alt="Mr. Mark Anthony Abito-Santos" 
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div className="space-y-1 flex-1 text-center sm:text-left">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white uppercase leading-snug font-serif tracking-wide">
                  Mr. Mark Anthony Abito-Santos
                </h3>
                <p className="text-xs font-semibold text-[#E2B857] uppercase tracking-wider">
                  President & Chief Executive Officer
                </p>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed font-normal max-w-2xl">
                Leading Alpha Premier Group with a strong national network built on innovation, professionalism, and service excellence across key Philippine industries.
              </p>
              <button 
                onClick={() => setShowFullStoryModal(true)}
                className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E2B857] hover:text-white transition-colors group cursor-pointer"
              >
                <span>Read Full Corporate Story</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* FULL CORPORATE STORY READER MODAL */}
      {showFullStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0A0A0C] border border-[#26262B] max-w-3xl w-full max-h-[85vh] flex flex-col justify-between shadow-2xl relative text-white">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#1C1C20] flex items-center justify-between bg-[#0F0F12]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E2B857] text-black font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                    Alpha Premier Group of Companies
                  </h3>
                  <p className="text-[11px] text-[#E2B857] font-semibold">
                    Official Corporate Statement
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowFullStoryModal(false)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-[#1C1C20] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-neutral-300 leading-relaxed divide-y divide-[#1C1C20]">
              {fullTextParagraphs.map((para, pIdx) => (
                <div key={pIdx} className={pIdx > 0 ? 'pt-6 space-y-2' : 'space-y-2'}>
                  <div className="flex items-center gap-2 text-[#E2B857] font-bold text-xs uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-[#E2B857]" />
                    <span>{para.heading}</span>
                  </div>
                  <p className="text-neutral-200 leading-relaxed font-normal">
                    {para.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-[#1C1C20] bg-[#0F0F12] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[11px] text-neutral-400">
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
                  className="px-5 py-2.5 bg-[#E2B857] hover:bg-[#d0a747] text-black font-extrabold text-xs tracking-wider uppercase transition-colors"
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
