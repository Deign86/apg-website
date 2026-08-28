import React, { useState, useMemo } from 'react';
import { JOB_OPENINGS } from '../data';
import { JobOpening } from '../types';
import { 
  Briefcase, 
  MapPin, 
  Search, 
  Star, 
  ShieldCheck, 
  Zap, 
  Users, 
  TrendingUp, 
  GraduationCap, 
  Globe, 
  FileText, 
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  MessageSquare
} from 'lucide-react';

interface CareersSectionProps {
  onApplySuccess: (jobTitle: string) => void;
}

export default function CareersSection({ onApplySuccess }: CareersSectionProps) {
  const [selectedJobForForm, setSelectedJobForForm] = useState<JobOpening | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [candidateForm, setCandidateForm] = useState({ fullName: '', email: '', phone: '', coverNote: '' });
  const [resumeFileName, setResumeFileName] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [jobToApply, setJobToApply] = useState<JobOpening | null>(null);

  // Resume form state
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantCoverLetter, setApplicantCoverLetter] = useState('');

  // Sample Quotes & Active Slide
  const [quotes, setQuotes] = useState([
    {
      text: "Joining Alpha Premier was the best decision of my career. The mentorship, the culture, and the earning potential are genuinely unlike anything I have experienced in any other firm. I closed my first 50M deal within eight months of starting.",
      author: "Maria Santos",
      role: "Senior Broker - BGC Office",
      tenure: "4 Years"
    },
    {
      text: "The institutional research backing we get here is world-class. When I pitch to corporate tenants, I have hard data model sheets that give me absolute leverage. The commission structures are transparent and paid promptly.",
      author: "Robert Lim",
      role: "Commercial Leasing Lead - Makati Office",
      tenure: "6 Years"
    },
    {
      text: "Our collaborative network is outstanding. I frequently refer clients migrating between Davao and Manila and get seamless splits. We work as a family, driving elite standards across the nation.",
      author: "Patricia Aquino",
      role: "Residential Specialist - Davao Branch",
      tenure: "3 Years"
    }
  ]);
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);

  // Add Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackAuthor, setFeedbackAuthor] = useState('');
  const [feedbackRole, setFeedbackRole] = useState('');
  const [feedbackTenure, setFeedbackTenure] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handlePrevQuote = () => {
    setActiveQuoteIdx((prev) => (prev === 0 ? quotes.length - 1 : prev - 1));
  };

  const handleNextQuote = () => {
    setActiveQuoteIdx((prev) => (prev === quotes.length - 1 ? 0 : prev + 1));
  };

  const handleAddFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || !feedbackAuthor.trim()) return;

    const newQuote = {
      text: feedbackText.trim(),
      author: feedbackAuthor.trim(),
      role: feedbackRole.trim() || 'Team Member',
      tenure: feedbackTenure.trim() || '1 Year'
    };

    setQuotes((prev) => [...prev, newQuote]);
    setActiveQuoteIdx(quotes.length);
    setFeedbackSuccess(true);

    setTimeout(() => {
      setFeedbackAuthor('');
      setFeedbackRole('');
      setFeedbackTenure('');
      setFeedbackText('');
      setFeedbackSuccess(false);
      setShowFeedbackModal(false);
    }, 1500);
  };

  // Filtering Job Openings
  const filteredJobs = useMemo(() => {
    return JOB_OPENINGS.filter((job) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesLoc = job.location.toLowerCase().includes(query);
        const matchesDept = job.department.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLoc && !matchesDept) return false;
      }
      return true;
    });
  }, [searchQuery]);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplySuccess(jobToApply ? jobToApply.title : "Open Application");
    // Reset form
    setApplicantName('');
    setApplicantEmail('');
    setApplicantPhone('');
    setApplicantCoverLetter('');
    setShowApplyModal(false);
    setJobToApply(null);
  };

  const handleOpenApplyModal = (job: JobOpening | null) => { setSelectedJobForForm(job || JOB_OPENINGS[0]); setFormSubmitted(false); setFormErrors({}); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!candidateForm.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!candidateForm.email.trim() || !/\S+@\S+\.\S+/.test(candidateForm.email)) errs.email = 'Valid Email Address is required';
    if (!candidateForm.phone.trim()) errs.phone = 'Mobile Number is required';
    if (!resumeFileName) errs.resume = 'Please attach your Resume file';
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
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
      formData.append('enterprise', 'realty');

      if (fileInputRef.current?.files?.[0]) {
        formData.append('resume', fileInputRef.current.files[0]);
      }

      const res = await fetch('/api/applicants.php', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok && result.success !== false) {
        setTicket(result.ticket || `APG-APP-${Date.now().toString().slice(-8)}`);
        setFormSubmitted(true);
        if (onApplySuccess) onApplySuccess(selectedJobForForm?.title || 'Open Application');
      } else {
        setFormErrors({ submit: result.error || 'Submission failed. Please try again.' });
      }
    } catch {
      setFormErrors({ submit: 'Network error. Please retry.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedJobForForm) {
    const currentJob = JOB_OPENINGS.find(j => j.id === selectedJobForForm.id) || selectedJobForForm;

    return (
      <div className="py-20 px-6 md:px-12 min-h-screen bg-[#07080b] text-white">
        <div className="max-w-6xl mx-auto mb-10 text-center">
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#c5a85c] mb-3 inline-block">
            ALPHA PREMIER REALTY
          </span>
          <h1 className="text-4xl md:text-5xl font-light tracking-wide text-white uppercase">
            Job <span className="text-[#c5a85c] font-semibold">Application Portal</span>
          </h1>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-[#0b0c10] border border-[#c5a85c]/30 rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-900">
              
              <div className="lg:col-span-5 p-8 bg-[#07080c] flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-[#c5a85c] uppercase tracking-widest mb-2">
                      APPLYING FOR POSITION:
                    </label>
                    <select
                      value={selectedJobForForm.id}
                      onChange={(e) => {
                        const found = JOB_OPENINGS.find(j => j.id === e.target.value);
                        if (found) setSelectedJobForForm(found);
                        setFormSubmitted(false);
                        setFormErrors({});
                      }}
                      className="w-full bg-[#0b0c10] border-2 border-[#c5a85c] text-[#c5a85c] font-bold text-sm rounded-xl px-4 py-3 outline-none cursor-pointer"
                    >
                      {JOB_OPENINGS.map((j) => (
                        <option key={j.id} value={j.id} className="bg-[#0b0c10] text-white">
                          {j.title} ({j.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 border-t border-gray-900">
                    <span className="text-xs font-bold text-[#c5a85c] uppercase tracking-wider bg-[#c5a85c]/10 px-3 py-1 rounded-full border border-[#c5a85c]/30">
                      {currentJob.department} • {currentJob.location}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-3 mb-2">{currentJob.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed font-light">{currentJob.description}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[#c5a85c] uppercase tracking-wider">REQUIREMENTS:</p>
                    <ul className="space-y-2 text-xs text-white/80 font-light">
                      {currentJob.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-[#c5a85c] font-bold">✓</span> {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setSelectedJobForForm(null); setFormSubmitted(false); }}
                  className="w-full border border-[#c5a85c] text-[#c5a85c] font-bold text-xs tracking-widest uppercase rounded-xl py-3.5 hover:bg-[#c5a85c] hover:text-[#06070a] transition-all cursor-pointer"
                >
                  ← BACK TO OPEN ROLES
                </button>
              </div>

              <div className="lg:col-span-7 p-8">
                {formSubmitted ? (
                  <div className="flex flex-col items-center justify-center min-h-[350px] text-center space-y-5">
                    <div className="w-16 h-16 rounded-full bg-[#c5a85c] text-[#06070a] flex items-center justify-center text-2xl font-bold">✓</div>
                    <h2 className="text-2xl font-bold text-white uppercase">Application Submitted</h2>
                    <p className="text-sm text-white/80 max-w-md font-light">
                      Thank you <strong className="text-[#c5a85c]">{candidateForm.fullName}</strong>. Your resume for <strong className="text-white">{currentJob.title}</strong> has been logged into Alpha Premier Realty's executive talent board.
                    </p>
                    <div className="p-3 bg-[#07080c] border border-[#c5a85c]/30 rounded-xl text-xs font-mono text-[#c5a85c]">
                      REFERENCE: <span className="text-white font-bold">{ticket || `APG-APP-${Date.now().toString().slice(-8)}`}</span>
                    </div>
                    <button
                      onClick={() => { setSelectedJobForForm(null); setFormSubmitted(false); }}
                      className="px-6 py-3 bg-[#c5a85c] text-[#06070a] font-bold text-xs tracking-widest uppercase rounded-xl hover:bg-[#b0934c]"
                    >
                      Back to Roles Catalog
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-2">Candidate Details</h2>
                    
                    <div>
                      <label className="block text-xs font-bold text-[#c5a85c] uppercase mb-1">FULL NAME *</label>
                      <input
                        type="text"
                        value={candidateForm.fullName}
                        onChange={(e) => setCandidateForm({ ...candidateForm, fullName: e.target.value })}
                        placeholder="Juan dela Cruz"
                        className="w-full bg-[#07080c] border border-gray-800 text-white text-sm p-3 rounded-xl outline-none focus:border-[#c5a85c]"
                      />
                      {formErrors.fullName && <p className="text-red-400 text-xs mt-1">{formErrors.fullName}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#c5a85c] uppercase mb-1">EMAIL ADDRESS *</label>
                        <input
                          type="email"
                          value={candidateForm.email}
                          onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                          placeholder="juan@example.com"
                          className="w-full bg-[#07080c] border border-gray-800 text-white text-sm p-3 rounded-xl outline-none focus:border-[#c5a85c]"
                        />
                        {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#c5a85c] uppercase mb-1">CONTACT NUMBER *</label>
                        <input
                          type="tel"
                          value={candidateForm.phone}
                          onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                          placeholder="+63 9XX XXX XXXX"
                          className="w-full bg-[#07080c] border border-gray-800 text-white text-sm p-3 rounded-xl outline-none focus:border-[#c5a85c]"
                        />
                        {formErrors.phone && <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#c5a85c] uppercase mb-1">ATTACH RESUME (PDF/DOC) *</label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) setResumeFileName(f.name); }}
                        className="hidden"
                      />
                      <div className="flex items-center gap-3 bg-[#07080c] border border-gray-800 rounded-xl p-2.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-[#c5a85c] text-[#06070a] font-extrabold text-xs tracking-wider uppercase px-4 py-2 rounded-lg cursor-pointer"
                        >
                          ⬆ BROWSE
                        </button>
                        <span className="text-xs text-white/70 truncate">{resumeFileName || "No file selected"}</span>
                      </div>
                      {formErrors.resume && <p className="text-red-400 text-xs mt-1">{formErrors.resume}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#c5a85c] uppercase mb-1">CAREER SUMMARY / COVER NOTE</label>
                      <textarea
                        rows={3}
                        value={candidateForm.coverNote}
                        onChange={(e) => setCandidateForm({ ...candidateForm, coverNote: e.target.value })}
                        placeholder="Briefly describe your real estate brokerage or sales background..."
                        className="w-full bg-[#07080c] border border-gray-800 text-white text-sm p-3 rounded-xl outline-none focus:border-[#c5a85c]"
                      />
                    </div>

                      {formErrors.submit && (
                        <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs font-semibold">
                          {formErrors.submit}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#c5a85c] hover:bg-[#b0934c] disabled:opacity-50 text-[#06070a] font-bold text-xs tracking-widest uppercase rounded-xl py-4 transition-all cursor-pointer mt-2"
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
    <div className="bg-transparent min-h-screen text-white py-10 sm:py-16 px-4 sm:px-6 md:px-12" id="careers-section">
      <div className="max-w-7xl mx-auto flex flex-col gap-24">
        
        {/* HERO HEADER SECTION exactly styled like Screenshot 4 */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 flex flex-col items-start gap-6">
            <span className="text-[#c5a85c] text-xs font-semibold tracking-[0.3em] uppercase">JOIN OUR TEAM</span>
            
            <h1 className="text-3xl md:text-5xl font-sans font-light tracking-wide text-white leading-tight uppercase">
              Build Your Legacy <br />
              With <span className="text-[#c5a85c] font-semibold">Alpha Premier</span>
            </h1>

            <p className="text-white/70 text-sm leading-relaxed font-sans font-light max-w-lg">
              We are looking for driven, principled, and ambitious professionals who want to build careers in one of the most dynamic industries in the world. Grow your business, expand your network, and maximize your earnings with the luxury industry leader.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
              <a 
                href="#openings-list"
                className="bg-[#c5a85c] hover:bg-[#b0934c] text-[#06070a] text-xs font-bold tracking-widest uppercase px-6 py-4 rounded-sm text-center transition-all duration-300"
              >
                EXPLORE OPEN ROLES &rarr;
              </a>
              <button
                onClick={() => {
                  const el = document.getElementById('culture-cards');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border border-[#c5a85c]/40 hover:border-[#c5a85c] text-white/90 hover:text-white text-xs font-bold tracking-widest uppercase px-6 py-4 rounded-sm bg-transparent text-center transition-all duration-300"
              >
                LEARN ABOUT US
              </button>
            </div>
          </div>

          {/* Hero Right Image exactly like Screenshot 4 */}
          <div className="lg:col-span-6 relative rounded-sm overflow-hidden border border-gray-900 bg-gray-950">
            <img 
              src="/images/download (22).jpg" 
              alt="Alpha Premier team members collaborating"
              className="w-full h-[380px] object-cover filter brightness-95 contrast-105"
            />
          </div>

        </section>

        {/* 2. OUR CULTURE: WHAT DRIVES US */}
        <section className="flex flex-col gap-12" id="culture-cards">
          <div className="text-center flex flex-col items-center gap-2">
            <span className="text-[#c5a85c] text-xs font-semibold tracking-[0.3em] uppercase">OUR CULTURE</span>
            <h2 className="text-2xl md:text-3xl font-sans font-light tracking-wider text-white">
              What Drives Us
            </h2>
            <div className="flex items-center justify-center gap-3 my-1">
              <div className="h-[1.5px] w-12 sm:w-16 bg-gradient-to-l from-[#c5a85c] to-transparent" />
              <div className="w-2 h-2 rotate-45 bg-[#c5a85c] shadow-[0_0_10px_rgba(197,168,92,0.8)] border border-[#e5cb80]/60 shrink-0" />
              <div className="h-[1.5px] w-12 sm:w-16 bg-gradient-to-r from-[#c5a85c] to-transparent" />
            </div>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 lg:grid lg:grid-cols-4 lg:gap-6 w-full pb-3 lg:pb-0 scrollbar-none [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            
            {/* Excellence */}
            <div className="flex-none w-[75vw] max-w-[280px] sm:w-[260px] lg:w-auto snap-start bg-[#0b0c10] border border-gray-900/60 p-6 flex flex-col gap-3.5 rounded-sm hover:border-gray-800 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm border border-[#c5a85c]/40 flex items-center justify-center bg-[#07080b] text-[#c5a85c] shrink-0">
                  <Star className="w-4 h-4" />
                </div>
                <h3 className="text-white font-sans text-xs font-semibold tracking-widest uppercase group-hover:text-[#c5a85c] transition-colors">
                  EXCELLENCE
                </h3>
              </div>
              <p className="text-white/55 text-xs leading-relaxed font-sans font-light">
                We hold ourselves to the highest standards in every client interaction, every market report, and every transaction we close.
              </p>
            </div>

            {/* Integrity */}
            <div className="flex-none w-[75vw] max-w-[280px] sm:w-[260px] lg:w-auto snap-start bg-[#0b0c10] border border-gray-900/60 p-6 flex flex-col gap-3.5 rounded-sm hover:border-gray-800 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm border border-[#c5a85c]/40 flex items-center justify-center bg-[#07080b] text-[#c5a85c] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-white font-sans text-xs font-semibold tracking-widest uppercase group-hover:text-[#c5a85c] transition-colors">
                  INTEGRITY
                </h3>
              </div>
              <p className="text-white/55 text-xs leading-relaxed font-sans font-light">
                Trust is earned through absolute transparency. We operate with radical honesty, protecting our clients and our brand name.
              </p>
            </div>

            {/* Innovation */}
            <div className="flex-none w-[75vw] max-w-[280px] sm:w-[260px] lg:w-auto snap-start bg-[#0b0c10] border border-gray-900/60 p-6 flex flex-col gap-3.5 rounded-sm hover:border-gray-800 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm border border-[#c5a85c]/40 flex items-center justify-center bg-[#07080b] text-[#c5a85c] shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-white font-sans text-xs font-semibold tracking-widest uppercase group-hover:text-[#c5a85c] transition-colors">
                  INNOVATION
                </h3>
              </div>
              <p className="text-white/55 text-xs leading-relaxed font-sans font-light">
                We invest in predictive modeling tools, premium databases, and high-tech visualization to empower our brokers to outperform.
              </p>
            </div>

            {/* Collaboration */}
            <div className="flex-none w-[75vw] max-w-[280px] sm:w-[260px] lg:w-auto snap-start bg-[#0b0c10] border border-gray-900/60 p-6 flex flex-col gap-3.5 rounded-sm hover:border-gray-800 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm border border-[#c5a85c]/40 flex items-center justify-center bg-[#07080b] text-[#c5a85c] shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-white font-sans text-xs font-semibold tracking-widest uppercase group-hover:text-[#c5a85c] transition-colors">
                  COLLABORATION
                </h3>
              </div>
              <p className="text-white/55 text-xs leading-relaxed font-sans font-light">
                The best outcomes emerge when diverse perspectives unite. We cross-sell, coordinate, and refer business with seamless split models.
              </p>
            </div>

          </div>
        </section>

        {/* 3. LIFE AT ALPHA PREMIER GRID */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[#c5a85c] text-[10px] font-semibold tracking-[0.3em] uppercase">LIFE AT ALPHA PREMIER</span>
            <h2 className="text-xl md:text-2xl font-sans font-light tracking-wide text-white uppercase">Our Vibrant Workspace</h2>
            <div className="flex items-center gap-2.5 my-1">
              <div className="w-2 h-2 rotate-45 bg-[#c5a85c] shadow-[0_0_8px_rgba(197,168,92,0.8)] border border-[#e5cb80]/60 shrink-0" />
              <div className="h-[1.5px] w-20 bg-gradient-to-r from-[#c5a85c] via-[#c5a85c]/50 to-transparent" />
              <div className="w-1 h-1 rounded-full bg-[#c5a85c]/60" />
            </div>
          </div>

          {/* Photo Collage exactly replicating the layout in Screenshot 4 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[550px] w-full">
            
            {/* Left Big Photo */}
            <div className="md:col-span-4 rounded-sm overflow-hidden border border-gray-900 h-full">
              <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80" 
                alt="Broker presenting data" 
                className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Right Quad Photos */}
            <div className="md:col-span-8 grid grid-cols-2 grid-rows-2 gap-4 h-full">
              <div className="rounded-sm overflow-hidden border border-gray-900 h-full">
                <img 
                  src="https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&w=400&q=80" 
                  alt="Team brainstorming session" 
                  className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="rounded-sm overflow-hidden border border-gray-900 h-full">
                <img 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80" 
                  alt="Success hands together high-five" 
                  className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="rounded-sm overflow-hidden border border-gray-900 h-full">
                <img 
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80" 
                  alt="Board room board collaboration" 
                  className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="rounded-sm overflow-hidden border border-gray-900 h-full">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80" 
                  alt="Office presentation" 
                  className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

          </div>
        </section>

        {/* 4. WHY ALPHA PREMIER: WHAT YOU WILL GAIN */}
        <section className="flex flex-col gap-12">
          <div className="text-center flex flex-col items-center gap-2">
            <span className="text-[#c5a85c] text-xs font-semibold tracking-[0.3em] uppercase">WHY ALPHA PREMIER</span>
            <h2 className="text-2xl md:text-3xl font-sans font-light tracking-wider text-white">
              What You Will Gain
            </h2>
            <div className="flex items-center justify-center gap-3 my-1">
              <div className="h-[1.5px] w-12 sm:w-16 bg-gradient-to-l from-[#c5a85c] to-transparent" />
              <div className="w-2 h-2 rotate-45 bg-[#c5a85c] shadow-[0_0_10px_rgba(197,168,92,0.8)] border border-[#e5cb80]/60 shrink-0" />
              <div className="h-[1.5px] w-12 sm:w-16 bg-gradient-to-r from-[#c5a85c] to-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Gain 1 */}
            <div className="bg-[#0b0c10] border border-gray-900/60 p-6 sm:p-7 rounded-sm flex flex-col gap-3.5 hover:border-[#c5a85c]/30 transition-all group">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full border border-[#c5a85c]/30 flex items-center justify-center bg-[#07080b] text-[#c5a85c] group-hover:border-[#c5a85c] transition-colors shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-white font-sans text-xs font-semibold tracking-widest uppercase group-hover:text-[#c5a85c] transition-colors leading-snug">
                  LIMITLESS EARNING POTENTIAL
                </h4>
              </div>
              <p className="text-white/50 text-xs leading-relaxed font-sans font-light">
                Performance-based commissions with no cap. Our top brokers earn seven figures annually through exclusive luxury developments and corporate commercial portfolios.
              </p>
            </div>

            {/* Gain 2 */}
            <div className="bg-[#0b0c10] border border-gray-900/60 p-6 sm:p-7 rounded-sm flex flex-col gap-3.5 hover:border-[#c5a85c]/30 transition-all group">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full border border-[#c5a85c]/30 flex items-center justify-center bg-[#07080b] text-[#c5a85c] group-hover:border-[#c5a85c] transition-colors shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h4 className="text-white font-sans text-xs font-semibold tracking-widest uppercase group-hover:text-[#c5a85c] transition-colors leading-snug">
                  WORLD-CLASS TRAINING
                </h4>
              </div>
              <p className="text-white/50 text-xs leading-relaxed font-sans font-light">
                Structured onboarding, weekly legal training updates, quarterly masterclasses, and direct executive mentorship to turn potentials into leading luxury advisors.
              </p>
            </div>

            {/* Gain 3 */}
            <div className="bg-[#0b0c10] border border-gray-900/60 p-6 sm:p-7 rounded-sm flex flex-col gap-3.5 hover:border-[#c5a85c]/30 transition-all group">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full border border-[#c5a85c]/30 flex items-center justify-center bg-[#07080b] text-[#c5a85c] group-hover:border-[#c5a85c] transition-colors shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <h4 className="text-white font-sans text-xs font-semibold tracking-widest uppercase group-hover:text-[#c5a85c] transition-colors leading-snug">
                  NATIONWIDE NETWORK
                </h4>
              </div>
              <p className="text-white/50 text-xs leading-relaxed font-sans font-light">
                Leverage our 18 offices, 320+ colleagues, and a robust cross-city client referral system to quickly expand your pipeline and build lasting client portfolios.
              </p>
            </div>

          </div>
        </section>

        {/* 5. TEAM FEEDBACK & REVIEWS (COMPACT CAROUSEL WITH ARROWS & ADD FEEDBACK) */}
        <section className="max-w-4xl mx-auto w-full bg-[#0a0b0f] border border-gray-900 rounded-lg p-5 sm:p-7 relative shadow-xl flex flex-col gap-5">
          {/* Header row: Title + Add Feedback button */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-900/80 pb-3.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#c5a85c]" />
              <span className="text-[#c5a85c] text-xs font-semibold tracking-[0.2em] uppercase font-sans">
                TEAM FEEDBACK & REVIEWS
              </span>
            </div>

            <button
              onClick={() => setShowFeedbackModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-[#c5a85c]/10 hover:bg-[#c5a85c] text-[#c5a85c] hover:text-[#06070a] border border-[#c5a85c]/30 text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Feedback
            </button>
          </div>

          {/* Feedback Content with Left & Right Navigation Arrows */}
          <div className="flex items-center gap-2 sm:gap-4 my-1">
            {/* Left Arrow */}
            <button
              onClick={handlePrevQuote}
              aria-label="Previous feedback"
              className="p-2 sm:p-2.5 rounded-full border border-gray-800 hover:border-[#c5a85c] bg-[#11131a] text-white/70 hover:text-[#c5a85c] transition-all cursor-pointer hover:scale-110 shrink-0"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Center Quote Display Card */}
            <div className="flex-1 flex flex-col items-center text-center px-2 sm:px-6 py-2 min-h-[140px] justify-center">
              <span className="text-[#c5a85c] text-2xl font-serif leading-none opacity-40 select-none mb-1">“</span>
              <p className="text-white/85 font-sans font-light italic text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl">
                {quotes[activeQuoteIdx]?.text}
              </p>

              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#181a24] border border-[#c5a85c]/40 flex items-center justify-center text-[#c5a85c] text-xs font-bold uppercase shrink-0">
                  {quotes[activeQuoteIdx]?.author.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-[#c5a85c] font-sans text-xs font-semibold tracking-wider uppercase">
                    {quotes[activeQuoteIdx]?.author}
                  </p>
                  <p className="text-white/40 text-[10px] uppercase font-mono">
                    {quotes[activeQuoteIdx]?.role} &bull; {quotes[activeQuoteIdx]?.tenure}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={handleNextQuote}
              aria-label="Next feedback"
              className="p-2 sm:p-2.5 rounded-full border border-gray-800 hover:border-[#c5a85c] bg-[#11131a] text-white/70 hover:text-[#c5a85c] transition-all cursor-pointer hover:scale-110 shrink-0"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-1">
            {quotes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveQuoteIdx(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                  activeQuoteIdx === idx ? 'bg-[#c5a85c] shadow-[0_0_8px_rgba(197,168,92,0.8)] scale-110' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </section>

        {/* 6. CURRENT OPENINGS SECTION */}
        <section className="flex flex-col gap-8 scroll-mt-24" id="openings-list">
          <div className="text-left flex flex-col items-start gap-1.5">
            <span className="text-[#c5a85c] text-xs font-semibold tracking-[0.3em] uppercase">JOIN THE TEAM</span>
            <h2 className="text-2xl md:text-3xl font-sans font-light tracking-wide text-white uppercase">
              Current Openings
            </h2>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rotate-45 bg-[#c5a85c] shadow-[0_0_8px_rgba(197,168,92,0.8)] border border-[#e5cb80]/60 shrink-0" />
              <div className="h-[1.5px] w-20 bg-gradient-to-r from-[#c5a85c] via-[#c5a85c]/50 to-transparent" />
              <div className="w-1 h-1 rounded-full bg-[#c5a85c]/60" />
            </div>
          </div>

          {/* Search/Filter Roles Bar exactly as Image */}
          <div className="bg-[#0b0c10] border border-gray-900 p-4 rounded-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-3 flex items-center text-white/30">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search roles or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#07080c] border border-gray-800 text-white text-xs pl-10 pr-4 py-3 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans"
              />
            </div>
            <button
              className="bg-[#c5a85c] hover:bg-[#b0934c] text-[#06070a] text-xs font-bold tracking-widest px-8 py-3 rounded-sm uppercase transition-colors"
            >
              SEARCH
            </button>
          </div>

          {/* Job Listings List matches layout */}
          <div className="flex flex-col gap-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div 
                  key={job.id}
                  className="bg-[#0b0c10] border border-gray-900/60 p-5 md:p-6 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-800 transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-white font-sans text-sm md:text-base font-semibold tracking-wide">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-white/45 text-[11px] font-mono">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#c5a85c]" />
                        {job.location}
                      </span>
                      <span>&bull;</span>
                      <span className="bg-[#12141c] text-[#c5a85c] px-2 py-0.5 rounded-sm border border-gray-800">
                        {job.type}
                      </span>
                      <span>&bull;</span>
                      <span>{job.department}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="text-white/60 hover:text-white text-xs font-semibold underline"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleOpenApplyModal(job)}
                      className="bg-[#12141c] hover:bg-[#1c1f2b] text-[#c5a85c] text-xs font-semibold tracking-wider px-5 py-2.5 rounded-sm uppercase border border-[#c5a85c]/20 hover:border-[#c5a85c]/50 transition-all"
                    >
                      APPLY NOW &rarr;
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-dashed border-gray-800 p-12 text-center text-white/40 font-sans">
                No job openings matched your search.
              </div>
            )}
          </div>

          {/* OPEN APPLICATION SUBMIT RESUME box exactly like Screenshot 4 */}
          <div className="bg-[#0b0c10] border border-gray-900/60 p-8 rounded-sm text-center flex flex-col items-center gap-4 mt-6">
            <span className="text-[#c5a85c] text-xs font-semibold tracking-[0.2em] uppercase font-mono">OPEN APPLICATION</span>
            <h3 className="text-white font-sans text-lg font-light tracking-wide uppercase">
              Don't See the Right Fit?
            </h3>
            <p className="text-white/50 text-xs leading-relaxed font-sans max-w-md">
              We are always looking for exceptional people. Send us your resume and we will reach out when the right opportunity emerges.
            </p>
            <button
              onClick={() => handleOpenApplyModal(null)}
              id="submit-resume-btn"
              className="mt-2 border border-[#c5a85c] hover:bg-[#c5a85c] hover:text-[#06070a] text-[#c5a85c] text-xs font-bold tracking-widest px-8 py-3.5 rounded-sm uppercase bg-transparent transition-all duration-300"
            >
              &uarr; SUBMIT RESUME
            </button>
          </div>

        </section>

      </div>

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b0c10] border border-gray-800 rounded-sm max-w-2xl w-full max-h-[85vh] overflow-y-auto relative p-6 md:p-8 flex flex-col gap-6">
            
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col gap-2 mt-4 border-b border-gray-900 pb-4">
              <h2 className="text-xl md:text-2xl font-sans font-semibold tracking-wide text-white">
                {selectedJob.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-white/50 text-xs font-mono">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#c5a85c]" />
                  {selectedJob.location}
                </span>
                <span>&bull;</span>
                <span>{selectedJob.type}</span>
                <span>&bull;</span>
                <span>{selectedJob.department}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-sm text-white/80">
              <h4 className="text-[#c5a85c] font-sans text-xs font-bold tracking-wider uppercase">ROLE DESCRIPTION</h4>
              <p className="leading-relaxed font-light">{selectedJob.description}</p>
            </div>

            <div className="flex flex-col gap-3 text-sm text-white/80">
              <h4 className="text-[#c5a85c] font-sans text-xs font-bold tracking-wider uppercase">ROLE REQUIREMENTS</h4>
              <ul className="list-disc pl-5 space-y-2 leading-relaxed font-light">
                {selectedJob.requirements.map((req, i) => <li key={i}>{req}</li>)}
              </ul>
            </div>

            <div className="border-t border-gray-900 pt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedJob(null)}
                className="border border-gray-800 hover:border-white/20 text-white/70 px-6 py-2.5 rounded-sm text-xs font-medium uppercase"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const job = selectedJob;
                  setSelectedJob(null);
                  handleOpenApplyModal(job);
                }}
                className="bg-[#c5a85c] hover:bg-[#b0934c] text-[#06070a] px-8 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider"
              >
                APPLY FOR ROLE &rarr;
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SUBMIT APPLICATION MODAL (FORM) */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b0c10] border border-gray-800 rounded-sm max-w-md w-full relative p-6 md:p-8 flex flex-col gap-5">
            
            <button
              onClick={() => { setShowApplyModal(false); setJobToApply(null); }}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center border-b border-gray-900 pb-3">
              <h3 className="text-[#c5a85c] text-sm font-bold tracking-widest uppercase mb-1">
                {jobToApply ? 'JOB APPLICATION' : 'OPEN RESUME SUBMISSION'}
              </h3>
              <p className="text-white text-xs font-semibold font-sans">
                {jobToApply ? jobToApply.title : 'Alpha Premier General Talent Pool'}
              </p>
            </div>

            <form onSubmit={handleApplySubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">Full Name</label>
                <input required type="text" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">Email Address</label>
                <input required type="email" value={applicantEmail} onChange={(e) => setApplicantEmail(e.target.value)} className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans" placeholder="jane@example.com" />
              </div>
              <div>
                <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">Phone Number</label>
                <input required type="tel" value={applicantPhone} onChange={(e) => setApplicantPhone(e.target.value)} className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans" placeholder="+63 918 111 2222" />
              </div>
              <div>
                <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">Short Cover Note / Introduction</label>
                <textarea required rows={3} value={applicantCoverLetter} onChange={(e) => setApplicantCoverLetter(e.target.value)} className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] resize-none font-sans" placeholder="Why would you be an excellent addition to Alpha Premier?" />
              </div>

              {/* Mock Resume Upload Button */}
              <div className="border border-dashed border-gray-800 p-4 rounded-sm text-center flex flex-col items-center justify-center gap-1.5 bg-[#07080c] cursor-pointer">
                <FileText className="w-5 h-5 text-[#c5a85c]" />
                <span className="text-[10px] tracking-wider text-white/60 uppercase">Resume_Jane_Doe_CV.pdf (245 KB)</span>
                <span className="text-[8px] text-emerald-500 font-mono">FILE ATTACHED SUCCESSFULLY</span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#c5a85c] hover:bg-[#b0934c] text-[#06070a] text-xs font-bold tracking-widest uppercase py-4 mt-2 rounded-sm transition-colors"
              >
                SUBMIT APPLICATION
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ADD FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b0c10] border border-gray-800 rounded-sm max-w-md w-full relative p-6 md:p-8 flex flex-col gap-5">
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center border-b border-gray-900 pb-3">
              <h3 className="text-[#c5a85c] text-xs font-bold tracking-widest uppercase mb-1">
                SHARE YOUR FEEDBACK
              </h3>
              <p className="text-white/70 text-xs font-sans">
                Tell us about your experience working with Alpha Premier
              </p>
            </div>

            {feedbackSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                <p className="text-white text-sm font-semibold font-sans">Feedback Submitted!</p>
                <p className="text-white/50 text-xs font-sans">Thank you for sharing your experience.</p>
              </div>
            ) : (
              <form onSubmit={handleAddFeedbackSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">Your Name *</label>
                  <input
                    required
                    type="text"
                    value={feedbackAuthor}
                    onChange={(e) => setFeedbackAuthor(e.target.value)}
                    className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans"
                    placeholder="e.g. Alex Rivera"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">Role / Position</label>
                  <input
                    type="text"
                    value={feedbackRole}
                    onChange={(e) => setFeedbackRole(e.target.value)}
                    className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans"
                    placeholder="e.g. Luxury Property Advisor"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">Years with Firm</label>
                  <input
                    type="text"
                    value={feedbackTenure}
                    onChange={(e) => setFeedbackTenure(e.target.value)}
                    className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans"
                    placeholder="e.g. 2 Years"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1">Your Feedback / Review *</label>
                  <textarea
                    required
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] resize-none font-sans"
                    placeholder="Share your thoughts about working with Alpha Premier..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#c5a85c] hover:bg-[#b0934c] text-[#06070a] text-xs font-bold tracking-widest uppercase py-3.5 mt-2 rounded-sm transition-colors cursor-pointer"
                >
                  SUBMIT FEEDBACK
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
