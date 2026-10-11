import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Megaphone } from 'lucide-react';
import { useSiteSettings, safeUrl } from '../hooks/useSiteSettings';
import { getEnterpriseConfig, ENTERPRISE_CONFIGS } from '../data/enterpriseConfig';
import { hostEnterprise } from '../lib/enterpriseHost';

const DISMISS_KEY = 'apg-announcement-dismissed';

/** Site slug for the current page: enterprise subdomain or path, virtual office, else the main site. */
function currentSite(pathname: string): string {
  const host = hostEnterprise();
  if (host) return host;
  if (pathname === '/virtual-office' || pathname.startsWith('/virtual-office/')) return 'virtual-office';
  const { slug } = getEnterpriseConfig(pathname);
  return slug === 'apg-main' ? 'corporate' : slug;
}

function readDismissed(): string {
  try {
    return sessionStorage.getItem(DISMISS_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Admin announcement (Site settings > Announcement banner), shown on the chosen sites as a small
 * floating card; dismissing hides that exact text for the rest of the visit.
 */
export default function AnnouncementBanner() {
  const { pathname } = useLocation();
  const settings = useSiteSettings();
  const [dismissed, setDismissed] = useState(readDismissed);

  const text = String(settings.announcement_text || '').trim();
  const sites = settings.announcement_sites as string[];
  const site = currentSite(pathname);
  if (
    settings.announcement_enabled !== true
    || text === ''
    || dismissed === text
    || pathname.startsWith('/admin')
    || (sites.length > 0 && !sites.includes(site))
  ) {
    return null;
  }

  const link = safeUrl(settings.announcement_link);
  const accent: string = ENTERPRISE_CONFIGS[site]?.accentColor || '#D4AF37';
  const dismiss = () => {
    try { sessionStorage.setItem(DISMISS_KEY, text); } catch { /* private mode: hide for this page view only */ }
    setDismissed(text);
  };

  return (
    <aside
      role="region"
      aria-label="Announcement"
      className="fixed z-[55] left-3 right-20 bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:right-auto sm:left-6 sm:bottom-6 sm:max-w-sm rounded-2xl border bg-[#0F0C07]/95 text-neutral-100 shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur-md px-4 py-3 flex items-start gap-3 font-sans"
      style={{ borderColor: accent }}
    >
      <Megaphone className="w-4 h-4 mt-0.5 shrink-0" style={{ color: accent }} aria-hidden="true" />
      <div className="min-w-0 flex-1 text-sm leading-snug">
        <p className="wrap-anywhere">{text}</p>
        {link && (
          <a
            href={link}
            className="inline-block mt-1 py-1 text-xs font-bold uppercase tracking-wider underline-offset-2 hover:underline"
            style={{ color: accent }}
            {...(/^https?:\/\//i.test(link) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {String(settings.announcement_link_label || 'Learn more')}
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="-mr-2 -mt-1 size-10 shrink-0 inline-flex items-center justify-center rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
}
