import { getTurnstileToken } from '@/lib/turnstile';
import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import Seo from '../components/Seo';
import { SocialIcon } from '../components/redesign/SocialIcon';
import { useContent } from '../hooks/useContent';
import { useSiteSettings, mainSocials, phoneParts, telHref } from '../hooks/useSiteSettings';
import { useFieldErrors } from '../hooks/useFieldErrors';
import { emailError, nameError, textError } from '../lib/formValidation';

// Same visual language as the apex Inquire page (src/views/InquireView.tsx): gold eyebrow, uppercase
// headline, a gold-hairline two-column card, labelled dark inputs and a gold pill button.
const LABEL = 'block text-xs tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1.5';
const INPUT = 'w-full bg-black/90 border border-neutral-800 focus:border-[#D4AF37] px-4 py-3 text-white placeholder-neutral-400 outline-none rounded-xl text-sm transition-colors disabled:opacity-60';
const EMPTY = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [ticket, setTicket] = useState('');
  const formStartedAt = useRef(Date.now());
  const { content: copy } = useContent('contact');
  const settings = useSiteSettings();
  const email = String(settings.email);
  const fields = useFieldErrors({
    name: nameError,
    email: emailError,
    subject: (v) => textError(v, { label: 'Subject', max: 200 }),
    message: (v) => textError(v, { label: 'Message', required: true, min: 10, max: 5000 }),
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    fields.recheck(e.target.name, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fields.validate(form)) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/inquire.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source: 'Contact Page',
          website: '',
          form_started_at: formStartedAt.current,
          turnstile_token: await getTurnstileToken(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setStatus('success');
        setTicket(data.ticket || '');
        setForm(EMPTY);
        fields.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const sending = status === 'sending';
  // Site headings end in gold ("Visit our Ortigas Headquarters"); the title is admin-editable, so its
  // last word takes the accent.
  const titleWords = String(copy.hero_title).trim().split(/\s+/);
  const titleAccent = titleWords.length > 1 ? titleWords.pop() : '';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 font-sans space-y-12">
      <Seo path="/contact" title="Contact Us | Alpha Premier Group" description="Contact Alpha Premier Group at Unit 3104, Tektite East Tower, Ortigas Center, Pasig City. Call 0915 888 9482 / (02) 8 650 2540 or send us a message." />

      <header className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs sm:text-sm tracking-[0.35em] uppercase text-[#E2B857] font-bold block">Get in touch</span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight leading-tight text-balance">
          {titleWords.join(' ')}
          {titleAccent && <> <span className="text-[#E2B857]">{titleAccent}</span></>}
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed text-pretty">{copy.hero_subtitle}</p>
      </header>

      <div className="rounded-3xl border border-[#D4AF37]/40 bg-[#0E0B04]/90 overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Direct channels */}
          <aside className="lg:col-span-4 p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-[#D4AF37]/20 bg-[#0A0803] space-y-6" aria-labelledby="contact-channels">
            <div>
              <span className="text-xs tracking-[0.3em] uppercase text-[#E2B857] font-bold block mb-1">Contact details</span>
              <h2 id="contact-channels" className="text-xl font-extrabold text-white uppercase tracking-wide text-balance">Direct channels</h2>
              <p className="text-sm text-neutral-400 mt-1 leading-relaxed text-pretty">Call, email or visit our Ortigas office. We reply to messages within one business day.</p>
            </div>

            <ul className="space-y-5">
              <Channel icon={Phone} label="Phone / Viber">
                {phoneParts(String(settings.phone)).map((num, i) => (
                  <a key={num} href={telHref(num)} className={i === 0 ? 'block py-1 text-sm font-bold text-white hover:text-[#E2B857] transition-colors tabular-nums' : 'inline-block py-1 text-xs font-semibold text-neutral-300 hover:text-[#E2B857] transition-colors tabular-nums'}>
                    {num}
                  </a>
                ))}
              </Channel>
              <Channel icon={Mail} label="Email">
                <a href={`mailto:${email}`} className="inline-block max-w-full py-1 wrap-anywhere text-sm font-bold text-white hover:text-[#E2B857] transition-colors">
                  {email.split('@')[0]}@<wbr />{email.split('@').slice(1).join('@')}
                </a>
              </Channel>
              <Channel icon={MapPin} label="Office">
                <span className="block text-sm text-neutral-300 leading-relaxed">{settings.address_short}</span>
              </Channel>
              {String(settings.business_hours).trim() !== '' && (
                <Channel icon={Clock} label="Business hours">
                  <span className="block text-sm text-neutral-300 leading-relaxed whitespace-pre-line">{settings.business_hours}</span>
                </Channel>
              )}
            </ul>

            <div className="border-t border-[#D4AF37]/20 pt-6">
              <span className="text-xs tracking-[0.25em] uppercase text-neutral-400 font-bold block mb-3">Connect with us</span>
              <div className="flex items-center gap-3">
                {mainSocials(settings).map((s) => (
                  <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="size-10 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-neutral-400 hover:border-[#D4AF37] hover:text-[#E2B857] hover:bg-[#D4AF37]/10 transition-colors">
                    <SocialIcon platform={s.key} className="w-4 h-4" tiktokSize={16} />
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* Message form */}
          <div className="lg:col-span-8 p-8 sm:p-12">
            {status === 'success' ? (
              <div role="status" className="min-h-[420px] flex flex-col items-center justify-center text-center gap-6 p-8">
                <div className="size-16 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#E2B857] flex items-center justify-center">
                  <CheckCircle2 className="size-10" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-wide text-white uppercase text-balance">Message sent</h2>
                <p className="text-sm text-neutral-300 max-w-md leading-relaxed text-pretty">Thank you for reaching out. Our team will reply to your email within one business day.</p>
                {ticket && (
                  <span className="inline-block px-4 py-1.5 bg-black/70 border border-[#D4AF37]/40 text-xs font-mono text-neutral-300 rounded-full">
                    Reference ticket: <strong className="text-[#E2B857]">{ticket}</strong>
                  </span>
                )}
                <button type="button" onClick={() => setStatus('idle')} className="px-8 py-3 bg-[#D4AF37] hover:bg-[#FFF3D1] text-neutral-950 font-extrabold text-xs tracking-widest uppercase rounded-full transition-colors cursor-pointer">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-labelledby="contact-form-title">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />
                <div>
                  <h2 id="contact-form-title" className="text-xl font-extrabold text-white uppercase tracking-wider text-balance">Send us a message</h2>
                  <p className="text-xs text-neutral-400 mt-1 text-pretty">Fields marked * are required.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className={LABEL}>Full name *</label>
                    <input {...fields.field('name')} id="contact-name" type="text" name="name" placeholder="Juan Dela Cruz" autoComplete="name" value={form.name} onChange={handleChange} required maxLength={100} disabled={sending} className={INPUT} />
                    <FieldError fields={fields} name="name" />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className={LABEL}>Email address *</label>
                    <input {...fields.field('email')} id="contact-email" type="email" name="email" placeholder="juan@example.com" inputMode="email" autoComplete="email" value={form.email} onChange={handleChange} required maxLength={254} disabled={sending} className={INPUT} />
                    <FieldError fields={fields} name="email" />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className={LABEL}>Subject</label>
                  <input {...fields.field('subject')} id="contact-subject" type="text" name="subject" placeholder="What is this about?" value={form.subject} onChange={handleChange} maxLength={200} disabled={sending} className={INPUT} />
                  <FieldError fields={fields} name="subject" />
                </div>

                <div>
                  <label htmlFor="contact-message" className={LABEL}>Message *</label>
                  <textarea {...fields.field('message')} id="contact-message" name="message" rows={6} placeholder="How can we help?" value={form.message} onChange={handleChange} required minLength={10} maxLength={5000} disabled={sending} className={`${INPUT} resize-none`} />
                  <FieldError fields={fields} name="message" />
                </div>

                {status === 'error' && (
                  <div role="alert" className="flex items-start gap-2.5 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 text-xs leading-relaxed">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Your message could not be sent. Please try again, or email us directly at <a href={`mailto:${email}`} className="underline underline-offset-2 hover:text-red-200">{email}</a>.</span>
                  </div>
                )}

                <div className="pt-3">
                  <button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-2.5 bg-[#D4AF37] hover:bg-[#FFF3D1] disabled:opacity-50 text-neutral-950 font-extrabold text-xs tracking-wider uppercase py-4 px-8 rounded-full transition-colors cursor-pointer">
                    <Send className="size-4" aria-hidden="true" />
                    {sending ? 'Sending…' : 'Send message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** One direct channel in the sidebar: a gold icon tile, a small caps label and its links/text. */
function Channel({ icon: Icon, label, children }) {
  return (
    <li className="flex items-start gap-4">
      <div className="size-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 text-[#E2B857]">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <span className="text-xs tracking-widest uppercase text-neutral-400 font-bold block mb-0.5">{label}</span>
        {children}
      </div>
    </li>
  );
}

function FieldError({ fields, name }) {
  const message = fields.errors[name];
  return message ? <p id={fields.errorId(name)} className="mt-1.5 text-xs font-semibold text-red-400">{message}</p> : null;
}
