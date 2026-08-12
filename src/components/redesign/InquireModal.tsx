import React, { useState } from 'react';
import { InquireFormData } from '../../types';
import { ENTERPRISES } from '../../data/companyData';
import { X, CheckCircle2, Calendar, Mail, Phone, User, Building, Send, MapPin, MessageCircle, ChevronDown, Facebook, Linkedin, Instagram, Check } from 'lucide-react';

function TikTokIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.54V6.77a4.85 4.85 0 01-1.02-.08z" />
    </svg>
  );
}

const logoImg = '/assets/images/logo2025.png';
const apgLogoFallback = '/assets/images/apgopc.png';

const BUDGET_OPTIONS = [
  "Select Budget Range",
  "Under ₱50,000",
  "₱50,000 – ₱150,000",
  "₱150,000 – ₱500,000",
  "₱500,000 – ₱1,000,000",
  "₱1,000,000+",
  "To be discussed",
];

interface InquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEnterprise?: string;
  defaultInquiryType?: 'property' | 'virtual-office' | 'partnership' | 'career' | 'general';
}

export const InquireModal: React.FC<InquireModalProps> = ({
  isOpen,
  onClose,
  defaultEnterprise,
  defaultInquiryType = 'general',
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [ticketRef, setTicketRef] = useState('');
  const [formData, setFormData] = useState<InquireFormData>({
    fullName: '',
    email: '',
    phone: '',
    enterprise: defaultEnterprise || 'Alpha Premier Realty',
    inquiryType: defaultInquiryType,
    message: '',
    preferredDate: '',
  });

  const [company, setCompany] = useState('');
  const [budget, setBudget] = useState('Select Budget Range');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketRef(`APG-INQ-${Math.floor(100000 + Math.random() * 900000)}`);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  const handleOpenLiveChat = () => {
    onClose();
    setTimeout(() => {
      const toggler = document.querySelector('.luxe-chatbot-toggler') as HTMLElement | null;
      if (toggler) toggler.click();
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-[#0B0905] border border-[#D4AF37]/50 w-full max-w-5xl text-neutral-100 shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden rounded-3xl relative my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Top Header Bar */}
        <div className="bg-black/90 px-6 py-4 border-b border-[#D4AF37]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src={logoImg} 
              alt="Alpha Premier Group" 
              className="h-8 w-auto object-contain"
              onError={(e) => { e.currentTarget.src = apgLogoFallback; }}
            />
            <div>
              <span className="text-[9px] font-black tracking-[0.25em] text-[#E2B857] uppercase block">
                ALPHA PREMIER GROUP OPC
              </span>
              <h2 className="text-xs sm:text-sm font-extrabold tracking-wider text-white uppercase">
                INQUIRE & SCHEDULE CONSULTATION
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 space-y-8">

          {/* Hero Header Banner (Dynamic Tree Style) */}
          <div className="text-center space-y-2">
            <span className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#E2B857] font-bold block">
              LET'S WORK TOGETHER
            </span>
            <h1 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
              START YOUR <span className="text-[#E2B857]">DISCOVERY CONSULTATION</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto font-light leading-relaxed">
              Reach out and let's talk about how Alpha Premier Group can elevate your business across our 7 market-leading enterprise divisions.
            </p>
          </div>

          {/* Two-Column Glassmorphic Card Container */}
          <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#120E05]/90 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12">

              {/* Left Column: Contact Sidebar & Direct Channels */}
              <div className="lg:col-span-4 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#D4AF37]/20 bg-[#0E0B04] flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  <div>
                    <span className="text-[9px] tracking-[0.3em] uppercase text-[#E2B857] font-bold block mb-1">
                      CONTACT DETAILS
                    </span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                      Direct Channels
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
                      Reach out to our corporate concierge desk for immediate assistance.
                    </p>
                  </div>

                  {/* Contact Info Items */}
                  <div className="space-y-4 text-xs text-neutral-300">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#E2B857]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] tracking-widest uppercase text-neutral-400 font-bold block mb-0.5">
                          Phone / Viber
                        </span>
                        <a href="tel:+639158889482" className="text-xs font-semibold text-white hover:text-[#E2B857] transition-colors">
                          0915 888 9482 / (02) 8 650 2540
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#E2B857]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] tracking-widest uppercase text-neutral-400 font-bold block mb-0.5">
                          Email Desk
                        </span>
                        <a href="mailto:contact@alphapremier.com" className="text-xs font-semibold text-white hover:text-[#E2B857] transition-colors">
                          contact@alphapremier.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#E2B857]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] tracking-widest uppercase text-neutral-400 font-bold block mb-0.5">
                          Headquarters
                        </span>
                        <span className="text-xs font-light text-neutral-300 leading-relaxed block">
                          Unit 3104, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#D4AF37]/20" />

                  {/* Connect Social Links */}
                  <div>
                    <span className="text-[9px] tracking-[0.25em] uppercase text-neutral-400 font-bold block mb-3">
                      CONNECT WITH US
                    </span>
                    <div className="flex items-center gap-2.5">
                      {[
                        { icon: <Facebook className="w-3.5 h-3.5" />, label: 'Facebook', href: 'https://www.facebook.com/alphapremiergroup' },
                        { icon: <Instagram className="w-3.5 h-3.5" />, label: 'Instagram', href: 'https://www.instagram.com/alphapremiergroup/' },
                        { icon: <TikTokIcon size={14} />, label: 'TikTok', href: 'https://www.tiktok.com/@alphapremierr' },
                        { icon: <Linkedin className="w-3.5 h-3.5" />, label: 'LinkedIn', href: 'https://www.linkedin.com/company/alpha-premier-group' },
                      ].map((s) => (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label}
                          className="w-8 h-8 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-neutral-400 hover:border-[#D4AF37] hover:text-[#E2B857] hover:bg-[#D4AF37]/10 transition-all"
                        >
                          {s.icon}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Why Alpha Premier Group Strip (Dynamic Tree Style) */}
                <div className="rounded-xl p-4 border border-[#D4AF37]/30 bg-[#D4AF37]/10 space-y-2 text-xs">
                  <span className="text-[9px] tracking-[0.25em] uppercase text-[#E2B857] font-bold block">
                    WHY ALPHA PREMIER GROUP
                  </span>
                  {[
                    "7 market-leading enterprise divisions",
                    "Full-service from concept to execution",
                    "12+ years of industry leadership & advisory",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#E2B857] shrink-0 mt-0.5" />
                      <span className="text-[11px] text-neutral-300 font-light leading-snug">{item}</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Right Column: Interactive Form */}
              <div className="lg:col-span-8 p-6 sm:p-8">
                {submitted ? (
                  <div className="p-6 text-center space-y-4 my-auto flex flex-col items-center justify-center min-h-[350px]">
                    <div className="w-14 h-14 bg-[#D4AF37]/20 border border-[#D4AF37] text-[#E2B857] flex items-center justify-center rounded-full">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold tracking-wide text-white uppercase">
                      Inquiry Submitted Successfully
                    </h3>
                    <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong className="text-[#E2B857]">{formData.fullName}</strong>. An executive representative from <span className="text-[#E2B857]">{formData.enterprise}</span> will review your requirements and reach out via email or phone within 24 hours.
                    </p>
                    {ticketRef && (
                      <span className="inline-block px-3 py-1 bg-black/60 border border-[#D4AF37]/40 text-[10px] font-mono text-neutral-300 rounded-full">
                        Reference #: <strong className="text-[#E2B857]">{ticketRef}</strong>
                      </span>
                    )}
                    <div className="pt-3">
                      <button
                        onClick={handleReset}
                        className="px-6 py-2.5 bg-[#D4AF37] text-neutral-950 font-extrabold text-xs tracking-widest uppercase hover:bg-[#FFF3D1] transition-all rounded-full cursor-pointer shadow-lg"
                      >
                        CLOSE & RETURN
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                      <h3 className="text-base font-bold text-white uppercase tracking-wider">
                        Tell Us About Your Project
                      </h3>
                      <p className="text-[11px] text-neutral-400 font-light mt-0.5">
                        Fill in the form below and our corporate team will respond within 24 hours.
                      </p>
                    </div>

                    {/* Row 1: Full Name */}
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Juan Dela Cruz"
                        className="w-full bg-black/80 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none rounded-xl"
                      />
                    </div>

                    {/* Row 2: Email + Company */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="juan@yourbrand.com"
                          className="w-full bg-black/80 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1">
                          Company / Organization
                        </label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Your Brand / Company Name"
                          className="w-full bg-black/80 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Row 3: Enterprise Division + Budget Range */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="relative">
                        <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1">
                          Enterprise Division Interest *
                        </label>
                        <div className="relative">
                          <select
                            value={formData.enterprise}
                            onChange={(e) => setFormData({ ...formData, enterprise: e.target.value })}
                            className="w-full bg-black/80 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white outline-none rounded-xl appearance-none pr-9 cursor-pointer"
                          >
                            {ENTERPRISES.map((ent) => (
                              <option key={ent.id} value={ent.name} className="bg-[#0B0D12]">
                                {ent.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div className="relative">
                        <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1">
                          Budget Range
                        </label>
                        <div className="relative">
                          <select
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full bg-black/80 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white outline-none rounded-xl appearance-none pr-9 cursor-pointer"
                          >
                            {BUDGET_OPTIONS.map((o) => (
                              <option key={o} value={o} className="bg-[#0B0D12]">
                                {o}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Row 4: Date + Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1">
                          Target Timeline / Date
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Q3 2026 or Immediate"
                          value={formData.preferredDate}
                          onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                          className="w-full bg-black/80 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1">
                          Phone / Viber Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="0917 123 4567"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-black/80 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Row 5: Project Details */}
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1">
                        Project Details / Message *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your project, campaign goals, property requirements, or corporate needs..."
                        className="w-full bg-black/80 border border-neutral-800 focus:border-[#D4AF37] p-3.5 text-white placeholder-neutral-500 outline-none rounded-xl resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#FFF3D1] text-neutral-950 font-extrabold text-xs tracking-wider uppercase py-3.5 px-6 rounded-full transition-all duration-300 shadow-xl cursor-pointer hover:scale-[1.01]"
                      >
                        <Send className="w-4 h-4" />
                        Send Message via Email
                      </button>
                    </div>

                  </form>
                )}
              </div>

            </div>
          </div>

          {/* Visit Our Office / Ortigas HQ Map Section (Dynamic Tree Style) */}
          <div className="space-y-4 pt-2">
            <div className="text-center">
              <span className="text-[9px] tracking-[0.3em] uppercase text-[#E2B857] font-bold block mb-1">
                FIND US
              </span>
              <h2 className="text-xl sm:text-2xl font-bold uppercase text-white tracking-tight">
                Visit Our <span className="text-[#E2B857]">Ortigas Headquarters</span>
              </h2>
            </div>

            <div 
              className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-xl"
              style={{ height: '280px' }}
            >
              <iframe
                title="Alpha Premier Group Ortigas Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.3821!2d121.0562!3d14.5871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c8f50a4f7b1d%3A0x6b2a6c5e3a4b8c9d!2sPhilippine%20Stock%20Exchange%20Centre%2C%20Exchange%20Rd%2C%20Ortigas%20Center%2C%20Pasig%2C%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1720000000000!5m2!1sen!2sph"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="flex items-center justify-center gap-2 text-center text-xs text-neutral-400">
              <MapPin className="w-4 h-4 text-[#E2B857] shrink-0" />
              <span>
                Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
