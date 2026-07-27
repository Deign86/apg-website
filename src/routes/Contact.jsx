import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabase';
import { MapPin, Phone, Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import AOS from 'aos';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [ticket, setTicket] = useState('');
  const [siteInfo, setSiteInfo] = useState({ 
    phone: '+63 (2) 1234 5678', 
    email: 'alphapremierrealty@gmail.com', 
    address: 'Ortigas Center, Pasig City, Philippines' 
  });

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    supabase.from('site_settings').select('key,value').in('key', ['company_phone','company_email','company_address'])
      .then(({ data }) => {
        if (data?.length) {
          const map = {};
          data.forEach(s => { map[s.key] = s.value; });
          setSiteInfo(prev => ({
            phone: map.company_phone || prev.phone,
            email: map.company_email || prev.email,
            address: map.company_address || prev.address,
          }));
        }
      })
      .catch(() => { /* use fallback */ });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setTicket(data.ticket || '');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Helmet><title>Contact Us | Alpha Premier</title></Helmet>
      
      <div className="bg-black text-neutral-100 font-sans min-h-screen pb-20 pt-24">
        
        {/* Header Banner */}
        <section className="bg-[#08080A] border-b border-[#1C1C22] py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-3 relative z-10">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#E2B857] uppercase font-display">
              GET IN TOUCH
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase font-display">
              Contact Advisory Board
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Connect with our corporate office or specific business divisions. Submit a secure message below for immediate routing.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch" data-aos="fade-up">
          
          {/* Left Side: Contact Information */}
          <div className="lg:col-span-5 bg-[#10141E] border border-[#232938] p-8 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div>
                <span className="text-[9px] font-bold text-[#E2B857] tracking-widest uppercase block mb-1 font-display">
                  Corporate HQ
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white uppercase font-display">
                  Alpha Premier Group
                </h3>
              </div>

              <div className="h-[1px] bg-neutral-800 w-16" />

              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                Our executive board coordinates communications for all 7 subsidiaries from our Ortigas Business Center headquarters.
              </p>
            </div>

            <div className="space-y-5 pt-4 border-t border-neutral-900">
              
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#E2B857]/15 border border-[#E2B857]/45 rounded-lg shrink-0">
                  <MapPin className="w-5 h-5 text-[#E2B857]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider mb-0.5">Corporate Address</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed font-normal">{siteInfo.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#E2B857]/15 border border-[#E2B857]/45 rounded-lg shrink-0">
                  <Phone className="w-5 h-5 text-[#E2B857]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-[#c5a059] uppercase tracking-wider mb-0.5">Telephone & Mobile</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed font-mono">{siteInfo.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#E2B857]/15 border border-[#E2B857]/45 rounded-lg shrink-0">
                  <Mail className="w-5 h-5 text-[#E2B857]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider mb-0.5">Corporate Email</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed font-normal">{siteInfo.email}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="lg:col-span-7 bg-[#10141E] border border-[#232938] p-8">
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              
              <div>
                <h3 className="text-base font-bold text-white uppercase font-display">Secure Messaging Terminal</h3>
                <p className="text-neutral-500 text-[10px] mt-0.5">All transmissions are routed and logged under security guidelines.</p>
              </div>

              {status === 'success' && (
                <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold uppercase tracking-wider text-xs">Message Dispatched</h5>
                    <p className="text-[11px] text-neutral-300 mt-0.5">Your communication has been processed. Reference ticket: <strong className="font-mono text-[#E2B857]">{ticket}</strong></p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="bg-rose-500/10 border border-rose-500 text-rose-400 p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold uppercase tracking-wider text-xs">Transmission Failure</h5>
                    <p className="text-[11px] text-neutral-300 mt-0.5">Unable to connect to the messaging server. Please email us directly.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    disabled={status === 'sending'}
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Juan dela Cruz"
                    className="w-full bg-[#151A26] border border-[#2B3142] focus:border-[#E2B857] p-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={status === 'sending'}
                    value={form.email}
                    onChange={handleChange}
                    placeholder="juan@company.com"
                    className="w-full bg-[#151A26] border border-[#2B3142] focus:border-[#E2B857] p-3 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                  Subject Line *
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  disabled={status === 'sending'}
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Inquiry Topic or Partnership Option"
                  className="w-full bg-[#151A26] border border-[#2B3142] focus:border-[#E2B857] p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                  Message / Details *
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  disabled={status === 'sending'}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Describe your corporate request, virtual office needs, or construction query..."
                  className="w-full bg-[#151A26] border border-[#2B3142] focus:border-[#E2B857] p-3 text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="px-6 py-3 bg-[#E2B857] hover:bg-[#cfa543] text-neutral-950 font-extrabold text-xs tracking-widest uppercase flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {status === 'sending' ? 'TRANSMITTING...' : 'SEND MESSAGE'}
                </button>
              </div>

            </form>
          </div>

        </section>

      </div>
    </>
  );
}
