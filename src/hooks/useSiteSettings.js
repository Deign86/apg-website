import { useContent } from './useContent';

/**
 * Site settings (content page `site`): contacts, socials, map, announcement banner.
 * Shares useContent's per-session cache, so every consumer costs one request in total.
 * Defaults are the values the site showed before they became editable.
 */
export function useSiteSettings() {
  return useContent('site').content;
}

const SAFE_URL = /^(https?:\/\/|mailto:|tel:|viber:|\/(?!\/))/i;

/** The URL when it is http(s), mailto/tel/viber or a site path; '' otherwise (never javascript: etc.). */
export function safeUrl(value) {
  const url = typeof value === 'string' ? value.trim() : '';
  return SAFE_URL.test(url) ? url : '';
}

/** Google Maps embed src from settings, else the default embed (iframes only load maps.google embeds). */
export function mapEmbedSrc(settings, fallback) {
  const url = typeof settings.map_embed_url === 'string' ? settings.map_embed_url.trim() : '';
  return url.startsWith('https://www.google.com/maps/embed') ? url : fallback;
}

/** "0915 888 9482 / (02) 8 650 2540" -> ["0915 888 9482", "(02) 8 650 2540"]. */
export function phoneParts(phone) {
  return String(phone || '').split(/\s*[/|]\s*/).map((part) => part.trim()).filter(Boolean);
}

/** tel: link for one Philippine number ("0915 888 9482" -> "tel:+639158889482"). */
export function telHref(phone) {
  const digits = String(phone || '').replace(/[^\d+]/g, '');
  if (!digits) return '';
  if (digits.startsWith('+')) return `tel:${digits}`;
  return `tel:${digits.startsWith('0') ? `+63${digits.slice(1)}` : digits}`;
}

/** Address rows as typed in the textarea (blank rows dropped). */
export function addressLines(address) {
  return String(address || '').split('\n').map((line) => line.trim()).filter(Boolean);
}

/** Address on one line ("row1 row2 row3"). */
export function addressOneLine(address) {
  return addressLines(address).join(' ');
}

const PLATFORMS = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'viber', label: 'Viber' },
];

/** Main social links that are filled in: [{ key, label, href }]. */
export function mainSocials(settings) {
  return PLATFORMS
    .map(({ key, label }) => ({ key, label, href: safeUrl(settings[key]) }))
    .filter((link) => link.href);
}

function companyValue(settings, slug, field) {
  const value = settings[`co_${slug}_${field}`];
  return typeof value === 'string' && value.trim() !== '' ? value : settings[field];
}

/**
 * Contact details for a company site: its own overrides from Site settings, else the main ones.
 * slug is an enterprise slug (realty, luxe-prime, ...); other slugs get the main details.
 * @returns {{ phone: string, email: string, address: string, socials: { key: string, label: string, href: string }[] }}
 */
export function companyContact(settings, slug) {
  const own = Array.isArray(settings[`co_${slug}_socials`]) ? settings[`co_${slug}_socials`] : [];
  const socials = own
    .map((item) => {
      const platform = PLATFORMS.find((p) => p.label === item?.platform);
      return platform ? { key: platform.key, label: platform.label, href: safeUrl(item.url) } : null;
    })
    .filter((link) => link && link.href);
  return {
    phone: companyValue(settings, slug, 'phone'),
    email: companyValue(settings, slug, 'email'),
    address: companyValue(settings, slug, 'address'),
    socials: socials.length > 0 ? socials : mainSocials(settings),
  };
}
