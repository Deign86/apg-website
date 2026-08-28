import { BlogPost, JobOpening } from './types';

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-featured',
    title: 'The Future of Commercial Real Estate in the Philippines',
    date: 'June 14, 2025',
    category: 'Market Trends',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    summary: 'As hybrid work reshapes demand, Grade-A office towers in BGC are seeing renewed absorption driven by corporate expansion.',
    content: `Commercial real estate is undergoing a structural paradigm shift in the Philippines. As hybrid and remote models stabilize, companies are demanding more versatile and sustainable work environments. Grade-A office towers that offer LEED and WELL certifications are experiencing a major flight-to-quality.

The business landscape in main hubs like Bonifacio Global City (BGC) and Ortigas Center is being redefined. With the ongoing relocation of international firms, corporate space optimization is no longer just about floor counts—it's about building wellness, tech integration, and premium flexible amenities.`
  },
  {
    id: 'blog-1',
    title: 'How to Evaluate Commercial Property Investments in 2026',
    date: 'May 28, 2025',
    category: 'Investment Guides',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
    summary: 'Strategic asset evaluation requires analyzing CBD location growth, tenant retention, infrastructure pipelines, and exit liquidity.',
    content: `Investing in commercial real estate represents one of the most resilient wealth-building strategies. Prime locations secure robust recurring lease yields and strong long-term capital appreciation.

Success is dependent on rigid screening. Always analyze occupancy rates, local infrastructure expansion, and corporate demand dynamics.`
  },
  {
    id: 'blog-2',
    title: '5 Crucial Steps in Real Estate Due Diligence & Title Verification',
    date: 'May 12, 2025',
    category: 'Property Tips',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
    summary: 'A clean title is non-negotiable. Our advisory team outlines the key steps to verify encumbrances and technical boundaries.',
    content: `Securing a clear Transfer Certificate of Title (TCT) is the single most critical step in property acquisitions. Title verification ensures title integrity, tax compliance, and zoning alignment.`
  }
];

export const REALTY_SERVICES = [
  {
    id: 1,
    title: 'Commercial Tower & Office Leasing',
    description: 'Exclusive tenant and landlord representation for Grade A office towers, corporate headquarters, and high-rise commercial floors in Ortigas, BGC, and Makati.',
    category: 'realty',
    price: 'Custom Brokerage Terms',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    features: ['Tenant Representation', 'Lease Structuring', 'Space Planning Advisory', 'CBD Market Valuation']
  },
  {
    id: 2,
    title: 'Strategic Land & Asset Acquisition',
    description: 'High-value land banking, commercial site sourcing, and joint-venture advisory for commercial developers, corporate investors, and institutional funds.',
    category: 'realty',
    price: 'Advisory Consultation',
    image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    features: ['Due Diligence & Title Verification', 'Zoning & Permitting Assessment', 'Feasibility Studies', 'Negotiation Representation']
  },
  {
    id: 3,
    title: 'Industrial Parks & Logistics Warehousing',
    description: 'Specialized sourcing of high-clearance warehouses, logistics facilities, and industrial manufacturing sites across major transportation corridors.',
    category: 'realty',
    price: 'Brokerage & Sourcing',
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    features: ['High-Bay Storage Sourcing', 'Logistics Corridor Analysis', 'Industrial Lease Agreements', 'Build-to-Suit Sourcing']
  },
  {
    id: 4,
    title: 'Luxury Residential & Penthouse Advisory',
    description: 'Discreet, bespoke brokerage for luxury residential estates, sky villas, and prestige pre-selling residential portfolios.',
    category: 'realty',
    price: 'Exclusive Portfolio',
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    features: ['Private Client Advisory', 'Prestige Penthouse Sourcing', 'Portfolio Diversification', 'Turnkey Handover Support']
  }
];

export const JOB_OPENINGS: JobOpening[] = [
  {
    id: 'job-1',
    title: 'Licensed Commercial Real Estate Broker',
    location: 'Ortigas Center, Pasig City',
    type: 'Full-Time',
    department: 'Commercial Brokerage',
    description: 'Represent high-net-worth clients and corporate tenants in commercial lease agreements and property acquisitions.',
    requirements: [
      'Active PRC Real Estate Broker license',
      'Minimum 2 years experience in commercial or high-end residential sales',
      'Strong network of corporate decision-makers',
      'Outstanding negotiation and communication skills'
    ]
  },
  {
    id: 'job-2',
    title: 'Property Investment Analyst',
    location: 'Ortigas Center, Pasig City',
    type: 'Full-Time',
    department: 'Research & Valuation',
    description: 'Perform market intelligence, financial modeling, and feasibility studies for prospective real estate portfolios.',
    requirements: [
      'Bachelor degree in Real Estate Management, Finance, or Economics',
      'Strong proficiency in financial valuation and cash flow modeling',
      'Exceptional research, analytical, and presentation skills'
    ]
  }
];
