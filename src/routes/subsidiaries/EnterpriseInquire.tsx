import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { Send, CheckCircle2, AlertCircle, Phone, Mail, Clock, ShieldCheck, MapPin, ChevronDown } from 'lucide-react';
import { getEnterpriseConfig } from '../../data/enterpriseConfig';

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const BUDGET_OPTIONS = [
  "Select Budget Range",
  "Under ₱50,000",
  "₱50,000 – ₱150,000",
  "₱150,000 – ₱500,000",
  "₱500,000 – ₱1,000,000",
  "₱1,000,000+",
  "To be discussed",
];

export default function EnterpriseInquire() {
  const location = useLocation();
  const config = getEnterpriseConfig(location.pathname);

  const accentColor = config.accentColor || '#C5A059';
  const logoSrc = config.logoSrc || config.footer?.logoSrc || '/assets/images/logo2025.png';
  const logoAlt = config.logoAlt || config.name || 'Alpha Premier Enterprise';

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    budget: 'Select Budget Range',
    subject: '',
    message: '',
  });

  const [selectedTopic, setSelectedTopic] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [ticket, setTicket] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(topic);
    setForm(prev => ({ ...prev, subject: `Inquiry regarding ${topic}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const fullMsg = [
        form.message.trim(),
        form.company ? `Company / Org: ${form.company}` : '',
        form.budget && form.budget !== 'Select Budget Range' ? `Budget: ${form.budget}` : '',
        selectedTopic ? `Topic: ${selectedTopic}` : '',
      ].filter(Boolean).join('\n\n');

      const res = await fetch('/api/inquire.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          subject: form.subject || `[${config.name}] Consultation Inquiry`,
          message: fullMsg,
          source: `subsidiary_${config.slug || 'inquiry'}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success !== false)) {
        setStatus('success');
        setTicket(data.ticket || `APG-INQ-${Date.now().toString().slice(-8)}`);
        setForm({ fullName: '', email: '', phone: '', company: '', budget: 'Select Budget Range', subject: '', message: '' });
        setSelectedTopic('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleOpenLiveChat = () => {
    const toggler = document.querySelector('.luxe-chatbot-toggler') as HTMLElement | null;
    if (toggler) {
      toggler.click();
    }
  };

  const topicList = config.quickPrompts || [
    'Property Leasing & Investment',
    'General Contracting & Build',
    'Disinfection & Facility Hygiene',
    'Creative Media & Commercials',
    'Global BPO & Offshoring',
    'Virtual Office & Ortigas Address'
  ];

  return (
    <>
      <Helmet>
        <title>{`Inquire & Consultation | ${config.name} | Alpha Premier Group`}</title>
        <meta
          name="description"
          content={`Get in touch with ${config.name} — schedule a consultation or inquire about our services.`}
        />
        <link rel="icon" type="image/png" href={logoSrc} />
      </Helmet>

      <div className="min-h-screen bg-[#0A0803] text-neutral-100 font-sans relative overflow-x-hidden pt-20 pb-20">
        
        {/* Ambient Radial Background Glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
            style={{
              background: `radial-gradient(ellipse at 50% 30%, ${accentColor} 0%, transparent 70%)`,
              filter: 'blur(100px)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, ${accentColor} 1px, transparent 1px)`,
              backgroundSize: '36px 36px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 pt-8">

          {/* ── Page Header Hero ── */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.div variants={fadeInUp} className="inline-block mb-4">
              <Link to={`/subsidiaries/${config.slug}`}>
                <img 
                  src={logoSrc} 
                  alt={logoAlt} 
                  className="h-14 sm:h-16 w-auto mx-auto object-contain drop-shadow-md" 
                />
              </Link>
            </motion.div>

            <motion.span 
              variants={fadeInUp}
              className="text-xs tracking-[0.35em] uppercase font-bold block mb-2.5"
              style={{ color: accentColor }}
            >
              Let's Connect & Work Together
            </motion.span>

            <motion.h1 
              variants={fadeInUp}
              className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white font-sans"
            >
              Start Your <span style={{ color: accentColor }}>Discovery Consultation</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto mt-3 leading-relaxed font-light"
            >
              Share your operational goals with our executive team. We respond within 24 business hours with custom solution recommendations for <strong className="text-white">{config.name}</strong>.
            </motion.p>
          </motion.div>

          {/* ── Two-Column Glassmorphic Card ── */}
          <div 
            className="rounded-3xl overflow-hidden border shadow-[0_10px_50px_rgba(0,0,0,0.8)]"
            style={{ 
              backgroundColor: 'rgba(15, 12, 6, 0.85)', 
              borderColor: `${accentColor}40`,
              backdropFilter: 'blur(20px)' 
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">

              {/* Left Column: Direct Contact & Channels */}
              <div 
                className="lg:col-span-4 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r flex flex-col justify-between gap-8"
                style={{ 
                  backgroundColor: 'rgba(20, 16, 8, 0.95)',
                  borderColor: `${accentColor}30` 
                }}
              >
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-[10px] tracking-[0.3em] uppercase font-bold block mb-1" style={{ color: accentColor }}>
                      Direct Channels
                    </span>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                      Contact Details
                    </h3>
                  </div>

                  {/* Contact Info Items */}
                  <div className="flex flex-col gap-3.5 text-xs text-neutral-300">
                    <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/50 border border-white/10 hover:border-white/30 transition-all shadow-sm group">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                      >
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold block mb-0.5">
                          Email Desk
                        </span>
                        <a href="mailto:contact@alphapremier.com" className="text-sm font-semibold text-white group-hover:underline">
                          {config.footer?.connect?.email || 'contact@alphapremier.com'}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/50 border border-white/10 hover:border-white/30 transition-all shadow-sm group">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                      >
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold block mb-0.5">
                          Concierge Line
                        </span>
                        <a href="tel:+639158889482" className="text-sm font-semibold text-white group-hover:underline">
                          {config.footer?.connect?.phone || '0915 888 9482 / (02) 8 650 2540'}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/50 border border-white/10 hover:border-white/30 transition-all shadow-sm group">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                      >
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold block mb-0.5">
                          Response Guarantee
                        </span>
                        <span className="text-sm font-semibold text-white">
                          Within 24 business hours
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confidential NDA Badge */}
                <div 
                  className="rounded-2xl p-5 border text-xs leading-relaxed"
                  style={{ 
                    backgroundColor: `${accentColor}10`,
                    borderColor: `${accentColor}30`,
                    color: '#E5E5E5' 
                  }}
                >
                  <div className="flex items-center gap-2 font-bold mb-1.5" style={{ color: accentColor }}>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confidential & Secure</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-light">
                    All consultations, metrics, and inquiry details are protected under strict corporate non-disclosure agreements (NDAs).
                  </p>
                </div>
              </div>

              {/* Right Column: Interactive Form */}
              <div className="lg:col-span-8 p-8 lg:p-10">
                
                {status === 'success' ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[380px] gap-5 text-center px-4">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                    >
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold uppercase text-white tracking-wide mb-2">
                        Inquiry Received!
                      </h3>
                      <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                        Thank you for reaching out to <strong style={{ color: accentColor }}>{config.name}</strong>. An executive representative will review your request and contact you within 24 business hours.
                      </p>
                      {ticket && (
                        <span className="inline-block mt-3 px-3 py-1 bg-black/60 border border-neutral-700 text-[11px] font-mono text-neutral-400 rounded-full">
                          Reference Ticket #: <strong style={{ color: accentColor }}>{ticket}</strong>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-4 text-xs font-bold px-6 py-2.5 rounded-full border transition-all cursor-pointer"
                      style={{ borderColor: accentColor, color: accentColor }}
                    >
                      Submit another inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs">
                    
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-1">
                        Send Us a Message
                      </h2>
                      <p className="text-neutral-400 text-[11px]">
                        Required fields marked with *
                      </p>
                    </div>

                    {/* Area of Interest Quick Pills */}
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase font-bold mb-2 text-neutral-300">
                        Select Primary Area of Interest:
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {topicList.map((topic) => (
                          <button
                            type="button"
                            key={topic}
                            onClick={() => handleTopicClick(topic)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                              selectedTopic === topic ? 'scale-105 shadow-md' : 'hover:bg-white/10'
                            }`}
                            style={{
                              backgroundColor: selectedTopic === topic ? accentColor : 'rgba(255,255,255,0.05)',
                              color: selectedTopic === topic ? '#000000' : '#E5E5E5',
                              borderColor: selectedTopic === topic ? accentColor : 'rgba(255,255,255,0.15)',
                            }}
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    </div>

                    {status === 'error' && (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Something went wrong. Please try again or email us directly at contact@alphapremier.com.</span>
                      </div>
                    )}

                    {/* Form Input Rows */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] tracking-wider uppercase font-bold text-neutral-300 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          placeholder="Juan Dela Cruz"
                          value={form.fullName}
                          onChange={handleChange}
                          disabled={status === 'sending'}
                          className="w-full bg-black/70 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] tracking-wider uppercase font-bold text-neutral-300 mb-1">
                          Business Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="juan@company.com"
                          value={form.email}
                          onChange={handleChange}
                          disabled={status === 'sending'}
                          className="w-full bg-black/70 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] tracking-wider uppercase font-bold text-neutral-300 mb-1">
                          Phone / Viber Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          placeholder="0917 123 4567"
                          value={form.phone}
                          onChange={handleChange}
                          disabled={status === 'sending'}
                          className="w-full bg-black/70 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none rounded-xl"
                        />
                      </div>

                      <div className="relative">
                        <label className="block text-[10px] tracking-wider uppercase font-bold text-neutral-300 mb-1">
                          Budget Range
                        </label>
                        <div className="relative">
                          <select
                            name="budget"
                            value={form.budget}
                            onChange={handleChange}
                            disabled={status === 'sending'}
                            className="w-full bg-black/70 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white outline-none rounded-xl appearance-none pr-10 cursor-pointer"
                          >
                            {BUDGET_OPTIONS.map((opt) => (
                              <option key={opt} value={opt} className="bg-[#0B0D12]">
                                {opt}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-wider uppercase font-bold text-neutral-300 mb-1">
                        Inquiry Subject / Topic
                      </label>
                      <input
                        type="text"
                        name="subject"
                        placeholder="How can we assist your business?"
                        value={form.subject}
                        onChange={handleChange}
                        disabled={status === 'sending'}
                        className="w-full bg-black/70 border border-neutral-800 focus:border-[#D4AF37] px-3.5 py-2.5 text-white placeholder-neutral-500 outline-none rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-wider uppercase font-bold text-neutral-300 mb-1">
                        Project Details / Message *
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        placeholder="Tell us about your project requirements, timeline, or objectives..."
                        value={form.message}
                        onChange={handleChange}
                        disabled={status === 'sending'}
                        className="w-full bg-black/70 border border-neutral-800 focus:border-[#D4AF37] p-3.5 text-white placeholder-neutral-500 outline-none rounded-xl resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="w-full flex items-center justify-center gap-2.5 text-neutral-950 font-black text-xs uppercase tracking-widest py-4 px-6 rounded-full transition-all duration-300 shadow-xl cursor-pointer hover:scale-[1.01]"
                        style={{ backgroundColor: accentColor }}
                      >
                        <Send className="w-4 h-4" />
                        {status === 'sending' ? 'Submitting Inquiry...' : 'Submit Inquiry'}
                      </button>
                    </div>

                  </form>
                )}

              </div>

            </div>
          </div>

          {/* ── Ortigas HQ Interactive Map Section ── */}
          <div className="mt-16 text-center">
            <span className="text-xs tracking-[0.3em] uppercase font-bold block mb-2" style={{ color: accentColor }}>
              Find Our Office
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mb-6 tracking-tight">
              Visit Our <span style={{ color: accentColor }}>Ortigas Headquarters</span>
            </h2>

            <div 
              className="rounded-3xl overflow-hidden border shadow-2xl relative h-[380px] sm:h-[420px]"
              style={{ borderColor: `${accentColor}30` }}
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

            <div className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-neutral-800 text-xs text-neutral-300">
              <MapPin className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
              <span>
                Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City
              </span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
