import { Listing, BlogPost, JobOpening } from './types';

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-featured',
    title: 'The Future of Commercial Real Estate in the Philippines',
    date: 'June 14, 2025',
    category: 'Market Trends',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    summary: 'As hybrid work reshapes demand, Grade-A office towers in BGC are seeing renewed absorption driven by POGO exits and BPO expansion.',
    content: `Commercial real estate is undergoing a structural paradigm shift in the Philippines. As hybrid and remote models stabilize, companies are demanding more versatile and sustainable work environments. Grade-A office towers that offer LEED and WELL certifications are experiencing a major flight-to-quality.

The business landscape in main hubs like Bonifacio Global City (BGC) and Ortigas Center is being redefined. With the ongoing relocation of international BPOs, corporate space optimization is no longer just about floor counts—it's about building wellness, tech integration, and premium flexible amenities. Property values in strategic commercial nodes are projected to maintain an upward trajectory of 4.5% year-on-year, driven by premium asset demand.`
  },
  {
    id: 'blog-1',
    title: 'How to Evaluate Pre-Selling Condo Investments in 2025',
    date: 'May 28, 2025',
    category: 'Investment Guides',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
    summary: 'Pre-selling units offer leverage and capital gains — but only when due diligence covers developer track record, location, and exit liquidity.',
    content: `Investing in pre-selling condominiums represents one of the most popular wealth-building strategies in urban centers. Buying property before it is built allows investors to secure below-market pricing and benefit from appreciation during construction.

However, success is highly dependent on rigid screening. Always analyze the developer's historical delivery rate, capital reserves, and structural warranty records. Furthermore, check the infrastructural plans for the immediate community—proximity to upcoming mass transit lines can boost appreciation by up to 35% upon project completion.`
  },
  {
    id: 'blog-2',
    title: '5 Red Flags to Watch for in a Property Title Check',
    date: 'May 12, 2025',
    category: 'Property Tips',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
    summary: 'A clean TCT is non-negotiable. Our legal team outlines the five most common encumbrances that derail transactions late in the process.',
    content: `Securing a clear Transfer Certificate of Title (TCT) is the single most critical step in property acquisitions. Title defects can lock your capital in legal disputes for decades.

Watch out for these five major warning signs:
1. Active adverse claims registered on the back of the title.
2. Unpaid real property taxes resulting in a municipal tax lien.
3. Discrepancies between the technical descriptions and actual survey boundaries.
4. Outdated registrations of deceased co-owners.
5. Undisclosed bank mortgages that haven't been canceled or released.`
  },
  {
    id: 'blog-3',
    title: 'Alpha Premier Opens Its 18th Office in Davao City',
    date: 'April 30, 2025',
    category: 'Company News',
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80',
    summary: 'Expanding our Mindanao footprint, the Davao branch will serve the booming agri-industrial and tourism-driven property market in the region.',
    content: `We are thrilled to announce the official opening of Alpha Premier Realty's 18th physical office, located in the heart of Davao City. This expansion marks a major milestone in our mission to provide unparalleled real estate expertise across the entire archipelago.

Mindanao's economy has demonstrated incredible resilience, fueled by massive government infrastructure projects, agricultural exports, and a thriving local tourism sector. Our new Davao branch is staffed with veteran local specialists who understand the unique dynamics of the Southern commercial and high-end residential markets.`
  },
  {
    id: 'blog-4',
    title: 'Warehouse and Logistics Properties: The Quiet Outperformer',
    date: 'April 18, 2025',
    category: 'Market Trends',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=600&q=80',
    summary: 'E-commerce growth and nearshoring trends have driven industrial real estate to record-low vacancy rates across Metro Manila\'s logistics corridors.',
    content: `While residential and office sectors capture public attention, industrial real estate—specifically warehouses and fulfillment hubs—has silently delivered stellar yields. 

The exponential expansion of e-commerce, combined with multinational corporations optimizing supply chain security via nearshoring, has driven warehouse vacancy rates to historic single-digits along key highway corridors in Cavite, Laguna, and Bulacan. Rents for modern logistics centers with high ceilings and smart loading docks are projected to climb an additional 8% this year.`
  },
  {
    id: 'blog-5',
    title: 'REITs vs. Direct Property: Which is Right for You?',
    date: 'March 25, 2025',
    category: 'Investment Guides',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80',
    summary: 'Both asset classes offer compelling risk-return profiles. We break down liquidity, management burden, tax treatment, and yield expectations.',
    content: `The debate between Real Estate Investment Trusts (REITs) and physical real estate acquisitions is vital for passive income seekers. 

REITs offer extreme liquidity, lower entry capital, and zero property management headaches, distributing at least 90% of taxable income to shareholders. Physical properties, on the other hand, offer strong tax write-offs, direct operational control, and significant capital appreciation leverage via mortgage financing. Our guide compares both side-by-side to help align with your investment profile.`
  },
  {
    id: 'blog-6',
    title: 'Negotiating Price: Tactics That Actually Work in a Seller\'s Market',
    date: 'March 5, 2025',
    category: 'Property Tips',
    image: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=600&q=80',
    summary: 'When inventory is tight, buyers who come prepared with data, pre-approval letters, and flexible terms consistently win on price.',
    content: `Negotiating in a seller's market requires surgical planning. Relying purely on lowball offers will isolate you from prospective listing brokers.

Instead, leverage terms. Offer standard, expedited closing dates, secure a pre-qualification letter from primary banks, and minimize contingency requests. Show the seller that you represent a guaranteed, friction-free closing. This emotional security is often worth a 3-5% price discount, even in high-demand luxury markets.`
  }
];

export const LISTINGS: Listing[] = [
  {
    id: 'list-1',
    title: 'Skyline Office Tower — Unit 18F',
    type: 'For Lease',
    category: 'COMMERCIAL SPACE',
    price: 85000,
    pricePeriod: 'mo',
    location: 'Bonifacio Global City, Taguig City',
    city: 'Taguig City',
    floorArea: 320,
    lotArea: 'N/A',
    floor: '18F',
    parking: '3 slots',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    isUpdated: true,
    description: 'This premium Grade-A office suite features floor-to-ceiling double-glazed glass panels presenting dramatic views of the BGC skyline. Fully equipped with centralized HVAC, high-speed fiber-optic arrays, and 24/7 dual-grid electrical redundancy. Designed for modern corporate headquarters seeking high-profile exposure and luxury staff amenities.'
  },
  {
    id: 'list-2',
    title: 'Central Commerce Plaza — Unit 4A',
    type: 'For Lease',
    category: 'COMMERCIAL SPACE',
    price: 42500,
    pricePeriod: 'mo',
    location: 'Ayala Avenue, Makati City',
    city: 'Makati City',
    floorArea: 180,
    lotArea: 'N/A',
    floor: '4F',
    parking: '2 slots',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    isUpdated: false,
    description: 'A beautifully designed commercial studio perfectly suited for dynamic retail outlets, tech offices, or design galleries. Situated right off Ayala Avenue, this high-traffic location enjoys immense pedestrian volume, dual security checkpoints, and seamless connections to transport nodes.'
  },
  {
    id: 'list-qc-1200-wh',
    title: '1,200 SQM Warehouse for Rent/Lease',
    type: 'For Lease',
    category: 'WAREHOUSE SPACE',
    price: 250,
    pricePeriod: 'SQM/mo (₱300,000/mo, VAT Excl.)',
    location: 'Quezon City, Metro Manila',
    city: 'Quezon City',
    floorArea: 1200,
    lotArea: 1200,
    loading: '40-Footer Truck Accessible',
    image: '/images/services/1 (3).jpg',
    images: [
      '/images/services/1 (3).jpg',
      '/images/services/2 (3).jpg',
      '/images/services/3 (3).jpg'
    ],
    isUpdated: true,
    description: "Secure a well-maintained warehouse in a strategic, flood-free location—ideal for businesses looking to expand their operations.",
    features: [
      'Flood-Free Location',
      'Safe & Secured Gated Compound',
      '40-Footer Truck Accessible',
      'With Parking Area',
      'Includes a Two-Storey Office',
      'With Comfort Rooms',
      'With Kitchen'
    ],
    suitableFor: [
      '📦 Logistics',
      '📦 Distribution',
      '🛒 E-commerce',
      '🏭 Manufacturing',
      '📦 Storage'
    ]
  },
  {
    id: 'list-bagbag-wh',
    title: '442 SQM Warehouse for Lease',
    type: 'For Lease',
    category: 'WAREHOUSE SPACE',
    price: 280,
    pricePeriod: 'SQM/mo (₱123,760/mo)',
    location: 'Bagbag, Novaliches, Quezon City',
    city: 'Quezon City',
    floorArea: 442,
    lotArea: 442,
    loading: '40-Footer Truck Accessible',
    image: '/images/services/3 (2).png',
    images: [
      '/images/services/3 (2).png',
      '/images/services/4 (1).png',
      '/images/services/5 (2).png'
    ],
    isUpdated: true,
    description: "Looking for a warehouse in a prime location? This 442 SQM warehouse is ready for your business!",
    features: [
      '40-Footer Truck Accessible',
      'Ideal for Logistics, Distribution, Storage & E-commerce Operations',
      'Strategic and Highly Accessible Location',
      'Ready for Immediate Occupancy',
      'With 3-Phase Electricity'
    ],
    suitableFor: [
      '🚚 Logistics',
      '📦 Distribution',
      '🛒 E-commerce',
      '📦 Storage'
    ]
  },
  {
    id: 'list-qc-wh',
    title: '1,300 SQM Prime Industrial Warehouse with Office',
    type: 'For Lease',
    category: 'WAREHOUSE SPACE',
    price: 280,
    pricePeriod: 'SQM/mo (₱364,000/mo)',
    cusa: '₱20/SQM',
    terms: '2 Months Advance + 2 Months Security Deposit',
    location: 'Novaliches, Quezon City',
    city: 'Quezon City',
    floorArea: 1300,
    lotArea: 1500,
    height: '8-10 m',
    loading: '40-Footer Truck Accessible',
    image: '/images/services/451.png',
    images: [
      '/images/services/451.png',
      '/images/services/452.png',
      '/images/services/453.png',
      '/images/services/454.png',
      '/images/services/455.png'
    ],
    isUpdated: true,
    description: "Looking for a strategic warehouse location that's ready for your business? This 1,300 SQM warehouse with a spacious office is available for immediate occupancy!",
    features: [
      '40-Footer Truck Accessible',
      'Inside a secured industrial compound',
      'Near Quirino Highway & Mindanao Avenue',
      'Only 10 minutes to NLEX (Mindanao Ave Exit)',
      'Near SM Fairview',
      'With 3-Phase Electricity',
      'Wide access roads for smooth truck movement'
    ],
    suitableFor: [
      '🚚 Logistics',
      '📦 Distribution',
      '🛒 E-commerce',
      '🏭 Manufacturing',
      '📦 Storage'
    ]
  },
  {
    id: 'list-3',
    title: 'Warehouse Complex — Bay 7',
    type: 'For Lease',
    category: 'WAREHOUSE SPACE',
    price: 120000,
    pricePeriod: 'mo',
    location: 'Eastwood, Pasig City',
    city: 'Pasig City',
    floorArea: 1200,
    lotArea: 2400,
    height: '9 m',
    loading: '4 docks',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    isUpdated: true,
    description: 'This premium logistics hub is optimized for large-scale distribution. Featuring an active 9-meter ceiling clearance, high-density industrial floor load capacity, 4 elevated loading docks with pneumatic dock levelers, and a comprehensive 3-phase electrical backbone.'
  },
  {
    id: 'list-4',
    title: 'Arton Luxury Penthouse Suite',
    type: 'For Sale',
    category: 'CONDO / HOUSE AND LOT',
    price: 24500000,
    location: 'Katipunan Ave, Quezon City',
    city: 'Quezon City',
    floorArea: 220,
    lotArea: 'N/A',
    floor: '28F',
    parking: '2 slots',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    isUpdated: true,
    description: 'Bespoke residential luxury overlooking the Ateneo valley. Featuring private elevator access, sub-zero luxury kitchen appliances, and an extensive wraparound open-sky balcony.'
  },
  {
    id: 'list-5',
    title: 'Prime Commercial Corner Lot',
    type: 'For Sale',
    category: 'CONDO / HOUSE AND LOT',
    price: 75000000,
    location: 'Metropolitan Avenue, Makati City',
    city: 'Makati City',
    floorArea: 0,
    lotArea: 650,
    parking: 'Open space',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    isUpdated: false,
    description: 'An exceptional high-density zoning corner lot with clear commercial potential. Outstanding road frontage ideal for multi-story mixed-use retail or boutique hotel developments.'
  },
  {
    id: 'list-6',
    title: 'Corporate Executive HQ',
    type: 'For Lease',
    category: 'OFFICE SPACE',
    price: 150000,
    pricePeriod: 'mo',
    location: '5th Avenue, Bonifacio Global City',
    city: 'Taguig City',
    floorArea: 410,
    lotArea: 'N/A',
    floor: '24F',
    parking: '4 slots',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
    isUpdated: true,
    description: 'Pre-fitted Grade-A office area designed to elevate enterprise output. High-speed executive boardrooms, elegant staff lounges, and an exclusive panoramic corner office.'
  },
  {
    id: 'vo-2899',
    title: 'Premier Access Virtual Office',
    type: 'For Lease',
    category: 'VIRTUAL OFFICE SPACE',
    price: 2899,
    pricePeriod: 'mo',
    location: 'Ortigas Center, Pasig City',
    city: 'Pasig City',
    floorArea: 0,
    lotArea: 'N/A',
    parking: 'N/A',
    image: '/images/2,899.png',
    isUpdated: true,
    description: 'Establish a prestigious corporate presence in Ortigas with a prime business address, digital signage display, and flexible coworking access.',
    features: [
      'Prestigious Ortigas Center Business Address',
      'Access to Shared Coworking Space (Once a Month)',
      'Mail & Parcel Receiving & Handling',
      'Company Name Display on Digital Signage',
      'Complimentary High-Speed Internet Access'
    ],
    suitableFor: [
      '🚀 Startups',
      '💻 Freelancers',
      '🌐 Remote Businesses',
      '💼 Consultants'
    ]
  },
  {
    id: 'vo-3499',
    title: 'Premier Prestige Virtual Office',
    type: 'For Lease',
    category: 'VIRTUAL OFFICE SPACE',
    price: 3499,
    pricePeriod: 'mo',
    location: 'Ortigas Center, Pasig City',
    city: 'Pasig City',
    floorArea: 0,
    lotArea: 'N/A',
    parking: 'N/A',
    image: '/images/3,499.png',
    isUpdated: true,
    description: 'Elevate your business image with a complete corporate address setup, admin printing support, and monthly executive boardroom access.',
    features: [
      'Prestigious Ortigas Center Business Address',
      'Access to Shared Coworking Space (Once a Month)',
      'Mail & Parcel Receiving & Handling Services',
      'Company Name Display on Digital Signage',
      'Free Drinking Water & High-Speed Internet',
      'Admin Printing Services (Up to 10 pages)',
      'Use of Executive Boardroom Once (1) a Month'
    ],
    suitableFor: [
      '🏢 SME Enterprises',
      '📊 Professional Firms',
      '💼 Consultants',
      '⚖️ Legal & Financial'
    ]
  },
  {
    id: 'vo-4999',
    title: 'Alpha Premier Executive Virtual Office',
    type: 'For Lease',
    category: 'VIRTUAL OFFICE SPACE',
    price: 4999,
    pricePeriod: 'mo',
    location: 'Ortigas Center, Pasig City',
    city: 'Pasig City',
    floorArea: 0,
    lotArea: 'N/A',
    parking: 'N/A',
    image: '/images/4,999.png',
    isUpdated: true,
    description: 'Top-tier executive corporate virtual office package featuring lobby receptionist greeting, boardroom access, and CEO office suite privileges.',
    features: [
      'Prestigious Ortigas Center Business Address',
      'Front Desk & Lobby Receptionist Access',
      'Mail & Parcel Receiving & Handling Services',
      'Free Drinking Water & High-Speed Internet',
      'Admin Printing Services (Up to 10 pages)',
      'Use of Executive Boardroom (Twice a Month)',
      'Access to CEO Office Suite for Client Contract Signings'
    ],
    suitableFor: [
      '👔 Corporate Executives',
      '📈 Scale-ups',
      '💼 Foreign Corporations',
      '🤝 Executive Consultancies'
    ]
  }
];

export const JOB_OPENINGS: JobOpening[] = [
  {
    id: 'job-1',
    title: 'Senior Real Estate Broker',
    location: 'BGC, Taguig City',
    type: 'Full-Time',
    department: 'Sales & Brokerage',
    description: 'We are seeking an elite, self-driven Senior Real Estate Broker with a proven track record in high-end commercial properties and luxury residential sales in BGC. You will manage high-net-worth client relationships and execute high-value leasing agreements.',
    requirements: [
      'Active PRC Real Estate Broker License is mandatory.',
      'Minimum 5 years of experience in luxury or commercial property markets.',
      'Established high-net-worth network (HNWI) in Metro Manila.',
      'Exceptional negotiation, communication, and client relationship skills.'
    ]
  },
  {
    id: 'job-2',
    title: 'Commercial Leasing Associate',
    location: 'Makati City',
    type: 'Full-Time',
    department: 'Leasing Division',
    description: 'Join our dominant commercial brokerage division. You will oversee leasing portfolios for primary Grade-A office buildings and retail centers in Makati and Ortigas, working alongside major multinational corporate tenants.',
    requirements: [
      'Bachelor’s degree in Business Administration, Real Estate Management, or related field.',
      '2+ years of experience in commercial leasing or corporate sales.',
      'Strong knowledge of lease mechanics, contracts, and financial yields.',
      'Highly professional presentation and verbal articulation.'
    ]
  },
  {
    id: 'job-3',
    title: 'Marketing & Brand Manager',
    location: 'Ortigas, Pasig City',
    type: 'Full-Time',
    department: 'Marketing & PR',
    description: 'Develop and execute high-profile brand strategies and visual campaigns for Alpha Premier Group. You will oversee digital media, luxury property brochures, client events, and press relations to maintain our leading market positioning.',
    requirements: [
      'Proven experience as a Brand Manager or Marketing Lead in luxury sectors.',
      'Deep expertise in digital marketing, search campaigns, and luxury events.',
      'Strong aesthetic eye, with experience managing design agencies and photographers.',
      'Outstanding copywriting and media relation skills.'
    ]
  },
  {
    id: 'job-4',
    title: 'Property Research Analyst',
    location: 'Remote (Philippines)',
    type: 'Full-Time',
    department: 'Research & Advisory',
    description: 'Conduct micro-market feasibility studies, price trend modeling, and write advisory papers for our investment board and HNW client advisory reports.',
    requirements: [
      'Strong quantitative background (Economics, Finance, or Statistics).',
      'Advanced Excel/data modeling skills; SQL or Python knowledge is a plus.',
      'Familiarity with Metro Manila real estate valuation indices.',
      'Excellent written research reporting and analytical skills.'
    ]
  }
];
