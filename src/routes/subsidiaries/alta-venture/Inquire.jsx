import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { ArrowRight, Send, CheckCircle2, AlertCircle, Phone, Mail, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { TEAL, ACCENT, MINT_LIGHT, MUTED } from './shared';
import { Glass, Pill } from './shared';

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const INTEREST_TOPICS = [
  'Virtual CFO & Finance',
  'Fractional Talent & HR',
  'Managed IT & Cloud',
  'Customer Experience (CX)',
  'Back-Office Operations',
  'Risk & Compliance'
];

export default function Inquire() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [selectedTopic, setSelectedTopic] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [ticket, setTicket] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    setForm(prev => ({ ...prev, subject: `Inquiry regarding ${topic}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/inquire.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject || `[Alta Venture Outsource] Inquiry regarding ${selectedTopic || 'BPO & Talent'}`,
          message: form.message.trim(),
          enterprise: 'Alta Venture Outsource',
          source: 'Alta Venture Outsource',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setStatus('success');
        setTicket(data.ticket || '');
        setForm({ name: '', email: '', subject: '', message: '' });
        setSelectedTopic('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Helmet>
        <title>Inquire | Alta Venture | Alpha Premier</title>
        <meta
          name="description"
          content="Get in touch with Alta Venture Outsourcing — book a free discovery call or send us a message about your business needs."
        />
      </Helmet>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden py-24 px-6 md:px-14" style={{ background: 'linear-gradient(180deg, #e2f8f0 0%, #f6fef9 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -90, right: -50, width: 480, height: 420,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(77,232,184,0.40) 0%, transparent 70%)',
              filter: 'blur(72px)',
            }}
          />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <motion.div variants={fadeInUp}>
            <Pill>Let's Connect</Pill>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight"
            style={{ color: TEAL }}
          >
            Start Your <span style={{ color: ACCENT }}>Discovery Consultation</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-medium"
            style={{ color: MUTED }}
          >
            Share your operational goals with our team. We respond within 24 business hours with custom solution recommendations.
          </motion.p>
        </motion.div>
      </section>

      {/* ── FORM & CONTACT GRID ── */}
      <section className="relative overflow-hidden py-16 px-6 md:px-14" style={{ background: 'linear-gradient(150deg, #f0fdf8 0%, #f6fef9 50%, #f5f0ff 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Mint orb top-left */}
          <div style={{ position: 'absolute', top: -110, left: -70, width: 520, height: 460, background: 'radial-gradient(ellipse at 38% 38%, rgba(77,232,184,0.26) 0%, rgba(20,146,123,0.10) 48%, transparent 70%)', filter: 'blur(70px)' }} />
          {/* Violet orb top-right */}
          <div style={{ position: 'absolute', top: -80, right: -60, width: 450, height: 390, background: 'radial-gradient(ellipse at 62% 40%, rgba(167,139,250,0.22) 0%, rgba(124,58,237,0.09) 50%, transparent 72%)', filter: 'blur(66px)' }} />
          {/* Amber bottom */}
          <div style={{ position: 'absolute', bottom: -60, left: '25%', width: 400, height: 340, background: 'radial-gradient(ellipse at 50% 62%, rgba(251,191,36,0.16) 0%, rgba(245,158,11,0.07) 52%, transparent 72%)', filter: 'blur(72px)' }} />
          {/* Diagonal stripe */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.025"><defs><pattern id="inq-stripe" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(32)"><line x1="0" y1="0" x2="0" y2="36" stroke="#14927b" strokeWidth="1" /></pattern></defs><rect width="100%" height="100%" fill="url(#inq-stripe)" /></svg>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Quick Contact Info */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="lg:col-span-4 flex flex-col gap-6"
          >
            <motion.div variants={fadeInUp}>
              <Glass className="rounded-3xl p-8 border shadow-lg">
                <h3 className="text-xl font-extrabold mb-6" style={{ color: TEAL }}>
                  Direct Channels
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(20, 146, 123, 0.12)', color: ACCENT }}
                    >
                      <Mail size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: MUTED }}>Email Desk</span>
                      <a href="mailto:hello@altaventureoutsourcing.com" className="text-sm font-bold hover:underline" style={{ color: TEAL }}>
                        hello@altaventureoutsourcing.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(20, 146, 123, 0.12)', color: ACCENT }}
                    >
                      <Phone size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: MUTED }}>Concierge Line</span>
                      <a href="tel:+18002582249" className="text-sm font-bold hover:underline" style={{ color: TEAL }}>
                        +1 (800) ALTA-BIZ
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(20, 146, 123, 0.12)', color: ACCENT }}
                    >
                      <Clock size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: MUTED }}>Response Guarantee</span>
                      <p className="text-sm font-semibold" style={{ color: TEAL }}>
                        Within 24 business hours
                      </p>
                    </div>
                  </div>
                </div>
              </Glass>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div
                className="rounded-3xl p-8 text-white relative overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #041824 0%, #082636 100%)' }}
              >
                <ShieldCheck size={32} className="mb-4 text-[#4de8b8]" />
                <h4 className="text-lg font-bold mb-2">Confidential & Secure</h4>
                <p className="text-xs leading-relaxed opacity-85">
                  All consultations and shared metrics are covered by strict non-disclosure agreements (NDAs) by default.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Interactive Contact Form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="lg:col-span-8"
          >
            <Glass className="rounded-3xl p-8 md:p-12 border shadow-xl">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}15`, color: ACCENT }}>
                    <Send size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold" style={{ color: TEAL }}>Send Us a Message</h2>
                    <p className="text-xs font-semibold" style={{ color: MUTED }}>Required fields marked with *</p>
                  </div>
                </div>

                {/* Quick Topic Buttons */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-3" style={{ color: TEAL }}>
                    Select Primary Area of Interest:
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {INTEREST_TOPICS.map((topic) => (
                      <button
                        type="button"
                        key={topic}
                        onClick={() => handleTopicClick(topic)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                          selectedTopic === topic ? 'shadow-md scale-105' : 'hover:bg-white'
                        }`}
                        style={{
                          background: selectedTopic === topic ? TEAL : 'rgba(255,255,255,0.7)',
                          color: selectedTopic === topic ? '#ffffff' : TEAL,
                          borderColor: selectedTopic === topic ? TEAL : 'rgba(8, 38, 54, 0.15)',
                        }}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Messages */}
                {status === 'success' && (
                  <div
                    className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold border"
                    style={{ background: 'rgba(77, 232, 184, 0.15)', color: TEAL, borderColor: ACCENT }}
                  >
                    <CheckCircle2 size={20} className="text-[#14927b] flex-shrink-0" />
                    <span>Message received! Our team will contact you shortly.</span>
                    {ticket && <span className="ml-auto text-xs font-semibold" style={{ color: MUTED }}>Ref #: {ticket}</span>}
                  </div>
                )}

                {status === 'error' && (
                  <div
                    className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold border"
                    style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', borderColor: 'rgba(220,38,38,0.3)' }}
                  >
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <span>Something went wrong. Please try again or email us directly at hello@altaventureoutsourcing.com.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={{ color: TEAL }}>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={handleChange}
                      required
                      disabled={status === 'sending'}
                      className="av-input"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1.5" style={{ color: TEAL }}>Business Email *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="jane@company.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      disabled={status === 'sending'}
                      className="av-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: TEAL }}>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="How can we assist your business?"
                    value={form.subject}
                    onChange={handleChange}
                    disabled={status === 'sending'}
                    className="av-input"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1.5" style={{ color: TEAL }}>Message / Project Details *</label>
                  <textarea
                    name="message"
                    rows="5"
                    placeholder="Tell us about your team, current challenges, and goals..."
                    value={form.message}
                    onChange={handleChange}
                    required
                    disabled={status === 'sending'}
                    className="av-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="av-btn-glow flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl text-base font-extrabold transition-all hover:scale-105 shadow-xl disabled:opacity-60 cursor-pointer"
                  style={{ background: TEAL, color: '#ffffff', boxShadow: `0 6px 24px ${TEAL}35` }}
                >
                  {status === 'sending' ? (
                    'Submitting Message...'
                  ) : (
                    <>
                      Submit Inquiry <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </Glass>
          </motion.div>
        </div>
      </section>
    </>
  );
}
