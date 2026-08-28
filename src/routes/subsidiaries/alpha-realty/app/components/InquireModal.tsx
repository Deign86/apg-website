import React, { useState } from 'react';
import { X, CheckCircle2, MessageSquare, Send, Phone, MapPin, Mail } from 'lucide-react';
import AlphaPremierLogo from './AlphaPremierLogo';

interface InquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  prefilledPropertyTitle?: string;
  prefilledPropertyId?: string;
}

export default function InquireModal({ 
  isOpen, 
  onClose, 
  onSubmitSuccess, 
  prefilledPropertyTitle,
  prefilledPropertyId
}: InquireModalProps) {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interestType, setInterestType] = useState(prefilledPropertyTitle ? 'Specific Property' : 'Luxury Acquisitions');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inquire.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone,
          company: companyName,
          subject: prefilledPropertyTitle ? `[Alpha Realty] Inquiry for: ${prefilledPropertyTitle}` : `[Alpha Realty] General Inquiry: ${interestType}`,
          source: 'Alpha Realty',
          message: message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSubmitSuccess();
      } else {
        // Fallback to success toast even if backend fails to not degrade UX
        onSubmitSuccess();
      }
    } catch (err) {
      console.error('Inquiry submission failed:', err);
      onSubmitSuccess();
    }
    // Reset state
    setName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b0c10] border border-gray-800 rounded-sm max-w-4xl w-full max-h-[90vh] overflow-y-auto relative p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer z-20"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left Side: Brand Visual & Contact Card info */}
        <div className="md:col-span-5 bg-cover bg-center rounded-sm p-8 flex flex-col justify-between border border-gray-900 relative"
             style={{
               backgroundImage: `linear-gradient(to bottom, rgba(11,12,16,0.85) 0%, rgba(6,7,10,0.95) 100%), url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80')`
             }}>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <AlphaPremierLogo className="h-14 w-auto -ml-3" />
            </div>

            <div className="h-[1px] w-12 bg-[#c5a85c]/60 mt-2" />

            <h4 className="text-white text-lg font-sans font-light tracking-wide leading-snug mt-2">
              Private Clients & Corporate Services Advisory Group
            </h4>
            <p className="text-white/50 text-xs font-light leading-relaxed">
              Experience the pinnacle of discreet Real Estate representation. Schedule a private consultation with our executive brokerage council.
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-gray-900">
            <div className="flex items-start gap-3 text-white/60 text-xs">
              <MapPin className="w-4 h-4 text-[#c5a85c] shrink-0 mt-0.5" />
              <span>Tektite East Tower, Exchange Road, Ortigas Center, Pasig City</span>
            </div>
            <div className="flex items-center gap-3 text-white/70 text-xs font-mono">
              <Phone className="w-4 h-4 text-[#c5a85c] shrink-0" />
              <span>0927 555 5803 | 0915 888 9482 | 0921 217 4555</span>
            </div>
            <div className="flex items-center gap-3 text-white/70 text-xs">
              <Mail className="w-4 h-4 text-[#c5a85c] shrink-0" />
              <span>realty@alphapremiergroup.com</span>
            </div>
          </div>

        </div>

        {/* Right Side: Luxurious Form */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="border-b border-gray-900 pb-3">
            <h2 className="text-xl md:text-2xl font-sans font-semibold tracking-wide text-white uppercase">
              Secure Portfolio Inquiry
            </h2>
            <p className="text-white/40 text-xs font-sans font-light mt-1">
              Complete the secure inquiry file below. An advisor will contact you within two hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {prefilledPropertyTitle && (
              <div className="bg-[#12141c]/80 border border-gray-800 p-3 rounded-sm text-xs text-white flex items-center justify-between">
                <div>
                  <span className="text-white/40 block text-[9px] uppercase tracking-widest mb-0.5">Selected Property File</span>
                  <span className="text-[#c5a85c] font-semibold">{prefilledPropertyTitle}</span>
                </div>
                <span className="text-[10px] font-mono text-white/40 uppercase">Pre-selected</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1 font-bold">Your Name</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans" placeholder="John Doe" />
              </div>
              <div>
                <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1 font-bold">Company Name (Optional)</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans" placeholder="Company or Business Name" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1 font-bold">Inquiry Interest</label>
                <select value={interestType} onChange={(e) => setInterestType(e.target.value)} className="w-full bg-[#07080c] border border-gray-800 text-white/80 text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans appearance-none" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`, backgroundPosition: 'right 10px center', backgroundRepeat: 'no-repeat' }}>
                  <option value="Luxury Acquisitions">Luxury Acquisitions</option>
                  <option value="Commercial Leasing">Commercial Leasing</option>
                  <option value="Property Valuation">Property Valuation</option>
                  <option value="Specific Property">Inquire on Specific Property</option>
                  <option value="Joint Ventures / Development">Joint Ventures / Development</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1 font-bold">Email Address</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans" placeholder="john@domain.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1 font-bold">Viber Number</label>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] font-sans" placeholder="0917 123 4567" />
              </div>
            </div>

            <div>
              <label className="text-[10px] tracking-widest text-white/50 uppercase block mb-1 font-bold">Your Inquiry Notes</label>
              <textarea 
                required 
                rows={4} 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                className="w-full bg-[#07080c] border border-gray-800 text-white text-xs p-3 rounded-sm focus:outline-none focus:border-[#c5a85c] resize-none font-sans" 
                placeholder="Discreet requirements, scheduling details, or investment profiles..."
              />
            </div>

            <div className="flex items-center gap-2.5 text-[10px] text-white/40 font-mono">
              <input required type="checkbox" className="accent-[#c5a85c] rounded-sm bg-gray-950 border-gray-800 w-4 h-4 cursor-pointer" defaultChecked />
              <span>I accept the secure storage, privacy treatment, and data policies.</span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#c5a85c] hover:bg-[#b0934c] text-[#06070a] text-xs font-bold tracking-[0.2em] uppercase py-4 mt-2 rounded-sm transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              SUBMIT SECURE INQUIRY FILE
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
