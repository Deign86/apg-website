import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';
import { readConsent, saveConsent, type ConsentChoice } from '../lib/consent';
import { enterpriseFromPath, hostEnterprise } from '../lib/enterpriseHost';

interface BannerTheme {
  bg: string;      // panel background
  text: string;    // heading
  muted: string;   // body copy
  accent: string;  // icon, link, buttons
  onAccent: string; // text on the filled button
}

const DARK_GOLD: BannerTheme = { bg: 'rgba(14,11,4,0.95)', text: '#FFFFFF', muted: '#D4D4D4', accent: '#D4AF37', onAccent: '#0A0A0A' };

// Each enterprise's own palette (matches its site); everything else uses the APG black & gold.
const THEMES = new Map<string, BannerTheme>([
  ['realty', { ...DARK_GOLD, accent: '#C5A85C' }],
  ['luxe-prime', { ...DARK_GOLD, accent: '#C49A2A' }],
  ['construction', { ...DARK_GOLD, bg: 'rgba(18,18,18,0.96)' }],
  ['88prime', { bg: 'rgba(12,31,63,0.97)', text: '#FFFFFF', muted: '#CBD5E1', accent: '#D4A53A', onAccent: '#0C1F3F' }],
  ['swiftclear', { bg: 'rgba(255,255,255,0.97)', text: '#0B1B3F', muted: '#475569', accent: '#0F4CBF', onAccent: '#FFFFFF' }],
  ['dynamic-tree', { bg: 'rgba(255,247,250,0.97)', text: '#1C1814', muted: '#6B5D65', accent: '#C84A72', onAccent: '#FFFFFF' }],
  ['alta-venture', { bg: 'rgba(246,254,249,0.97)', text: '#082636', muted: '#3F5A63', accent: '#14927B', onAccent: '#FFFFFF' }],
]);

export default function CookieConsent() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(() => readConsent() === null);

  const decide = (choice: ConsentChoice) => {
    saveConsent(choice);
    setVisible(false);
  };

  if (!visible) return null;

  const slug = hostEnterprise() ?? enterpriseFromPath(pathname)?.slug ?? 'corporate';
  const t = THEMES.get(slug) ?? DARK_GOLD;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-6 sm:bottom-28 sm:max-w-md z-[60] rounded-2xl border backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-5 space-y-3"
      style={{ background: t.bg, borderColor: `${t.accent}66` }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 shrink-0 rounded-xl border flex items-center justify-center"
          style={{ color: t.accent, background: `${t.accent}26`, borderColor: `${t.accent}66` }}
        >
          <ShieldCheck className="w-4.5 h-4.5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xs font-extrabold uppercase tracking-widest" style={{ color: t.text }}>We value your privacy</h2>
          <p className="text-xs leading-relaxed" style={{ color: t.muted }}>
            We use essential cookies to keep this site working and, with your consent, analytics cookies to understand
            how visitors use it. Read our{' '}
            <Link to="/privacy" className="underline underline-offset-2 hover:opacity-80 transition-opacity" style={{ color: t.accent }}>
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <button
          onClick={() => decide('declined')}
          aria-label="Dismiss cookie notice"
          className="ml-auto -mr-2 -mt-2 shrink-0 size-10 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          style={{ color: t.text }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-2.5 pl-12">
        <button
          onClick={() => decide('accepted')}
          className="flex-1 px-4 py-2 rounded-full font-extrabold text-xs tracking-widest uppercase hover:opacity-90 transition-opacity cursor-pointer"
          style={{ background: t.accent, color: t.onAccent }}
        >
          Accept All
        </button>
        <button
          onClick={() => decide('declined')}
          className="flex-1 px-4 py-2 rounded-full border font-bold text-xs tracking-widest uppercase hover:opacity-80 transition-opacity cursor-pointer"
          style={{ borderColor: `${t.accent}80`, color: t.accent }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
