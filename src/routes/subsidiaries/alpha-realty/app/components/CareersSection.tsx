import { getTurnstileToken } from '@/lib/turnstile';
import { submitPublicForm } from '@/lib/publicForm';
import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { JobOpening } from '../types';
import { FALLBACK_JOB_OPENINGS } from '../data';
import { useCareers } from '@/hooks/useCareers';
import { useModalDialog } from '@/hooks/useModalDialog';
import { useFieldErrors } from '@/hooks/useFieldErrors';
import { useContent } from '@/hooks/useContent';
import { RichText } from '@/components/RichText';
import { resumeFileError } from '@/lib/resumeFile';
import { emailError, nameError, phoneError, textError } from '@/lib/formValidation';
import type { ExtrasJob } from '@/lib/applicantExtras';
import { ApplicantExtrasFields, useApplicantExtras } from '@/components/careers/ApplicantExtrasFields';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  GraduationCap,
  MapPin,
  MessageSquarePlus,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  Upload,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { LiveCount } from './ListingCard';
import { Reveal, rise, SectionHeading } from './reveal';
import {
  ARROW,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CAPTION,
  CTA_PANEL,
  FIELD_ERROR,
  FIELD_INPUT,
  FIELD_LABEL,
  FOCUS,
  GOLD_ACCENT,
  MODAL_CLOSE,
  MODAL_OVERLAY,
  MODAL_PANEL,
  SMALL_CAPS,
  SWIPE_ROW,
  TEXT_LINK,
} from './ui';

interface CareersSectionProps {
  onApplySuccess: (jobTitle: string) => void;
}

// Admin-editable copy: content page 'realty' (src/data/realtyContent.json); defaults = the shipped copy.
interface TitleText {
  title: string;
  text: string;
}
interface Photo {
  image: string;
  alt: string;
}
interface Quote {
  text: string;
  author: string;
  role: string;
  tenure: string;
}

/** An opening as /api/careers.php sends it (or the corporate fallback rows); every field is re-read in toJob. */
interface JobRow {
  id?: string | number;
  title?: string;
  location?: string;
  type?: string;
  department?: string;
  tag?: string;
  division?: string;
  description?: string;
  requirements?: string[];
  require_photo?: string | number;
  ask_portfolio?: string | number;
}

interface ApplyResponse {
  success?: boolean;
  ticket?: string;
  error?: string;
}

// Live openings also carry the per-opening extras flags (2x2 photo, portfolio links).
type RealtyJob = JobOpening & ExtrasJob;

const toJob = (j: JobRow): RealtyJob => ({
  id: String(j.id ?? ''),
  title: String(j.title ?? ''),
  location: j.location || 'Ortigas Center, Pasig City',
  type: j.type || 'Full-time',
  department: j.department || j.tag || j.division || 'Commercial Real Estate',
  description: j.description || '',
  requirements: Array.isArray(j.requirements) ? j.requirements.map(String) : [],
  require_photo: Number(j.require_photo) || 0,
  ask_portfolio: Number(j.ask_portfolio) || 0,
});

// Icons stay in code, assigned by position.
const VALUE_ICONS = [Star, ShieldCheck, Zap, Users];
const GAIN_ICONS = [TrendingUp, GraduationCap, Globe];

type CandidateField = 'fullName' | 'email' | 'phone' | 'coverNote';
const CANDIDATE_FIELDS: CandidateField[] = ['fullName', 'email', 'phone', 'coverNote'];
const FIELD_IDS = {
  fullName: 'realty-apply-name',
  email: 'realty-apply-email',
  phone: 'realty-apply-phone',
  resume: 'realty-apply-resume-browse',
  coverNote: 'realty-apply-note',
} satisfies Record<CandidateField | 'resume', string>;

function candidateFieldError(field: CandidateField, value: string): string | null {
  if (field === 'fullName') return nameError(value);
  if (field === 'email') return emailError(value);
  if (field === 'phone') return phoneError(value);
  return textError(value, { label: 'Cover note', max: 5000 });
}

const GENERAL_APPLICATION_JOB: RealtyJob = {
  id: 'general',
  title: 'General Application (Open Opportunity)',
  department: 'Commercial Real Estate',
  location: 'Ortigas Center, Pasig City',
  type: 'All Levels',
  description:
    'Submit your profile to the Alpha Premier Realty talent pool. We review applicants for brokerage, investment advisory and corporate real estate roles all year round.',
  requirements: [
    'Strong motivation for commercial real estate and property investment',
    'High standard of integrity, client communication and professionalism',
    'Eagerness to grow within an enterprise brokerage',
  ],
};

const PAGE_X = 'mx-auto max-w-7xl px-5 sm:px-8 lg:px-12';
const SECTION_GAP = 'mt-24 sm:mt-28 short:mt-20';
const CARD =
  'group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01)_60%)] p-6 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-[#c5a85c]/45 hover:shadow-[0_24px_50px_-24px_rgba(197,168,92,0.35)] motion-reduce:hover:translate-y-0 sm:p-7';
const CARD_LINE = 'absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#c5a85c]/70 to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-100';
const ICON_CIRCLE =
  'grid size-11 shrink-0 place-items-center rounded-full border border-[#c5a85c]/35 text-[#c5a85c] transition-colors duration-500 group-hover:bg-[#c5a85c] group-hover:text-[#0a0a0c]';
const META_PILL = 'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/65';
const SLIDE = { type: 'spring', stiffness: 420, damping: 36, mass: 0.8 } as const;

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

interface RoleMetaProps {
  job: JobOpening;
}

/** Location, type and department of an opening, as quiet pills. */
function RoleMeta({ job }: RoleMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={META_PILL}>
        <MapPin className="size-3.5 text-[#c5a85c]" aria-hidden="true" />
        {job.location}
      </span>
      <span className={`${META_PILL} border-[#c5a85c]/35 text-[#e6cd86]`}>{job.type}</span>
      {job.department && <span className={META_PILL}>{job.department}</span>}
    </div>
  );
}

interface RequirementsProps {
  items: string[];
}

function Requirements({ items }: RequirementsProps) {
  return (
    <ul className="space-y-2 text-sm leading-relaxed text-white/75">
      {items.map((req, i) => (
        <li key={`${req}-${i}`} className="flex gap-3 text-pretty">
          <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-[#c5a85c]" />
          {req}
        </li>
      ))}
    </ul>
  );
}

/**
 * Realty's Careers page: an intro with the team photo, culture values, the workspace photos, what you will
 * gain, team feedback (with a form that sends feedback to HR), and the open roles (search, details popup,
 * apply). Applying swaps the page for the application form (POST /api/applicants.php, multipart with the
 * resume and the per-opening extras). Copy and photos are admin-editable (content page 'realty').
 */
export default function CareersSection({ onApplySuccess }: CareersSectionProps) {
  // Openings are authored in the admin portal and scoped by enterprise_slug.
  // Corporate openings are served as a fallback when realty has none of its own.
  const { jobs: rawJobs } = useCareers('realty', FALLBACK_JOB_OPENINGS);
  const rows: JobRow[] = rawJobs;
  const JOB_OPENINGS = rows.map(toJob);
  const ALL_SELECT_JOBS: RealtyJob[] = [GENERAL_APPLICATION_JOB, ...JOB_OPENINGS];
  const reduce = useReducedMotion();
  const [selectedJobForForm, setSelectedJobForForm] = useState<RealtyJob | null>(null);
  const extras = useApplicantExtras(selectedJobForForm);
  const [formStartedAt] = useState(Date.now);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [candidateForm, setCandidateForm] = useState({ fullName: '', email: '', phone: '', coverNote: '' });
  const [resumeFileName, setResumeFileName] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<RealtyJob | null>(null);
  const { content } = useContent('realty');
  // Registry repeaters (src/data/realtyContent.json); useContent drops wrong-shaped saved values.
  const quotes: Quote[] = Array.isArray(content.testimonials) ? content.testimonials : [];
  const cultureValues: TitleText[] = Array.isArray(content.culture_values) ? content.culture_values : [];
  const workspacePhotos: Photo[] = Array.isArray(content.workspace_photos) ? content.workspace_photos : [];
  const gains: TitleText[] = Array.isArray(content.gains) ? content.gains : [];
  const [quoteIdx, setActiveQuoteIdx] = useState(0);
  // An admin may remove reviews while one is showing.
  const activeQuoteIdx = quotes.length > 0 ? quoteIdx % quotes.length : 0;

  // Add Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const jobDialogRef = useModalDialog<HTMLDivElement>(!!selectedJob, () => setSelectedJob(null));
  const feedbackDialogRef = useModalDialog<HTMLDivElement>(showFeedbackModal, () => setShowFeedbackModal(false));
  const [feedbackAuthor, setFeedbackAuthor] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackRole, setFeedbackRole] = useState('');
  const [feedbackTenure, setFeedbackTenure] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  // Each feedback field shows its own error, linked to it (aria-invalid, aria-describedby); feedbackError is a failed send.
  const feedbackFields = useFieldErrors({
    name: nameError,
    email: emailError,
    role: (v) => textError(v, { label: 'Role', max: 100 }),
    tenure: (v) => textError(v, { label: 'Tenure', max: 100 }),
    text: (v) => textError(v, { label: 'Feedback', required: true, max: 5000 }),
  });

  const handlePrevQuote = () => {
    setActiveQuoteIdx(activeQuoteIdx === 0 ? quotes.length - 1 : activeQuoteIdx - 1);
  };

  const handleNextQuote = () => {
    setActiveQuoteIdx(activeQuoteIdx === quotes.length - 1 ? 0 : activeQuoteIdx + 1);
  };

  // Feedback goes to the team inbox (api/inquire.php form=feedback); it is not published on the page.
  const handleAddFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackFields.validate({ name: feedbackAuthor, email: feedbackEmail, role: feedbackRole, tenure: feedbackTenure, text: feedbackText })) return;
    setFeedbackSending(true);
    setFeedbackError('');
    try {
      await submitPublicForm(
        {
          form: 'feedback',
          enterprise: 'realty',
          name: feedbackAuthor.trim(),
          email: feedbackEmail.trim(),
          role: feedbackRole.trim(),
          tenure: feedbackTenure.trim(),
          message: feedbackText.trim(),
        },
        formStartedAt,
      );
      setFeedbackSuccess(true);
      setTimeout(() => {
        setFeedbackAuthor('');
        setFeedbackEmail('');
        setFeedbackRole('');
        setFeedbackTenure('');
        setFeedbackText('');
        setFeedbackSuccess(false);
        setShowFeedbackModal(false);
      }, 2500);
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setFeedbackSending(false);
    }
  };

  // Live search over title, location and department.
  const query = searchQuery.trim().toLowerCase();
  const filteredJobs = query
    ? JOB_OPENINGS.filter((job) => `${job.title} ${job.location} ${job.department}`.toLowerCase().includes(query))
    : JOB_OPENINGS;

  const handleOpenApplyModal = (job: RealtyJob | null) => {
    setSelectedJobForForm(job || GENERAL_APPLICATION_JOB);
    setFormSubmitted(false);
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState('');

  const updateCandidate = (field: CandidateField, value: string) => {
    setCandidateForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        const problem = candidateFieldError(field, value);
        if (problem) next[field] = problem;
        else delete next[field];
        return next;
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    for (const field of CANDIDATE_FIELDS) {
      const problem = candidateFieldError(field, candidateForm[field]);
      if (problem) errs[field] = problem;
    }
    if (!resumeFileName) errs.resume = formErrors.resume || 'Please attach your Resume file';
    const extrasProblem = extras.validate();
    if (Object.keys(errs).length > 0 || extrasProblem) {
      setFormErrors(errs);
      const firstField = (['fullName', 'email', 'phone', 'resume', 'coverNote'] as const).find((field) => errs[field]);
      if (firstField) document.getElementById(FIELD_IDS[firstField])?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fullName', candidateForm.fullName.trim());
      formData.append('email', candidateForm.email.trim());
      formData.append('phone', candidateForm.phone.trim());
      formData.append('coverLetter', candidateForm.coverNote.trim());
      formData.append('jobTitle', selectedJobForForm?.title || 'General Application (Open Opportunity)');
      formData.append('enterprise', 'realty');
      if (selectedJobForForm && /^\d+$/.test(String(selectedJobForForm.id))) {
        formData.append('jobId', String(selectedJobForForm.id));
      }

      if (fileInputRef.current?.files?.[0]) {
        formData.append('resume', fileInputRef.current.files[0]);
      }
      extras.append(formData);

      formData.append('form_started_at', String(formStartedAt));
      formData.append('turnstile_token', await getTurnstileToken());
      const res = await fetch('/api/applicants.php', {
        method: 'POST',
        body: formData,
      });
      // SAFETY: applicants.php answers { success, ticket } or { success: false, error }; both are re-read as text.
      const result = (await res.json().catch(() => ({}))) as ApplyResponse;
      if (res.ok && result.success !== false) {
        setTicket(result.ticket ? String(result.ticket) : '');
        setFormSubmitted(true);
        if (onApplySuccess) onApplySuccess(selectedJobForForm?.title || 'General Application (Open Opportunity)');
      } else {
        setFormErrors({ submit: result.error ? String(result.error) : 'Submission failed. Please try again.' });
      }
    } catch {
      setFormErrors({ submit: 'Network error. Please retry.' });
    } finally {
      setSubmitting(false);
    }
  };

  const backToRoles = () => {
    setSelectedJobForForm(null);
    setFormSubmitted(false);
  };

  if (selectedJobForForm) {
    const currentJob = ALL_SELECT_JOBS.find((j) => String(j.id) === String(selectedJobForForm.id)) || selectedJobForForm;

    return (
      <div id="realty-careers" className={`${PAGE_X} pb-16 pt-28 sm:pb-24 sm:pt-32`}>
        <button type="button" onClick={backToRoles} className={`${TEXT_LINK} -ml-1`}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to open roles
        </button>
        <Reveal className="mt-4">
          <SectionHeading id="realty-apply-title" page align="left" eyebrow="Careers at Alpha Premier Realty" title="Job **Application**" />
        </Reveal>

        <div className="mt-8 overflow-hidden rounded-3xl border border-[#c5a85c]/25 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(197,168,92,0.1),transparent_55%),linear-gradient(180deg,#101012,#0a0a0c)] shadow-[0_30px_80px_-40px_rgba(197,168,92,0.3)]">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="space-y-6 border-b border-white/10 p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r">
              <div>
                <label htmlFor="realty-apply-position" className={FIELD_LABEL}>
                  Applying for position
                </label>
                <div className="relative">
                  <select
                    id="realty-apply-position"
                    value={selectedJobForForm.id}
                    onChange={(e) => {
                      const found = ALL_SELECT_JOBS.find((j) => String(j.id) === String(e.target.value));
                      if (found) setSelectedJobForForm(found);
                      setFormSubmitted(false);
                      setFormErrors({});
                    }}
                    className={`${FIELD_INPUT} cursor-pointer appearance-none border-[#c5a85c]/50 pr-10 font-semibold text-[#e6cd86] [&>option]:bg-[#0b0b0d] [&>option]:text-white`}
                  >
                    {ALL_SELECT_JOBS.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} ({j.type})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#c5a85c]" aria-hidden="true" />
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <RoleMeta job={currentJob} />
                <h2 className="mt-4 text-xl font-semibold leading-snug text-white">{currentJob.title}</h2>
                {currentJob.description && <p className="mt-2 text-pretty text-sm leading-relaxed text-white/70">{currentJob.description}</p>}
              </div>

              {currentJob.requirements.length > 0 && (
                <div>
                  <p className={`${SMALL_CAPS} mb-3`}>Requirements</p>
                  <Requirements items={currentJob.requirements} />
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 lg:col-span-7">
              {formSubmitted ? (
                <div className="flex min-h-[22rem] flex-col items-center justify-center gap-4 text-center">
                  <span className="grid size-14 place-items-center rounded-full bg-[#c5a85c]/15 text-[#e6cd86]">
                    <Check className="size-7" aria-hidden="true" />
                  </span>
                  <h2 className="font-display text-2xl text-white">
                    Application <span className={GOLD_ACCENT}>Sent</span>
                  </h2>
                  <p className="max-w-md text-pretty text-sm leading-relaxed text-white/70">
                    Thank you, <span className="font-semibold text-white">{candidateForm.fullName}</span>. Your application for{' '}
                    <span className="font-semibold text-white">{currentJob.title}</span> is with our hiring team, and a confirmation is on its way to your email.
                  </p>
                  {ticket && (
                    <p className="text-xs text-white/50">
                      Reference <span className="font-mono text-white/75">{ticket}</span>
                    </p>
                  )}
                  <button type="button" onClick={backToRoles} className={`${BUTTON_SECONDARY} mt-2`}>
                    Back to open roles
                  </button>
                </div>
              ) : (
                <form noValidate onSubmit={handleFormSubmit} className="space-y-4">
                  <h2 className="text-lg font-semibold text-white">Your details</h2>

                  <div>
                    <label htmlFor="realty-apply-name" className={FIELD_LABEL}>
                      Full name <span className="text-[#c5a85c]">*</span>
                    </label>
                    <input
                      id="realty-apply-name"
                      name="fullName"
                      autoComplete="name"
                      type="text"
                      required
                      maxLength={100}
                      value={candidateForm.fullName}
                      aria-invalid={formErrors.fullName ? true : undefined}
                      aria-describedby={formErrors.fullName ? 'realty-apply-name-error' : undefined}
                      onChange={(e) => updateCandidate('fullName', e.target.value)}
                      placeholder="Juan Dela Cruz"
                      className={FIELD_INPUT}
                    />
                    {formErrors.fullName && <p id="realty-apply-name-error" className={FIELD_ERROR}>{formErrors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="realty-apply-email" className={FIELD_LABEL}>
                        Email address <span className="text-[#c5a85c]">*</span>
                      </label>
                      <input
                        id="realty-apply-email"
                        name="email"
                        autoComplete="email"
                        type="email"
                        required
                        maxLength={254}
                        value={candidateForm.email}
                        aria-invalid={formErrors.email ? true : undefined}
                        aria-describedby={formErrors.email ? 'realty-apply-email-error' : undefined}
                        onChange={(e) => updateCandidate('email', e.target.value)}
                        placeholder="juan@example.com"
                        className={FIELD_INPUT}
                      />
                      {formErrors.email && <p id="realty-apply-email-error" className={FIELD_ERROR}>{formErrors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="realty-apply-phone" className={FIELD_LABEL}>
                        Contact number <span className="text-[#c5a85c]">*</span>
                      </label>
                      <input
                        id="realty-apply-phone"
                        name="phone"
                        autoComplete="tel"
                        type="tel"
                        inputMode="tel"
                        required
                        maxLength={30}
                        value={candidateForm.phone}
                        aria-invalid={formErrors.phone ? true : undefined}
                        aria-describedby={formErrors.phone ? 'realty-apply-phone-error' : undefined}
                        onChange={(e) => updateCandidate('phone', e.target.value)}
                        placeholder="0917 123 4567"
                        className={FIELD_INPUT}
                      />
                      {formErrors.phone && <p id="realty-apply-phone-error" className={FIELD_ERROR}>{formErrors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="realty-apply-resume" className={FIELD_LABEL}>
                      Resume (PDF or Word) <span className="text-[#c5a85c]">*</span>
                    </label>
                    <input
                      id="realty-apply-resume"
                      name="resume"
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const error = resumeFileError(f);
                        if (error) {
                          e.target.value = '';
                          setResumeFileName('');
                          setFormErrors((prev) => ({ ...prev, resume: error }));
                          return;
                        }
                        setResumeFileName(f.name);
                        setFormErrors(({ resume: _cleared, ...rest }) => rest);
                      }}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.03] p-1.5 pr-4">
                      <button
                        type="button"
                        id="realty-apply-resume-browse"
                        aria-describedby={`realty-apply-resume-name${formErrors.resume ? ' realty-apply-resume-error' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        className={`inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-[linear-gradient(135deg,#e6cd86,#c5a85c)] px-4 text-xs font-bold uppercase tracking-[0.14em] text-[#0a0a0c] ${FOCUS}`}
                      >
                        <Upload className="size-3.5" aria-hidden="true" />
                        Browse
                      </button>
                      <span id="realty-apply-resume-name" className="truncate text-xs text-white/65">
                        {resumeFileName || 'No file selected'}
                      </span>
                    </div>
                    {formErrors.resume && <p id="realty-apply-resume-error" className={FIELD_ERROR}>{formErrors.resume}</p>}
                  </div>

                  <ApplicantExtrasFields
                    extras={extras}
                    labelClassName={FIELD_LABEL}
                    inputClassName={`${FIELD_INPUT} h-auto py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-[#c5a85c] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:text-[#0a0a0c]`}
                    hintClassName="mt-1.5 text-xs text-white/50"
                    errorClassName={FIELD_ERROR}
                  />

                  <div>
                    <label htmlFor="realty-apply-note" className={FIELD_LABEL}>
                      Cover note
                    </label>
                    <textarea
                      id="realty-apply-note"
                      name="coverLetter"
                      rows={3}
                      maxLength={5000}
                      value={candidateForm.coverNote}
                      aria-invalid={formErrors.coverNote ? true : undefined}
                      aria-describedby={formErrors.coverNote ? 'realty-apply-note-error' : undefined}
                      onChange={(e) => updateCandidate('coverNote', e.target.value)}
                      placeholder="Your real estate, brokerage or sales background, in a few lines"
                      className={`${FIELD_INPUT} h-auto resize-none py-3 leading-relaxed`}
                    />
                    {formErrors.coverNote && <p id="realty-apply-note-error" className={FIELD_ERROR}>{formErrors.coverNote}</p>}
                  </div>

                  {formErrors.submit && (
                    <p role="alert" className="rounded-xl border border-red-500/40 bg-red-950/50 p-3 text-xs text-red-200">
                      {formErrors.submit}
                    </p>
                  )}

                  <button type="submit" disabled={submitting} className={`${BUTTON_PRIMARY} mt-2 w-full disabled:cursor-wait disabled:opacity-70`}>
                    {submitting ? 'Submitting application…' : 'Submit application'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="realty-careers" className={`${PAGE_X} pb-16 pt-28 sm:pb-24 sm:pt-32`}>
      {/* 1. INTRO: heading, short text, the two actions, and the team photo in an offset gold frame. */}
      <Reveal className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="flex flex-col gap-5 lg:col-span-6">
          <SectionHeading id="realty-careers-title" page align="left" eyebrow="Join our team" title={String(content.careers_heading ?? '')} />
          <motion.p variants={rise} className="max-w-prose text-pretty text-[15px] leading-relaxed text-white/75 sm:text-base">
            {String(content.careers_text ?? '')}
          </motion.p>
          <motion.div variants={rise} className="grid grid-cols-2 gap-3 sm:flex">
            <button type="button" onClick={() => scrollToId('openings-list')} className={`${BUTTON_PRIMARY} px-4 sm:px-7`}>
              Open roles
            </button>
            <button type="button" onClick={() => scrollToId('culture-cards')} className={`${BUTTON_SECONDARY} px-4 sm:px-7`}>
              Our culture
            </button>
          </motion.div>
        </div>
        <motion.div variants={rise} className="relative mb-3 mr-3 sm:mb-4 sm:mr-4 lg:col-span-6">
          <span aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border border-[#c5a85c]/35 sm:translate-x-4 sm:translate-y-4" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
            <img
              src={String(content.careers_image ?? '')}
              alt="Alpha Premier team members in a meeting"
              decoding="async"
              className="aspect-[16/10] w-full object-cover md:max-h-[56svh]"
            />
          </div>
        </motion.div>
      </Reveal>

      {/* 2. CULTURE: four values. */}
      {cultureValues.length > 0 && (
        <section id="culture-cards" aria-labelledby="realty-culture-title" className={`${SECTION_GAP} scroll-mt-24`}>
          <Reveal>
            <SectionHeading id="realty-culture-title" eyebrow="Our culture" title="What **Drives** Us" className="mb-8 sm:mb-12" />
            <div className={`${SWIPE_ROW} sm:grid-cols-2 lg:grid-cols-4`}>
              {cultureValues.map((value, idx) => {
                const Icon = VALUE_ICONS[idx % VALUE_ICONS.length];
                return (
                  <motion.article key={`${value.title}-${idx}`} variants={rise} className="w-[78%] shrink-0 snap-start sm:w-auto">
                    <div className={CARD}>
                      <span aria-hidden="true" className={CARD_LINE} />
                      <div className="flex items-start justify-between">
                        <span className={ICON_CIRCLE}>
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <span aria-hidden="true" className="font-display text-2xl italic text-white/20 transition-colors duration-500 group-hover:text-[#c5a85c]/70">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold leading-snug text-white">{value.title}</h3>
                      <p className="text-pretty text-[15px] leading-relaxed text-white/70">{value.text}</p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </Reveal>
        </section>
      )}

      {/* 3. WORKSPACE: one tall photo beside four (a swipe row on phones). */}
      {workspacePhotos.length > 0 && (
        <section aria-labelledby="realty-workspace-title" className={SECTION_GAP}>
          <Reveal>
            <SectionHeading id="realty-workspace-title" eyebrow="Life at Alpha Premier" title="Our **Workspace**" align="left" className="mb-8 sm:mb-10" />
            <motion.div
              variants={rise}
              className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:h-[min(34rem,68svh)] sm:grid-cols-[1.4fr_1fr_1fr] sm:grid-rows-2 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
            >
              {workspacePhotos.slice(0, 5).map((photo, idx) => (
                <div
                  key={`${photo.image}-${idx}`}
                  className={`group relative aspect-[4/3] w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 sm:aspect-auto sm:w-auto ${idx === 0 ? 'sm:row-span-2' : ''}`}
                >
                  <img
                    src={photo.image}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
              ))}
            </motion.div>
          </Reveal>
        </section>
      )}

      {/* 4. WHAT YOU WILL GAIN: three benefits. */}
      {gains.length > 0 && (
        <section aria-labelledby="realty-gains-title" className={SECTION_GAP}>
          <Reveal>
            <SectionHeading id="realty-gains-title" eyebrow="Why Alpha Premier" title="What You Will **Gain**" className="mb-8 sm:mb-12" />
            <div className={`${SWIPE_ROW} sm:grid-cols-3`}>
              {gains.map((gain, idx) => {
                const Icon = GAIN_ICONS[idx % GAIN_ICONS.length];
                return (
                  <motion.article key={`${gain.title}-${idx}`} variants={rise} className="w-[78%] shrink-0 snap-start sm:w-auto">
                    <div className={CARD}>
                      <span aria-hidden="true" className={CARD_LINE} />
                      <span className={ICON_CIRCLE}>
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <h3 className="text-lg font-semibold leading-snug text-white">{gain.title}</h3>
                      <p className="text-pretty text-[15px] leading-relaxed text-white/70">{gain.text}</p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </Reveal>
        </section>
      )}

      {/* 5. TEAM FEEDBACK: one quote at a time, and a form that sends feedback to HR. */}
      <section aria-labelledby="realty-feedback-title" className={SECTION_GAP}>
        <Reveal>
          <motion.div
            variants={rise}
            className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(197,168,92,0.12),transparent_60%),linear-gradient(180deg,#101012,#0a0a0c)] px-5 py-8 sm:px-10 sm:py-10"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="realty-feedback-title" className={SMALL_CAPS}>
                Team feedback
              </h2>
              <button type="button" onClick={() => setShowFeedbackModal(true)} className={`${BUTTON_SECONDARY} h-10 px-5`}>
                <MessageSquarePlus className="size-4" aria-hidden="true" />
                Share your feedback
              </button>
            </div>

            {quotes.length > 0 && (
              <>
                <div className="mt-6 flex items-center gap-2 sm:gap-6">
                  <button
                    type="button"
                    onClick={handlePrevQuote}
                    aria-label="Previous feedback"
                    className={`grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-[#c5a85c]/60 hover:text-[#f0dfae] ${FOCUS}`}
                  >
                    <ChevronLeft className="size-5" aria-hidden="true" />
                  </button>

                  <figure key={activeQuoteIdx} className="flex min-h-[11rem] flex-1 flex-col items-center justify-center text-center animate-in fade-in-0 duration-500 motion-reduce:animate-none">
                    <span aria-hidden="true" className="font-display text-5xl leading-none text-[#c5a85c]/60">
                      “
                    </span>
                    <blockquote className="mt-1 max-w-2xl text-pretty font-display text-lg italic leading-relaxed text-white/85 sm:text-xl">
                      {quotes[activeQuoteIdx]?.text}
                    </blockquote>
                    <figcaption className="mt-5 flex items-center gap-3 text-left">
                      <span aria-hidden="true" className="grid size-9 place-items-center rounded-full border border-[#c5a85c]/40 bg-[#c5a85c]/10 text-sm font-semibold text-[#e6cd86]">
                        {quotes[activeQuoteIdx]?.author.charAt(0)}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-white">{quotes[activeQuoteIdx]?.author}</span>
                        <span className={CAPTION}>{[quotes[activeQuoteIdx]?.role, quotes[activeQuoteIdx]?.tenure].filter(Boolean).join(' · ')}</span>
                      </span>
                    </figcaption>
                  </figure>

                  <button
                    type="button"
                    onClick={handleNextQuote}
                    aria-label="Next feedback"
                    className={`grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-[#c5a85c]/60 hover:text-[#f0dfae] ${FOCUS}`}
                  >
                    <ChevronRight className="size-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-center">
                  {quotes.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveQuoteIdx(idx)}
                      aria-label={`Show feedback ${idx + 1}`}
                      aria-current={activeQuoteIdx === idx}
                      className={`group/dot grid size-10 cursor-pointer place-items-center ${FOCUS}`}
                    >
                      <span className="relative h-1.5 w-6 rounded-full bg-white/15 transition-colors group-hover/dot:bg-white/30">
                        {activeQuoteIdx === idx && (
                          <motion.span
                            layoutId="realty-quote-dot"
                            transition={reduce ? { duration: 0 } : SLIDE}
                            className="absolute inset-0 rounded-full bg-[#c5a85c] shadow-[0_0_8px_rgba(197,168,92,0.7)]"
                          />
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </Reveal>
      </section>

      {/* 6. OPEN ROLES: live search, role cards, and an open application. */}
      <section id="openings-list" aria-labelledby="realty-roles-title" className={`${SECTION_GAP} scroll-mt-24`}>
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading id="realty-roles-title" eyebrow="Join the team" title="Open **Roles**" align="left" />
            <motion.div variants={rise} className="relative w-full lg:w-80">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#c5a85c]" aria-hidden="true" />
              <input
                type="search"
                aria-label="Search roles or locations"
                placeholder="Search roles or locations"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full rounded-full border border-white/10 bg-white/[0.03] pl-11 pr-5 text-sm text-white outline-none transition-colors placeholder:text-white/55 focus:border-[#c5a85c]/70 focus:bg-white/[0.05]"
              />
            </motion.div>
          </div>

          <p role="status" className="mt-6">
            <LiveCount
              text={query ? `${filteredJobs.length} of ${JOB_OPENINGS.length} roles` : `${JOB_OPENINGS.length} open ${JOB_OPENINGS.length === 1 ? 'role' : 'roles'}`}
              syncedAt={null}
            />
          </p>
          <div className="mt-4 flex flex-col gap-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <motion.article
                  key={job.id}
                  variants={rise}
                  aria-labelledby={`realty-role-${job.id}`}
                  className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors duration-500 hover:border-[#c5a85c]/40 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                >
                  <div className="min-w-0 space-y-3">
                    <h3 id={`realty-role-${job.id}`} className="text-lg font-semibold leading-snug text-white">
                      {job.title}
                    </h3>
                    <RoleMeta job={job} />
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <button type="button" onClick={() => setSelectedJob(job)} className={TEXT_LINK}>
                      View details
                    </button>
                    <button type="button" onClick={() => handleOpenApplyModal(job)} className={`${BUTTON_SECONDARY} h-11 px-6`}>
                      Apply now
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </motion.article>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center text-sm text-white/60">
                {JOB_OPENINGS.length > 0 ? 'No roles match your search.' : 'There are no open roles right now. Send your resume below and we will keep you in mind.'}
              </p>
            )}
          </div>

          <motion.div variants={rise} className={`${CTA_PANEL} mt-10`}>
            <div>
              <p className="font-display text-xl text-white sm:text-2xl">
                <RichText text="Don't See the Right **Fit**?" strongClassName={GOLD_ACCENT} />
              </p>
              <p className="mt-1 text-sm text-white/65">Send us your resume and we will reach out when the right role opens.</p>
            </div>
            <button type="button" id="submit-resume-btn" onClick={() => handleOpenApplyModal(null)} className={`${BUTTON_PRIMARY} w-full sm:w-auto`}>
              <Upload className="size-4" aria-hidden="true" />
              Send your resume
            </button>
          </motion.div>
        </Reveal>
      </section>

      {/* JOB DETAILS POPUP */}
      {selectedJob && (
        <div className={MODAL_OVERLAY}>
          <div ref={jobDialogRef} role="dialog" aria-modal="true" aria-labelledby="realty-job-title" tabIndex={-1} className={`${MODAL_PANEL} max-w-2xl`}>
            <button type="button" onClick={() => setSelectedJob(null)} aria-label="Close job details" className={MODAL_CLOSE}>
              <X className="size-5" aria-hidden="true" />
            </button>
            <div className="w-full overflow-y-auto overscroll-contain p-6 sm:p-8">
              <RoleMeta job={selectedJob} />
              <h2 id="realty-job-title" tabIndex={-1} data-autofocus className="mt-4 pr-10 text-2xl font-semibold leading-snug text-white outline-none">
                {selectedJob.title}
              </h2>
              {selectedJob.description && <p className="mt-4 text-pretty text-[15px] leading-relaxed text-white/75">{selectedJob.description}</p>}
              {selectedJob.requirements.length > 0 && (
                <div className="mt-6">
                  <p className={`${SMALL_CAPS} mb-3`}>Requirements</p>
                  <Requirements items={selectedJob.requirements} />
                </div>
              )}
              <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-white/10 pt-6">
                <button type="button" onClick={() => setSelectedJob(null)} className={BUTTON_SECONDARY}>
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const job = selectedJob;
                    setSelectedJob(null);
                    handleOpenApplyModal(job);
                  }}
                  className={BUTTON_PRIMARY}
                >
                  Apply for this role
                  <ArrowRight className={ARROW} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK POPUP */}
      {showFeedbackModal && (
        <div className={MODAL_OVERLAY}>
          <div ref={feedbackDialogRef} role="dialog" aria-modal="true" aria-labelledby="realty-feedback-form-title" tabIndex={-1} className={`${MODAL_PANEL} max-w-md`}>
            <button type="button" onClick={() => setShowFeedbackModal(false)} aria-label="Close feedback form" className={MODAL_CLOSE}>
              <X className="size-5" aria-hidden="true" />
            </button>
            <div className="w-full overflow-y-auto overscroll-contain p-6 sm:p-8">
              <h2 id="realty-feedback-form-title" tabIndex={-1} data-autofocus className="pr-10 font-display text-2xl leading-tight text-white outline-none">
                Share Your <span className={GOLD_ACCENT}>Feedback</span>
              </h2>
              <p className="mt-2 text-sm text-white/60">Tell us about working with Alpha Premier. It goes to our HR team.</p>

              {feedbackSuccess ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <span className="grid size-12 place-items-center rounded-full bg-[#c5a85c]/15 text-[#e6cd86]">
                    <Check className="size-6" aria-hidden="true" />
                  </span>
                  <p className="text-base font-semibold text-white">Feedback sent</p>
                  <p className="text-sm text-white/60">Thank you for sharing. A confirmation is on its way to your inbox.</p>
                </div>
              ) : (
                <form noValidate onSubmit={handleAddFeedbackSubmit} className="mt-6 flex flex-col gap-4">
                  <div>
                    <label htmlFor="realty-feedback-name" className={FIELD_LABEL}>
                      Your name <span className="text-[#c5a85c]">*</span>
                    </label>
                    <input {...feedbackFields.field('name')} id="realty-feedback-name" required type="text" autoComplete="name" value={feedbackAuthor} onChange={(e) => { setFeedbackAuthor(e.target.value); feedbackFields.recheck('name', e.target.value); }} className={FIELD_INPUT} placeholder="e.g. Alex Rivera" />
                    {feedbackFields.errors.name && <p id={feedbackFields.errorId('name')} className={FIELD_ERROR}>{feedbackFields.errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="realty-feedback-email" className={FIELD_LABEL}>
                      Email address <span className="text-[#c5a85c]">*</span>
                    </label>
                    <input {...feedbackFields.field('email')} id="realty-feedback-email" required type="email" autoComplete="email" value={feedbackEmail} onChange={(e) => { setFeedbackEmail(e.target.value); feedbackFields.recheck('email', e.target.value); }} className={FIELD_INPUT} placeholder="alex@example.com" />
                    {feedbackFields.errors.email && <p id={feedbackFields.errorId('email')} className={FIELD_ERROR}>{feedbackFields.errors.email}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="realty-feedback-role" className={FIELD_LABEL}>
                        Role
                      </label>
                      <input {...feedbackFields.field('role')} id="realty-feedback-role" type="text" value={feedbackRole} onChange={(e) => { setFeedbackRole(e.target.value); feedbackFields.recheck('role', e.target.value); }} className={FIELD_INPUT} placeholder="e.g. Advisor" />
                      {feedbackFields.errors.role && <p id={feedbackFields.errorId('role')} className={FIELD_ERROR}>{feedbackFields.errors.role}</p>}
                    </div>
                    <div>
                      <label htmlFor="realty-feedback-tenure" className={FIELD_LABEL}>
                        Years with us
                      </label>
                      <input {...feedbackFields.field('tenure')} id="realty-feedback-tenure" type="text" value={feedbackTenure} onChange={(e) => { setFeedbackTenure(e.target.value); feedbackFields.recheck('tenure', e.target.value); }} className={FIELD_INPUT} placeholder="e.g. 2 years" />
                      {feedbackFields.errors.tenure && <p id={feedbackFields.errorId('tenure')} className={FIELD_ERROR}>{feedbackFields.errors.tenure}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="realty-feedback-text" className={FIELD_LABEL}>
                      Your feedback <span className="text-[#c5a85c]">*</span>
                    </label>
                    <textarea
                      {...feedbackFields.field('text')}
                      id="realty-feedback-text"
                      required
                      rows={4}
                      value={feedbackText}
                      onChange={(e) => {
                        setFeedbackText(e.target.value);
                        feedbackFields.recheck('text', e.target.value);
                      }}
                      className={`${FIELD_INPUT} h-auto resize-none py-3 leading-relaxed`}
                      placeholder="What is it like to work at Alpha Premier?"
                    />
                    {feedbackFields.errors.text && <p id={feedbackFields.errorId('text')} className={FIELD_ERROR}>{feedbackFields.errors.text}</p>}
                  </div>

                  {feedbackError && (
                    <p role="alert" className="rounded-xl border border-red-500/40 bg-red-950/50 p-3 text-xs text-red-200">
                      {feedbackError}
                    </p>
                  )}
                  <button type="submit" disabled={feedbackSending} className={`${BUTTON_PRIMARY} mt-1 w-full disabled:cursor-wait disabled:opacity-70`}>
                    {feedbackSending ? 'Sending…' : 'Send feedback'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
