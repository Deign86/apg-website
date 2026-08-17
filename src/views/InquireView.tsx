import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENTERPRISES } from '../data/companyData';
import { CheckCircle2, Calendar, Mail, Phone, MapPin, MessageCircle, ChevronDown, Facebook, Linkedin, Instagram, Check, Send } from 'lucide-react';

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

export const InquireView: React.FC = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [ticketRef, setTicketRef] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [enterprise, setEnterprise] = useState('Alpha Premier Realty');
  const [budget, setBudget] = useState('Select Budget Range');
  const [preferredDate, setPreferredDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const fullMsg = [
        message.trim(),
        company ? `Company / Org: ${company}` : '',
        budget && budget !== 'Select Budget Range' ? `Budget: ${budget}` : '',
        preferredDate ? `Target Timeline: ${preferredDate}` : '',
      ].filter(Boolean).join('\n\n');

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          subject: `[${enterprise}] Discovery Inquiry`,
          message: fullMsg,
          source: 'inquire_page',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to submit inquiry. Please try again or call our concierge.');
      }

      setTicketRef(data.ticket || `APG-${Date.now().toString().slice(-6)}`);
      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLiveChat = () => {
    const toggler = document.querySelector('.luxe-chatbot-toggler') as HTMLElement | null;
    if (toggler) toggler.click();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 font-sans space-y-12">
      
      {/* Hero Header Banner (Dynamic Tree Style) */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs sm:text-sm tracking-[0.35em] uppercase text-[#E2B857] font-bold block">
          LET'S WORK TOGETHER
        </span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight leading-tight">
          START YOUR <span className="text-[#E2B857]">DISCOVERY CONSULTATION</span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
          Reach out and let's talk about how Alpha Premier Group can elevate your business across our 7 market-leading enterprise divisions.
        </p>
      </div>

      {/* Two-Column Glassmorphic Card Container */}
      <div className="rounded-3xl border border-[#D4AF37]/40 bg-[#0E0B04]/90 overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
        <div className="grid grid-cols-1 lg:grid-cols-12">

          {/* Left Column: Contact Sidebar & Direct Channels */}
          <div className="lg:col-span-4 p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-[#D4AF37]/20 bg-[#0A0803] flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] tracking-[0.3em] uppercase text-[#E2B857] font-bold block mb-1">
                  CONTACT DETAILS
                </span>
                <h3 className="text-xl font-extrabold text-white uppercase tracking-wide">
                  Direct Channels
                </h3>
                <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
                  Reach out to our corporate concierge desk for immediate assistance.
                </p>
              </div>

              {/* Contact Info Items */}
              <div className="space-y-5 text-xs text-neutral-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 text-[#E2B857]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold block mb-0.5">
                      Phone / Viber Concierge
                    </span>
                    <a href="tel:+639158889482" className="text-sm font-bold text-white hover:text-[#E2B857] transition-colors block">
                      0915 888 9482
                    </a>
                    <a href="tel:+63286502540" className="text-xs font-semibold text-neutral-300 hover:text-[#E2B857] transition-colors">
                      (02) 8 650 2540
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 text-[#E2B857]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold block mb-0.5">
                      Corporate Email Desk
                    </span>
                    <a href="mailto:contact@alphapremier.com" className="text-sm font-bold text-white hover:text-[#E2B857] transition-colors">
                      contact@alphapremier.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 text-[#E2B857]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold block mb-0.5">
                      Ortigas Headquarters
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
                <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 font-bold block mb-3">
                  CONNECT WITH US
                </span>
                <div className="flex items-center gap-3">
                  {[
                    { icon: <Facebook className="w-4 h-4" />, label: 'Facebook', href: 'https://www.facebook.com/alphapremiergroup' },
                    { icon: <Instagram className="w-4 h-4" />, label: 'Instagram', href: 'https://www.instagram.com/alphapremiergroup/' },
                    { icon: <TikTokIcon size={16} />, label: 'TikTok', href: 'https://www.tiktok.com/@alphapremierr' },
                    { icon: <Linkedin className="w-4 h-4" />, label: 'LinkedIn', href: 'https://www.linkedin.com/company/alpha-premier-group' },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="w-9 h-9 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-neutral-400 hover:border-[#D4AF37] hover:text-[#E2B857] hover:bg-[#D4AF37]/10 transition-all"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Why Alpha Premier Group Strip (Dynamic Tree Style) */}
            <div className="rounded-2xl p-5 border border-[#D4AF37]/30 bg-[#D4AF37]/10 space-y-3 text-xs my-4">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#E2B857] font-extrabold block">
                WHY ALPHA PREMIER GROUP
              </span>
              {[
                "7 market-leading enterprise divisions",
                "Full-service execution from concept to operation",
                "12+ years of industry leadership & corporate advisory",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#E2B857] shrink-0 mt-0.5" />
                  <span className="text-xs text-neutral-200 font-medium leading-snug">{item}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-8 p-8 sm:p-12">
            {submitted ? (
              <div className="p-8 text-center space-y-6 my-auto flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-16 h-16 bg-[#D4AF37]/20 border border-[#D4AF37] text-[#E2B857] flex items-center justify-center rounded-full shadow-lg">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-extrabold tracking-wide text-white uppercase">
                  Inquiry Submitted Successfully
                </h3>
                <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-[#E2B857]">{fullName}</strong>. An executive representative from <span className="text-[#E2B857]">{enterprise}</span> will review your requirements and reach out via email or phone within 24 hours.
                </p>
                {ticketRef && (
                  <span className="inline-block px-4 py-1.5 bg-black/70 border border-[#D4AF37]/40 text-xs font-mono text-neutral-300 rounded-full">
                    Reference Ticket #: <strong className="text-[#E2B857]">{ticketRef}</strong>
                  </span>
                )}
                <div className="pt-4 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-8 py-3 bg-[#D4AF37] text-neutral-950 font-extrabold text-xs tracking-widest uppercase hover:bg-[#FFF3D1] transition-all rounded-full cursor-pointer shadow-xl"
                  >
                    SUBMIT ANOTHER INQUIRY
                  </button>
                  <button
                    onClick={() => navigate('/enterprises')}
                    className="px-8 py-3 border border-[#D4AF37]/50 text-[#E2B857] font-bold text-xs tracking-widest uppercase hover:bg-[#D4AF37]/10 transition-all rounded-full cursor-pointer"
                  >
                    EXPLORE ENTERPRISES
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                <div>
                  <h3 className="text-xl font-extrabold text-white uppercase tracking-wider">
                    Tell Us About Your Project & Requirements
                  </h3>
                  <p className="text-xs text-neutral-400 font-light mt-1">
                    Fill in the form below and an APG executive will respond within 24 hours.
                  </p>
                </div>

                {/* Row 1: Full Name */}
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className="w-full bg-black/90 border border-neutral-800 focus:border-[#D4AF37] px-4 py-3 text-white placeholder-neutral-500 outline-none rounded-xl text-sm transition-colors"
                  />
                </div>

                {/* Row 2: Email + Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="juan@yourbrand.com"
                      className="w-full bg-black/90 border border-neutral-800 focus:border-[#D4AF37] px-4 py-3 text-white placeholder-neutral-500 outline-none rounded-xl text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1.5">
                      Company / Organization Name
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Your Brand / Company Name"
                      className="w-full bg-black/90 border border-neutral-800 focus:border-[#D4AF37] px-4 py-3 text-white placeholder-neutral-500 outline-none rounded-xl text-sm transition-colors"
                    />
                  </div>
                </div>

                {/* Row 3: Enterprise Division + Budget Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1.5">
                      Enterprise Division Interest *
                    </label>
                    <div className="relative">
                      <select
                        value={enterprise}
                        onChange={(e) => setEnterprise(e.target.value)}
                        className="w-full bg-black/90 border border-neutral-800 focus:border-[#D4AF37] px-4 py-3 text-white outline-none rounded-xl appearance-none pr-10 cursor-pointer text-sm transition-colors"
                      >
                        {ENTERPRISES.map((ent) => (
                          <option key={ent.id} value={ent.name} className="bg-[#0B0D12]">
                            {ent.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1.5">
                      Estimated Budget Range
                    </label>
                    <div className="relative">
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full bg-black/90 border border-neutral-800 focus:border-[#D4AF37] px-4 py-3 text-white outline-none rounded-xl appearance-none pr-10 cursor-pointer text-sm transition-colors"
                      >
                        {BUDGET_OPTIONS.map((o) => (
                          <option key={o} value={o} className="bg-[#0B0D12]">
                            {o}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 4: Timeline + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1.5">
                      Target Timeline / Date
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Immediate, Q3 2026, or flexible"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-black/90 border border-neutral-800 focus:border-[#D4AF37] px-4 py-3 text-white placeholder-neutral-500 outline-none rounded-xl text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1.5">
                      Phone / Viber Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0917 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-black/90 border border-neutral-800 focus:border-[#D4AF37] px-4 py-3 text-white placeholder-neutral-500 outline-none rounded-xl text-sm transition-colors"
                    />
                  </div>
                </div>

                {/* Row 5: Project Details */}
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1.5">
                    Project Details / Requirements *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your project goals, required property specifications, facility cleaning needs, outsourcing team size, or corporate setup..."
                    className="w-full bg-black/90 border border-neutral-800 focus:border-[#D4AF37] p-4 text-white placeholder-neutral-500 outline-none rounded-xl text-sm resize-none transition-colors"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 text-xs">
                    {errorMessage}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 bg-[#D4AF37] hover:bg-[#FFF3D1] disabled:opacity-50 text-neutral-950 font-extrabold text-xs tracking-wider uppercase py-4 px-8 rounded-full transition-all duration-300 shadow-xl cursor-pointer hover:scale-[1.01]"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Submitting Inquiry...' : 'Send Message via Email'}
                  </button>
                </div>

              </form>
            )}
          </div>

        </div>
      </div>

      {/* Visit Our Office / Ortigas HQ Map Section (Dynamic Tree Style) */}
      <div className="space-y-5 pt-6 text-center">
        <div>
          <span className="text-xs tracking-[0.3em] uppercase text-[#E2B857] font-bold block mb-1">
            FIND US
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">
            Visit Our <span className="text-[#E2B857]">Ortigas Headquarters</span>
          </h2>
        </div>

        <div 
          className="rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl"
          style={{ height: '360px' }}
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

        <div className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0E0B04] border border-[#D4AF37]/30 text-xs sm:text-sm text-neutral-300 rounded-full shadow-lg">
          <MapPin className="w-4 h-4 text-[#E2B857] shrink-0" />
          <span>
            Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City
          </span>
        </div>
      </div>

    </div>
  );
};
