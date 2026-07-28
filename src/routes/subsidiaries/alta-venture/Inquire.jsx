import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { TEAL, MUTED } from './shared';
import { Pill } from './shared';

export default function Inquire() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [ticket, setTicket] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, recipient: 'alta-venture' }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setTicket(data.ticket || '');
        setForm({ name: '', email: '', subject: '', message: '' });
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

      <section className="relative overflow-hidden py-20 px-8 md:px-14" style={{ background: '#e2f8f0' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -90, right: -50, width: 480, height: 420,
              background: 'radial-gradient(ellipse at 50% 40%, #74e87a 0%, #c8f5b0 52%, transparent 76%)',
              filter: 'blur(72px)', opacity: 0.65,
            }}
          />
          <div
            style={{
              position: 'absolute', bottom: -70, left: -50, width: 420, height: 360,
              background: 'radial-gradient(ellipse at 48% 56%, #b8c8f8 0%, transparent 70%)',
              filter: 'blur(80px)', opacity: 0.45,
            }}
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <Pill>Let's Talk</Pill>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4" style={{ color: TEAL, letterSpacing: '-0.02em' }}>
            Get In Touch
          </h1>
          <p className="text-base leading-relaxed max-w-md mx-auto" style={{ color: MUTED }}>
            Tell us about your business and what you're looking for. We'll get back to you within 24 hours.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 px-8 md:px-14" style={{ background: '#f6fef9' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            style={{
              position: 'absolute', top: -140, left: -100, width: 520, height: 460,
              background: 'radial-gradient(ellipse at 40% 40%, #c4f5e4 0%, transparent 68%)',
              filter: 'blur(60px)', opacity: 0.55,
            }}
          />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="rounded-3xl p-7 md:p-10 flex flex-col gap-5">
            <div
              style={{
                background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.95)',
                boxShadow: '0 4px 28px rgba(13,61,82,0.07), inset 0 1px 0 rgba(255,255,255,0.90)',
                borderRadius: 24, padding: 32,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${TEAL}10`, color: TEAL }}>
                  <Send size={18} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: TEAL }}>Send us a message</h2>
              </div>
              <p className="text-xs leading-relaxed mb-6" style={{ color: MUTED }}>
                Fields marked with <span style={{ color: TEAL }}>*</span> are required. We typically reply within one
                business day.
              </p>

              {status === 'success' && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium"
                  style={{ background: `${TEAL}10`, color: TEAL, border: `1px solid ${TEAL}25` }}
                >
                  <CheckCircle2 size={16} /> Message sent! We'll be in touch shortly.
                  {ticket && <span className="ml-auto text-xs" style={{ color: MUTED }}>Ticket: {ticket}</span>}
                </div>
              )}
              {status === 'error' && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium"
                  style={{ background: 'rgba(212,24,61,0.08)', color: '#d4183d', border: '1px solid rgba(212,24,61,0.25)' }}
                >
                  <AlertCircle size={16} /> Something went wrong. Please try again or email us directly at
                  hello@altaventureoutsourcing.com.
                </div>
              )}

              <div className="flex flex-col gap-3">
                <input
                  type="text" name="name" placeholder="Your Name *"
                  value={form.name} onChange={handleChange} required disabled={status === 'sending'}
                  className="av-input"
                />
                <input
                  type="email" name="email" placeholder="Your Email *"
                  value={form.email} onChange={handleChange} required disabled={status === 'sending'}
                  className="av-input"
                />
                <input
                  type="text" name="subject" placeholder="Subject"
                  value={form.subject} onChange={handleChange} disabled={status === 'sending'}
                  className="av-input"
                />
                <textarea
                  name="message" rows="5" placeholder="Tell us about your business and what you're looking for *"
                  value={form.message} onChange={handleChange} required disabled={status === 'sending'}
                  className="av-input"
                  style={{ resize: 'vertical' }}
                />
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:hover:translate-y-0"
                  style={{ background: TEAL, color: '#fff', boxShadow: `0 4px 18px ${TEAL}30` }}
                >
                  {status === 'sending' ? 'Sending...' : (<>Send message <ArrowRight size={15} /></>)}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
