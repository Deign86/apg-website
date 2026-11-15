import React, { useRef, useState } from 'react';
import { Building2, GraduationCap, Network, Trophy } from 'lucide-react';
import { ApplicantExtrasFields, useApplicantExtras } from '@/components/careers/ApplicantExtrasFields';
import { useCareers } from '@/hooks/useCareers';
import { useContent } from '@/hooks/useContent';
import { emailError, nameError, phoneError, textError } from '@/lib/formValidation';
import { resumeFileError } from '@/lib/resumeFile';
import { getTurnstileToken } from '@/lib/turnstile';
import ClosingPanel from './ClosingPanel';
import { motion } from 'motion/react';
import { Reveal, rise, SectionHeading } from './headings';
import {
  BODY,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CAPS,
  CONTAINER,
  DIAMOND,
  DIAMOND_LIST,
  DISPLAY,
  DOUBLE_FRAME,
  FIELD_ERROR,
  FIELD_INPUT,
  FIELD_LABEL,
  FOCUS,
  IVORY,
  OPENING,
  PAGE_HEAD,
  SCREEN,
  roman,
  TEXT_LINK,
} from './ui';

const PERK_ICONS = [Trophy, Network, GraduationCap, Building2];
const GENERAL = 'General Application';

/** An opening as /api/careers.php sends it; every field is re-read in toPosition. */
interface JobRow {
  id?: string | number;
  title?: string;
  location?: string;
  type?: string;
  description?: string;
  responsibilities?: (string | number)[];
  requirements?: (string | number)[];
  require_photo?: string | number;
  ask_portfolio?: string | number;
}

interface Position {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  highlights: string[];
  require_photo: number;
  ask_portfolio: number;
}

const text = (v: string | number | undefined): string => (v == null ? '' : String(v).trim());
const textList = (v: (string | number)[] | undefined): string[] => (Array.isArray(v) ? v.map(text).filter(Boolean) : []);

function toPosition(row: JobRow): Position | null {
  const id = text(row.id);
  const title = text(row.title);
  if (!id || !title) return null;
  const responsibilities = textList(row.responsibilities);
  return {
    id,
    title,
    location: text(row.location),
    type: text(row.type),
    description: text(row.description),
    highlights: responsibilities.length > 0 ? responsibilities : textList(row.requirements),
    require_photo: Number(row.require_photo) || 0,
    ask_portfolio: Number(row.ask_portfolio) || 0,
  };
}

/** Luxe Prime careers: perks, open roles, and the application page (a role's, or a general one). */
export default function CareersPage() {
  const { content } = useContent('luxe-prime');
  const { jobs: rows, loading } = useCareers('luxe-prime', []);
  // SAFETY: useCareers is untyped JS over /api/careers.php; toPosition re-reads every field it uses.
  const positions = (rows as JobRow[]).map(toPosition).filter((p): p is Position => p !== null);
  // SAFETY: the 'luxe-prime' registry types careers_perks as a repeater of { title, desc }.
  const perks = content.careers_perks as { title: string; desc: string }[];
  /** The application page: a role's id, or GENERAL; null shows the careers page. */
  const [applying, setApplying] = useState<string | null>(null);

  const apply = (id: string) => {
    setApplying(id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (applying !== null) {
    return (
      <ApplicationPage
        positions={positions}
        initial={applying}
        onBack={() => {
          setApplying(null);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
      />
    );
  }

  return (
    <div id="luxe-careers">
      {/* Opening screen: the title and what working here offers. Enters once, on load. */}
      <header className={OPENING}>
        <Reveal className={`${CONTAINER} flex flex-col items-center text-center`}>
          <SectionHeading id="luxe-careers-title" eyebrow="Join Luxe Prime Realty" title="Career **Opportunities**" page />
          <motion.p variants={rise} className={`${BODY} mt-4 max-w-2xl text-pretty`}>
            {String(content.careers_intro)}
          </motion.p>
          {perks.length > 0 && (
            <div className="mt-10 w-full">
              <h2 id="luxe-perks-heading" className="sr-only">Why work with us</h2>
              <ul className="grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-4">
                {perks.map((perk, idx) => {
                  const Icon = PERK_ICONS[idx % PERK_ICONS.length];
                  return (
                    <motion.li variants={rise} key={perk.title} className={`${DOUBLE_FRAME} flex flex-col items-start gap-3 px-6 pb-6 pt-7`}>
                      <span aria-hidden="true" className={`${CAPS} absolute right-5 top-4 text-xs tracking-[0.12em] text-[#C49A2A]/80`}>{roman(idx + 1)}</span>
                      <span aria-hidden="true" className="my-1 grid size-11 rotate-45 place-items-center border border-[#C49A2A]/55">
                        <Icon className="size-[18px] -rotate-45 text-[#C49A2A]" />
                      </span>
                      <h3 className={`${DISPLAY} ${IVORY} text-balance text-2xl leading-tight`}>{perk.title}</h3>
                      <p className="text-pretty text-[15px] leading-relaxed text-[#F5F0E8]/70">{perk.desc}</p>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          )}
        </Reveal>
      </header>

      <section aria-labelledby="luxe-roles-heading" aria-busy={loading} className={SCREEN}>
        {/* Restarts once the roles are in, so roles that arrive after the reveal still rise in. */}
        <Reveal key={loading ? 'loading' : 'ready'} amount={0.1} className={CONTAINER}>
          <SectionHeading id="luxe-roles-heading" eyebrow="Now hiring" title="Open **Roles**" />
          <motion.p variants={rise} role="status" className={`${CAPS} mb-8 mt-3 text-center text-xs tracking-[0.12em] text-[#F5F0E8]/60`}>
            {loading ? 'Loading roles…' : positions.length === 0 ? 'No open roles right now' : `${positions.length} open ${positions.length === 1 ? 'role' : 'roles'}`}
          </motion.p>

          {loading ? (
            <div aria-hidden="true" className="h-36 animate-pulse border border-[#C49A2A]/20 bg-white/[0.03] motion-reduce:animate-none" />
          ) : positions.length === 0 ? (
            <div className={`${DOUBLE_FRAME} mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-8 text-center`}>
              <p className={`${DISPLAY} ${IVORY} text-2xl`}>We are not hiring for a specific role at the moment.</p>
              <p className={BODY}>We still welcome exceptional advisors, leasing specialists and partners. Send a general application and we will keep it on file.</p>
              <button type="button" onClick={() => apply(GENERAL)} className={BUTTON_PRIMARY}>
                Send a General Application
              </button>
            </div>
          ) : (
            <ul className="space-y-5">
              {positions.map((position) => (
                <motion.li variants={rise} key={position.id}>
                  <article className="group flex flex-col gap-5 border border-[#C49A2A]/25 bg-[#080705]/85 p-6 transition-colors duration-200 hover:border-[#C49A2A]/70 sm:p-8 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 space-y-2">
                      <h3 className={`${DISPLAY} ${IVORY} text-2xl leading-tight sm:text-[1.75rem]`}>{position.title}</h3>
                      <p className={`${CAPS} flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-[0.12em] text-[#C49A2A]`}>
                        {[position.location, position.type].filter(Boolean).map((part, i) => (
                          <span key={part} className="flex items-center gap-3">
                            {i > 0 && <span aria-hidden="true" className={`${DIAMOND} size-1`} />}
                            {part}
                          </span>
                        ))}
                      </p>
                      {position.description && <p className="line-clamp-3 max-w-3xl text-[15px] leading-relaxed text-[#F5F0E8]/70">{position.description}</p>}
                    </div>
                    <button type="button" onClick={() => apply(position.id)} className={`${BUTTON_PRIMARY} shrink-0`}>
                      Apply Now<span className="sr-only">: {position.title}</span>
                    </button>
                  </article>
                </motion.li>
              ))}
            </ul>
          )}

          {positions.length > 0 && (
            <ClosingPanel
              className="mt-12"
              title="Don't See Your **Position**?"
              text="We are always seeking exceptional advisors, leasing specialists and corporate partners."
              primary={{ label: 'Send a General Application', onClick: () => apply(GENERAL) }}
            />
          )}
        </Reveal>
      </section>
    </div>
  );
}

type ApplyField = 'name' | 'email' | 'contact' | 'notes';
const fieldError = (field: ApplyField, value: string): string | null =>
  field === 'name' ? nameError(value)
    : field === 'email' ? emailError(value)
      : field === 'contact' ? phoneError(value)
        : textError(value, { label: 'Cover note', max: 5000 });
const EMPTY_FORM = { name: '', email: '', contact: '', notes: '' };

interface ApplicationPageProps {
  positions: Position[];
  /** A role's id, or GENERAL. */
  initial: string;
  onBack: () => void;
}

/** The application: the role (switchable) and its highlights beside the candidate form; then the server's reference. */
function ApplicationPage({ positions, initial, onBack }: ApplicationPageProps) {
  const [positionId, setPositionId] = useState(initial);
  const position = positions.find((p) => p.id === positionId) ?? null;
  const title = position?.title ?? GENERAL;
  // When the form opened (a bot check on the server); read once, on the first render.
  const [formStartedAt] = useState(() => Date.now());
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  /** The server's reference once sent; null while the form is open. */
  const [ticket, setTicket] = useState<string | null>(null);
  const extras = useApplicantExtras(position);

  const update = (field: ApplyField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (!errors[field]) return;
    setErrors((prev) => {
      const next = { ...prev };
      const problem = fieldError(field, value);
      if (problem) next[field] = problem;
      else delete next[field];
      return next;
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const problem = resumeFileError(file);
    if (problem) {
      e.target.value = '';
      setFileName('');
      setErrors((prev) => ({ ...prev, resume: problem }));
      return;
    }
    setFileName(file.name);
    setErrors(({ resume: _cleared, ...rest }) => rest);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found: Record<string, string> = {};
    for (const field of ['name', 'email', 'contact', 'notes'] as const) {
      const problem = fieldError(field, form[field]);
      if (problem) found[field] = problem;
    }
    if (!fileName) found.resume = 'Please attach your resume or CV.';
    const extrasProblem = extras.validate();
    if (Object.keys(found).length > 0 || extrasProblem) {
      setErrors(found);
      const first = Object.keys(found)[0];
      if (first) document.getElementById(first === 'resume' ? 'luxe-apply-resume-browse' : `luxe-apply-${first}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('fullName', form.name.trim());
      payload.append('email', form.email.trim());
      payload.append('phone', form.contact.trim());
      payload.append('coverLetter', form.notes.trim());
      payload.append('jobTitle', title);
      if (position && /^\d+$/.test(position.id)) payload.append('jobId', position.id);
      payload.append('enterprise', 'luxe-prime');
      const file = fileRef.current?.files?.[0];
      if (file) payload.append('resume', file);
      extras.append(payload);
      payload.append('form_started_at', String(formStartedAt));
      payload.append('turnstile_token', await getTurnstileToken());
      const res = await fetch('/api/applicants.php', { method: 'POST', body: payload });
      // SAFETY: applicants.php answers { success, ticket } or { success: false, error }; each field is re-read below.
      const result = (await res.json().catch(() => ({}))) as { success?: boolean; ticket?: string | number; error?: string };
      if (res.ok && result.success !== false) {
        setTicket(result.ticket == null ? '' : String(result.ticket));
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        setErrors({ submit: result.error ? String(result.error) : 'Submission failed. Please try again.' });
      }
    } catch {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const describedBy = (field: string) => (errors[field] ? `luxe-apply-${field}-error` : undefined);

  return (
    <div id="luxe-apply">
      <header className={PAGE_HEAD}>
        <Reveal className={`${CONTAINER} flex flex-col items-center gap-5 text-center`}>
          <SectionHeading id="luxe-apply-title" eyebrow="Job application" title={ticket === null ? title : 'Application **Sent**'} page />
        </Reveal>
      </header>

      <div className="px-5 pb-20 sm:px-8 lg:px-12">
        {ticket !== null ? (
          <div className={`${CONTAINER} max-w-2xl`}>
            <div role="status" className={`${DOUBLE_FRAME} flex flex-col items-center gap-4 px-6 py-10 text-center`}>
              <p className={BODY}>
                Thank you, <span className="font-semibold text-[#F0D080]">{form.name.trim().split(/\s+/)[0]}</span>. Your application for{' '}
                <span className="text-[#F5F0E8]">{title}</span> is with our recruitment team, and a confirmation is on its way to your email.
              </p>
              {ticket && (
                <p className={`${CAPS} border border-[#C49A2A]/40 px-4 py-2 text-xs tracking-[0.12em] text-[#C49A2A]`}>
                  Reference <span className="ml-2 font-mono text-[#F5F0E8]">{ticket}</span>
                </p>
              )}
              <button type="button" onClick={onBack} className={`${BUTTON_SECONDARY} mt-2`}>
                Back to Careers
              </button>
            </div>
          </div>
        ) : (
          <Reveal amount={0.1} className={`${CONTAINER} grid gap-6 lg:grid-cols-12`}>
            {/* The role: switchable, with its summary and highlights. */}
            <motion.aside variants={rise} className={`${DOUBLE_FRAME} flex flex-col gap-6 p-6 sm:p-8 lg:col-span-5`}>
              {positions.length > 0 && (
                <div>
                  <label htmlFor="luxe-apply-position" className={FIELD_LABEL}>Applying for</label>
                  <select
                    id="luxe-apply-position"
                    value={positionId}
                    onChange={(e) => { setPositionId(e.target.value); setErrors({}); }}
                    className={`${FIELD_INPUT} cursor-pointer`}
                  >
                    {positions.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#111008] text-white">
                        {p.title}{p.type ? ` (${p.type})` : ''}
                      </option>
                    ))}
                    <option value={GENERAL} className="bg-[#111008] text-white">{GENERAL}</option>
                  </select>
                </div>
              )}
              <div>
                <h2 className={`${DISPLAY} ${IVORY} text-2xl leading-tight`}>{title}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-[#F5F0E8]/70">
                  {position?.description || 'Tell us about your experience and the kind of role you are looking for; we keep general applications on file for upcoming openings.'}
                </p>
              </div>
              {position && position.highlights.length > 0 && (
                <div>
                  <h3 className={FIELD_LABEL}>Position highlights</h3>
                  <ul className={`${DIAMOND_LIST} space-y-2 text-[15px] leading-relaxed text-[#F5F0E8]/75`}>
                    {position.highlights.map((h) => <li key={h}>{h}</li>)}
                  </ul>
                </div>
              )}
              <button type="button" onClick={onBack} className={`${TEXT_LINK} mt-auto self-start`}>
                <span aria-hidden="true" className="h-px w-6 bg-current" />
                All positions
              </button>
            </motion.aside>

            {/* The candidate. */}
            <motion.section variants={rise} aria-labelledby="luxe-apply-form-heading" className="border border-[#C49A2A]/25 bg-[#080705]/85 p-6 sm:p-8 lg:col-span-7">
              <h2 id="luxe-apply-form-heading" className={`${DISPLAY} ${IVORY} text-2xl`}>Candidate Details</h2>
              <p className="mt-1 text-sm text-[#F5F0E8]/60">Fields marked * are required.</p>
              <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="luxe-apply-name" className={FIELD_LABEL}>Full name *</label>
                  <input id="luxe-apply-name" type="text" autoComplete="name" required maxLength={100} aria-invalid={!!errors.name} aria-describedby={describedBy('name')} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Juan dela Cruz" className={FIELD_INPUT} />
                  {errors.name && <p id="luxe-apply-name-error" className={FIELD_ERROR}>{errors.name}</p>}
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="luxe-apply-email" className={FIELD_LABEL}>Email *</label>
                    <input id="luxe-apply-email" type="email" autoComplete="email" required maxLength={254} aria-invalid={!!errors.email} aria-describedby={describedBy('email')} value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="juan@company.com" className={FIELD_INPUT} />
                    {errors.email && <p id="luxe-apply-email-error" className={FIELD_ERROR}>{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="luxe-apply-contact" className={FIELD_LABEL}>Contact number *</label>
                    <input id="luxe-apply-contact" type="tel" inputMode="tel" autoComplete="tel" required maxLength={30} aria-invalid={!!errors.contact} aria-describedby={describedBy('contact')} value={form.contact} onChange={(e) => update('contact', e.target.value)} placeholder="+63 9XX XXX XXXX" className={FIELD_INPUT} />
                    {errors.contact && <p id="luxe-apply-contact-error" className={FIELD_ERROR}>{errors.contact}</p>}
                  </div>
                </div>

                <div>
                  <p id="luxe-apply-resume-label" className={FIELD_LABEL}>Resume (PDF, DOC or DOCX) *</p>
                  <input id="luxe-apply-resume" type="file" ref={fileRef} accept=".pdf,.doc,.docx" onChange={handleFile} className="hidden" aria-labelledby="luxe-apply-resume-label" />
                  <div className="flex items-center gap-3 border border-[#C49A2A]/30 bg-[#0b0906] p-2">
                    <button
                      type="button"
                      id="luxe-apply-resume-browse"
                      onClick={() => fileRef.current?.click()}
                      aria-label="Choose your resume (PDF, DOC or DOCX, up to 15 MB)"
                      aria-describedby={errors.resume ? 'luxe-apply-resume-name luxe-apply-resume-error' : 'luxe-apply-resume-name'}
                      className={`h-10 shrink-0 cursor-pointer bg-[#C49A2A] px-5 text-sm font-medium text-[#0a0703] transition-colors hover:bg-[#D8B048] ${FOCUS}`}
                    >
                      Choose file
                    </button>
                    <span id="luxe-apply-resume-name" className="min-w-0 flex-1 truncate text-sm text-[#F5F0E8]/60">{fileName || 'No file chosen'}</span>
                  </div>
                  {errors.resume && <p id="luxe-apply-resume-error" role="alert" className={FIELD_ERROR}>{errors.resume}</p>}
                </div>

                <ApplicantExtrasFields
                  extras={extras}
                  labelClassName={FIELD_LABEL}
                  inputClassName={`${FIELD_INPUT} h-auto py-2 file:mr-3 file:cursor-pointer file:border-0 file:bg-[#C49A2A] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:text-[#0a0703]`}
                  hintClassName="mt-1.5 text-xs text-[#F5F0E8]/55"
                  errorClassName={FIELD_ERROR}
                />

                <div>
                  <label htmlFor="luxe-apply-notes" className={FIELD_LABEL}>Cover note</label>
                  <textarea id="luxe-apply-notes" rows={4} maxLength={5000} aria-invalid={!!errors.notes} aria-describedby={describedBy('notes')} value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="A short summary of your real estate experience or key transactions" className={`${FIELD_INPUT} h-auto resize-none py-3 leading-relaxed`} />
                  {errors.notes && <p id="luxe-apply-notes-error" className={FIELD_ERROR}>{errors.notes}</p>}
                </div>

                {errors.submit && <p role="alert" className={`${FIELD_ERROR} text-center`}>{errors.submit}</p>}

                <button type="submit" disabled={submitting} className={`${BUTTON_PRIMARY} mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60`}>
                  {submitting ? 'Sending…' : 'Submit Application'}
                </button>
              </form>
            </motion.section>
          </Reveal>
        )}
      </div>
    </div>
  );
}
