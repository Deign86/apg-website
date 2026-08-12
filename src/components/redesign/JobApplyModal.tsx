import React, { useState } from 'react';
import { JobPosition } from '../../types';
import { X, Briefcase, MapPin, CheckCircle2, Upload, Send, FileText } from 'lucide-react';

interface JobApplyModalProps {
  job: JobPosition | null;
  isOpen: boolean;
  onClose: () => void;
}

export const JobApplyModal: React.FC<JobApplyModalProps> = ({ job, isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleFileSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <div className="bg-[#0B0D12] border border-[#D4AF37] w-full max-w-2xl text-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden max-h-[90vh] flex flex-col rounded-2xl">
        
        {/* Header */}
        <div className="bg-black px-6 py-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-black tracking-[0.25em] text-[#D4AF37] uppercase block">
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
            <div className="bg-black p-4 border border-neutral-800 space-y-3 rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                <span className="text-xs font-bold text-[#D4AF37] uppercase">{job.division}</span>
                <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#D4AF37]" />{job.location}</span>
                  <span className="bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 font-bold text-[10px] rounded">{job.type}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-neutral-300 mb-1">Key Responsibilities:</h4>
                <ul className="list-disc list-inside text-xs text-neutral-400 space-y-1">
                  {job.responsibilities.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-neutral-300 mb-1">Requirements:</h4>
                <ul className="list-disc list-inside text-xs text-neutral-400 space-y-1">
                  {job.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center mx-auto rounded-full">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold tracking-wide text-white uppercase">
                Application Received
              </h3>
              <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-[#D4AF37]">{fullName}</strong>. Our corporate HR acquisition team will review your resume for the <strong className="text-[#D4AF37]">{job ? job.title : 'General Position'}</strong> role and reach out if your credentials align.
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-[#D4AF37] text-neutral-950 font-extrabold text-xs tracking-widest uppercase hover:bg-[#FFF3D1] transition-all rounded-lg"
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
                    className="w-full bg-black border border-neutral-800 focus:border-[#D4AF37] p-2.5 text-white outline-none rounded-lg"
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
                    className="w-full bg-black border border-neutral-800 focus:border-[#D4AF37] p-2.5 text-white outline-none rounded-lg"
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
                  className="w-full bg-black border border-neutral-800 focus:border-[#D4AF37] p-2.5 text-white outline-none rounded-lg"
                />
              </div>

              {/* Upload Resume or Summary */}
              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                  Resume / Curriculum Vitae *
                </label>
                <div className="bg-black border border-dashed border-neutral-800 p-4 text-center rounded-lg">
                  <input
                    type="file"
                    id="resume-file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSimulate}
                    className="hidden"
                  />
                  <label htmlFor="resume-file" className="cursor-pointer flex flex-col items-center gap-1.5 text-neutral-400 hover:text-[#D4AF37]">
                    <Upload className="w-5 h-5 text-[#D4AF37]" />
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
                  className="w-full bg-black border border-neutral-800 focus:border-[#D4AF37] p-2.5 text-white outline-none rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#D4AF37] hover:bg-[#FFF3D1] text-neutral-950 font-extrabold text-xs tracking-widest uppercase flex items-center gap-2 transition-all rounded-lg"
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
