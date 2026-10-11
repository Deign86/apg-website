import { ROOT_DOMAIN, isProductionHost } from './enterpriseHost';

// Cookie consent is shared by the apex and every enterprise subdomain, so one choice is enough.
// A cookie on .alphapremiergroup.com is visible to all of them; localStorage is per-subdomain.
export type ConsentChoice = 'accepted' | 'declined';

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: IArguments[];
    gtag?: Gtag;
  }
}

const COOKIE = 'apg_consent';
// Key the banner used before the shared cookie (its literal value, including the "…").
const LEGACY_STORAGE_KEY = 'apg-co…sent';

function writeCookie(choice: ConsentChoice) {
  const domain = isProductionHost() ? `; Domain=.${ROOT_DOMAIN}` : '';
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE}=${choice}; Max-Age=31536000; Path=/; SameSite=Lax${domain}${secure}`;
}

/** The visitor's saved choice, or null when they have not chosen yet. */
export function readConsent(): ConsentChoice | null {
  const match = document.cookie.match(/(?:^|;\s*)apg_consent=(accepted|declined)/);
  if (match) return match[1] === 'accepted' ? 'accepted' : 'declined';
  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy !== null) {
      const choice: ConsentChoice = legacy.includes('accepted') ? 'accepted' : 'declined';
      writeCookie(choice); // share the earlier choice with the other subdomains
      return choice;
    }
  } catch {
    // Storage blocked: fall through to "not chosen".
  }
  return null;
}

export function saveConsent(choice: ConsentChoice) {
  writeCookie(choice);
  if (choice === 'accepted') loadAnalytics();
}

let analyticsLoaded = false;

/** Google Analytics (VITE_ANALYTICS_ID). Only called once the visitor has accepted cookies. */
export function loadAnalytics() {
  const analyticsId = import.meta.env.VITE_ANALYTICS_ID;
  if (analyticsLoaded || !analyticsId || !/^G-[A-Z0-9]+$/i.test(analyticsId)) return;
  analyticsLoaded = true;
  const dataLayer = (window.dataLayer = window.dataLayer || []);
  const gtag: Gtag = function gtag() {
    // gtag.js expects the Arguments object itself.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', analyticsId);
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`;
  document.head.appendChild(script);
}
