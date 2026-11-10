import React, { useState } from 'react';
import { X, Check, Building2, Send, Phone, Mail, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import { VIRTUAL_OFFICE_PLANS, VirtualOfficePlan } from '../data/virtualOfficeData';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: VirtualOfficePlan | null;
  billingCycle: 'monthly' | 'annual';
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  billingCycle: initialBillingCycle
}) => {
  const [activePlanId, setActivePlanId] = useState<string>(
    selectedPlan?.id || 'premier-prestige'
  );
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(
    initialBillingCycle
  );
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [requestTour, setRequestTour] = useState(true);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'payment'>('form');

  if (!isOpen) return null;

  const currentPlan = VIRTUAL_OFFICE_PLANS.find(p => p.id === activePlanId) || VIRTUAL_OFFICE_PLANS[1];
  const price = billingCycle === 'annual' ? currentPlan.annualPricePerMonth : currentPlan.monthlyPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0d1321] p-6 sm:p-8 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          /* Confirmation View */
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>

            <h3 className="font-display text-2xl font-bold text-white">
              Inquiry & Reservation Received
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-white">{fullName || 'Executive'}</strong>. Your reservation request for <strong className="text-amber-400">{currentPlan.name}</strong> ({billingCycle} plan) at <strong className="text-white">Tektite East Tower Hub</strong> has been logged.
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Reference Code:</span>
                <span className="font-mono text-amber-400 font-bold">APG-VO-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Registered Address:</span>
                <span className="text-slate-200">Unit 3104, PSE Centre, Ortigas</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Contract Turnaround:</span>
                <span className="text-emerald-400 font-semibold">Within 24 Hours</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Our enterprise officer will contact you via email ({email}) or phone ({phone}) with your draft commercial lease agreement and payment proof instructions.
            </p>

            <div className="pt-4">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Reservation Form View */
          <div>
            <div className="mb-6 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Unit 3104 Tektite East Tower &bull; Ortigas Center
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                Reserve Virtual Office & Book Tour
              </h3>
              <p className="text-xs text-slate-400">
                Receive an official lease proposal, SEC compliance pack, and arrange an executive walkthrough.
              </p>
            </div>

            {/* Sub-Tabs: Form vs Payment Channels */}
            <div className="flex gap-2 mb-6 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveSubTab('form')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSubTab === 'form'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Reservation Details
              </button>
              <button
                onClick={() => setActiveSubTab('payment')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeSubTab === 'payment'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>APG Payment Channels & Proof</span>
              </button>
            </div>

            {activeSubTab === 'form' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Plan Selection Buttons */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Selected Package:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {VIRTUAL_OFFICE_PLANS.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setActivePlanId(p.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          activePlanId === p.id
                            ? 'border-amber-500 bg-amber-500/10 text-white'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold truncate">{p.name}</div>
                        <div className="font-mono text-[11px] text-amber-400">
                          ₱{(billingCycle === 'annual' ? p.annualPricePerMonth : p.monthlyPrice).toLocaleString()}/mo
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <span className="font-semibold text-white block">Contract Term:</span>
                    <span className="text-[11px] text-slate-400">
                      {billingCycle === 'annual' ? 'Billed annually with 15% discount' : 'Flexible monthly renewal'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        billingCycle === 'monthly' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('annual')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        billingCycle === 'annual' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                      }`}
                    >
                      Annual (-15%)
                    </button>
                  </div>
                </div>

                {/* Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Juan dela Cruz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Company / Proposed Entity Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Acme Tech Solutions Inc."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Business Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="juan@acmetech.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Mobile / WhatsApp / Viber *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+63 9XX XXX XXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Tour Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="tourCheckbox"
                    checked={requestTour}
                    onChange={(e) => setRequestTour(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="tourCheckbox" className="text-xs text-slate-300 cursor-pointer">
                    I would like to book a physical visit/tour at Tektite East Tower Level 31
                  </label>
                </div>

                {/* Submit Action */}
                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Reservation & Request SEC Document Pack</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    Official commercial lease contract sent within 24 hours. No obligation.
                  </p>
                </div>
              </form>
            ) : (
              /* Payment Information View matching APG live site portal */
              <div className="space-y-4 text-xs">
                <p className="text-slate-300 leading-relaxed">
                  Alpha Premier Group accepts digital payments for virtual offices and enterprise services. After settling your invoice or down payment, submit your transaction slip directly:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                    <span className="font-bold text-white block">Bank Wire / Electronic Fund Transfer</span>
                    <div className="text-slate-400 space-y-1">
                      <div><strong className="text-slate-200">Bank:</strong> BDO / BPI (Corporate Account)</div>
                      <div><strong className="text-slate-200">Account Name:</strong> Alpha Premier Group of Companies</div>
                      <div><strong className="text-slate-200">Branch:</strong> Ortigas Center Branch</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                    <span className="font-bold text-white block">Digital Wallets & QR Ph</span>
                    <div className="text-slate-400 space-y-1">
                      <div><strong className="text-slate-200">Channels:</strong> GCash, Maya, Instapay, PesoNet</div>
                      <div><strong className="text-slate-200">Receipt:</strong> Instant confirmation reference</div>
                      <div><strong className="text-slate-200">Portal:</strong> alphapremiergroup.com/pay</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
                  <strong>Online Proof-of-Payment:</strong> Alpha Premier Group maintains an online payment verification portal where you upload your transfer screenshot to receive immediate official receipt issuance and lease agreement activation.
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('form')}
                  className="w-full py-2.5 rounded-lg bg-slate-800 text-slate-200 font-semibold hover:bg-slate-700 transition-colors"
                >
                  Return to Reservation Form
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
