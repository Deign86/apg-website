import React, { useState } from 'react';
import { Check, Shield, Sparkles, HelpCircle, ArrowRight, Layers, FileText } from 'lucide-react';
import { VIRTUAL_OFFICE_PLANS, VirtualOfficePlan } from '../data/virtualOfficeData';

interface PricingProps {
  onSelectPlan: (plan: VirtualOfficePlan, billingCycle: 'monthly' | 'annual') => void;
}

export const PricingSection: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activeTab, setActiveTab] = useState<'cards' | 'matrix'>('cards');

  return (
    <section id="packages" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <span>Official Corporate Packages</span>
          <span aria-hidden="true" className="text-slate-600">&bull;</span>
          <span>Tektite East Tower Hub</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-balance">
          Transparent Virtual Office Plans Built for Scale
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          From early-stage SEC incorporation to executive enterprise operations, select the workspace tier that fits your corporate trajectory.
        </p>

        {/* Billing Cycle Switcher */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Contract</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                SAVE 15%
              </span>
            </button>
          </div>

          {/* View toggle (Cards vs Matrix) */}
          <div className="hidden sm:inline-flex items-center p-1 rounded-xl bg-slate-900/60 border border-slate-800">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'cards' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Plan Cards
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'matrix' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Feature Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Cards View */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {VIRTUAL_OFFICE_PLANS.map((plan) => {
            const price = billingCycle === 'annual' ? plan.annualPricePerMonth : plan.monthlyPrice;
            const isHighlight = plan.highlighted;

            return (
              <div
                key={plan.id}
                className={`flex flex-col justify-between rounded-2xl p-6 sm:p-8 transition-all relative ${
                  isHighlight
                    ? 'border-2 border-amber-500/80 bg-gradient-to-b from-[#131b2e] to-[#0c1220] shadow-2xl shadow-amber-500/10'
                    : 'border border-slate-800 bg-[#0d1321] hover:border-slate-700'
                }`}
              >
                {/* Top Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Plan Name & Target */}
                  <div className="mb-4">
                    <h3 className="font-display text-xl font-bold text-white mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-amber-400 font-medium">
                      {plan.targetAudience}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-slate-800/80">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-slate-400">₱</span>
                      <span className="font-mono text-4xl sm:text-5xl font-extrabold text-white tabular-nums">
                        {price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400">/ month</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className="text-[11px] text-emerald-400 mt-1 font-medium">
                        Billed annually (₱{(price * 12).toLocaleString()} / yr) &bull; Save ₱{((plan.monthlyPrice - plan.annualPricePerMonth) * 12).toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
                      Plan Inclusions:
                    </span>
                    <ul className="space-y-2.5 text-xs text-slate-200">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isHighlight ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'
                          }`}>
                            <Check className="w-2.5 h-2.5" />
                          </div>
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Action */}
                <div className="pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => onSelectPlan(plan, billingCycle)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isHighlight
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    <span>Reserve {plan.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    Includes official notarized commercial contract & consent form
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feature Matrix View */}
      {activeTab === 'matrix' && (
        <div className="rounded-2xl border border-slate-800 bg-[#0d1321] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60">
                  <th className="p-4 sm:p-5 font-bold text-slate-300 w-1/3">Feature / Specification</th>
                  {VIRTUAL_OFFICE_PLANS.map((p) => (
                    <th key={p.id} className="p-4 sm:p-5 font-bold text-white">
                      <div className="font-display text-sm">{p.name}</div>
                      <div className="font-mono text-amber-400 text-xs font-semibold">
                        ₱{(billingCycle === 'annual' ? p.annualPricePerMonth : p.monthlyPrice).toLocaleString()} / mo
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                <tr>
                  <td className="p-4 sm:p-5 font-medium text-slate-300">Registered Business Address</td>
                  <td className="p-4 sm:p-5">Unit 3104, PSE Tektite East Tower</td>
                  <td className="p-4 sm:p-5">Unit 3104, PSE Tektite East Tower</td>
                  <td className="p-4 sm:p-5">Unit 3104, PSE Tektite East Tower</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-medium text-slate-300">SEC / DTI / BIR RDO 043 Compliance</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-semibold">Included</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-semibold">Included</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-semibold">Included</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-medium text-slate-300">Boardroom Access</td>
                  <td className="p-4 sm:p-5 text-slate-400">{VIRTUAL_OFFICE_PLANS[0].perks.boardroomHours}</td>
                  <td className="p-4 sm:p-5 text-white font-medium">{VIRTUAL_OFFICE_PLANS[1].perks.boardroomHours}</td>
                  <td className="p-4 sm:p-5 text-amber-400 font-semibold">{VIRTUAL_OFFICE_PLANS[2].perks.boardroomHours}</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-medium text-slate-300">CEO Private Office Signing Access</td>
                  <td className="p-4 sm:p-5 text-slate-500">Not Included</td>
                  <td className="p-4 sm:p-5 text-slate-500">Not Included</td>
                  <td className="p-4 sm:p-5 text-amber-400 font-semibold">Included for contract signings</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-medium text-slate-300">Front Desk Guest Greeting</td>
                  <td className="p-4 sm:p-5 text-slate-400">Standard receptionist</td>
                  <td className="p-4 sm:p-5 text-white">Full Concierge greeting</td>
                  <td className="p-4 sm:p-5 text-amber-400 font-semibold">VIP Branded greeting under company name</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-medium text-slate-300">Mail & Parcel Handling</td>
                  <td className="p-4 sm:p-5">Daily logging & SMS/email</td>
                  <td className="p-4 sm:p-5">Priority scan & dispatch</td>
                  <td className="p-4 sm:p-5">Same-day scan & locked drawer</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-medium text-slate-300">Digital Signage at Hub</td>
                  <td className="p-4 sm:p-5 text-slate-500">Add-on</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-semibold">Included</td>
                  <td className="p-4 sm:p-5 text-emerald-400 font-semibold">Priority listing</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enterprise Add-ons Strip */}
      <div className="mt-12 rounded-xl border border-slate-800 bg-[#0d1321] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 block mb-1">
              Custom Enterprise Capabilities
            </span>
            <h4 className="text-base font-bold text-white">
              Need Multi-Entity SEC Filing, Dedicated Landlines, or Dynamic Tree Studio Access?
            </h4>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Alpha Premier Group provides tailored corporate secretary services, BIR compliance filings, and sister-company perks like podcast recording studio time and facility maintenance.
            </p>
          </div>
          <button
            onClick={() => onSelectPlan(VIRTUAL_OFFICE_PLANS[1], billingCycle)}
            className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-800 text-amber-400 border border-slate-700 hover:bg-slate-700 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Request Custom Quotation
          </button>
        </div>
      </div>
    </section>
  );
};
