import { getTurnstileToken } from '@/lib/turnstile';
import React, { useEffect, useState } from 'react';
import { useModalDialog } from '@/hooks/useModalDialog';
import { useFieldErrors } from '@/hooks/useFieldErrors';
import { emailError, nameError, phoneError, textError } from '@/lib/formValidation';
import { X, Send, Phone, MapPin, Mail } from 'lucide-react';
import AlphaPremierLogo from './AlphaPremierLogo';
import { useContent } from '@/hooks/useContent';
import { useSiteSettings, companyContact, phoneParts, telHref, addressOneLine } from '@/hooks/useSiteSettings';

/** Value the property pages pre-select; always offered as the 4th choice. */
const SPECIFIC_PROPERTY = 'Specific Property';

interface InquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  prefilledPropertyTitle?: string;
  /** Live listing ref (APR-XXXXXX); inquire.php uses it to link staff to the listing's Drive folder. */
  prefilledPropertyRef?: string;
}

export default function InquireModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  prefilledPropertyTitle,
  prefilledPropertyRef
}: InquireModalProps) {
  // Copy and choices: content page 'realty'; desk phone/email/address: Site settings (Alpha Premier Realty).
  const { content } = useContent('realty');
  const contact = companyContact(useSiteSettings(), 'realty');
  const interests = content.inquiry_interests as string[];
  const interestOptions = [...interests.slice(0, 3), SPECIFIC_PROPERTY, ...interests.slice(3)];
  const formStartedAt = React.useRef(Date.now());
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interestType, setInterestType] = useState(prefilledPropertyTitle ? SPECIFIC_PROPERTY : interestOptions[0]);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const fields = useFieldErrors({
    name: nameError,
    companyName: (v) => textError(v, { label: 'Company name', max: 150 }),
    interestType: (v) => textError(v, { label: 'Inquiry interest', required: true }),
    email: emailError,
    phone: (v) => phoneError(v),
    message: (v) => textError(v, { label: 'Message', required: true, min: 10, max: 5000 }),
    consent: (v) => (v ? null : 'Please agree so we can use these details to answer you.'),
  });
  const resetFieldErrors = fields.reset;
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dialogRef = useModalDialog<HTMLDivElement>(isOpen, onClose);

  // Stays mounted between opens: sync the interest to the property it was opened for.
  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage('');
    resetFieldErrors();
    formStartedAt.current = Date.now();
    if (prefilledPropertyTitle) setInterestType(SPECIFIC_PROPERTY);
  }, [isOpen, prefilledPropertyTitle, resetFieldErrors]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!fields.validate({ name, companyName, interestType, email, phone, message, consent: consent ? 'yes' : '' })) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/inquire.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_started_at: formStartedAt.current,
          turnstile_token: await getTurnstileToken(),
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: companyName.trim(),
          subject: prefilledPropertyTitle
            ? `[Alpha Realty] Inquiry for: ${prefilledPropertyRef ? `${prefilledPropertyRef} ` : ''}${prefilledPropertyTitle}`
            : `[Alpha Realty] General Inquiry: ${interestType}`,
          property: prefilledPropertyRef ? `${prefilledPropertyRef} — ${prefilledPropertyTitle}` : undefined,
          topic: interestType,
          source: 'Alpha Realty',
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error((typeof data.error === 'string' && data.error) || 'We could not send your inquiry. Please try again or call us directly.');
      }
    } catch (err) {
      // Keep the form filled and tell the visitor; never report a lost inquiry as sent.
      setErrorMessage(err instanceof Error ? err.message : 'We could not send your inquiry. Please try again.');
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    onSubmitSuccess();
    // Reset state
    setName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setConsent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="realty-inquire-title"
        tabIndex={-1}
        className="bg-[#0b0c10] border border-gray-800 rounded-sm max-w-4xl w-full max-h-[90dvh] relative flex">

        {/* Close Button: outside the scroller so it stays reachable while the form scrolls on phones */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close inquiry form"
          className="absolute top-2 right-2 md:top-3 md:right-3 p-2 rounded-full bg-[#0b0c10]/80 text-white/60 hover:text-white transition-colors cursor-pointer z-20"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>

        <div className="w-full overflow-y-auto overscroll-contain p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-stretch">

        {/* Left Side: Brand Visual & Contact Card info */}
        <div className="md:col-span-5 bg-cover bg-center rounded-sm p-5 sm:p-8 flex flex-col justify-between border border-gray-900 relative"
             style={{
               backgroundImage: `linear-gradient(to bottom, rgba(11,12,16,0.85) 0%, rgba(6,7,10,0.95) 100%), url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80')`
             }}>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <AlphaPremierLogo className="h-14 w-auto -ml-3" />
            </div>

            <div className="h-[1px] w-12 bg-[#c5a85c]/60 mt-2" />

            <h4 className="text-white text-lg font-sans font-light tracking-wide leading-snug mt-2">
              {content.inquiry_title as string}
            </h4>
            <p className="text-white/50 text-sm font-normal leading-relaxed">
              {content.inquiry_text as string}
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-6 sm:mt-8 pt-6 border-t border-gray-900">
            <div className="flex items-start gap-3 text-white/60 text-xs">
              <MapPin className="w-4 h-4 text-[#c5a85c] shrink-0 mt-0.5" />
              <span>{addressOneLine(contact.address)}</span>
            </div>
            <div className="flex items-center gap-3 text-white/70 text-xs font-mono">
              <Phone className="w-4 h-4 text-[#c5a85c] shrink-0" />
              <span>
                {phoneParts(contact.phone).map((phone, idx) => (
                  <React.Fragment key={phone}>
                    {idx > 0 && ' | '}
                    <a href={telHref(phone)} className="hover:text-[#c5a85c] transition-colors">{phone}</a>
                  </React.Fragment>
                ))}
              </span>
            </div>
            <div className="flex items-center gap-3 text-white/70 text-xs">
              <Mail className="w-4 h-4 text-[#c5a85c] shrink-0" />
              <a href={`mailto:${contact.email}`} className="min-w-0 break-all hover:text-[#c5a85c] transition-colors">{contact.email}</a>
            </div>
          </div>

        </div>

        {/* Right Side: Luxurious Form */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="border-b border-gray-900 pb-3">
            <h2 id="realty-inquire-title" className="text-xl md:text-2xl font-sans font-semibold tracking-wide text-white uppercase">
              Secure Portfolio Inquiry
            </h2>
            <p className="text-white/60 text-xs font-sans font-normal mt-1">
              Complete the inquiry below. An advisor will get back to you within one business day.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            
            {prefilledPropertyTitle && (
              <div className="bg-[#12141c]/80 border border-gray-800 p-3 rounded-sm text-xs text-white flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <div>
                  <span className="text-white/60 block text-xs uppercase tracking-widest mb-0.5">Selected Property File</span>
                  <span className="text-[#c5a85c] font-semibold">{prefilledPropertyTitle}</span>
                </div>
                <span className="text-xs font-mono text-white/60 uppercase whitespace-nowrap">{prefilledPropertyRef ? `Ref ${prefilledPropertyRef}` : 'Pre-selected'}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="realty-inq-name" className="text-xs tracking-widest text-white/50 uppercase block mb-1 font-bold">Your Name</label>
                <input {...fields.field('name')} id="realty-inq-name" autoComplete="name" maxLength={100} required type="text" value={name} onChange={(e) => { setName(e.target.value); fields.recheck('name', e.target.value); }} className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans" placeholder="John Doe" />
                {fields.errors.name && <p id={fields.errorId('name')} className="mt-1 text-xs text-red-300 font-sans">{fields.errors.name}</p>}
              </div>
              <div>
                <label htmlFor="realty-inq-company" className="text-xs tracking-widest text-white/50 uppercase block mb-1 font-bold">Company Name (Optional)</label>
                <input {...fields.field('companyName')} id="realty-inq-company" autoComplete="organization" maxLength={150} type="text" value={companyName} onChange={(e) => { setCompanyName(e.target.value); fields.recheck('companyName', e.target.value); }} className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans" placeholder="Company or Business Name" />
                {fields.errors.companyName && <p id={fields.errorId('companyName')} className="mt-1 text-xs text-red-300 font-sans">{fields.errors.companyName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="realty-inq-interest" className="text-xs tracking-widest text-white/50 uppercase block mb-1 font-bold">Inquiry Interest</label>
                <select {...fields.field('interestType')} id="realty-inq-interest" required value={interestType} onChange={(e) => { setInterestType(e.target.value); fields.recheck('interestType', e.target.value); }} className="w-full bg-[#07080c] border border-gray-800 text-white/80 text-xs p-3 pr-9 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans appearance-none" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`, backgroundPosition: 'right 10px center', backgroundRepeat: 'no-repeat' }}>
                  {interestOptions.map((option) => (
                    <option key={option} value={option}>{option === SPECIFIC_PROPERTY ? 'Inquire on Specific Property' : option}</option>
                  ))}
                </select>
                {fields.errors.interestType && <p id={fields.errorId('interestType')} className="mt-1 text-xs text-red-300 font-sans">{fields.errors.interestType}</p>}
              </div>
              <div>
                <label htmlFor="realty-inq-email" className="text-xs tracking-widest text-white/50 uppercase block mb-1 font-bold">Email Address</label>
                <input {...fields.field('email')} id="realty-inq-email" inputMode="email" autoComplete="email" maxLength={254} required type="email" value={email} onChange={(e) => { setEmail(e.target.value); fields.recheck('email', e.target.value); }} className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans" placeholder="john@domain.com" />
                {fields.errors.email && <p id={fields.errorId('email')} className="mt-1 text-xs text-red-300 font-sans">{fields.errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="realty-inq-phone" className="text-xs tracking-widest text-white/50 uppercase block mb-1 font-bold">Viber Number</label>
                <input {...fields.field('phone')} id="realty-inq-phone" inputMode="tel" autoComplete="tel" maxLength={30} required type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); fields.recheck('phone', e.target.value); }} className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans" placeholder="0917 123 4567" />
                {fields.errors.phone && <p id={fields.errorId('phone')} className="mt-1 text-xs text-red-300 font-sans">{fields.errors.phone}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="realty-inq-message" className="text-xs tracking-widest text-white/50 uppercase block mb-1 font-bold">Your Inquiry Notes</label>
              <textarea
                {...fields.field('message')} id="realty-inq-message" minLength={10} maxLength={5000}
                required 
                rows={4} 
                value={message} 
                onChange={(e) => { setMessage(e.target.value); fields.recheck('message', e.target.value); }}
                className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] resize-none font-sans" 
                placeholder="Discreet requirements, scheduling details, or investment profiles..."
              />
              {fields.errors.message && <p id={fields.errorId('message')} className="mt-1 text-xs text-red-300 font-sans">{fields.errors.message}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2.5 text-xs text-white/60 font-mono">
                {/* value mirrors the checked state so the shared blur re-check reads it like a text field */}
                <input {...fields.field('consent')} required type="checkbox" value={consent ? 'yes' : ''} checked={consent} onChange={(e) => { setConsent(e.target.checked); fields.recheck('consent', e.target.checked ? 'yes' : ''); }} className="accent-[#c5a85c] rounded-sm bg-gray-950 border-gray-800 w-4 h-4 cursor-pointer" />
                <span>I agree that Alpha Premier Realty may store and use these details to answer my inquiry.</span>
              </label>
              {fields.errors.consent && <p id={fields.errorId('consent')} className="mt-1 text-xs text-red-300 font-sans">{fields.errors.consent}</p>}
            </div>

            {errorMessage && (
              <p role="alert" className="text-xs text-red-300 bg-red-950/50 border border-red-500/40 rounded-sm p-3">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full disabled:opacity-60 bg-[#c5a85c] hover:bg-[#b0934c] text-[#06070a] text-xs font-bold tracking-[0.2em] uppercase py-4 mt-2 rounded-sm transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'SENDING…' : 'SUBMIT SECURE INQUIRY FILE'}
            </button>
          </form>
        </div>
        </div>

      </div>
    </div>
  );
}
