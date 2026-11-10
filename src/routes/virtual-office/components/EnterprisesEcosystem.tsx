import React from 'react';
import { Building2, Layers, Sparkles, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { APG_ECOSYSTEM } from '../data/virtualOfficeData';

export const EnterprisesEcosystem: React.FC = () => {
  return (
    <section id="ecosystem" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Layers className="w-3.5 h-3.5" />
          <span>The Alpha Premier Group Ecosystem</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-balance">
          Integrated Enterprise Solutions Under One Holding
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          How our Virtual Office connects with Alpha Premier Group’s real estate brokerage, luxury estates, digital multimedia, and commercial contracting subsidiaries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {APG_ECOSYSTEM.map((entity) => {
          const isVirtualOffice = entity.id === 'virtual-office';
          return (
            <div
              key={entity.id}
              className={`rounded-2xl p-6 transition-all border flex flex-col justify-between ${
                isVirtualOffice
                  ? 'border-amber-500/60 bg-gradient-to-b from-amber-500/10 to-[#0d1321] shadow-lg shadow-amber-500/5'
                  : 'border-slate-800 bg-[#0d1321] hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 font-mono">
                    {entity.category}
                  </span>
                  {isVirtualOffice ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                      Current Section
                    </span>
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                <h3 className="font-display text-lg font-bold text-white mb-1.5">
                  {entity.name}
                </h3>

                <p className="text-xs text-slate-400 font-medium mb-4">
                  {entity.tagline}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                  Ecosystem Value & Synergy:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {entity.synergy}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
