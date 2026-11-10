import React, { useState } from 'react';
import { Calculator, ArrowRight, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react';

export const CostCalculator: React.FC<{ onOpenInquiry: () => void }> = ({ onOpenInquiry }) => {
  const [estimatedDesks, setEstimatedDesks] = useState<number>(5);
  const [includeAdminStaff, setIncludeAdminStaff] = useState<boolean>(true);
  const [selectedPlanTier, setSelectedPlanTier] = useState<number>(3499); // default Premier Prestige

  // Approximate Ortigas commercial real estate economics (per desk / sqm)
  const rentPerDesk = 7500; // commercial rent + CUSA allocation
  const utilitiesPerDesk = 2200; // power, AC, enterprise fiber
  const receptionistSalary = includeAdminStaff ? 24000 : 0;
  
  const traditionalMonthlyCost = (estimatedDesks * rentPerDesk) + (estimatedDesks * utilitiesPerDesk) + receptionistSalary;
  const virtualOfficeMonthlyCost = selectedPlanTier;
  const monthlySavings = traditionalMonthlyCost - virtualOfficeMonthlyCost;
  const annualSavings = monthlySavings * 12;
  const savingsPercent = Math.round((monthlySavings / traditionalMonthlyCost) * 100);

  return (
    <section id="calculator" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Context & Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive ROI & Overhead Simulator</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-balance">
            Compare Physical Lease vs. Alpha Premier Virtual Office
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate multi-year lock-in commercial leases, 3-month security deposits, fit-out capital expenditures, and dedicated receptionist payroll.
          </p>

          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0d1321] space-y-6">
            {/* Control 1: Team Size Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Traditional Office Capacity:
                </label>
                <span className="font-mono text-amber-400 font-bold text-sm">
                  {estimatedDesks} team members / desks
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={estimatedDesks}
                onChange={(e) => setEstimatedDesks(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>1 desk (Solo Founder)</span>
                <span>12 desks (Growing SME)</span>
                <span>25 desks (Enterprise)</span>
              </div>
            </div>

            {/* Control 2: Include Dedicated Receptionist Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Dedicated Front Desk Staff Overhead
                </span>
                <span className="text-[11px] text-slate-400">
                  Approx. ₱24,000/mo salary + SSS/PhilHealth/13th month
                </span>
              </div>
              <button
                onClick={() => setIncludeAdminStaff(!includeAdminStaff)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  includeAdminStaff ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    includeAdminStaff ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Control 3: Selected Virtual Office Tier */}
            <div className="pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Compare Against Alpha Premier Plan:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Access', price: 2899 },
                  { name: 'Prestige', price: 3499 },
                  { name: 'Executive', price: 4999 },
                ].map((tier) => (
                  <button
                    key={tier.name}
                    onClick={() => setSelectedPlanTier(tier.price)}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      selectedPlanTier === tier.price
                        ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{tier.name}</div>
                    <div className="text-xs font-mono text-amber-400">₱{tier.price.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Results Card */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl border-2 border-amber-500/60 bg-gradient-to-br from-[#121a2c] to-[#0a0f1b] p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Monthly Financial Projection
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                ~{savingsPercent}% Lower Overhead
              </span>
            </div>

            {/* Side-by-Side Breakdown */}
            <div className="py-6 space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block">Physical Ortigas Commercial Lease:</span>
                  <span className="text-xs text-slate-300 font-medium">
                    Rent, dues, utilities{includeAdminStaff ? ' + receptionist' : ''}
                  </span>
                </div>
                <span className="font-mono text-lg font-bold text-slate-300 tabular-nums">
                  ₱{traditionalMonthlyCost.toLocaleString()} <span className="text-xs text-slate-500">/ mo</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div>
                  <span className="text-xs text-amber-300 block font-semibold">Alpha Premier Virtual Office:</span>
                  <span className="text-xs text-slate-300">
                    Tektite address, mail handling, boardroom & compliance
                  </span>
                </div>
                <span className="font-mono text-lg font-bold text-amber-400 tabular-nums">
                  ₱{virtualOfficeMonthlyCost.toLocaleString()} <span className="text-xs text-slate-400">/ mo</span>
                </span>
              </div>
            </div>

            {/* Savings Callout Box */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Estimated Capital Retained Every Year:
              </span>
              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-emerald-400 tabular-nums">
                ₱{annualSavings.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400">
                Capital you can reinvest directly into marketing, hiring, or product development.
              </p>
            </div>

            {/* Instant Action */}
            <div className="pt-6">
              <button
                onClick={onOpenInquiry}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lock In This Rate & Request Official Proposal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
