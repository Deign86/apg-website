import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight, ChevronRight, Globe, Zap, Award, Target, Users, Shield,
  BarChart3, HeadphonesIcon, Code2, FileText, MapPin, Clock, DollarSign, Send, Sparkles, CheckCircle2
} from 'lucide-react';
import { TEAL, TEAL2, ACCENT, MINT_LIGHT, MUTED } from './shared';
import { Glass, Pill } from './shared';

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const PERKS = [
  { Icon: Globe, title: '100% Remote-First', desc: "Work from anywhere worldwide. We operate asynchronously with global flexibility." },
  { Icon: Zap, title: 'Rapid Growth Track', desc: 'Accelerate your career in a hyper-growth enterprise environment with merit-based advancement.' },
  { Icon: Award, title: 'Learning Allowance', desc: '$1,500/year professional stipend for certifications, courses, books, and industry summits.' },
  { Icon: Target, title: 'Profit-Sharing Access', desc: 'Long-term team members gain access to direct equity and profit-sharing pools.' },
  { Icon: Users, title: 'Global Diversity', desc: 'Join 500+ specialists across 40+ countries bringing multi-disciplinary perspective.' },
  { Icon: Shield, title: 'Comprehensive Benefits', desc: 'Full medical coverage, wellness stipends, parental leave, and generous paid time off.' },
];

const JOBS_DATA = [
  {
    id: 'job-1', Icon: BarChart3, color: ACCENT, dept: 'Finance', tags: ['FINANCE', 'FP&A', 'MODELING'],
    title: 'Senior Virtual CFO Analyst', type: 'Full-time', loc: 'Remote (Global)', sal: '$70k – $95k',
    desc: "Lead financial modeling, cash flow management, investor reporting packages, and strategic budgeting for venture-backed portfolio companies."
  },
  {
    id: 'job-2', Icon: Users, color: TEAL2, dept: 'People', tags: ['HR', 'RECRUITING', 'COMPLIANCE'],
    title: 'Global HR Business Partner', type: 'Full-time', loc: 'Manila / Remote', sal: '$50k – $70k',
    desc: "Oversee global talent acquisition, executive search, onboarding workflows, and payroll compliance for international enterprise clients."
  },
  {
    id: 'job-3', Icon: HeadphonesIcon, color: '#7c3aed', dept: 'CX', tags: ['CX', 'SAAS', 'CSAT'],
    title: 'Customer Operations Manager', type: 'Full-time', loc: 'Remote (APAC/US)', sal: '$55k – $75k',
    desc: "Lead omnichannel customer experience delivery teams. Manage SLAs, CSAT tracking, quality audits, and key client escalation channels."
  },
  {
    id: 'job-4', Icon: Code2, color: '#4338ca', dept: 'Tech', tags: ['REACT', 'NODE.JS', 'CLOUD'],
    title: 'Senior Full-Stack Engineer', type: 'Contract / Full-time', loc: 'Remote (Global)', sal: '$85k – $125k',
    desc: "Architect internal automation workflows, client portals, and secure API integrations in a fast-paced async engineering environment."
  },
  {
    id: 'job-5', Icon: FileText, color: '#d97706', dept: 'Ops', tags: ['OPERATIONS', 'PROCESS', 'AUTOMATION'],
    title: 'Back-Office Operations Coordinator', type: 'Full-time', loc: 'Cebu / Remote', sal: '$35k – $50k',
    desc: 'Coordinate back-office execution, document processing, and data workflows with meticulous attention to accuracy and process efficiency.'
  },
  {
    id: 'job-6', Icon: Shield, color: '#0284c7', dept: 'Legal', tags: ['RISK', 'KYC', 'AUDIT'],
    title: 'Enterprise Compliance Lead', type: 'Full-time', loc: 'Remote (US/EU)', sal: '$65k – $90k',
    desc: 'Keep client operations audit-ready. Conduct risk assessments, enforce AML/KYC protocols, and oversee data privacy adherence.'
  },
];

export default function Careers() {
  const [activeDept, setActiveDept] = useState('All');
  const [selectedJobForForm, setSelectedJobForForm] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [candidateForm, setCandidateForm] = useState({ fullName: '', email: '', phone: '', coverNote: '' });
  const [resumeFileName, setResumeFileName] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);

  const depts = ['All', 'Finance', 'People', 'CX', 'Tech', 'Ops', 'Legal'];

  const filteredJobs = activeDept === 'All'
    ? JOBS_DATA
    : JOBS_DATA.filter((j) => j.dept === activeDept);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!candidateForm.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!candidateForm.email.trim() || !/\S+@\S+\.\S+/.test(candidateForm.email)) errs.email = 'Valid Email Address is required';
    if (!candidateForm.phone.trim()) errs.phone = 'Mobile Number is required';
    if (!resumeFileName) errs.resume = 'Please attach your CV / Resume file';
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormSubmitted(true);
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
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#4de8b8' }}>
                      APPLYING FOR POSITION:
                    </label>
                    <select
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

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#4de8b8' }}>BENEFITS & PERKS:</p>
                    <ul className="space-y-2 text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      <li className="flex items-center gap-2"><span style={{ color: '#4de8b8', fontWeight: 'bold' }}>✓</span> 100% Remote-first global flexibility</li>
                      <li className="flex items-center gap-2"><span style={{ color: '#4de8b8', fontWeight: 'bold' }}>✓</span> $1,500/yr annual learning stipend</li>
                    </ul>
                  </div>
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
                    <button
                      onClick={() => { setSelectedJobForForm(null); setFormSubmitted(false); }}
                      className="px-6 py-3 text-black font-bold text-xs tracking-widest uppercase rounded-xl"
                      style={{ background: '#4de8b8' }}
                    >
                      Back to Positions Catalog
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-2">Candidate Details</h2>
                    
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1" style={{ color: '#4de8b8' }}>FULL NAME *</label>
                      <input
                        type="text"
                        value={candidateForm.fullName}
                        onChange={(e) => setCandidateForm({ ...candidateForm, fullName: e.target.value })}
                        placeholder="Juan dela Cruz"
                        className="w-full text-white text-sm p-3 rounded-xl outline-none"
                        style={{ background: 'rgba(4, 15, 23, 0.8)', border: '1px solid rgba(25, 164, 138, 0.4)' }}
                      />
                      {formErrors.fullName && <p className="text-red-400 text-xs mt-1">{formErrors.fullName}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1" style={{ color: '#4de8b8' }}>EMAIL ADDRESS *</label>
                        <input
                          type="email"
                          value={candidateForm.email}
                          onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                          placeholder="juan@example.com"
                          className="w-full text-white text-sm p-3 rounded-xl outline-none"
                          style={{ background: 'rgba(4, 15, 23, 0.8)', border: '1px solid rgba(25, 164, 138, 0.4)' }}
                        />
                        {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1" style={{ color: '#4de8b8' }}>MOBILE NUMBER *</label>
                        <input
                          type="tel"
                          value={candidateForm.phone}
                          onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                          placeholder="+63 9XX XXX XXXX"
                          className="w-full text-white text-sm p-3 rounded-xl outline-none"
                          style={{ background: 'rgba(4, 15, 23, 0.8)', border: '1px solid rgba(25, 164, 138, 0.4)' }}
                        />
                        {formErrors.phone && <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1" style={{ color: '#4de8b8' }}>ATTACH RESUME (PDF/DOC) *</label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) setResumeFileName(f.name); }}
                        className="hidden"
                      />
                      <div className="flex items-center gap-3 rounded-xl p-2.5" style={{ background: 'rgba(4, 15, 23, 0.8)', border: '1px solid rgba(25, 164, 138, 0.4)' }}>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-black font-extrabold text-xs tracking-wider uppercase px-4 py-2 rounded-lg cursor-pointer"
                          style={{ background: '#4de8b8' }}
                        >
                          ⬆ BROWSE
                        </button>
                        <span className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{resumeFileName || "No file selected"}</span>
                      </div>
                      {formErrors.resume && <p className="text-red-400 text-xs mt-1">{formErrors.resume}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-1" style={{ color: '#4de8b8' }}>EXPERIENCE SUMMARY / LINK</label>
                      <textarea
                        rows={3}
                        value={candidateForm.coverNote}
                        onChange={(e) => setCandidateForm({ ...candidateForm, coverNote: e.target.value })}
                        placeholder="Link to LinkedIn, portfolio, or summary of BPO/finance experience..."
                        className="w-full text-white text-sm p-3 rounded-xl outline-none"
                        style={{ background: 'rgba(4, 15, 23, 0.8)', border: '1px solid rgba(25, 164, 138, 0.4)' }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full text-black font-bold text-xs tracking-widest uppercase rounded-xl py-4 transition-all cursor-pointer mt-2"
                      style={{ background: '#4de8b8' }}
                    >
                      SUBMIT APPLICATION
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
        <div aria-hidden className="pointer-events-none absolute inset-0">
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
            Build Your Career <br />
            <span style={{ color: MINT_LIGHT }}>With Alta Venture</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg max-w-xl leading-relaxed mb-8 font-medium"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Join an elite global network of fractional leaders, financial strategists, and tech operations specialists.
          </motion.p>
        </motion.div>
      </section>

      {/* ── WHY ALTA VENTURE / PERKS ── */}
      <section className="relative overflow-hidden py-20 px-6 md:px-14" style={{ background: 'linear-gradient(160deg, #f0fdf8 0%, #f6fef9 55%, #fff5f5 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
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
            {PERKS.map(({ Icon, title, desc }) => (
              <motion.div key={title} variants={fadeInUp}>
                <Glass hoverEffect className="rounded-3xl p-8 flex flex-col justify-between h-full border border-teal-900/10 shadow-lg">
                  <div>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                      style={{ background: 'rgba(8, 38, 54, 0.08)', color: TEAL }}
                    >
                      <Icon size={22} />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: TEAL }}>{title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{desc}</p>
                  </div>
                </Glass>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── OPEN POSITIONS ── */}
      <section className="relative overflow-hidden py-20 px-6 md:px-14" style={{ background: 'linear-gradient(140deg, #f0f4ff 0%, #f3f8f5 45%, #fdf5f0 100%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
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
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer border ${
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
                    <div className="flex items-start gap-4 flex-1">
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
                              className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                              style={{ background: `${c}15`, color: c }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        <h3 className="text-xl font-bold mb-2" style={{ color: TEAL }}>{job.title}</h3>
                        <p className="text-xs md:text-sm leading-relaxed mb-4" style={{ color: MUTED }}>{job.desc}</p>

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
                          onClick={() => { setSelectedJobForForm(job); setFormSubmitted(false); setFormErrors({}); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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
                <p className="text-sm font-medium" style={{ color: MUTED }}>No open positions in this department at the moment.</p>
                <button
                  onClick={() => setActiveDept('All')}
                  className="mt-4 text-xs font-bold underline cursor-pointer"
                  style={{ color: TEAL }}
                >
                  View All Open Positions
                </button>
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
        <div aria-hidden className="pointer-events-none absolute inset-0">
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
            Don't See Your Exact Role?
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.85)' }}>
            We are always seeking senior domain specialists and fractional leaders. Send us an open application to join our active talent pool.
          </p>

          <button
            type="button"
            onClick={() => { setSelectedJobForForm({ id: "open-app", title: "General Talent Pool Application", dept: "Corporate", type: "Full-time", loc: "Remote (Global)", sal: "Competitive", desc: "General application for senior specialists and fractional leaders." }); setFormSubmitted(false); setFormErrors({}); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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
