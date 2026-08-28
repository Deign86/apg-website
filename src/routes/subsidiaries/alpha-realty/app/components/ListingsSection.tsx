import React from 'react';
import { REALTY_SERVICES } from '../data';
import { useServices } from '@/hooks/useServices';
import { Building2, ArrowRight, CheckCircle2, Shield, TrendingUp, Landmark } from 'lucide-react';

interface ListingsSectionProps {
  onInquireClick: (serviceTitle: string, serviceId: string) => void;
}

export default function ListingsSection({ onInquireClick }: ListingsSectionProps) {
  const { services } = useServices('realty', REALTY_SERVICES);

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="realty-services">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a85c]/10 border border-[#c5a85c]/30 text-[#c5a85c] text-xs font-semibold uppercase tracking-widest mb-4">
          <Landmark className="w-3.5 h-3.5" />
          Brokerage & Advisory Solutions
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white font-normal tracking-tight">
          Commercial Brokerage & Strategic Asset Advisory
        </h2>
        <p className="mt-4 text-white/70 text-sm sm:text-base leading-relaxed">
          Alpha Premier Realty delivers end-to-end property brokerage, investment structuring, and corporate leasing advisory across Metro Manila’s premier central business districts.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((service, index) => {
          const features = Array.isArray(service.features) 
            ? service.features 
            : ['Brokerage Representation', 'Market Intelligence', 'Due Diligence Advisory', 'Transaction Closing'];

          return (
            <div 
              key={service.id || index}
              className="group bg-[#0d0e14]/90 border border-[#c5a85c]/20 hover:border-[#c5a85c]/60 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_10px_30px_rgba(197,168,92,0.15)] flex flex-col justify-between"
            >
              <div className="relative h-60 overflow-hidden bg-neutral-900">
                <img 
                  src={service.image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'} 
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e14] via-transparent to-transparent"></div>
                <span className="absolute top-4 left-4 bg-[#c5a85c] text-black text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded">
                  {service.price || 'Advisory'}
                </span>
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-serif text-white font-semibold group-hover:text-[#c5a85c] transition-colors mb-3">
                    {service.title}
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <div className="space-y-2 mb-8">
                    {features.map((feat: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-white/80">
                        <CheckCircle2 className="w-4 h-4 text-[#c5a85c] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onInquireClick(service.title, String(service.id))}
                  className="w-full py-3 px-4 rounded bg-[#c5a85c]/10 hover:bg-[#c5a85c] text-[#c5a85c] hover:text-black font-semibold text-xs uppercase tracking-widest transition-all duration-300 border border-[#c5a85c]/40 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Inquire for Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Banner */}
      <div className="mt-16 bg-[#12131b] border border-[#c5a85c]/30 rounded-lg p-8 text-center sm:text-left sm:flex items-center justify-between gap-6">
        <div>
          <h4 className="text-lg font-serif text-white font-medium">Looking for bespoke corporate representation or land acquisition?</h4>
          <p className="text-white/60 text-xs sm:text-sm mt-1">Our licensed real estate specialists and legal advisory council are ready to assist.</p>
        </div>
        <button
          onClick={() => onInquireClick('Commercial Real Estate Advisory', 'general')}
          className="mt-4 sm:mt-0 whitespace-nowrap px-6 py-3 bg-[#c5a85c] text-black text-xs font-bold uppercase tracking-widest rounded hover:bg-[#dfc47b] transition-colors cursor-pointer"
        >
          Speak with a Broker
        </button>
      </div>
    </div>
  );
}
