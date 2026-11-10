import React from 'react';
import { Building2, ShieldCheck, MapPin, ArrowRight, Check, Award, Calculator, Calendar } from 'lucide-react';

interface HeroProps {
  onSelectPlan: (planId: string) => void;
  onOpenInquiry: () => void;
}

export const VirtualOfficeHero: React.FC<HeroProps> = ({
  onSelectPlan,
  onOpenInquiry
}) => {
  return (
    <section id="overview" className="relative pt-12 pb-20 overflow-hidden border-b border-slate-800/60">
      {/* Subtle Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>
      
      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Unboxed Kicker */}
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 mb-4">
          <MapPin className="w-3.5 h-3.5" />
          <span>Unit 3104, PSE Centre (Tektite East Tower)</span>
          <span aria-hidden="true" className="text-slate-600">&bull;</span>
          <span className="text-slate-400">Ortigas Center, Pasig City</span>
        </div>

        {/* Hero Title & Value Proposition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] text-balance">
              Ortigas CBD Virtual Office for Growing Enterprises
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              Legitimize your business with an official commercial address in the heart of Metro Manila. Full SEC, BIR RDO 043, and local government compliance with executive boardroom and CEO suite privileges.
            </p>

            {/* Benefit Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>100% SEC, DTI & BIR Form 2303 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>Daily Mail Handling & SMS Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>Tektite Boardroom & CEO Office Access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>Immediate 24-Hour Contract Release</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href="#packages"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>View Virtual Office Plans</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={onOpenInquiry}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-200 hover:bg-slate-800 hover:text-white transition-all cursor-pointer whitespace-nowrap"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Book Tektite Site Visit</span>
              </button>
            </div>
          </div>

          {/* Right Column: Architectural Visual Card & Trust Frame */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-800 bg-[#0d1321] p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>

              {/* Verified Commercial Location Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Commercial Hub Verified
                  </span>
                </div>
                <span className="text-xs font-mono text-amber-400 font-semibold">UNIT 3104</span>
              </div>

              {/* Illustrated Architectural Preview */}
              <div className="my-5 rounded-xl border border-slate-800/80 bg-slate-950 p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-display">Tektite East Tower</h4>
                      <p className="text-[11px] text-slate-400">Philippine Stock Exchange Centre</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Active Hub
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                  <div className="flex justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">District:</span>
                    <span className="font-medium text-slate-200">Ortigas Center Central Business District</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">Zoning:</span>
                    <span className="font-medium text-slate-200">PEZA / Commercial Grade-A</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">Jurisdiction:</span>
                    <span className="font-medium text-slate-200">Pasig City LGU & BIR RDO 043</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Starting Rate:</span>
                    <span className="font-bold text-amber-400 font-mono">₱2,899 / month</span>
                  </div>
                </div>
              </div>

              {/* Direct Action inside Card */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400">
                  <span>Part of </span>
                  <strong className="text-white">Alpha Premier Group</strong>
                </div>
                <button
                  onClick={() => onSelectPlan('premier-prestige')}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Quick Setup Prestige Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Metric Key Proof Strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800 pt-8">
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
              ₱2,899
            </span>
            <p className="text-xs text-slate-400">Starting entry plan per month</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
              100%
            </span>
            <p className="text-xs text-slate-400">SEC & BIR approval compliance</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
              24 hrs
            </span>
            <p className="text-xs text-slate-400">Lease agreement turnaround</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
              92%
            </span>
            <p className="text-xs text-slate-400">Cost savings vs. physical lease</p>
          </div>
        </div>
      </div>
    </section>
  );
};
