import React from 'react';
import { Building2, Sparkles, MessageSquareText, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'redesign' | 'audit';
  setActiveTab: (tab: 'redesign' | 'audit') => void;
  onOpenInquiry: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenInquiry
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Zone 1: Single Brand Wordmark */}
        <a href="#hero" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
            <span className="font-display tracking-tight text-sm">APG</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-base font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
              ALPHA PREMIER GROUP
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Enterprises &bull; Virtual Office
            </span>
          </div>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wide uppercase text-slate-300">
          <a href="#overview" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            Overview
          </a>
          <a href="#packages" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            Virtual Office Plans
          </a>
          <a href="#tektite-hub" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            Tektite Ortigas Hub
          </a>
          <a href="#compliance" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            SEC & BIR Roadmap
          </a>
          <a href="#calculator" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            Savings Calculator
          </a>
          <a href="#ecosystem" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            Enterprises
          </a>
        </nav>

        {/* Zone 3: Mode Switch & Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Audit vs Redesign Switcher for the IT Team */}
          <div className="flex items-center rounded-lg bg-slate-900/90 border border-slate-800 p-0.5 text-xs font-medium">
            <button
              onClick={() => setActiveTab('redesign')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === 'redesign'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Revised UI</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-slate-800 text-amber-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>IT Site Audit</span>
            </button>
          </div>

          <button
            onClick={onOpenInquiry}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            Inquire / Book Tour
          </button>
        </div>
      </div>
    </header>
  );
};
