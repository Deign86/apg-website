import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';

const STORAGE_KEY = 'apg-co…sent';

export default function CookieConsent() {
  const [visible, setVisible] = useState<boolean | null>(null);

  React.useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) === null);
  }, []);

  const decide = (choice: 'accepted' | 'declined') => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: Date.now() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md z-[60] rounded-2xl border border-[#D4AF37]/40 bg-[#0E0B04]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-5 space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 shrink-0 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
          <ShieldCheck className="w-4.5 h-4.5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-white">We value your privacy</h2>
          <p className="text-xs text-neutral-300 leading-relaxed">
            We use essential cookies to keep this site working and, with your consent, analytics cookies to understand
            how visitors use it. Read our{' '}
            <Link to="/privacy" className="text-[#D4AF37] underline underline-offset-2 hover:text-[#FFF3D1] transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <button
          onClick={() => decide('declined')}
          aria-label="Dismiss cookie notice"
          className="ml-auto shrink-0 p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-2.5 pl-12">
        <button
          onClick={() => decide('accepted')}
          className="flex-1 px-4 py-2 rounded-full bg-[#D4AF37] text-neutral-950 font-extrabold text-[11px] tracking-widest uppercase hover:bg-[#FFF3D1] transition-all cursor-pointer"
        >
          Accept All
        </button>
        <button
          onClick={() => decide('declined')}
          className="flex-1 px-4 py-2 rounded-full border border-[#D4AF37]/50 text-[#D4AF37] font-bold text-[11px] tracking-widest uppercase hover:bg-[#D4AF37]/10 transition-all cursor-pointer"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
