import { getTurnstileToken } from '@/lib/turnstile';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight, ChevronRight, Globe, Zap, Award, Target, Users, Shield,
  BarChart3, HeadphonesIcon, Code2, FileText, MapPin, Clock, DollarSign, Send, Sparkles, CheckCircle2
} from 'lucide-react';
import { TEAL, TEAL2, ACCENT, MINT_LIGHT, MUTED } from './shared';
import { Glass, Pill } from './shared';
import { useCareers } from '@/hooks/useCareers';
import { useContent } from '@/hooks/useContent';
import { resumeFileError } from '@/lib/resumeFile';
import { emailError, nameError, phoneError, textError } from '@/lib/formValidation';
import { ApplicantExtrasFields, useApplicantExtras } from '@/components/careers/ApplicantExtrasFields';
import { OPEN_POSITIONS } from '@/data/companyData';

const CANDIDATE_FIELDS = ['fullName', 'email', 'phone', 'coverNote'];
const FIELD_IDS = {
  fullName: 'av-apply-fullName',
  email: 'av-apply-email',
  phone: 'av-apply-phone',
  resume: 'av-apply-resume-browse',
  coverNote: 'av-apply-note',
};

function candidateFieldError(field, value) {
  if (field === 'fullName') return nameError(value);
  if (field === 'email') return emailError(value);
  if (field === 'phone') return phoneError(value);
  return textError(value, { label: 'Cover note', max: 5000 });
}

const FIELD_STYLE = { background: 'rgba(4, 15, 23, 0.8)', border: '1px solid rgba(25, 164, 138, 0.4)' };
const ERROR_CLS = 'text-red-400 text-xs mt-1';

// Presentation-only attributes keyed by department. Icons, accent colours and the
// skill chips stay in code; only the role content lives in the database.
const DEPT_STYLES = {
  Finance: { Icon: BarChart3, color: ACCENT, tags: ['FINANCE', 'FP&A', 'MODELING'] },
  People: { Icon: Users, color: TEAL2, tags: ['HR', 'RECRUITING', 'COMPLIANCE'] },
  CX: { Icon: HeadphonesIcon, color: '#7c3aed', tags: ['CX', 'SAAS', 'CSAT'] },
  Tech: { Icon: Code2, color: '#4338ca', tags: ['REACT', 'NODE.JS', 'CLOUD'] },
  Ops: { Icon: FileText, color: '#d97706', tags: ['OPERATIONS', 'PROCESS', 'AUTOMATION'] },
  Legal: { Icon: Shield, color: '#0284c7', tags: ['RISK', 'KYC', 'AUDIT'] },
};
const DEFAULT_DEPT_STYLE = { Icon: Zap, color: ACCENT, tags: [] };

// Admin tags are free text, so departments match ignoring letter case and surrounding space.
const DEPT_BY_KEY = Object.fromEntries(Object.keys(DEPT_STYLES).map((d) => [d.toLowerCase(), d]));

/** Maps an API job opening onto the shape this page renders. */
function toJobView(job) {
  const tag = String(job.tag || '').trim();
  const dept = DEPT_BY_KEY[tag.toLowerCase()] ?? (tag || 'General');
  const style = DEPT_STYLES[dept] || DEFAULT_DEPT_STYLE;
  return {
    id: String(job.id),
    Icon: style.Icon,
    color: style.color,
    dept,
    tags: style.tags,
    title: job.title,
    type: job.type,
    loc: job.location,
    sal: job.salary || '',
    desc: job.description || '',
    require_photo: Number(job.require_photo) || 0,
    ask_portfolio: Number(job.ask_portfolio) || 0,
  };
}

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

// Perk copy is in the content registry (page 'alta-venture'); icons stay here by position.
const PERK_ICONS = [Globe, Zap, Award, Target, Users, Shield];

const FALLBACK_JOBS = OPEN_POSITIONS.map((j) => ({
  id: String(j.id),
  tag: j.division || 'General',
  title: j.title,
  type: j.type,
  location: j.location,
  salary: '',
  description: j.description || '',
}));

export default function Careers() {
  const { content } = useContent('alta-venture');
  const formStartedAt = useRef(Date.now());
  const [activeDept, setActiveDept] = useState('All');
  const [selectedJobForForm, setSelectedJobForForm] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [candidateForm, setCandidateForm] = useState({ fullName: '', email: '', phone: '', coverNote: '' });
  const [resumeFileName, setResumeFileName] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);

  const depts = ['All', 'Finance', 'People', 'CX', 'Tech', 'Ops', 'Legal'];

  const { jobs: rawJobs } = useCareers('alta-venture', FALLBACK_JOBS);
  const JOBS_DATA = rawJobs.map(toJobView);

  const filteredJobs = activeDept === 'All'
    ? JOBS_DATA
    : JOBS_DATA.filter((j) => j.dept.toLowerCase() === activeDept.toLowerCase());

  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState('');
  const extras = useApplicantExtras(selectedJobForForm);

  const updateCandidate = (field, value) => {
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    for (const field of CANDIDATE_FIELDS) {
      const problem = candidateFieldError(field, candidateForm[field]);
      if (problem) errs[field] = problem;
    }
    if (!resumeFileName) errs.resume = formErrors.resume || 'Please attach your CV / Resume file';
    const extrasProblem = extras.validate();
    if (Object.keys(errs).length > 0 || extrasProblem) {
      setFormErrors(errs);
      const firstField = ['fullName', 'email', 'phone', 'resume', 'coverNote'].find((field) => errs[field]);
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
      formData.append('jobTitle', selectedJobForForm?.title || 'Open Application');
      formData.append('enterprise', 'alta-venture');
      if (selectedJobForForm && /^\d+$/.test(String(selectedJobForForm.id))) {
        formData.append('jobId', String(selectedJobForForm.id));
      }

      if (fileInputRef.current?.files?.[0]) {
        formData.append('resume', fileInputRef.current.files[0]);
      }
      extras.append(formData);

      formData.append('form_started_at', String(formStartedAt.current));
      formData.append('turnstile_token', await getTurnstileToken());
      const res = await fetch('/api/applicants.php', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok && result.success !== false) {
        setTicket(result.ticket || `APG-APP-${Date.now().toString().slice(-8)}`);
        setFormSubmitted(true);
      } else {
        setFormErrors({ submit: result.error || 'Submission failed. Please try again.' });
      }
    } catch {
      setFormErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedJobForForm) {
    const currentJob = JOBS_DATA.find(j => j.id === selectedJobForForm.id) || selectedJobForForm;

    return (
      <div className="py-20 px-6 md:px-14 min-h-screen" style={{ background: '#082636', color: '#ffffff' }}>
        <div className="max-w-6xl mx-auto mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3" style={{ background: 'rgba(77, 232, 184, 0.15)', color: '#4de8b8', border: '1px solid rgba(77, 232, 184, 0.3)' }}>
            ALTA VENTURE CAREERS
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Job <span style={{ color: '#4de8b8' }}>Application Portal</span>
          </h1>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl border border-teal-500/20 overflow-hidden shadow-2xl" style={{ background: 'rgba(5, 20, 30, 0.85)', backdropFilter: 'blur(12px)' }}>
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-teal-500/20">
              
              <div className="lg:col-span-5 p-8 flex flex-col justify-between space-y-6" style={{ background: 'rgba(4, 15, 23, 0.9)' }}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="av-apply-position" className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#4de8b8' }}>
                      APPLYING FOR POSITION:
                    </label>
                    <select
                      id="av-apply-position"
                      value={selectedJobForForm.id || selectedJobForForm.title}
                      onChange={(e) => {
                        const found = JOBS_DATA.find(j => j.id === e.target.value || j.title === e.target.value);
                        if (found) setSelectedJobForForm(found);
                        else setSelectedJobForForm({ id: "open-app", title: e.target.value, dept: "Corporate", type: "Full-time", loc: "Remote", desc: "General candidate application." });
                        setFormSubmitted(false);
                        setFormErrors({});
                      }}
                      className="w-full text-sm font-bold rounded-xl px-4 py-3 outline-none cursor-pointer"
                      style={{ background: '#082636', border: '2px solid #19A48A', color: '#4de8b8' }}
                    >
                      {!JOBS_DATA.some((j) => j.id === selectedJobForForm.id) && (
                        <option value={selectedJobForForm.id || selectedJobForForm.title} className="bg-[#082636] text-white">
                          {selectedJobForForm.title}
                        </option>
                      )}
                      {JOBS_DATA.map((j) => (
                        <option key={j.id} value={j.id} className="bg-[#082636] text-white">
                          {j.title} ({j.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 border-t border-teal-500/20">
                    <span className="text-xs font-bold uppercase px-3 py-1 rounded-full" style={{ background: 'rgba(77,232,184,0.15)', color: '#4de8b8' }}>
                      {currentJob.dept} • {currentJob.type}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-3 mb-2">{currentJob.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{currentJob.desc}</p>
                    <div className="mt-3 text-xs font-semibold" style={{ color: '#4de8b8' }}>
                      📍 {currentJob.loc} • 💰 {currentJob.sal || "Competitive"}
                    </div>
                  </div>

                  {content.apply_benefits.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4de8b8' }}>BENEFITS & PERKS:</p>
                    <ul className="space-y-2 text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {content.apply_benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2"><span style={{ color: '#4de8b8', fontWeight: 'bold' }}>✓</span> {benefit}</li>
                      ))}
                    </ul>
                  </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => { setSelectedJobForForm(null); setFormSubmitted(false); }}
                  className="w-full font-bold text-xs tracking-widest uppercase rounded-xl py-3.5 transition-all cursor-pointer"
                  style={{ border: '1px solid #19A48A', color: '#4de8b8' }}
                >
                  ← BACK TO OPEN POSITIONS
                </button>
              </div>

              <div className="lg:col-span-7 p-8">
                {formSubmitted ? (
                  <div className="flex flex-col items-center justify-center min-h-[350px] text-center space-y-5">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-black" style={{ background: '#4de8b8' }}>✓</div>
                    <h2 className="text-2xl font-bold text-white uppercase">Application Registered</h2>
                    <p className="text-sm max-w-md" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Thank you <strong style={{ color: '#4de8b8' }}>{candidateForm.fullName}</strong>. Your resume for <strong className="text-white">{currentJob.title}</strong> has been logged into Alta Venture's global recruitment engine.
                    </p>
                    <div className="p-3 rounded-xl text-xs font-mono" style={{ background: 'rgba(4, 15, 23, 0.9)', border: '1px solid rgba(77, 232, 184, 0.3)', color: '#4de8b8' }}>
                      APPLICATION REF: <span className="text-white font-bold">{ticket || `APG-APP-${Date.now().toString().slice(-8)}`}</span>
                    </div>
                    <button
                      onClick={() => { setSelectedJobForForm(null); setFormSubmitted(false); }}
                      className="px-6 py-3 text-black font-bold text-xs tracking-widest uppercase rounded-xl"
                      style={{ background: '#4de8b8' }}
                    >
                      Back to Positions Catalog
                    </button>
                  </div>
                ) : (
                  <form noValidate onSubmit={handleFormSubmit} className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-2">Candidate Details</h2>
                    
                    <div>
                      <label htmlFor="av-apply-fullName" className="block text-xs font-bold uppercase mb-1" style={{ color: '#4de8b8' }}>FULL NAME *</label>
                      <input
                        type="text"
                        id="av-apply-fullName"
                        name="fullName"
                        autoComplete="name"
                        required
                        maxLength={100}
                        value={candidateForm.fullName}
                        aria-invalid={formErrors.fullName ? true : undefined}
                        aria-describedby={formErrors.fullName ? 'av-apply-fullName-error' : undefined}
                        onChange={(e) => updateCandidate('fullName', e.target.value)}
                        placeholder="Juan dela Cruz"
                        className="w-full text-white text-sm p-3 rounded-xl outline-none"
                        style={FIELD_STYLE}
                      />
                      {formErrors.fullName && <p id="av-apply-fullName-error" className={ERROR_CLS}>{formErrors.fullName}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="av-apply-email" className="block text-xs font-bold uppercase mb-1" style={{ color: '#4de8b8' }}>EMAIL ADDRESS *</label>
                        <input
                          type="email"
                          id="av-apply-email"
                          name="email"
                          autoComplete="email"
                          required
                          maxLength={254}
                          value={candidateForm.email}
                          aria-invalid={formErrors.email ? true : undefined}
                          aria-describedby={formErrors.email ? 'av-apply-email-error' : undefined}
                          onChange={(e) => updateCandidate('email', e.target.value)}
                          placeholder="juan@example.com"
                          className="w-full text-white text-sm p-3 rounded-xl outline-none"
                          style={FIELD_STYLE}
                        />
                        {formErrors.email && <p id="av-apply-email-error" className={ERROR_CLS}>{formErrors.email}</p>}
                      </div>
                      <div>
                        <label htmlFor="av-apply-phone" className="block text-xs font-bold uppercase mb-1" style={{ color: '#4de8b8' }}>MOBILE NUMBER *</label>
                        <input
                          type="tel"
                          id="av-apply-phone"
                          name="phone"
                          autoComplete="tel"
                          inputMode="tel"
                          required
                          maxLength={30}
                          value={candidateForm.phone}
                          aria-invalid={formErrors.phone ? true : undefined}
                          aria-describedby={formErrors.phone ? 'av-apply-phone-error' : undefined}
                          onChange={(e) => updateCandidate('phone', e.target.value)}
                          placeholder="+63 9XX XXX XXXX"
                          className="w-full text-white text-sm p-3 rounded-xl outline-none"
                          style={FIELD_STYLE}
                        />
                        {formErrors.phone && <p id="av-apply-phone-error" className={ERROR_CLS}>{formErrors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="av-apply-resume" className="block text-xs font-bold uppercase mb-1" style={{ color: '#4de8b8' }}>ATTACH RESUME (PDF/DOC) *</label>
                      <input
                        id="av-apply-resume"
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
                      <div className="flex items-center gap-3 rounded-xl p-2.5" style={FIELD_STYLE}>
                        <button
                          type="button"
                          id="av-apply-resume-browse"
                          aria-describedby={`av-apply-resume-name${formErrors.resume ? ' av-apply-resume-error' : ''}`}
                          onClick={() => fileInputRef.current?.click()}
                          className="text-black font-extrabold text-xs tracking-wider uppercase px-4 py-2 rounded-lg cursor-pointer"
                          style={{ background: '#4de8b8' }}
                        >
                          ⬆ BROWSE
                        </button>
                        <span id="av-apply-resume-name" className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{resumeFileName || "No file selected"}</span>
                      </div>
                      {formErrors.resume && <p id="av-apply-resume-error" className={ERROR_CLS}>{formErrors.resume}</p>}
                    </div>

                    <ApplicantExtrasFields
                      extras={extras}
                      labelClassName="block text-xs font-bold uppercase mb-1 text-[#4de8b8]"
                      inputClassName="w-full text-white text-sm p-3 rounded-xl outline-none bg-[rgba(4,15,23,0.8)] border border-[rgba(25,164,138,0.4)] file:mr-3 file:rounded-lg file:border-0 file:bg-[#4de8b8] file:px-4 file:py-2 file:text-xs file:font-extrabold file:uppercase file:text-black"
                      hintClassName="text-xs mt-1 text-white/60"
                      errorClassName={ERROR_CLS}
                    />

                    <div>
                      <label htmlFor="av-apply-note" className="block text-xs font-bold uppercase mb-1" style={{ color: '#4de8b8' }}>EXPERIENCE SUMMARY / LINK</label>
                      <textarea
                        id="av-apply-note"
                        name="coverLetter"
                        rows={3}
                        maxLength={5000}
                        value={candidateForm.coverNote}
                        aria-invalid={formErrors.coverNote ? true : undefined}
                        aria-describedby={formErrors.coverNote ? 'av-apply-note-error' : undefined}
                        onChange={(e) => updateCandidate('coverNote', e.target.value)}
                        placeholder="Link to LinkedIn, portfolio, or summary of BPO/finance experience..."
                        className="w-full text-white text-sm p-3 rounded-xl outline-none"
                        style={FIELD_STYLE}
                      />
                      {formErrors.coverNote && <p id="av-apply-note-error" className={ERROR_CLS}>{formErrors.coverNote}</p>}
                    </div>

                    {formErrors.submit && (
                      <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs font-semibold">
                        {formErrors.submit}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full text-black font-bold text-xs tracking-widest uppercase rounded-xl py-4 transition-all cursor-pointer mt-2 disabled:opacity-50"
                      style={{ background: '#4de8b8' }}
                    >
                      {submitting ? 'SUBMITTING APPLICATION...' : 'SUBMIT APPLICATION'}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden py-24 px-6 md:px-14" style={{ background: TEAL }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-x-clip">
          <div
            style={{
              position: 'absolute', top: -120, right: -80, width: 520, height: 460,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(77,232,184,0.30) 0%, transparent 72%)',
              filter: 'blur(60px)',
            }}
          />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-5xl mx-auto"
        >
          <motion.div variants={fadeInUp}>
            <Pill light>We're Hiring</Pill>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-white tracking-tight"
          >
            {content.careers_heading_a} <br />
            <span style={{ color: MINT_LIGHT }}>{content.careers_heading_b}</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg max-w-xl leading-relaxed mb-8 font-medium"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            {content.careers_text}
          </motion.p>
        </motion.div>
      </section>

      {/* ── WHY ALTA VENTURE / PERKS ── */}
      <section className="relative overflow-hidden py-20 px-6 md:px-14" style={{ background: 'linear-gradient(160deg, #f0fdf8 0%, #f6fef9 55%, #fff5f5 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-x-clip">
          {/* Mint orb top-right */}
          <div style={{ position: 'absolute', top: -100, right: -60, width: 500, height: 440, background: 'radial-gradient(ellipse at 60% 38%, rgba(77,232,184,0.26) 0%, rgba(20,146,123,0.10) 46%, transparent 70%)', filter: 'blur(68px)' }} />
          {/* Rose splash bottom-left */}
          <div style={{ position: 'absolute', bottom: -65, left: -50, width: 460, height: 400, background: 'radial-gradient(ellipse at 38% 62%, rgba(251,113,133,0.18) 0%, rgba(244,63,94,0.08) 50%, transparent 72%)', filter: 'blur(70px)' }} />
          {/* Amber mid */}
          <div style={{ position: 'absolute', top: '40%', left: '35%', width: 360, height: 300, background: 'radial-gradient(ellipse at 50% 50%, rgba(251,191,36,0.14) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          {/* Dot grid */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.03"><defs><pattern id="careers-dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="#082636" /></pattern></defs><rect width="100%" height="100%" fill="url(#careers-dots)" /></svg>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <Pill>Why Alta Venture</Pill>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4" style={{ color: TEAL }}>
              Life & Culture at <span style={{ color: ACCENT }}>Alta Venture</span>
            </h2>
            <p className="text-base leading-relaxed" style={{ color: MUTED }}>
              Built for high performers who value autonomy, excellence, and continuous growth.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {content.perks.map(({ title, desc }, i) => {
              const Icon = PERK_ICONS[i % PERK_ICONS.length];
              return (
              <motion.div key={i} variants={fadeInUp}>
                <Glass hoverEffect className="rounded-3xl p-8 flex flex-col justify-between h-full border border-teal-900/10 shadow-lg">
                  <div>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                      style={{ background: 'rgba(8, 38, 54, 0.08)', color: TEAL }}
                    >
                      <Icon size={22} />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: TEAL }}>{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{desc}</p>
                  </div>
                </Glass>
              </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── OPEN POSITIONS ── */}
      <section className="relative overflow-hidden py-20 px-6 md:px-14" style={{ background: 'linear-gradient(140deg, #f0f4ff 0%, #f3f8f5 45%, #fdf5f0 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-x-clip">
          {/* Indigo orb top-right */}
          <div style={{ position: 'absolute', top: -110, right: -65, width: 520, height: 460, background: 'radial-gradient(ellipse at 58% 40%, rgba(99,102,241,0.22) 0%, rgba(139,92,246,0.10) 48%, transparent 70%)', filter: 'blur(70px)' }} />
          {/* Peach splash bottom-left */}
          <div style={{ position: 'absolute', bottom: -60, left: -55, width: 460, height: 400, background: 'radial-gradient(ellipse at 40% 62%, rgba(251,146,60,0.18) 0%, rgba(249,115,22,0.08) 50%, transparent 72%)', filter: 'blur(68px)' }} />
          {/* Mint mid */}
          <div style={{ position: 'absolute', top: '45%', left: '28%', width: 340, height: 290, background: 'radial-gradient(ellipse at 50% 50%, rgba(77,232,184,0.14) 0%, transparent 70%)', filter: 'blur(58px)' }} />
          {/* Diagonal stripe */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" opacity="0.025"><defs><pattern id="careers-stripe" width="38" height="38" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="38" stroke="#082636" strokeWidth="1" /></pattern></defs><rect width="100%" height="100%" fill="url(#careers-stripe)" /></svg>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <Pill>Open Roles</Pill>
              <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: TEAL }}>
                Current Opportunities
              </h2>
            </div>

            {/* Department Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {depts.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className={`min-h-10 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer border ${
                    activeDept === dept
                      ? 'shadow-md scale-105'
                      : 'hover:bg-white/80'
                  }`}
                  style={{
                    background: activeDept === dept ? TEAL : 'rgba(255,255,255,0.75)',
                    color: activeDept === dept ? '#ffffff' : TEAL,
                    borderColor: activeDept === dept ? TEAL : 'rgba(8, 38, 54, 0.1)',
                  }}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <motion.div
            key={activeDept}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className={
              filteredJobs.length === 1
                ? 'max-w-3xl mx-auto flex flex-col gap-4 w-full'
                : 'flex flex-col gap-4'
            }
          >
            {filteredJobs.map((job) => {
              const c = job.color;
              const JobIcon = job.Icon;
              const isApplied = selectedJobForForm?.id === job.id;

              return (
                <motion.div key={job.id} variants={fadeInUp}>
                  <Glass
                    hoverEffect
                    className="rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-teal-900/10 shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 min-w-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1"
                        style={{ background: `${c}15`, color: c, border: `1.5px solid ${c}30` }}
                      >
                        <JobIcon size={22} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {job.tags.map((t) => (
                            <span
                              key={t}
                              className="text-xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                              style={{ background: `${c}15`, color: c }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        <h3 className="text-xl font-bold mb-2" style={{ color: TEAL }}>{job.title}</h3>
                        <p className="text-sm md:text-sm leading-relaxed mb-4" style={{ color: MUTED }}>{job.desc}</p>

                        <div className="flex items-center gap-5 flex-wrap text-xs font-semibold" style={{ color: MUTED }}>
                          <span className="flex items-center gap-1.5"><MapPin size={13} /> {job.loc}</span>
                          <span className="flex items-center gap-1.5"><Clock size={13} /> {job.type}</span>
                          <span className="flex items-center gap-1.5"><DollarSign size={13} /> {job.sal}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      {isApplied ? (
                        <span className="flex items-center gap-1.5 text-xs font-extrabold px-5 py-3 rounded-xl bg-emerald-100 text-emerald-800">
                          <CheckCircle2 size={16} /> Application Started
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setSelectedJobForForm(job); setFormSubmitted(false); setFormErrors({}); window.scrollTo({ top: 0, behavior: "instant" }); }}
                          className="flex-shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-extrabold transition-all hover:scale-105 shadow-md cursor-pointer"
                          style={{ background: TEAL, color: '#ffffff' }}
                        >
                          Apply Now <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </Glass>
                </motion.div>
              );
            })}

            {filteredJobs.length === 0 && (
              <div className="text-center py-16 bg-white/50 rounded-3xl border border-dashed border-teal-900/20">
                <p className="text-sm font-medium" style={{ color: MUTED }}>
                  {JOBS_DATA.length === 0
                    ? 'There are no open positions right now. Send a general application below and we will reach out when a fitting role opens.'
                    : 'No open positions in this department at the moment.'}
                </p>
                {JOBS_DATA.length > 0 && (
                  <button
                    onClick={() => setActiveDept('All')}
                    className="mt-4 text-xs font-bold underline cursor-pointer"
                    style={{ color: TEAL }}
                  >
                    View All Open Positions
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── GENERAL APPLICATION CTA ── */}
      <section
        className="relative overflow-hidden py-24 px-6 md:px-14"
        style={{ background: 'linear-gradient(145deg, #041824 0%, #082636 45%, #0d4e66 100%)' }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-x-clip">
          <div
            className="av-pulse-glow"
            style={{
              position: 'absolute', top: -60, left: '18%', width: 460, height: 380,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(77,232,184,0.30) 0%, transparent 72%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: MINT_LIGHT }}
          >
            <Send size={24} />
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">
            {content.careers_cta_heading}
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {content.careers_cta_text}
          </p>

          <button
            type="button"
            onClick={() => { setSelectedJobForForm({ id: "open-app", title: "General Talent Pool Application", dept: "Corporate", type: "Full-time", loc: "Remote (Global)", sal: "Competitive", desc: "General application for senior specialists and fractional leaders." }); setFormSubmitted(false); setFormErrors({}); window.scrollTo({ top: 0, behavior: "instant" }); }}
            className="av-btn-glow flex items-center gap-2.5 px-9 py-4 rounded-xl text-base font-extrabold transition-all hover:scale-105 shadow-2xl cursor-pointer"
            style={{ background: MINT_LIGHT, color: TEAL }}
          >
            Send Open Application <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>
    </>
  );
}
