// Virtual Office plans. The live source is service_items (category 'virtual-office',
// kind 'package'), edited in /admin/services and read through useServices(). This list is
// only the error fallback (network / HTTP / database failure) for every page that shows
// the plans, so the prices here must match the database seed in api/schema.sql.
import { hostEnterprise, ROOT_DOMAIN } from '../lib/enterpriseHost';

export const VO_FALLBACK_PACKAGES = [
  {
    id: 1,
    category: 'virtual-office',
    kind: 'package',
    title: 'Bronze Virtual Office Package',
    price: '₱2,899 / mo',
    description: 'Prestigious business address for SEC/DTI registration, basic mail handling, and 2 hours complimentary meeting room credits monthly.',
    image_url: '/assets/images/landingpage.webp',
  },
  {
    id: 2,
    category: 'virtual-office',
    kind: 'package',
    title: 'Silver Business Address & Call Handling',
    price: '₱3,499 / mo',
    description: 'Everything in Bronze plus dedicated local phone number, personalized call answering, call patching, and 4 hours meeting room usage.',
    image_url: '/assets/images/landingpage.webp',
  },
  {
    id: 3,
    category: 'virtual-office',
    kind: 'package',
    title: 'Gold Executive Workspace Suite',
    price: '₱4,999 / mo',
    description: 'All Silver features plus unlimited mail & parcel forwarding, 8 hours conference room usage, high-speed fiber internet, and executive lounge access.',
    image_url: '/assets/images/landingpage.webp',
  },
  {
    id: 4,
    category: 'virtual-office',
    kind: 'package',
    title: 'Platinum Enterprise Custom Suite',
    price: 'Contact for Price',
    description: 'Fully tailored corporate solution with multi-entity address support, priority boardroom bookings, dedicated receptionist, and concierge services.',
    image_url: '/assets/images/landingpage.webp',
  },
];

/**
 * Link to the inquiry form with this plan pre-selected (see InquireView). The form lives
 * on the apex, so on an enterprise subdomain this is an absolute apex URL.
 */
export function voInquirePath(pkg) {
  const label = pkg.price ? `${pkg.title} (${pkg.price})` : pkg.title;
  const path = `/inquire?enterprise=virtual-office&package=${encodeURIComponent(label)}`;
  return hostEnterprise() ? `https://${ROOT_DOMAIN}${path}` : path;
}
