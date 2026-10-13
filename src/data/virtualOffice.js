// Virtual Office plans. The live source is service_items (category 'virtual-office',
// kind 'package'), edited in /admin/services and read through useServices(). This list is
// only the error fallback (network / HTTP / database failure) for every page that shows
// the plans, so the plans here must match the database seed in api/schema.sql.
// Plans, inclusions and photos: the "2026 V3.0 NEW VIRTUAL OFFICE" posters in the APR Google Drive
// (folder 1zWG6fWYpE0YCkvdGOhrowce4U3hPa6ma), photos cropped into public/assets/images/virtual-office/.
import { hostEnterprise, ROOT_DOMAIN } from '../lib/enterpriseHost';

export const VO_FALLBACK_PACKAGES = [
  {
    id: 1,
    category: 'virtual-office',
    kind: 'package',
    title: 'Premier Access',
    price: '₱2,899 / mo',
    description: 'Ideal for startups, freelancers and remote businesses: a prestigious business address with mail handling and coworking access once a month.',
    features: [
      'Use of prestigious business address',
      'Access to shared coworking space (once per month)',
      'Mail receiving and handling',
      'Company name display on digital signage',
      'Complimentary internet access (during coworking use)',
    ],
    image_url: '/assets/images/virtual-office/premier-access.webp',
  },
  {
    id: 2,
    category: 'virtual-office',
    kind: 'package',
    title: 'Premier Prestige',
    price: '₱3,499 / mo',
    description: 'A business address that looks established: digital signage, printing and the board room once a month.',
    features: [
      'Use of prestigious business address',
      'Access to shared coworking space (once per month)',
      'Mail handling',
      'Company name displayed on digital signage',
      'Complimentary internet access',
      'Free water',
      'Access to admin printing services (10 pages)',
      'Use of board room once a month',
    ],
    image_url: '/assets/images/virtual-office/premier-prestige.webp',
  },
  {
    id: 3,
    category: 'virtual-office',
    kind: 'package',
    title: 'Alpha Premier',
    price: '₱4,999 / mo',
    description: "The full executive package: front desk reception, the board room twice a month, and the CEO's office for contract signing with your clients.",
    features: [
      'Use of prestigious business address',
      'Front desk reception access',
      'Mail receiving and handling',
      'Complimentary internet access',
      'Free drinking water',
      'Access to admin printing services (up to 10 pages per month)',
      'Use of board room (twice per month)',
      "Access to CEO's office (for contract signing with your client)",
    ],
    image_url: '/assets/images/virtual-office/alpha-premier.webp',
    photos: ['/assets/images/virtual-office/alpha-premier.webp', '/assets/images/virtual-office/alpha-premier-2.webp', '/assets/images/virtual-office/alpha-premier-3.webp'],
  },
  {
    id: 4,
    category: 'virtual-office',
    kind: 'package',
    title: 'Platinum Enterprise Custom Suite',
    price: 'Contact for Price',
    description: 'Fully tailored corporate solution with multi-entity address support, priority boardroom bookings, dedicated receptionist, and concierge services.',
    image_url: '/assets/images/virtual-office/platinum.webp',
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
