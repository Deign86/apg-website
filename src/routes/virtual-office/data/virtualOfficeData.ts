export interface VirtualOfficePlan {
  id: string;
  name: string;
  badge?: string;
  monthlyPrice: number;
  annualPricePerMonth: number;
  targetAudience: string;
  description: string;
  highlighted?: boolean;
  features: string[];
  perks: {
    boardroomHours: string;
    coworkingPasses: string;
    mailHandling: string;
    callHandling: string;
    signage: string;
    complianceSupport: string;
  };
}

export const VIRTUAL_OFFICE_PLANS: VirtualOfficePlan[] = [
  {
    id: 'premier-access',
    name: 'Premier Access',
    monthlyPrice: 2899,
    annualPricePerMonth: 2499,
    targetAudience: 'Startups, Freelancers & Remote Founders',
    description: 'Essential corporate presence and registered commercial address to legitimize your enterprise in Ortigas CBD.',
    features: [
      'Prestigious Business Address at Tektite East Tower, Ortigas Center',
      'SEC, DTI & BIR RDO 043 Registration Compliance Rights',
      'Secure Mail & Parcel Receiving with instant SMS/Email notifications',
      '1x Day Pass monthly to shared executive coworking hub',
      'High-speed business fiber Wi-Fi during visits',
      'Complimentary executive lounge access & refreshments'
    ],
    perks: {
      boardroomHours: 'Available via on-demand add-on rates',
      coworkingPasses: '1 Day Pass / month',
      mailHandling: 'Daily receiving, logging & notification',
      callHandling: 'Centralized directory assistance',
      signage: 'Building directory listing',
      complianceSupport: 'SEC & DTI business permit proof of address'
    }
  },
  {
    id: 'premier-prestige',
    name: 'Premier Prestige',
    badge: 'Most Popular',
    highlighted: true,
    monthlyPrice: 3499,
    annualPricePerMonth: 2999,
    targetAudience: 'Growing SMEs, Consultancies & Professional Agencies',
    description: 'Comprehensive business infrastructure combining physical boardroom privileges with high-visibility corporate prestige.',
    features: [
      'Everything in Premier Access included',
      'Digital Directory & Reception Screen Signage at Tektite Hub',
      '1x Boardroom Session (up to 4 hours) monthly with conference AV',
      'Professional Front Desk Concierge greeting your guests',
      'Dedicated local call forwarding & personalized message forwarding',
      '50 pages/month high-speed document printing & scanning allowance',
      'Direct courier & document drop-off/pick-up coordination'
    ],
    perks: {
      boardroomHours: '4 hours / month (with 4K video conferencing display)',
      coworkingPasses: '2 Day Passes / month',
      mailHandling: 'Priority mail receiving, scanning & courier dispatch',
      callHandling: 'Dedicated company call answering & forward',
      signage: 'Digital Reception Lobby Signage',
      complianceSupport: 'Full BIR, SEC & Local LGU Mayor’s Permit package'
    }
  },
  {
    id: 'alpha-premier',
    name: 'Alpha Premier Executive',
    badge: 'Executive Suite',
    monthlyPrice: 4999,
    annualPricePerMonth: 4299,
    targetAudience: 'Corporations, Expanding Tech Firms & C-Suite Executives',
    description: 'The definitive executive package with private CEO office access for client signings and priority holding group benefits.',
    features: [
      'Everything in Premier Prestige included',
      '2x Boardroom Sessions (up to 8 hours total) monthly',
      'Exclusive CEO Private Executive Office access for high-stakes client contract signings',
      'Dedicated locked mail cabinet & immediate physical scan-to-email',
      'Personalized bilingual receptionist call answering using your company script',
      'Unlimited artisanal coffee, espresso, and executive refreshments',
      'Exclusive 15% discount on Dynamic Tree Multimedia studio & SwiftClear services'
    ],
    perks: {
      boardroomHours: '8 hours / month (priority reservation)',
      coworkingPasses: 'Unlimited drop-in business lounge access',
      mailHandling: 'Same-day digital document scan & locked physical storage',
      callHandling: 'Personalized branded script call answering',
      signage: 'Premium digital signage & directory priority',
      complianceSupport: 'Dedicated corporate compliance liaison'
    }
  }
];

export interface ComplianceStep {
  step: string;
  title: string;
  description: string;
  document: string;
}

export const COMPLIANCE_STEPS: ComplianceStep[] = [
  {
    step: '01',
    title: 'SEC or DTI Business Registration',
    description: 'Use the official PSE Tektite East Tower commercial lease contract and authorization letter to secure your Certificate of Incorporation.',
    document: 'Lease Contract & Consent Form'
  },
  {
    step: '02',
    title: 'Barangay & Pasig Mayor’s Business Permit',
    description: 'Clear local government zoning effortlessly. Our address is fully commercial-zoned under Pasig City regulations.',
    document: 'Barangay Clearance & Building Assessment'
  },
  {
    step: '03',
    title: 'BIR Registration (RDO 043 - Pasig)',
    description: 'Register with the Bureau of Internal Revenue to obtain your Certificate of Registration (BIR Form 2303) and official invoices.',
    document: 'BIR Form 1903 / 1901'
  },
  {
    step: '04',
    title: 'Commercial Corporate Bank Account',
    description: 'Top-tier Philippine banks (BDO, BPI, Metrobank, Security Bank) recognize Tektite East Tower for hassle-free corporate account opening.',
    document: 'Bank Verification Document Pack'
  }
];

export interface EnterpriseSubsidiary {
  id: string;
  name: string;
  category: string;
  tagline: string;
  synergy: string;
}

export const APG_ECOSYSTEM: EnterpriseSubsidiary[] = [
  {
    id: 'virtual-office',
    name: 'Virtual Office & Executive Hubs',
    category: 'Workspace Solutions',
    tagline: 'Ortigas Central Business District corporate address & flexible suites',
    synergy: 'The starting foundation for compliance, legitimacy, and operational headquarters.'
  },
  {
    id: 'alpha-realty',
    name: 'Alpha Premier Realty',
    category: 'Commercial Brokerage',
    tagline: 'Commercial leasing, office floors, industrial logistics & land acquisitions',
    synergy: 'Seamlessly upgrade from virtual office to physical commercial office floors as you scale.'
  },
  {
    id: 'luxe-prime',
    name: 'Luxe Prime Realty',
    category: 'Luxury Real Estate',
    tagline: 'High-end residential estates, executive leasing, and private wealth properties',
    synergy: 'Executive housing and relocation for founders, directors, and expatriate leadership.'
  },
  {
    id: 'dynamic-tree',
    name: 'Dynamic Tree Multimedia',
    category: 'Creative & Media',
    tagline: 'Full-service digital campaigns, studio production, video & branding',
    synergy: 'Brand identity, website development, product photography, and media production.'
  },
  {
    id: 'swiftclear',
    name: 'SwiftClear Facility Solutions',
    category: 'Facility & Maintenance',
    tagline: 'Commercial sanitation, deep disinfection, pest control & HVAC servicing',
    synergy: 'Turnkey facility maintenance and clean-room certification for enterprise offices.'
  },
  {
    id: 'construction',
    name: 'Alpha Premier Construction',
    category: 'Engineering & Fit-Out',
    tagline: 'Architectural fit-out, structural contracting, and MEP engineering',
    synergy: 'Custom interior fit-outs when your firm builds its dedicated headquarters.'
  }
];
