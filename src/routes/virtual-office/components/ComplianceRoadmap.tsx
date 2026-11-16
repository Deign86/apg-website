import React from 'react';
import { ShieldCheck, FileCheck, CheckCircle2, FileText, ArrowRight, HelpCircle } from 'lucide-react';
import { COMPLIANCE_STEPS } from '../data/virtualOfficeData';

export const ComplianceRoadmap: React.FC<{ onOpenInquiry: () => void }> = ({ onOpenInquiry }) => {
  return (
    <section id="compliance" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Philippine Regulatory Roadmap</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-balance">
          Guaranteed SEC, BIR & LGU Approval Standards
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Avoid registration rejections. Alpha Premier Group delivers officially notarized lease agreements and lessor consent forms specifically formatted for Philippine regulatory compliance.
        </p>
      </div>

      {/* 4-Step Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COMPLIANCE_STEPS.map((step) => (
          <div
            key={step.step}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0d1321] p-6 hover:border-slate-700 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xl font-extrabold text-amber-400">
                  {step.step}
                </span>
                <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-amber-400 transition-colors">
                  <FileText className="w-4 h-4" />
                </span>
              </div>

              <h3 className="font-display text-base font-bold text-white mb-2 leading-snug">
                {step.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {step.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                Provided by Alpha Premier:
              </span>
              <span className="text-xs font-semibold text-amber-300 font-mono">
                {step.document}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Callout Banner */}
      <div className="mt-12 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#0d1321] to-slate-900 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zero Regulatory Friction Guarantee</span>
          </div>
          <h4 className="text-base font-bold text-white">
            Have questions about foreign corporation setup or BIR RDO 043 transfer?
          </h4>
          <p className="text-xs text-slate-300 max-w-2xl">
            Our corporate affairs desk liaises directly with your accountant, corporate lawyer, or corporate secretary to supply all required documents.
          </p>
        </div>

        <button
          onClick={onOpenInquiry}
          className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Consult Compliance Desk
        </button>
      </div>
    </section>
  );
};
