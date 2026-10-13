import { getTurnstileToken } from '@/lib/turnstile';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useModalDialog } from '../../hooks/useModalDialog';
import { useFieldErrors } from '../../hooks/useFieldErrors';
import { emailError, nameError, phoneError, textError } from '../../lib/formValidation';
import { InquireFormData } from '../../types';
import { INQUIRY_COMPANY_OPTIONS, INQUIRY_GROUP_NAME } from '../../data/companyData';
import { X, CheckCircle2, Calendar, Mail, Phone, User, Building, Send, MapPin, MessageCircle, ChevronDown, Check } from 'lucide-react';
import { useSiteSettings, mainSocials, phoneParts, telHref, addressOneLine, mapEmbedSrc } from '../../hooks/useSiteSettings';
import { SocialIcon } from './SocialIcon';

const MAP_EMBED_DEFAULT = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.3821!2d121.0562!3d14.5871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c8f50a4f7b1d%3A0x6b2a6c5e3a4b8c9d!2sPhilippine%20Stock%20Exchange%20Centre%2C%20Exchange%20Rd%2C%20Ortigas%20Center%2C%20Pasig%2C%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1720000000000!5m2!1sen!2sph';
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
  defaultInquiryType?: 'virtual-office' | 'partnership' | 'career' | 'general';
}

export const InquireModal: React.FC<InquireModalProps> = ({
  isOpen,
  onClose,
  defaultEnterprise,
  defaultInquiryType = 'general',
}) => {
  const [submitted, setSubmitted] = useState(false);
  const formStartedAt = useRef(Date.now());
  const [ticketRef, setTicketRef] = useState('');
  const [formData, setFormData] = useState<InquireFormData>({
    fullName: '',
    email: '',
    phone: '',
    enterprise: defaultEnterprise || INQUIRY_GROUP_NAME,
    inquiryType: defaultInquiryType,
    message: '',
    preferredDate: '',
  });

  const [company, setCompany] = useState('');
  const [budget, setBudget] = useState('Select Budget Range');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dialogRef = useModalDialog<HTMLDivElement>(isOpen, onClose);
  const fields = useFieldErrors({
    fullName: nameError,
    email: emailError,
    company: (v) => textError(v, { label: 'Company', max: 150 }),
    enterprise: (v) => textError(v, { label: 'Enterprise division', required: true }),
    timeline: (v) => textError(v, { label: 'Timeline', max: 100 }),
    phone: (v) => phoneError(v),
    message: (v) => textError(v, { label: 'Message', required: true, min: 10, max: 5000 }),
  });
  const resetFieldErrors = fields.reset;
  const settings = useSiteSettings();
  const phone = settings.phone as string;
  const email = settings.email as string;

  // The modal stays mounted between opens: start each open fresh and on the enterprise it was opened for.
  useEffect(() => {
    if (!isOpen) return;
    setSubmitted(false);
    setErrorMessage('');
    resetFieldErrors();
    formStartedAt.current = Date.now();
    setFormData((prev) => ({
      ...prev,
      enterprise: defaultEnterprise || INQUIRY_GROUP_NAME,
      inquiryType: defaultInquiryType,
    }));
  }, [isOpen, defaultEnterprise, defaultInquiryType, resetFieldErrors]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const valid = fields.validate({
      fullName: formData.fullName,
      email: formData.email,
      company,
      enterprise: formData.enterprise,
      timeline: formData.preferredDate,
      phone: formData.phone,
      message: formData.message,
    });
    if (!valid) return;
    setLoading(true);

    try {
      const fullMsg = [
        formData.message.trim(),
        company ? `Company / Org: ${company}` : '',
        budget && budget !== 'Select Budget Range' ? `Budget: ${budget}` : '',
        formData.preferredDate ? `Target Timeline: ${formData.preferredDate}` : '',
      ].filter(Boolean).join('\n\n');

      const res = await fetch('/api/inquire.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          company: company.trim() || undefined,
          enterprise: formData.enterprise,
          budget: budget && budget !== 'Select Budget Range' ? budget : undefined,
          timeline: formData.preferredDate.trim() || undefined,
          subject: `[${formData.enterprise}] Consultation Inquiry`,
          message: formData.message.trim(),
          source: formData.enterprise,
          website: '',
          form_started_at: formStartedAt.current,
          turnstile_token: await getTurnstileToken(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success !== true) {
        throw new Error((typeof data.error === 'string' && data.error) || data.message || 'Failed to submit inquiry. Please try again.');
      }

      setTicketRef(data.ticket || `APG-${Date.now().toString().slice(-6)}`);
      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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

  // Portalled to <body>: page content sits in a z-10 stacking context below the fixed navbar.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto font-sans">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquire-modal-title"
        tabIndex={-1}
        className="bg-[#0B0905] border border-[#D4AF37]/50 w-full max-w-5xl text-neutral-100 shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden rounded-3xl relative my-auto max-h-[92dvh] flex flex-col">
        
        {/* Modal Top Header Bar */}
        <div className="bg-black/90 px-4 sm:px-6 py-4 border-b border-[#D4AF37]/20 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src={logoImg} 
              alt="Alpha Premier Group" 
              className="h-8 w-auto object-contain"
              onError={(e) => { e.currentTarget.src = apgLogoFallback; }}
            />
            <div>
              <span className="text-xs font-black tracking-[0.25em] text-[#E2B857] uppercase block">
                ALPHA PREMIER GROUP OPC
              </span>
              <h2 id="inquire-modal-title" className="text-xs sm:text-sm font-extrabold tracking-wider text-white uppercase">
                INQUIRE & SCHEDULE CONSULTATION
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 shrink-0 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all cursor-pointer"
            aria-label="Close inquiry form"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 space-y-8">

          {/* Hero Header Banner (Dynamic Tree Style) */}
          <div className="text-center space-y-2">
            <span className="text-xs tracking-[0.35em] uppercase text-[#E2B857] font-bold block">
              LET'S WORK TOGETHER
            </span>
            <h1 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
              START YOUR <span className="text-[#E2B857]">DISCOVERY CONSULTATION</span>
            </h1>
            <p className="text-sm text-neutral-400 max-w-xl mx-auto font-normal leading-relaxed">
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
                    <span className="text-xs tracking-[0.3em] uppercase text-[#E2B857] font-bold block mb-1">
                      CONTACT DETAILS
                    </span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                      Direct Channels
                    </h3>
                    <p className="text-sm text-neutral-400 mt-1 font-normal leading-relaxed">
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
                        <span className="text-xs tracking-widest uppercase text-neutral-400 font-bold block mb-0.5">
                          Phone / Viber
                        </span>
                        <a href={telHref(phoneParts(phone)[0])} className="text-xs font-semibold text-white hover:text-[#E2B857] transition-colors">
                          {phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#E2B857]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs tracking-widest uppercase text-neutral-400 font-bold block mb-0.5">
                          Email Desk
                        </span>
                        <a href={`mailto:${email}`} className="inline-block py-1 wrap-anywhere text-xs font-semibold text-white hover:text-[#E2B857] transition-colors">
                          {email.split('@')[0]}@<wbr />{email.split('@').slice(1).join('@')}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#E2B857]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs tracking-widest uppercase text-neutral-400 font-bold block mb-0.5">
                          Headquarters
                        </span>
                        <span className="text-xs font-normal text-neutral-300 leading-relaxed block">
                          {settings.address_short as string}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#D4AF37]/20" />

                  {/* Connect Social Links */}
                  <div>
                    <span className="text-xs tracking-[0.25em] uppercase text-neutral-400 font-bold block mb-3">
                      CONNECT WITH US
                    </span>
                    <div className="flex items-center gap-2.5">
                      {mainSocials(settings).map((s) => (
                        <a
                          key={s.key}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label}
                          className="w-10 h-10 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-neutral-400 hover:border-[#D4AF37] hover:text-[#E2B857] hover:bg-[#D4AF37]/10 transition-all"
                        >
                          <SocialIcon platform={s.key} className="w-3.5 h-3.5" tiktokSize={14} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Why Alpha Premier Group Strip (Dynamic Tree Style) */}
                <div className="rounded-xl p-4 border border-[#D4AF37]/30 bg-[#D4AF37]/10 space-y-2 text-xs">
                  <span className="text-xs tracking-[0.25em] uppercase text-[#E2B857] font-bold block">
                    WHY ALPHA PREMIER GROUP
                  </span>
                  {[
                    "7 market-leading enterprise divisions",
                    "Full-service from concept to execution",
                    "12+ years of industry leadership & advisory",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#E2B857] shrink-0 mt-0.5" />
                      <span className="text-xs text-neutral-300 font-normal leading-snug">{item}</span>
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
                    <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong className="text-[#E2B857]">{formData.fullName}</strong>. An executive representative from <span className="text-[#E2B857]">{formData.enterprise}</span> will review your requirements and reach out via email or phone within 24 hours.
                    </p>
                    {ticketRef && (
                      <span className="inline-block px-3 py-1 bg-black/60 border border-[#D4AF37]/40 text-xs font-mono text-neutral-300 rounded-full">
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
                  <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />
                    <div>
                      <h3 className="text-base font-bold text-white uppercase tracking-wider">
                        Tell Us About Your Project
                      </h3>
                      <p className="text-xs text-neutral-400 font-normal mt-0.5">
                        Fill in the form below and our corporate team will respond within 24 hours.
                      </p>
                    </div>

                    {/* Row 1: Full Name */}
                    <div>
                      <label htmlFor="modal-inquire-name" className="block text-xs tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        {...fields.field('fullName')} id="modal-inquire-name" autoComplete="name"
                        name="fullName"
                        required
                        maxLength={100}
                        value={formData.fullName}
                        onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); fields.recheck('fullName', e.target.value); }}
                        placeholder="Juan Dela Cruz"
                        className="w-full bg-black/80 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none rounded-xl"
                      />
                      {fields.errors.fullName && <p id={fields.errorId('fullName')} className="mt-1 text-xs font-semibold text-red-400">{fields.errors.fullName}</p>}
                    </div>

                    {/* Row 2: Email + Company */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label htmlFor="modal-inquire-email" className="block text-xs tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          {...fields.field('email')} id="modal-inquire-email" inputMode="email" autoComplete="email"
                          name="email"
                          required
                          maxLength={254}
                          value={formData.email}
                          onChange={(e) => { setFormData({ ...formData, email: e.target.value }); fields.recheck('email', e.target.value); }}
                          placeholder="juan@yourbrand.com"
                          className="w-full bg-black/80 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none rounded-xl"
                        />
                      {fields.errors.email && <p id={fields.errorId('email')} className="mt-1 text-xs font-semibold text-red-400">{fields.errors.email}</p>}
                      </div>
                      <div>
                        <label htmlFor="modal-inquire-company" className="block text-xs tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1">
                          Company / Organization
                        </label>
                        <input
                          type="text"
                          {...fields.field('company')} id="modal-inquire-company" autoComplete="organization" maxLength={150}
                          name="company"
                          value={company}
                          onChange={(e) => { setCompany(e.target.value); fields.recheck('company', e.target.value); }}
                          placeholder="Your Brand / Company Name"
                          className="w-full bg-black/80 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none rounded-xl"
                        />
                      {fields.errors.company && <p id={fields.errorId('company')} className="mt-1 text-xs font-semibold text-red-400">{fields.errors.company}</p>}
                      </div>
                    </div>

                    {/* Row 3: Enterprise Division + Budget Range */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="relative">
                        <label htmlFor="modal-inquire-enterprise" className="block text-xs tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1">
                          Enterprise Division Interest *
                        </label>
                        <div className="relative">
                          <select
                            {...fields.field('enterprise')} id="modal-inquire-enterprise" required
                            name="enterprise"
                            value={formData.enterprise}
                            onChange={(e) => { setFormData({ ...formData, enterprise: e.target.value }); fields.recheck('enterprise', e.target.value); }}
                            className="w-full bg-black/80 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white outline-none rounded-xl appearance-none pr-9 cursor-pointer"
                          >
                            {INQUIRY_COMPANY_OPTIONS.map((name) => (
                              <option key={name} value={name} className="bg-[#0B0D12]">
                                {name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      {fields.errors.enterprise && <p id={fields.errorId('enterprise')} className="mt-1 text-xs font-semibold text-red-400">{fields.errors.enterprise}</p>}
                      </div>

                      <div className="relative">
                        <label htmlFor="modal-inquire-budget" className="block text-xs tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1">
                          Budget Range
                        </label>
                        <div className="relative">
                          <select
                            id="modal-inquire-budget"
                            name="budget"
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
                        <label htmlFor="modal-inquire-timeline" className="block text-xs tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1">
                          Target Timeline / Date
                        </label>
                        <input
                          type="text"
                          {...fields.field('timeline')} id="modal-inquire-timeline" maxLength={100}
                          name="timeline"
                          placeholder="e.g. Q3 2026 or Immediate"
                          value={formData.preferredDate}
                          onChange={(e) => { setFormData({ ...formData, preferredDate: e.target.value }); fields.recheck('timeline', e.target.value); }}
                          className="w-full bg-black/80 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none rounded-xl"
                        />
                      {fields.errors.timeline && <p id={fields.errorId('timeline')} className="mt-1 text-xs font-semibold text-red-400">{fields.errors.timeline}</p>}
                      </div>
                      <div>
                        <label htmlFor="modal-inquire-phone" className="block text-xs tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1">
                          Phone / Viber Number *
                        </label>
                        <input
                          type="tel"
                          {...fields.field('phone')} id="modal-inquire-phone" inputMode="tel" autoComplete="tel" maxLength={30}
                          name="phone"
                          required
                          placeholder="0917 123 4567"
                          value={formData.phone}
                          onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); fields.recheck('phone', e.target.value); }}
                          className="w-full bg-black/80 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none rounded-xl"
                        />
                      {fields.errors.phone && <p id={fields.errorId('phone')} className="mt-1 text-xs font-semibold text-red-400">{fields.errors.phone}</p>}
                      </div>
                    </div>

                    {/* Row 5: Project Details */}
                    <div>
                      <label htmlFor="modal-inquire-message" className="block text-xs tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1">
                        Project Details / Message *
                      </label>
                      <textarea
                        {...fields.field('message')} id="modal-inquire-message" minLength={10}
                        name="message"
                        required
                        maxLength={5000}
                        rows={3}
                        value={formData.message}
                        onChange={(e) => { setFormData({ ...formData, message: e.target.value }); fields.recheck('message', e.target.value); }}
                        placeholder="Tell us about your project, campaign goals, property requirements, or corporate needs..."
                        className="w-full bg-black/80 border border-neutral-800 focus:border-[#D4AF37] p-3.5 text-white placeholder-neutral-500 outline-none rounded-xl resize-none"
                      />
                      {fields.errors.message && <p id={fields.errorId('message')} className="mt-1 text-xs font-semibold text-red-400">{fields.errors.message}</p>}
                    </div>

                    {errorMessage && (
                      <div role="alert" className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 text-xs">
                        {errorMessage}
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#FFF3D1] disabled:opacity-50 text-neutral-950 font-extrabold text-xs tracking-wider uppercase py-3.5 px-6 rounded-full transition-all duration-300 shadow-xl cursor-pointer hover:scale-[1.01]"
                      >
                        <Send className="w-4 h-4" />
                        {loading ? 'Sending Inquiry...' : 'Send Message via Email'}
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
              <span className="text-xs tracking-[0.3em] uppercase text-[#E2B857] font-bold block mb-1">
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
                src={mapEmbedSrc(settings, MAP_EMBED_DEFAULT)}
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
                {addressOneLine(settings.address)}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  , document.body);
};
