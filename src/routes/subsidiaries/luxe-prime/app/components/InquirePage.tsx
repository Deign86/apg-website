import React, { useState } from 'react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { ENTERPRISE_CONFIGS } from '@/data/enterpriseConfig';
import { useFieldErrors } from '@/hooks/useFieldErrors';
import { addressOneLine, companyContact, phoneParts, telHref, useSiteSettings } from '@/hooks/useSiteSettings';
import { emailError, nameError, phoneError, textError } from '@/lib/formValidation';
import { getTurnstileToken } from '@/lib/turnstile';
import { motion } from 'motion/react';
import { Reveal, rise, SectionHeading } from './headings';
import {
  BODY,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CAPS,
  CONTAINER,
  DISPLAY,
  DOUBLE_FRAME,
  FIELD_ERROR,
  FIELD_INPUT,
  FIELD_LABEL,
  FOCUS,
  IVORY,
  PAGE_HEAD,
} from './ui';

const LUXE = ENTERPRISE_CONFIGS['luxe-prime'];
const BUDGETS = ['Under ₱50,000', '₱50,000 – ₱150,000', '₱150,000 – ₱500,000', '₱500,000 – ₱1,000,000', '₱1,000,000+', 'To be discussed'];
type Field = 'fullName' | 'email' | 'phone' | 'company' | 'business' | 'subject' | 'message';
const emptyForm = (interest: string) => ({
  fullName: '',
  email: '',
  phone: '',
  company: '',
  business: '',
  subject: interest ? `Inquiry regarding ${interest}` : '',
  message: interest ? `I'm interested in ${interest}.` : '',
}) satisfies Record<Field, string>;

interface InquirePageProps {
  /** The service an "Inquire about this service" button was clicked on; prefills the topic and message. */
  interest?: string;
}

/**
 * Luxe Prime's own inquiry page (the other enterprises keep the shared EnterpriseInquire): one-tap topics, the
 * contact desk beside the form. Posts the same JSON to /api/inquire.php as the shared page and shows the ticket.
 */
export default function InquirePage({ interest = '' }: InquirePageProps) {
  const contact = companyContact(useSiteSettings(), 'luxe-prime');
  // When the form opened (a bot check on the server); read once, on the first render.
  const [startedAt] = useState(() => Date.now());
  const [form, setForm] = useState(() => emptyForm(interest));
  const [topic, setTopic] = useState('');
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  /** The server's ticket once sent; null while the form is open. */
  const [ticket, setTicket] = useState<string | null>(null);
  const fields = useFieldErrors<Field>({
    fullName: nameError,
    email: emailError,
    phone: (v) => phoneError(v),
    company: (v) => textError(v, { label: 'Company name', max: 150 }),
    business: (v) => textError(v, { label: 'Line of business', max: 150 }),
    subject: (v) => textError(v, { label: 'Subject', max: 200 }),
    message: (v) => textError(v, { label: 'Message', required: true, min: 10, max: 5000 }),
  });
  const phones = phoneParts(contact.phone);

  const change = (key: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    fields.recheck(key, value);
  };

  const pickTopic = (t: string) => {
    setTopic(t);
    setForm((prev) => ({ ...prev, subject: `Inquiry regarding ${t}` }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.validate(form)) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/inquire.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_started_at: startedAt,
          turnstile_token: await getTurnstileToken(),
          name: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          company: form.company.trim() || undefined,
          business: form.business.trim() || undefined,
          enterprise: LUXE.name,
          budget: budget || undefined,
          subject: form.subject || `[${LUXE.name}] Consultation Inquiry`,
          message: form.message.trim(),
          service: interest || undefined,
          source: LUXE.name,
        }),
      });
      // SAFETY: inquire.php answers { success, ticket } or { success: false, error }; each field is re-read below.
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; ticket?: string | number };
      if (!res.ok || data.success === false) throw new Error('not sent');
      setTicket(data.ticket == null ? '' : String(data.ticket));
      setStatus('idle');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    setForm(emptyForm(''));
    setTopic('');
    setBudget('');
    fields.reset();
    setTicket(null);
  };

  const input = (key: Field, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={`luxe-inq-${key}`} className={FIELD_LABEL}>{label}</label>
      <input {...fields.field(key)} {...props} id={`luxe-inq-${key}`} name={key} value={form[key]} onChange={change(key)} className={FIELD_INPUT} />
      {fields.errors[key] && <p id={fields.errorId(key)} className={FIELD_ERROR}>{fields.errors[key]}</p>}
    </div>
  );

  return (
    <div id="luxe-inquire">
      <header className={PAGE_HEAD}>
        <Reveal className={`${CONTAINER} flex flex-col items-center gap-5 text-center`}>
          <SectionHeading id="luxe-inquire-title" eyebrow="Private consultation" title={ticket === null ? 'Begin Your **Consultation**' : 'Inquiry **Received**'} page />
          {ticket === null && (
            <motion.p variants={rise} className={`${BODY} max-w-2xl`}>
              Tell us about your property and goals. Our team replies within one business day with recommendations for Luxe Prime Realty.
            </motion.p>
          )}
        </Reveal>
      </header>

      <div className="px-5 pb-20 sm:px-8 lg:px-12">
        {ticket !== null ? (
          <div className={`${CONTAINER} max-w-2xl`}>
            <div role="status" className={`${DOUBLE_FRAME} flex flex-col items-center gap-4 px-6 py-10 text-center`}>
              <p className={BODY}>Thank you. Our team will get back to you within one business day; a confirmation is on its way to your email.</p>
              {ticket && (
                <p className={`${CAPS} border border-[#C49A2A]/40 px-4 py-2 text-xs tracking-[0.12em] text-[#C49A2A]`}>
                  Ticket <span className="ml-2 font-mono text-[#F5F0E8]">{ticket}</span>
                </p>
              )}
              <button type="button" onClick={reset} className={`${BUTTON_SECONDARY} mt-2`}>Send Another Inquiry</button>
            </div>
          </div>
        ) : (
          <Reveal amount={0.1} className={`${CONTAINER} grid gap-6 lg:grid-cols-12`}>
            {/* The concierge desk. */}
            <motion.aside variants={rise} aria-labelledby="luxe-desk-heading" className={`${DOUBLE_FRAME} flex flex-col gap-6 p-6 sm:p-8 lg:col-span-4`}>
              <h2 id="luxe-desk-heading" className={`${DISPLAY} ${IVORY} text-2xl`}>Concierge Desk</h2>
              <ul className="space-y-5 text-sm">
                {contact.email && (
                  <li className="flex gap-3">
                    <Mail className="mt-0.5 size-4 shrink-0 text-[#C49A2A]" aria-hidden="true" />
                    <span>
                      <span className={`${CAPS} block text-xs tracking-[0.12em] text-[#C49A2A]`}>Email</span>
                      <a href={`mailto:${contact.email}`} className={`break-all text-[#F5F0E8] hover:text-[#F0D080] ${FOCUS}`}>{contact.email}</a>
                    </span>
                  </li>
                )}
                {phones.length > 0 && (
                  <li className="flex gap-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-[#C49A2A]" aria-hidden="true" />
                    <span>
                      <span className={`${CAPS} block text-xs tracking-[0.12em] text-[#C49A2A]`}>Phone and Viber</span>
                      {phones.map((p) => (
                        <a key={p} href={telHref(p)} className={`block text-[#F5F0E8] hover:text-[#F0D080] ${FOCUS}`}>{p}</a>
                      ))}
                    </span>
                  </li>
                )}
                <li className="flex gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-[#C49A2A]" aria-hidden="true" />
                  <span>
                    <span className={`${CAPS} block text-xs tracking-[0.12em] text-[#C49A2A]`}>Response</span>
                    <span className="text-[#F5F0E8]/80">Within one business day</span>
                  </span>
                </li>
                {contact.address && (
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-[#C49A2A]" aria-hidden="true" />
                    <span>
                      <span className={`${CAPS} block text-xs tracking-[0.12em] text-[#C49A2A]`}>Office</span>
                      <span className="text-[#F5F0E8]/80">{addressOneLine(contact.address)}</span>
                    </span>
                  </li>
                )}
              </ul>
            </motion.aside>

            <motion.section variants={rise} aria-labelledby="luxe-inquiry-form-heading" className="border border-[#C49A2A]/25 bg-[#080705]/85 p-6 sm:p-8 lg:col-span-8">
              <h2 id="luxe-inquiry-form-heading" className={`${DISPLAY} ${IVORY} text-2xl`}>Send Us a Message</h2>
              <p className="mt-1 text-sm text-[#F5F0E8]/60">Fields marked * are required.</p>
              <form noValidate onSubmit={submit} className="mt-6 space-y-5">
                <div role="group" aria-labelledby="luxe-inq-topics-label">
                  <p id="luxe-inq-topics-label" className={FIELD_LABEL}>What is it about?</p>
                  <div className="flex flex-wrap gap-2">
                    {(LUXE.quickPrompts ?? []).map((t: string) => (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={topic === t}
                        onClick={() => pickTopic(t)}
                        className={`h-10 cursor-pointer border px-4 text-sm font-medium transition-colors duration-300 ${topic === t ? 'border-[#C49A2A] bg-[#C49A2A] text-[#0a0703]' : 'border-[#C49A2A]/35 text-[#F0D080] hover:border-[#C49A2A]'} ${FOCUS}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {input('fullName', 'Full name *', { type: 'text', autoComplete: 'name', maxLength: 100, placeholder: 'Juan dela Cruz' })}
                <div className="grid gap-5 md:grid-cols-2">
                  {input('email', 'Email *', { type: 'email', inputMode: 'email', autoComplete: 'email', maxLength: 254, placeholder: 'juan@company.com' })}
                  {input('phone', 'Phone or Viber *', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', maxLength: 30, placeholder: '+63 9XX XXX XXXX' })}
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {input('company', 'Company name', { type: 'text', autoComplete: 'organization', maxLength: 150 })}
                  {input('business', 'Line of business', { type: 'text', maxLength: 150 })}
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="luxe-inq-budget" className={FIELD_LABEL}>Budget range</label>
                    <select id="luxe-inq-budget" value={budget} onChange={(e) => setBudget(e.target.value)} className={`${FIELD_INPUT} cursor-pointer`}>
                      <option value="" className="bg-[#111008]">Select a budget range</option>
                      {BUDGETS.map((b) => <option key={b} value={b} className="bg-[#111008]">{b}</option>)}
                    </select>
                  </div>
                  {input('subject', 'Subject', { type: 'text', maxLength: 200 })}
                </div>
                <div>
                  <label htmlFor="luxe-inq-message" className={FIELD_LABEL}>Your message *</label>
                  <textarea {...fields.field('message')} id="luxe-inq-message" name="message" rows={5} minLength={10} maxLength={5000} value={form.message} onChange={change('message')} placeholder="Your property, its location and what you need" className={`${FIELD_INPUT} h-auto resize-none py-3 leading-relaxed`} />
                  {fields.errors.message && <p id={fields.errorId('message')} className={FIELD_ERROR}>{fields.errors.message}</p>}
                </div>

                {status === 'error' && (
                  <p role="alert" className={`${FIELD_ERROR} text-center`}>
                    Something went wrong. Please try again{contact.email ? `, or email us at ${contact.email}` : ''}.
                  </p>
                )}
                <p className="text-xs leading-relaxed text-[#F5F0E8]/55">We use your details only to answer this inquiry.</p>
                <button type="submit" disabled={status === 'sending'} className={`${BUTTON_PRIMARY} w-full disabled:cursor-not-allowed disabled:opacity-60`}>
                  {status === 'sending' ? 'Sending…' : 'Send Inquiry'}
                </button>
              </form>
            </motion.section>
          </Reveal>
        )}
      </div>
    </div>
  );
}
