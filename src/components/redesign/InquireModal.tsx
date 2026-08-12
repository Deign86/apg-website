import React, { useState } from 'react';
import { InquireFormData } from '../../types';
import { ENTERPRISES } from '../../data/companyData';
import { X, CheckCircle2, Calendar, Mail, Phone, User, Building, Send } from 'lucide-react';

interface InquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEnterprise?: string;
  defaultInquiryType?: 'property' | 'virtual-office' | 'partnership' | 'career' | 'general';
}

export const InquireModal: React.FC<InquireModalProps> = ({
  isOpen,
  onClose,
  defaultEnterprise,
  defaultInquiryType = 'general',
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<InquireFormData>({
    fullName: '',
    email: '',
    phone: '',
    enterprise: defaultEnterprise || 'Alpha Premier Realty',
    inquiryType: defaultInquiryType,
    message: '',
    preferredDate: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0B0D12] border border-[#D4AF37] w-full max-w-2xl text-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden rounded-2xl">
        
        {/* Modal Header */}
        <div className="bg-black px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black tracking-[0.25em] text-[#D4AF37] uppercase block">
              ALPHA PREMIER GROUP
            </span>
            <h2 className="text-base font-bold tracking-wider text-white uppercase">
              INQUIRE & SCHEDULE CONSULTATION
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center mx-auto rounded-full">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold tracking-wide text-white uppercase">
              Inquiry Submitted Successfully
            </h3>
            <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-[#D4AF37]">{formData.fullName}</strong>. An executive representative from <span className="text-[#D4AF37]">{formData.enterprise}</span> will review your inquiry and reach out via email or phone within 24 hours.
            </p>
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-[#D4AF37] text-neutral-950 font-extrabold text-xs tracking-widest uppercase hover:bg-[#FFF3D1] transition-all rounded-lg"
              >
                RETURN TO WEBSITE
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Juan dela Cruz"
                    className="w-full bg-black border border-neutral-800 focus:border-[#D4AF37] pl-9 pr-3 py-2 text-white outline-none rounded-lg"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="juan@company.com"
                    className="w-full bg-black border border-neutral-800 focus:border-[#D4AF37] pl-9 pr-3 py-2 text-white outline-none rounded-lg"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(+63) 917 123 4567"
                    className="w-full bg-black border border-neutral-800 focus:border-[#D4AF37] pl-9 pr-3 py-2 text-white outline-none rounded-lg"
                  />
                </div>
              </div>

              {/* Enterprise of Interest */}
              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                  Enterprise Division *
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                  <select
                    value={formData.enterprise}
                    onChange={(e) => setFormData({ ...formData, enterprise: e.target.value })}
                    className="w-full bg-black border border-neutral-800 focus:border-[#D4AF37] pl-9 pr-3 py-2 text-white outline-none appearance-none rounded-lg"
                  >
                    {ENTERPRISES.map((ent) => (
                      <option key={ent.id} value={ent.name} className="bg-[#0B0D12]">
                        {ent.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Inquiry Type & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                  Inquiry Type
                </label>
                <select
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value as any })}
                  className="w-full bg-black border border-neutral-800 focus:border-[#D4AF37] px-3 py-2 text-white outline-none rounded-lg"
                >
                  <option value="property">Property Acquisition & Leasing</option>
                  <option value="virtual-office">Virtual Office & Ortigas Address</option>
                  <option value="partnership">Corporate Partnership / Joint Venture</option>
                  <option value="career">Career / Job Inquiry</option>
                  <option value="general">General Corporate Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                  Preferred Consultation Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full bg-black border border-neutral-800 focus:border-[#D4AF37] pl-9 pr-3 py-2 text-white outline-none rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                Inquiry Details & Message *
              </label>
              <textarea
                required
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Briefly describe your requirements (e.g. required office floor area, timeline, business setup)..."
                className="w-full bg-black border border-neutral-800 focus:border-[#D4AF37] p-3 text-white outline-none rounded-lg"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-neutral-500">
                12F One Corporate Centre, Ortigas Center, Pasig City
              </span>
              <button
                type="submit"
                className="px-6 py-3 bg-[#D4AF37] hover:bg-[#FFF3D1] text-neutral-950 font-extrabold text-xs tracking-widest uppercase flex items-center gap-2 transition-all shadow-md rounded-lg"
              >
                <Send className="w-4 h-4" />
                SUBMIT INQUIRY
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
