import React, { useState } from 'react';
import { Building, MapPin, Coffee, Users, Laptop, Lock, Monitor, Shield, Navigation } from 'lucide-react';

export const LocationShowcase: React.FC = () => {
  const [selectedAmenity, setSelectedAmenity] = useState<string>('boardroom');

  const amenities = [
    {
      id: 'boardroom',
      title: 'Executive Boardroom',
      subtitle: 'Up to 12 persons &bull; 4K Conference AV',
      icon: Users,
      description: 'Fully equipped executive conference room with high-definition presentation screens, video conferencing hardware, and high-speed enterprise fiber connection for hybrid stakeholder meetings.',
      specs: [
        'Acoustically treated private conference room',
        '75" 4K wireless casting display & web conference camera',
        'Ergonomic executive leather seating for 12 participants',
        'HDMI, USB-C, and Apple AirPlay connectivity'
      ]
    },
    {
      id: 'reception',
      title: 'Concierge & Front Desk',
      subtitle: 'PSE Tektite East Tower &bull; Level 31',
      icon: Building,
      description: 'A sophisticated first impression for your clients and regulatory officers. Dedicated receptionist stationed to receive couriers, log registered mail, and greet visiting executives.',
      specs: [
        'Professional guest reception under your corporate name',
        'Certified parcel, courier, and legal document logging',
        'Digital directory screen listing your registered business',
        'Comfortable air-conditioned executive waiting lounge'
      ]
    },
    {
      id: 'ceo-suite',
      title: 'Private CEO Signing Suite',
      subtitle: 'Alpha Premier Plan Exclusive',
      icon: Lock,
      description: 'An executive private suite designed for closing major corporate deals, high-value investor contracts, and confidential board sessions in a discreet luxury environment.',
      specs: [
        'Dedicated executive desk with skyline views of Ortigas CBD',
        'Private consultation seating area for 4 stakeholders',
        'Soundproof privacy door for confidential negotiations',
        'High-speed color contract printing & document scanning'
      ]
    },
    {
      id: 'lounge',
      title: 'Coworking & Coffee Lounge',
      subtitle: 'Drop-in Productivity Space',
      icon: Coffee,
      description: 'A quiet, modern shared workstation area equipped with dedicated high-speed fiber internet, charging ports, and unlimited complimentary beverages for your on-demand workspace visits.',
      specs: [
        '500 Mbps redundant fiber Wi-Fi network',
        'Unlimited fresh brewed coffee, tea, and alkaline water',
        'Power-equipped ergonomic work desks',
        'Business center multi-function printer & document scanner'
      ]
    }
  ];

  const currentAmenity = amenities.find(a => a.id === selectedAmenity) || amenities[0];

  return (
    <section id="tektite-hub" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Address Credibility & Map Context */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>Prestigious Ortigas Center Headquarters</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-balance">
            Unit 3104, Philippine Stock Exchange Centre
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            The Philippine Stock Exchange Centre (Tektite East Tower) is one of Metro Manila’s most established financial landmarks. Having your registered corporate address here instantly elevates your brand in the eyes of banks, clients, and regulatory authorities.
          </p>

          {/* Location Key Highlights */}
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1321] space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-xs uppercase tracking-wider">
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>Prime Metro Manila Accessibility</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Situated on Exchange Road, Ortigas Center, Pasig City. Minutes away from SM Megamall, The Podium, Shangri-La Plaza, and MRT-3 Shaw Blvd & Ortigas stations.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1321] space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-xs uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Grade-A Corporate Security & Infrastructure</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                24/7 building security, strict turnstile visitor access, 100% back-up power generators, multi-level basement parking, and high-speed elevator banks.
              </p>
            </div>
          </div>

          {/* Google Maps / GPS Reference */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400">Official Postal Coordinates:</span>
              <span className="font-mono text-amber-400 font-medium">1605 Pasig City</span>
            </div>
            <div className="text-xs text-slate-200 font-mono bg-slate-900 p-2.5 rounded border border-slate-800 select-all">
              Unit 3104, Tektite East Tower, PSE Centre, Exchange Road, Ortigas Center, Pasig City 1605
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Amenity Showcase */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-800 bg-[#0d1321] p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Physical Hub Amenities & Facilities
                </h3>
                <p className="text-xs text-slate-400">
                  Select an amenity to inspect specifications available to virtual office members
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                Floor 31
              </span>
            </div>

            {/* Amenity Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-6">
              {amenities.map((item) => {
                const IconComponent = item.icon;
                const isActive = selectedAmenity === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedAmenity(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'border-amber-500 bg-amber-500/10 text-white shadow-md'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 mb-2 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <div className="text-xs font-bold leading-tight truncate">{item.title}</div>
                  </button>
                );
              })}
            </div>

            {/* Active Amenity Details Frame */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-display text-lg font-bold text-white">
                    {currentAmenity.title}
                  </h4>
                  <p className="text-xs font-medium text-amber-400">
                    {currentAmenity.subtitle}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentAmenity.description}
              </p>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-2">
                  Key Specifications:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                  {currentAmenity.specs.map((spec, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">&bull;</span>
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>All spaces air-conditioned & fully serviced</span>
              <a
                href="#packages"
                className="text-amber-400 font-semibold hover:text-amber-300 transition-colors"
              >
                See which plan includes this &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
