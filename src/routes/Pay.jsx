import { getTurnstileToken } from '@/lib/turnstile';
import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Check, CheckCircle2, Copy, QrCode, Send, Upload } from 'lucide-react';
import Seo from '../components/Seo';
import { ENTERPRISES, isValidEnterprise } from '../data/enterprises';
import { useContent } from '../hooks/useContent';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useFieldErrors } from '../hooks/useFieldErrors';
import { emailError, nameError, phoneError, textError } from '../lib/formValidation';

// Same visual language as the Contact page: gold eyebrow, uppercase headline, a gold-hairline
// two-column card (channels + QR on the left, the proof-of-payment form on the right).
const LABEL = 'block text-xs tracking-[0.2em] uppercase font-bold text-neutral-300 mb-1.5';
const INPUT = 'w-full bg-black/90 border border-neutral-800 focus:border-[#D4AF37] px-4 py-3 text-white placeholder-neutral-400 outline-none rounded-xl text-sm transition-colors disabled:opacity-60';
const PROOF_MAX_BYTES = 15 * 1024 * 1024;
const PROOF_FILE = /\.(jpe?g|png|pdf)$/i;

const STEPS = [
  ['Choose a channel', 'Pick the channel you want to pay with and scan its QR code with your app.'],
  ['Send the payment', 'Pay the agreed amount and keep the receipt or confirmation screen.'],
  ['Send your proof', 'Fill in the amount and reference number, attach the receipt, and submit.'],
];

/** Mirrors api/inquire.php: pesos with up to two decimals, commas and a ₱ sign allowed. */
function amountError(value) {
  const v = value.trim().replace(/[₱,\s]/g, '');
  if (!v) return 'Amount is required.';
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(v)) return 'Enter the amount in pesos, e.g. 4999 or 4999.50.';
  if (Number(v) <= 0) return 'Amount must be more than zero.';
  return null;
}

export default function Pay() {
  const [searchParams] = useSearchParams();
  // A plan card on /virtual-office links here with the company and plan pre-filled.
  const fromEnterprise = searchParams.get('enterprise') || '';
  const EMPTY = {
    name: '', email: '', phone: '',
    enterprise: isValidEnterprise(fromEnterprise) ? fromEnterprise : 'corporate',
    purpose: (searchParams.get('for') || '').trim().slice(0, 200),
    amount: '', method: '', reference: '', message: '',
  };
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [serverError, setServerError] = useState('');
  const [ticket, setTicket] = useState('');
  const [selected, setSelected] = useState(0);
  const formStartedAt = useRef(Date.now());
  const fileInput = useRef(null);
  const { content } = useContent('payments');
  const email = String(useSiteSettings().email);
  const fields = useFieldErrors({
    name: nameError,
    email: emailError,
    phone: (v) => phoneError(v, false),
    purpose: (v) => textError(v, { label: 'Payment for', required: true, min: 3, max: 200 }),
    amount: amountError,
    method: (v) => (v.trim() ? null : 'Choose how you paid.'),
    reference: (v) => textError(v, { label: 'Reference number', max: 100 }),
    message: (v) => textError(v, { label: 'Notes', max: 5000 }),
  });

  // Admin-managed channels (Content > Pay Online page); a channel needs at least a name.
  const channels = (Array.isArray(content.channels) ? content.channels : []).filter((c) => c && String(c.name || '').trim() !== '');
  const active = channels[Math.min(selected, Math.max(channels.length - 1, 0))];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    fields.recheck(e.target.name, e.target.value);
  };

  const chooseChannel = (index) => {
    setSelected(index);
    setForm((prev) => ({ ...prev, method: channels[index].name }));
    fields.recheck('method', channels[index].name);
  };

  const handleFile = (e) => {
    const next = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (!next) {
      setFile(null);
      return;
    }
    if (!PROOF_FILE.test(next.name)) {
      e.target.value = '';
      setFile(null);
      setFileError('Upload a JPG, PNG or PDF.');
      return;
    }
    if (next.size > PROOF_MAX_BYTES) {
      e.target.value = '';
      setFile(null);
      setFileError('The file is larger than 15MB. Please upload a smaller screenshot.');
      return;
    }
    setFile(next);
    setFileError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldsOk = fields.validate(form);
    if (!file) {
      setFileError('Attach your proof of payment.');
      if (fieldsOk) fileInput.current?.focus();
    }
    if (!fieldsOk || !file) return;
    setStatus('sending');
    setServerError('');
    try {
      const body = new FormData();
      Object.entries({
        form: 'payment',
        name: form.name,
        email: form.email,
        phone: form.phone,
        enterprise: form.enterprise,
        service: form.purpose,
        amount: form.amount,
        payment_method: form.method,
        reference_no: form.reference,
        message: form.message,
        source: 'Pay Online',
        website: '',
        form_started_at: String(formStartedAt.current),
        turnstile_token: await getTurnstileToken(),
      }).forEach(([key, value]) => body.append(key, value));
      body.append('attachment', file, file.name);
      const res = await fetch('/api/inquire.php', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        setStatus('success');
        setTicket(data.ticket || '');
        setForm({ ...EMPTY, enterprise: form.enterprise });
        setFile(null);
        fields.reset();
      } else {
        setStatus('error');
        setServerError(data.error ? String(data.error) : '');
      }
    } catch (err) {
      setStatus('error');
      setServerError(err instanceof Error ? err.message : '');
    }
  };

  const sending = status === 'sending';
  const titleWords = String(content.hero_title).trim().split(/\s+/);
  const titleAccent = titleWords.length > 1 ? titleWords.pop() : '';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 font-sans space-y-12">
      <Seo path="/pay" title="Pay Online | Alpha Premier Group" description="Pay Alpha Premier Group by GCash, Maya or bank transfer: scan the QR code, then send your proof of payment and reference number. For Virtual Office plans and every APG company." />

      <header className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs sm:text-sm tracking-[0.35em] uppercase text-[#E2B857] font-bold block">Payments</span>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight leading-tight text-balance">
          {titleWords.join(' ')}
          {titleAccent && <> <span className="text-[#E2B857]">{titleAccent}</span></>}
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed text-pretty">{content.hero_subtitle}</p>
      </header>

      <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto" aria-label="How to pay">
        {STEPS.map(([title, text], i) => (
          <li key={title} className="flex gap-4 rounded-2xl border border-[#D4AF37]/20 bg-[#0A0803]/80 p-5">
            <span className="size-9 shrink-0 rounded-full border border-[#D4AF37] text-[#E2B857] font-black text-sm flex items-center justify-center tabular-nums" aria-hidden="true">{i + 1}</span>
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-white">{title}</h2>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed text-pretty">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="rounded-3xl border border-[#D4AF37]/40 bg-[#0E0B04]/90 overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Channels + QR */}
          <aside className="lg:col-span-5 p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-[#D4AF37]/20 bg-[#0A0803] space-y-6" aria-labelledby="pay-channels">
            <div>
              <span className="text-xs tracking-[0.3em] uppercase text-[#E2B857] font-bold block mb-1">Step 1 &amp; 2</span>
              <h2 id="pay-channels" className="text-xl font-extrabold text-white uppercase tracking-wide text-balance">Scan &amp; pay</h2>
              <p className="text-sm text-neutral-400 mt-1 leading-relaxed text-pretty">Choose a channel, scan its QR code with your app and pay the amount agreed with our team.</p>
            </div>

            {channels.length === 0 ? (
              <p className="text-sm text-neutral-400 leading-relaxed">Payment channels will be published here soon. In the meantime, our team can send you the payment details by email.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Payment channel">
                  {channels.map((channel, i) => (
                    <button
                      key={channel.name}
                      type="button"
                      aria-pressed={channel === active}
                      onClick={() => chooseChannel(i)}
                      className={`px-4 py-2 rounded-full border text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer ${channel === active ? 'bg-[#D4AF37] border-[#D4AF37] text-neutral-950' : 'border-[#D4AF37]/30 text-neutral-300 hover:border-[#D4AF37] hover:text-[#E2B857]'}`}
                    >
                      {channel.name}
                    </button>
                  ))}
                </div>

                <div className="mx-auto w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden">
                  {active.qr_image ? (
                    <img src={active.qr_image} alt={`${active.name} payment QR code`} className="w-full h-full object-contain bg-white p-3" />
                  ) : (
                    <div className="w-full h-full border border-dashed border-[#D4AF37]/40 bg-black/60 flex flex-col items-center justify-center gap-3 text-neutral-400 text-center p-6">
                      <QrCode className="size-12 text-[#E2B857]" aria-hidden="true" />
                      <span className="text-xs font-semibold tracking-wider uppercase">QR code coming soon</span>
                    </div>
                  )}
                </div>

                <dl className="space-y-3">
                  <Detail label="Account name" value={active.account_name} />
                  <Detail label="Account / mobile number" value={active.account_number} copy />
                </dl>
                {String(active.instructions || '').trim() !== '' && (
                  <p className="text-xs text-neutral-400 leading-relaxed whitespace-pre-line text-pretty border-t border-[#D4AF37]/20 pt-4">{active.instructions}</p>
                )}
              </>
            )}
          </aside>

          {/* Proof of payment form */}
          <div className="lg:col-span-7 p-8 sm:p-12">
            {status === 'success' ? (
              <div role="status" className="min-h-[420px] flex flex-col items-center justify-center text-center gap-6 p-8">
                <div className="size-16 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#E2B857] flex items-center justify-center">
                  <CheckCircle2 className="size-10" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-wide text-white uppercase text-balance">Proof received</h2>
                <p className="text-sm text-neutral-300 max-w-md leading-relaxed text-pretty whitespace-pre-line">{content.success_note}</p>
                {ticket && (
                  <span className="inline-block px-4 py-1.5 bg-black/70 border border-[#D4AF37]/40 text-xs font-mono text-neutral-300 rounded-full">
                    Reference ticket: <strong className="text-[#E2B857]">{ticket}</strong>
                  </span>
                )}
                <button type="button" onClick={() => setStatus('idle')} className="px-8 py-3 bg-[#D4AF37] hover:bg-[#FFF3D1] text-neutral-950 font-extrabold text-xs tracking-widest uppercase rounded-full transition-colors cursor-pointer">
                  Send another proof
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-labelledby="pay-form-title">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />
                <div>
                  <span className="text-xs tracking-[0.3em] uppercase text-[#E2B857] font-bold block mb-1">Step 3</span>
                  <h2 id="pay-form-title" className="text-xl font-extrabold text-white uppercase tracking-wider text-balance">Send your proof of payment</h2>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed text-pretty whitespace-pre-line">{content.proof_note}</p>
                  <p className="text-xs text-neutral-400 mt-1">Fields marked * are required.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pay-name" className={LABEL}>Full name *</label>
                    <input {...fields.field('name')} id="pay-name" type="text" name="name" placeholder="Juan Dela Cruz" autoComplete="name" value={form.name} onChange={handleChange} required maxLength={100} disabled={sending} className={INPUT} />
                    <FieldError fields={fields} name="name" />
                  </div>
                  <div>
                    <label htmlFor="pay-email" className={LABEL}>Email address *</label>
                    <input {...fields.field('email')} id="pay-email" type="email" name="email" placeholder="juan@example.com" inputMode="email" autoComplete="email" value={form.email} onChange={handleChange} required maxLength={254} disabled={sending} className={INPUT} />
                    <FieldError fields={fields} name="email" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pay-phone" className={LABEL}>Mobile number</label>
                    <input {...fields.field('phone')} id="pay-phone" type="tel" name="phone" placeholder="0917 123 4567" inputMode="tel" autoComplete="tel" value={form.phone} onChange={handleChange} maxLength={30} disabled={sending} className={INPUT} />
                    <FieldError fields={fields} name="phone" />
                  </div>
                  <div>
                    <label htmlFor="pay-enterprise" className={LABEL}>Paying to *</label>
                    <select id="pay-enterprise" name="enterprise" value={form.enterprise} onChange={handleChange} disabled={sending} className={INPUT}>
                      {ENTERPRISES.map((e) => <option key={e.slug} value={e.slug}>{e.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="pay-purpose" className={LABEL}>Payment for *</label>
                  <input {...fields.field('purpose')} id="pay-purpose" type="text" name="purpose" placeholder="e.g. Virtual Office – Premier Access, November 2026" value={form.purpose} onChange={handleChange} required maxLength={200} disabled={sending} className={INPUT} />
                  <FieldError fields={fields} name="purpose" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pay-amount" className={LABEL}>Amount paid (PHP) *</label>
                    <input {...fields.field('amount')} id="pay-amount" type="text" name="amount" placeholder="4,999.00" inputMode="decimal" value={form.amount} onChange={handleChange} required maxLength={20} disabled={sending} className={INPUT} />
                    <FieldError fields={fields} name="amount" />
                  </div>
                  <div>
                    <label htmlFor="pay-method" className={LABEL}>Paid via *</label>
                    <select {...fields.field('method')} id="pay-method" name="method" value={form.method} onChange={handleChange} required disabled={sending} className={INPUT}>
                      <option value="">Choose a channel</option>
                      {channels.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    <FieldError fields={fields} name="method" />
                  </div>
                </div>

                <div>
                  <label htmlFor="pay-reference" className={LABEL}>Reference / transaction number</label>
                  <input {...fields.field('reference')} id="pay-reference" type="text" name="reference" placeholder="As shown on your receipt" value={form.reference} onChange={handleChange} maxLength={100} disabled={sending} className={INPUT} />
                  <FieldError fields={fields} name="reference" />
                </div>

                <div>
                  <label htmlFor="pay-proof" className={LABEL}>Proof of payment (JPG, PNG or PDF) *</label>
                  <div className={`bg-black/90 border border-dashed p-5 text-center rounded-xl ${fileError ? 'border-red-500/60' : 'border-neutral-800'}`}>
                    <input ref={fileInput} id="pay-proof" type="file" name="attachment" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" onChange={handleFile} disabled={sending} aria-invalid={fileError ? true : undefined} aria-describedby={fileError ? 'pay-proof-error' : undefined} className="sr-only" />
                    <label htmlFor="pay-proof" className="cursor-pointer flex flex-col items-center gap-1.5 text-neutral-400 hover:text-[#E2B857] transition-colors">
                      <Upload className="size-5 text-[#D4AF37]" aria-hidden="true" />
                      <span className="text-xs font-semibold wrap-anywhere">{file ? `Selected: ${file.name}` : 'Click to upload your receipt screenshot'}</span>
                      <span className="text-xs text-neutral-500">Max size 15MB</span>
                    </label>
                  </div>
                  {fileError && <p id="pay-proof-error" className="mt-1.5 text-xs font-semibold text-red-400">{fileError}</p>}
                </div>

                <div>
                  <label htmlFor="pay-message" className={LABEL}>Notes</label>
                  <textarea {...fields.field('message')} id="pay-message" name="message" rows={3} placeholder="Anything our team should know about this payment" value={form.message} onChange={handleChange} maxLength={5000} disabled={sending} className={`${INPUT} resize-none`} />
                  <FieldError fields={fields} name="message" />
                </div>

                {status === 'error' && (
                  <div role="alert" className="flex items-start gap-2.5 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 text-xs leading-relaxed">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{serverError || 'Your proof of payment could not be sent.'} Please try again, or email it to <a href={`mailto:${email}`} className="underline underline-offset-2 hover:text-red-200">{email}</a>.</span>
                  </div>
                )}

                <div className="pt-3">
                  <button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-2.5 bg-[#D4AF37] hover:bg-[#FFF3D1] disabled:opacity-50 text-neutral-950 font-extrabold text-xs tracking-wider uppercase py-4 px-8 rounded-full transition-colors cursor-pointer">
                    <Send className="size-4" aria-hidden="true" />
                    {sending ? 'Sending…' : 'Submit proof of payment'}
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

/** One account detail under the QR code; `copy` adds a copy-to-clipboard button. */
function Detail({ label, value, copy = false }) {
  const [copied, setCopied] = useState(false);
  const text = String(value || '').trim();
  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (insecure context / permissions): the number is still on screen to select.
    }
  };
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <dt className="text-xs tracking-widest uppercase text-neutral-400 font-bold mb-0.5">{label}</dt>
        <dd className={`text-sm wrap-anywhere ${text ? 'font-bold text-white tabular-nums' : 'text-neutral-500'}`}>{text || 'To be announced'}</dd>
      </div>
      {copy && text && (
        <button type="button" onClick={copyValue} aria-label={copied ? 'Copied' : `Copy ${label.toLowerCase()}`} className="size-9 shrink-0 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-neutral-400 hover:border-[#D4AF37] hover:text-[#E2B857] transition-colors cursor-pointer">
          {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}

function FieldError({ fields, name }) {
  const message = fields.errors[name];
  return message ? <p id={fields.errorId(name)} className="mt-1.5 text-xs font-semibold text-red-400">{message}</p> : null;
}
