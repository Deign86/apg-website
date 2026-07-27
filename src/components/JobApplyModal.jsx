import React, { useState } from 'react';
import { X, MapPin, CheckCircle2, Upload, Send } from 'lucide-react';

export const JobApplyModal = ({ job, isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: email,
          subject: job ? `Career Application: ${job.title}` : 'Career Application: General',
          message: `Phone: ${phone}\nResume File: ${fileName || 'None uploaded'}\n\nCover Note:\n${resumeText}`,
        }),
      });
    } catch (err) {
      console.error('Job Application API Error:', err);
    }
    setSubmitted(true);
  };

  const handleFileSimulate = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0E121B] border border-[#E2B857] w-full max-w-2xl text-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#151A26] px-6 py-4 border-b border-[#2A303F] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-black tracking-[0.25em] text-[#E2B857] uppercase block">
              ALPHA PREMIER GROUP CAREERS
            </span>
            <h2 className="text-sm sm:text-base font-bold tracking-wider text-white uppercase">
              {job ? `Apply: ${job.title}` : 'General Application'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {job && (
            <div className="bg-[#151A26] p-4 border border-[#2B3142] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2B3142] pb-2">
                <span className="text-xs font-bold text-[#E2B857] uppercase">{job.division || job.department || 'Corporate'}</span>
                <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#E2B857]" />{job.location || 'Pasig City'}</span>
                  <span className="bg-[#E2B857]/20 text-[#E2B857] px-2 py-0.5 font-bold text-[10px]">{job.type || 'FULL-TIME'}</span>
                </div>
              </div>

              {job.responsibilities && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-neutral-300 mb-1">Key Responsibilities:</h4>
                  <ul className="list-disc list-inside text-xs text-neutral-400 space-y-1">
                    {job.responsibilities.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.requirements && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-neutral-300 mb-1">Requirements:</h4>
                  <ul className="list-disc list-inside text-xs text-neutral-400 space-y-1">
                    {job.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-[#E2B857]/20 border border-[#E2B857] text-[#E2B857] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold tracking-wide text-white uppercase">
                Application Received
              </h3>
              <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-[#E2B857]">{fullName}</strong>. Our corporate HR acquisition team will review your resume for the <strong className="text-[#E2B857]">{job ? job.title : 'General Position'}</strong> role and reach out if your credentials align.
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-[#E2B857] text-neutral-950 font-extrabold text-xs tracking-widest uppercase hover:bg-[#cfa543]"
              >
                CLOSE
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full bg-[#151A26] border border-[#2B3142] focus:border-[#E2B857] p-2.5 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maria@example.com"
                    className="w-full bg-[#151A26] border border-[#2B3142] focus:border-[#E2B857] p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(+63) 918 555 1234"
                  className="w-full bg-[#151A26] border border-[#2B3142] focus:border-[#E2B857] p-2.5 text-white outline-none"
                />
              </div>

              {/* Upload Resume or Summary */}
              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                  Resume / Curriculum Vitae *
                </label>
                <div className="bg-[#151A26] border border-dashed border-[#3A4257] p-4 text-center">
                  <input
                    type="file"
                    id="resume-file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSimulate}
                    className="hidden"
                  />
                  <label htmlFor="resume-file" className="cursor-pointer flex flex-col items-center gap-1.5 text-neutral-400 hover:text-[#E2B857]">
                    <Upload className="w-5 h-5 text-[#E2B857]" />
                    <span className="text-xs font-semibold">
                      {fileName ? `Selected: ${fileName}` : 'Click to Upload PDF / Word Resume'}
                    </span>
                    <span className="text-[10px] text-neutral-500">Max size 10MB</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                  Career Summary / Cover Note
                </label>
                <textarea
                  rows={3}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Introduce yourself, key achievements, and availability..."
                  className="w-full bg-[#151A26] border border-[#2B3142] focus:border-[#E2B857] p-2.5 text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#E2B857] hover:bg-[#cfa543] text-neutral-950 font-extrabold text-xs tracking-widest uppercase flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  SUBMIT APPLICATION
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
