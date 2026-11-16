import React from 'react';
import { Building2, MapPin, Mail, Phone, ShieldCheck, Globe } from 'lucide-react';

export const Footer: React.FC<{ onOpenInquiry: () => void }> = ({ onOpenInquiry }) => {
  return (
    <footer className="border-t border-slate-800 bg-[#080c14] text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand & Holding */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold">
                <span className="font-display text-xs">APG</span>
              </div>
              <span className="font-display text-base font-bold text-white tracking-tight">
                ALPHA PREMIER GROUP
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Alpha Premier Group of Companies is a diversified holding conglomerate specializing in commercial real estate brokerage, flexible corporate workspace hubs, luxury property management, multimedia, and construction.
            </p>

            <div className="space-y-1.5 pt-2 text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City 1605, Philippines</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:contact@alphapremiergroup.com" className="hover:text-white transition-colors">
                  contact@alphapremiergroup.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Virtual Office Solutions */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Virtual Office
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#packages" className="hover:text-amber-400 transition-colors">Premier Access (₱2,899)</a></li>
              <li><a href="#packages" className="hover:text-amber-400 transition-colors">Premier Prestige (₱3,499)</a></li>
              <li><a href="#packages" className="hover:text-amber-400 transition-colors">Alpha Premier Executive (₱4,999)</a></li>
              <li><a href="#tektite-hub" className="hover:text-amber-400 transition-colors">Tektite Boardroom Rental</a></li>
              <li><a href="#compliance" className="hover:text-amber-400 transition-colors">SEC & BIR Compliance Pack</a></li>
            </ul>
          </div>

          {/* Column 3: APG Subsidiaries */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Enterprises
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li><span className="hover:text-white">Alpha Premier Realty</span></li>
              <li><span className="hover:text-white">Luxe Prime Realty</span></li>
              <li><span className="hover:text-white">Dynamic Tree Multimedia</span></li>
              <li><span className="hover:text-white">SwiftClear Disinfection</span></li>
              <li><span className="hover:text-white">Alpha Premier Construction</span></li>
              <li><span className="hover:text-white">88 Prime & Alta Venture</span></li>
            </ul>
          </div>

          {/* Column 4: Compliance & Legal */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Compliance
            </h4>
            <div className="space-y-2 text-slate-400">
              <p>SEC Registered Commercial Lessor</p>
              <p>BIR Revenue District Office: RDO 043 (Pasig City)</p>
              <p>Barangay San Antonio Clearance</p>
              <p>Pasig City LGU Commercial Zoning</p>
              <div className="pt-2">
                <button
                  onClick={onOpenInquiry}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 font-semibold text-center transition-colors cursor-pointer"
                >
                  Contact Desk
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Alpha Premier Group of Companies. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="https://alphapremiergroup.com" target="_blank" rel="noreferrer" className="hover:text-slate-300">
              Official Holding Domain: alphapremiergroup.com
            </a>
            <span>&bull;</span>
            <span className="text-slate-400">Ortigas Center, Pasig City, Metro Manila</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
