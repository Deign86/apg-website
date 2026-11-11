import React, { useId, useState } from 'react';
import { Check, ChevronDown, PenLine, Plus, Send, UserRound } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { useFieldErrors } from '@/hooks/useFieldErrors';
import { emailError, nameError, phoneError, textError } from '@/lib/formValidation';
import { getTurnstileToken } from '@/lib/turnstile';
import { BUTTON_PRIMARY, FIELD_INPUT, FIELD_LABEL, FOCUS } from './ui';

/** Topic of an inquiry about one property; always offered as the 4th "Inquiry interest" choice. */
const SPECIFIC_PROPERTY = 'Specific Property';
/** localStorage key for the visitor's own contact details, saved after an inquiry is sent. */
const SAVED_KEY = 'apg_realty_contact';
const SEND_FAILED = 'We could not send your inquiry. Please try again or call us directly.';

/** What an inquiry is about: a live listing (with its APR- ref) or a service the visitor picked. */
export interface InquirySubject {
  title: string;
  ref?: string;
}

interface Contact {
  name: string;
  email: string;
  phone: string;
  company: string;
  business: string;
}

interface QuickAsk {
  label: string;
  line: string;
}

interface InquiryResponse {
  success?: boolean;
  error?: string;
  ticket?: string;
}

const EMPTY: Contact = { name: '', email: '', phone: '', company: '', business: '' };

// One-tap requests for a listing or a service: the message is written from them, so typing is optional.
const LISTING_ASKS: QuickAsk[] = [
  { label: 'Schedule a viewing', line: 'I would like to schedule a viewing.' },
  { label: 'Is it still available?', line: 'Is this property still available?' },
  { label: 'Best rate and terms', line: 'What are the best rate and terms?' },
  { label: 'More photos or floor plan', line: 'Please send more photos or the floor plan.' },
];
const SERVICE_ASKS: QuickAsk[] = [
  { label: 'Book a consultation', line: 'I would like to book a consultation.' },
  { label: 'Request a proposal', line: 'Please send me a proposal.' },
  { label: 'Ask about fees', line: 'What are your fees for this service?' },
  { label: 'Call me back', line: 'Please call me to discuss.' },
];
const DEFAULT_LISTING_ASK = 'I am interested in this property. Please send me more details.';
const DEFAULT_SERVICE_ASK = 'I am interested in this service. Please contact me with more details.';

const companyError = (v: string) => textError(v, { label: 'Company name', max: 150 });
const businessError = (v: string) => textError(v, { label: 'Line of business', max: 150 });

/** The details saved by this browser's last inquiry, or null (none, unreadable, or no longer valid). */
function loadContact(): Contact | null {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (raw === null) return null;
    // SAFETY: written by saveContact; every field is read back as a string and the whole contact re-validated.
    const saved = JSON.parse(raw) as Partial<Contact> | null;
    const contact: Contact = {
      name: String(saved?.name ?? ''),
      email: String(saved?.email ?? ''),
      phone: String(saved?.phone ?? ''),
      company: String(saved?.company ?? ''),
      business: String(saved?.business ?? ''),
    };
    const invalid =
      nameError(contact.name) ?? emailError(contact.email) ?? phoneError(contact.phone) ?? companyError(contact.company) ?? businessError(contact.business);
    return invalid === null ? contact : null;
  } catch {
    return null; // storage blocked or not JSON
  }
}

function saveContact(contact: Contact) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(contact));
  } catch {
    // Storage blocked: the next inquiry asks again.
  }
}

function forgetContact() {
  try {
    localStorage.removeItem(SAVED_KEY);
  } catch {
    // Storage blocked: nothing was saved.
  }
}

const INPUT = FIELD_INPUT;
const LABEL = FIELD_LABEL;
const SMALL_LINK = `cursor-pointer rounded text-xs font-semibold text-[#c5a85c] underline-offset-4 transition-colors hover:text-[#e6cd86] hover:underline ${FOCUS}`;

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error: string | null | undefined;
  errorId: string;
  /** Spans both columns when the form is wide enough for two. */
  wide?: boolean;
  children: React.ReactNode;
}

function Field({ label, htmlFor, required, error, errorId, wide, children }: FieldProps) {
  return (
    <div className={wide ? '@md:col-span-2' : undefined}>
      <label htmlFor={htmlFor} className={LABEL}>
        {label}
        {required && <span aria-hidden="true" className="text-[#c5a85c]"> *</span>}
      </label>
      {children}
      {error && <p id={errorId} className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  );
}

interface InquiryFormProps {
  /** What the inquiry is about. A live listing (with a ref) gets one-tap requests and an optional message. */
  subject?: InquirySubject;
  /** Called once the team has the inquiry, with its ticket (APG-XXXXXXXX, '' if the reply had none). */
  onSent: (ticket: string) => void;
}

/**
 * Realty's inquiry form (POST /api/inquire.php), in the inquiry popup and beside a listing's photos.
 * After a first inquiry the visitor's details are kept in their own browser, so the next one is a summary
 * ("Sending as …", with Edit and "Not you? Clear") and the Send button. For a listing or a service (a `subject`),
 * the "Inquiry interest" choice is skipped (the topic is the property or the service) and the message is written
 * from one-tap requests; "Add a note" opens a box for anything else.
 */
export function InquiryForm({ subject, onSent }: InquiryFormProps) {
  const { content } = useContent('realty');
  // Registry list (api/data/content-schema.json); useContent drops wrong-shaped saved values.
  const interests = Array.isArray(content.inquiry_interests) ? content.inquiry_interests.map(String) : [];
  const interestOptions = [...interests.slice(0, 3), SPECIFIC_PROPERTY, ...interests.slice(3)];
  const listingRef = subject?.ref;
  /** About a listing or a service: one-tap requests, an optional message, no "Inquiry interest" choice. */
  const quick = subject !== undefined;
  const quickAsks = listingRef ? LISTING_ASKS : SERVICE_ASKS;
  const id = useId();
  const [startedAt] = useState(Date.now); // when the form opened (inquire.php rejects instant bot posts)
  const [saved] = useState(loadContact);
  const [contact, setContact] = useState<Contact>(saved ?? EMPTY);
  const [editing, setEditing] = useState(saved === null);
  /** Focus the name field when the fields appear from Edit or Clear (not on first open). */
  const [focusName, setFocusName] = useState(false);
  const [asks, setAsks] = useState<string[]>([]);
  const [interest, setInterest] = useState(interestOptions[0]);
  const [message, setMessage] = useState('');
  /** The message box: always for a general inquiry, after "Add a note" for a listing (it is optional there). */
  const [noting, setNoting] = useState(!quick);
  const [consent, setConsent] = useState(saved !== null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fields = useFieldErrors({
    name: nameError,
    email: emailError,
    phone: (v) => phoneError(v)?.replace('Phone number', 'Viber number') ?? null, // the field is labelled Viber number
    company: companyError,
    business: businessError,
    interest: (v) => textError(v, { label: 'Inquiry interest', required: true }),
    message: (v) =>
      quick ? textError(v, { label: 'Message', max: 4000 }) : textError(v, { label: 'Message', required: true, min: 10, max: 5000 }),
    consent: (v) => (v ? null : 'Please agree so we can use these details to answer you.'),
  });

  const change = (key: keyof Contact) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setContact((c) => ({ ...c, [key]: value }));
    fields.recheck(key, value);
  };

  const editDetails = () => {
    setEditing(true);
    setFocusName(true);
  };

  const clearDetails = () => {
    forgetContact();
    setContact(EMPTY);
    setConsent(false);
    editDetails();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const sender: Contact = {
      name: contact.name.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      company: contact.company.trim(),
      business: contact.business.trim(),
    };
    if (!fields.validate({ ...sender, interest, message, consent: consent ? 'yes' : '' })) return;
    const typed = message.trim();
    const opening =
      quickAsks.filter((a) => asks.includes(a.label)).map((a) => a.line).join(' ') || (listingRef ? DEFAULT_LISTING_ASK : DEFAULT_SERVICE_ASK);
    setSubmitting(true);
    let ticket = '';
    try {
      const res = await fetch('/api/inquire.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_started_at: startedAt,
          turnstile_token: await getTurnstileToken(),
          name: sender.name,
          email: sender.email,
          phone: sender.phone,
          company: sender.company,
          business: sender.business,
          subject: subject
            ? `[Alpha Realty] Inquiry for: ${listingRef ? `${listingRef} ` : ''}${subject.title}`
            : `[Alpha Realty] General Inquiry: ${interest}`,
          property: listingRef ? `${listingRef} — ${subject?.title ?? ''}` : undefined,
          topic: subject ? (listingRef ? SPECIFIC_PROPERTY : subject.title) : interest,
          source: 'Alpha Realty',
          message: quick ? [opening, typed].filter(Boolean).join('\n\n') : typed,
        }),
      });
      // SAFETY: inquire.php answers { success, ticket } or { success: false, error }; each field is re-read below.
      const data = (await res.json().catch(() => ({}))) as InquiryResponse;
      if (!res.ok || !data.success) throw new Error(data.error ? String(data.error) : SEND_FAILED);
      ticket = String(data.ticket ?? '');
    } catch (err) {
      // Keep the form filled and tell the visitor; never report a lost inquiry as sent.
      setError(err instanceof Error && !(err instanceof TypeError) ? err.message : SEND_FAILED);
      setSubmitting(false);
      return;
    }
    saveContact(sender);
    setSubmitting(false);
    onSent(ticket);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="@container space-y-4 short:space-y-3">
      {editing ? (
        <div className="grid gap-4 @md:grid-cols-2 short:gap-3">
          <Field label="Name" htmlFor={`${id}-name`} required wide error={fields.errors.name} errorId={fields.errorId('name')}>
            <input
              {...fields.field('name')}
              id={`${id}-name`}
              type="text"
              autoComplete="name"
              maxLength={100}
              required
              autoFocus={focusName}
              value={contact.name}
              onChange={change('name')}
              className={INPUT}
              placeholder="Juan Dela Cruz"
            />
          </Field>
          <Field label="Email" htmlFor={`${id}-email`} required error={fields.errors.email} errorId={fields.errorId('email')}>
            <input
              {...fields.field('email')}
              id={`${id}-email`}
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              required
              value={contact.email}
              onChange={change('email')}
              className={INPUT}
              placeholder="juan@company.com"
            />
          </Field>
          <Field label="Viber number" htmlFor={`${id}-phone`} required error={fields.errors.phone} errorId={fields.errorId('phone')}>
            <input
              {...fields.field('phone')}
              id={`${id}-phone`}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={30}
              required
              value={contact.phone}
              onChange={change('phone')}
              className={INPUT}
              placeholder="0917 123 4567"
            />
          </Field>
          <Field label="Company" htmlFor={`${id}-company`} error={fields.errors.company} errorId={fields.errorId('company')}>
            <input
              {...fields.field('company')}
              id={`${id}-company`}
              type="text"
              autoComplete="organization"
              maxLength={150}
              value={contact.company}
              onChange={change('company')}
              className={INPUT}
              placeholder="Optional"
            />
          </Field>
          <Field label="Line of business" htmlFor={`${id}-business`} error={fields.errors.business} errorId={fields.errorId('business')}>
            <input
              {...fields.field('business')}
              id={`${id}-business`}
              type="text"
              maxLength={150}
              value={contact.business}
              onChange={change('business')}
              className={INPUT}
              placeholder="e.g. Retail, F&B, BPO"
            />
          </Field>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#c5a85c]/15 text-[#e6cd86]">
            <UserRound className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white/60">
              Sending as <span className="font-semibold text-white">{contact.name}</span>
            </p>
            <p className="mt-0.5 break-words text-xs text-white/50">
              {[contact.email, contact.phone, contact.company].filter(Boolean).join(' · ')}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <button type="button" onClick={editDetails} className={SMALL_LINK}>
                Edit details
              </button>
              <button type="button" onClick={clearDetails} className={SMALL_LINK}>
                Not you? Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {quick ? (
        <fieldset>
          <legend className={LABEL}>
            What would you like? <span className="font-normal text-white/55">Tap any</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {quickAsks.map(({ label }) => {
              const on = asks.includes(label);
              const Icon = on ? Check : Plus;
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setAsks((list) => (on ? list.filter((l) => l !== label) : [...list, label]))}
                  className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${FOCUS} ${
                    on ? 'border-[#c5a85c] bg-[#c5a85c]/15 text-[#f0dfae]' : 'border-white/15 text-white/75 hover:border-white/35 hover:text-white'
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                  {label}
                </button>
              );
            })}
            {!noting && (
              <button
                type="button"
                onClick={() => setNoting(true)}
                className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-white/25 px-3.5 py-1.5 text-[13px] font-medium text-white/60 transition-colors hover:border-white/45 hover:text-white ${FOCUS}`}
              >
                <PenLine className="size-3.5 shrink-0" aria-hidden="true" />
                Add a note
              </button>
            )}
          </div>
        </fieldset>
      ) : (
        <Field label="Inquiry interest" htmlFor={`${id}-interest`} required error={fields.errors.interest} errorId={fields.errorId('interest')}>
          <div className="relative">
            <select
              {...fields.field('interest')}
              id={`${id}-interest`}
              required
              value={interest}
              onChange={(e) => {
                setInterest(e.target.value);
                fields.recheck('interest', e.target.value);
              }}
              className={`${INPUT} cursor-pointer appearance-none pr-10 [&>option]:bg-[#0b0b0d]`}
            >
              {interestOptions.map((option) => (
                <option key={option} value={option}>
                  {option === SPECIFIC_PROPERTY ? 'Inquire on Specific Property' : option}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-white/50" aria-hidden="true" />
          </div>
        </Field>
      )}

      {noting && (
        <Field
          label={quick ? 'Anything else? (optional)' : 'Message'}
          htmlFor={`${id}-message`}
          required={!quick}
          error={fields.errors.message}
          errorId={fields.errorId('message')}
        >
          <textarea
            {...fields.field('message')}
            id={`${id}-message`}
            rows={quick ? 2 : 4}
            autoFocus={quick}
            maxLength={quick ? 4000 : 5000}
            required={!quick}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              fields.recheck('message', e.target.value);
            }}
            className={`${INPUT} h-auto resize-none py-3 leading-relaxed`}
            placeholder={
              listingRef ? 'Move-in date, number of seats, parking…' : quick ? 'Your timeline, budget or the areas you are considering…' : 'What you need, preferred areas, budget and timing'
            }
          />
        </Field>
      )}

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-white/60">
          {/* value mirrors the checked state so the shared blur re-check reads it like a text field */}
          <input
            {...fields.field('consent')}
            type="checkbox"
            required
            value={consent ? 'yes' : ''}
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              fields.recheck('consent', e.target.checked ? 'yes' : '');
            }}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#c5a85c]"
          />
          <span>I agree that Alpha Premier Realty may store and use these details to answer my inquiry.</span>
        </label>
        {fields.errors.consent && <p id={fields.errorId('consent')} className="mt-1.5 text-xs text-red-300">{fields.errors.consent}</p>}
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-950/50 p-3 text-xs text-red-200">
          {error}
        </p>
      )}

      <div>
        <button type="submit" disabled={submitting} className={`${BUTTON_PRIMARY} w-full disabled:cursor-wait disabled:opacity-70`}>
          <Send className="size-4" aria-hidden="true" />
          {submitting ? 'Sending…' : 'Send inquiry'}
        </button>
        {editing && (
          <p className="mt-3 text-center text-[11px] leading-relaxed text-white/55">
            Your details are remembered in this browser only, so your next inquiry is one click.
          </p>
        )}
      </div>
    </form>
  );
}
