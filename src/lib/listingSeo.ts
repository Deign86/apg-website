import type { Listing } from '../hooks/useListings';
import { enterpriseOrigin } from './enterpriseHost';

// Head metadata for one listing's own page, realty.alphapremiergroup.com/properties/APR-XXXXXX.
// Crawlers get the same title, description, image and JSON-LD rendered server-side from the
// same feed, so a change here must be made there too.

const ORIGIN = enterpriseOrigin('realty');
const GOOD_RELATIONS = 'http://purl.org/goodrelations/v1#';
const MAX_DESCRIPTION = 160;

type JsonLd = string | number | JsonLd[] | { [key: string]: JsonLd };

/** Leaves out keys whose value is empty ('' or []). */
const compact = (node: Record<string, JsonLd>): Record<string, JsonLd> =>
  Object.fromEntries(Object.entries(node).filter(([, v]) => v !== '' && !(Array.isArray(v) && v.length === 0)));

/** "Title, size. Price. Term. Term", cut at a word to at most 160 characters (code points). */
function describe(l: Listing): string {
  const text = [`${l.title}${l.size ? `, ${l.size}` : ''}`, l.price || 'Rate on request', ...l.terms]
    .map((part) => part.trim().replace(/\.+$/, ''))
    .filter(Boolean)
    .join('. ');
  const chars = [...text];
  if (chars.length <= MAX_DESCRIPTION) return text;
  const cut = chars.slice(0, MAX_DESCRIPTION - 1).join('');
  const space = cut.lastIndexOf(' ');
  return `${space === -1 ? cut : cut.slice(0, space)}…`;
}

/** `<Seo enterprise="realty">` props for a listing: canonical path, title, description, first photo, JSON-LD. */
export function listingSeo(l: Listing) {
  const path = `/properties/${l.ref}`;
  const url = `${ORIGIN}${path}`;
  const description = describe(l);
  const photos = l.photos.map((photo) => `${ORIGIN}${photo}`);
  return {
    path,
    title: `${l.title}${l.size ? ` (${l.size})` : ''} | Alpha Premier Realty`,
    description,
    image: photos[0], // none: the default og-image
    jsonLd: [
      compact({
        '@type': 'RealEstateListing',
        '@id': `${url}#listing`,
        url,
        name: l.title,
        description,
        identifier: l.ref,
        image: photos,
        datePosted: l.added,
        dateModified: l.updated,
        contentLocation: l.area && {
          '@type': 'Place',
          name: l.area,
          address: { '@type': 'PostalAddress', addressLocality: l.area, addressCountry: 'PH' },
        },
        offers: compact({
          '@type': 'Offer',
          businessFunction: l.deal === 'lease' ? `${GOOD_RELATIONS}LeaseOut` : l.deal === 'sale' ? `${GOOD_RELATIONS}Sell` : '',
          description: l.price || 'Rate on request',
          availability: 'https://schema.org/InStock',
          seller: { '@id': `${ORIGIN}/#organization`, name: 'Alpha Premier Realty' },
        }),
      }),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Alpha Premier Realty', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Available Properties', item: `${ORIGIN}/properties` },
          { '@type': 'ListItem', position: 3, name: l.title, item: url },
        ],
      },
    ],
  };
}
