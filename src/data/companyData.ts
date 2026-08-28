import { Enterprise, JobPosition, BlogPost } from '../types';

const realtyLogo = '/assets/images/sstcompany-realty.png';
const swiftClearLogo = '/assets/images/sstcompany-swiftclear1.png';
const dynamicTreeLogo = '/assets/images/2. Dynamic Tree.png';
const luxePrimeLogo = '/assets/images/7. LOGO LUXE PRIME-png.png';
const altaVentureLogo = '/assets/images/3. Alta Venture - Logo.png';
const alphaConsLogo = '/assets/images/construction.png';
const prime88Logo = '/assets/images/sstcompany-88prime11.png';

export const COMPANY_INFO = {
  name: 'ALPHA PREMIER GROUP',
  fullName: 'Alpha Premier Group of Companies',
  tagline: 'A diversified conglomerate connecting ambition with opportunity across real estate, construction, and business services.',
  founded: 'EST. 2010 · PASIG CITY, PHILIPPINES',
  address: '12F One Corporate Centre, Julia Vargas Ave., Ortigas Center, Pasig City 1605',
  phone: '(+63 2) 8888-1234',
  email: 'info@alphapremiergroup.com',
  stats: [
    { label: 'PROPERTIES MANAGED', value: '500+' },
    { label: 'YEARS OF EXCELLENCE', value: '15+' },
    { label: 'BUSINESS DIVISIONS', value: '6' },
    { label: 'SATISFIED CLIENTS', value: '1,200+' },
  ]
};

export const PROPERTY_TYPES = [
  { id: 'realty', name: 'Premium Realty', icon: 'Building2', description: 'Exclusive residential & commercial brokerage.' },
  { id: 'condo', name: 'Condominium', icon: 'Building', description: 'High-rise luxury living in CBD locations.' },
  { id: 'investment', name: 'Strategic Investment', icon: 'TrendingUp', description: 'High-yielding real estate portfolios.' },
  { id: 'commercial', name: 'Commercial Space', icon: 'Store', description: 'Retail units, shopping arcades & showrooms.' },
  { id: 'office', name: 'Office Space', icon: 'Briefcase', description: 'Grade A corporate spaces & co-working suites.' },
  { id: 'warehouse', name: 'Warehouse', icon: 'Package', description: 'Industrial parks & logistics hubs.' },
];

export const CORE_VALUES = [
  { name: 'EXCELLENCE', icon: 'Star', description: 'Setting industry standards through meticulous quality and unwavering commitment.' },
  { name: 'PARTNERSHIP', icon: 'Handshake', description: 'Forging collaborative relationships built on mutual trust and growth.' },
  { name: 'INNOVATION', icon: 'Lightbulb', description: 'Embracing modern technology and progressive business solutions.' },
  { name: 'INTEGRITY', icon: 'Shield', description: 'Conducting all operations with total transparency and ethical discipline.' },
  { name: 'LEGACY', icon: 'Columns', description: 'Building enduring value for communities, investors, and future generations.' },
];

export const ENTERPRISES: Enterprise[] = [
  {
    id: 'realty',
    tag: 'REAL ESTATE',
    name: 'Alpha Premier Realty',
    subTitle: 'Cornerstone Property Services',
    description: 'Alpha Premier Realty stands as the cornerstone of the Alpha Premier Group\'s real estate division, providing a full spectrum of property services tailored to meet the diverse needs of today\'s market. Whether you\'re an investor, developer, business owner, or homebuyer, we deliver tailored solutions with a strategic blend of market expertise, innovation, and client-focused service.',
    iconName: 'Building',
    ctaText: 'EXPLORE REALTY SOLUTIONS',
    category: 'real-estate',
    image: realtyLogo,
    highlights: [
      'Commercial & Residential Brokerage',
      'Property & Asset Management',
      'Tenant Representation & Leasing',
      'Investment Feasibility & Valuation'
    ]
  },
  {
    id: 'swift-clear',
    tag: 'FACILITY SERVICES',
    name: 'Swift Clear',
    subTitle: 'Disinfecting & Exterminating Services',
    description: 'Swift Clear Disinfecting & Exterminating Services offers from basic cleaning to general & deep cleaning, pest control and more with intensive hospital grade disinfection and sanitation treatments.',
    iconName: 'ShieldCheck',
    ctaText: 'LEARN MORE',
    category: 'facility',
    image: swiftClearLogo,
    highlights: [
      'Disinfection & Sanitation Treatments',
      'General & Deep Cleaning',
      'Pest Control'
    ]
  },
  {
    id: 'dynamic-tree',
    tag: 'CREATIVE AGENCY & TALENT HUB',
    name: 'Dynamic Tree Multimedia Services',
    subTitle: 'Visual Storytelling & Brand Hub',
    description: 'Dynamic Tree is a full-service creative agency and talent casting hub, focused on multimedia campaigns, visual storytelling, and brand promotions that bring ideas to life—visually, emotionally, and commercially.',
    iconName: 'Film',
    ctaText: 'EXPLORE CREATIVE SERVICES',
    category: 'creative',
    image: dynamicTreeLogo,
    badges: ['CREATIVE AGENCY', 'TALENT CASTING', 'CAMPAIGNS', 'BRANDING']
  },
  {
    id: 'luxe-prime',
    tag: 'LUXURY REAL ESTATE',
    name: 'Luxe Prime Realty',
    subTitle: 'Elevated Living & Prestige Holdings',
    description: 'Luxe Prime Realty combines prestige with practicality to deliver real estate solutions that are both sophisticated and strategic. We redefine the luxury property experience through sophisticated design, strategic expertise, and personalized service—curating elevated living and investment experiences tailored to the discerning few.',
    iconName: 'Sparkles',
    ctaText: 'CURATED LIVING +',
    category: 'real-estate',
    image: luxePrimeLogo,
    highlights: [
      'Penthouse Suites & Private Estates',
      'Bespoke Investment Consulting',
      'Private High-Net-Worth Advisory'
    ]
  },
  {
    id: 'alta-venture',
    tag: 'PROFESSIONAL SOLUTIONS',
    name: 'Alta Venture Outsource',
    subTitle: 'Business Process Outsourcing',
    description: 'Alta Venture is the Group\'s professional solutions hub, empowering entrepreneurs and businesses through comprehensive outsourcing services. We work with startups, scale-ups, and established firms to deliver real solutions to real business challenges.',
    iconName: 'Users',
    ctaText: 'LEARN MORE',
    category: 'outsource',
    image: altaVentureLogo,
    badges: ['STARTUPS', 'SCALE-UPS', 'ESTABLISHED FIRMS']
  },
  {
    id: 'construction',
    tag: 'CONSTRUCTION & DESIGN',
    name: 'Alpha Premier Construction',
    subTitle: 'Architecture & Contracting',
    description: 'We specialize in elegant, modern, functional designs that reflect the sophistication of our clientele. From concept planning to handover, our projects are marked by efficiency, craftsmanship, and accountability.',
    iconName: 'HardHat',
    ctaText: 'VIEW COMPLETED PROJECTS',
    category: 'construction',
    image: alphaConsLogo,
    highlights: [
      'Commercial Fit-Outs & Turnkey Builds',
      'Structural Engineering & Project Management',
      'Architectural Interior Design'
    ]
  },
  {
    id: '88-prime',
    tag: 'CONSUMER GOODS & VIRTUAL OFFICE',
    name: '88 Prime',
    subTitle: 'Virtual Office & Office Essentials',
    description: '88PRIME Consumer Goods Trading is your reliable partner in building professional foundations for emerging businesses. We specialize in providing office essentials, virtual office solutions, and support services tailored for startups and small enterprises.',
    iconName: 'Store',
    ctaText: 'GET IN TOUCH',
    category: 'business',
    image: prime88Logo,
    highlights: [
      'Virtual Office Solutions - Prestigious Ortigas Address',
      'Startups Support - Business registration & workspace setup',
      'Office Essentials - Premium supplies for modern workplaces',
      'Consumer Goods - Curated products for enterprise spaces'
    ]
  }
];

export const OPEN_POSITIONS: JobPosition[] = [
  {
    id: 'job-1',
    title: 'Senior Property Consultant',
    division: 'Real Estate',
    location: 'Ortigas Center, Pasig',
    type: 'FULL-TIME',
    description: 'Drive high-value commercial and luxury residential property sales across Metro Manila CBDs.',
    requirements: [
      'Licensed Real Estate Broker or accredited Salesperson',
      '3+ years experience in corporate or luxury real estate sales',
      'Strong network of corporate tenants and investors',
      'Exceptional negotiation and client presentation skills'
    ],
    responsibilities: [
      'Manage end-to-end lease and sale negotiations for premier property portfolios',
      'Conduct site viewings and present investment reports to corporate clients',
      'Develop strategic pitch proposals for developers and property owners'
    ]
  },
  {
    id: 'job-2',
    title: 'Project Manager – Construction',
    division: 'Construction',
    location: 'Makati City',
    type: 'FULL-TIME',
    description: 'Lead commercial fit-outs and architectural construction projects from blueprint to site turnover.',
    requirements: [
      'Degree in Civil Engineering or Architecture (Licensed)',
      '5+ years experience in commercial fit-out and building construction',
      'Proficient in Primavera P6, MS Project, and AutoCAD',
      'Proven track record of managing multi-million PHP construction budgets'
    ],
    responsibilities: [
      'Oversee site safety, subcontractor scheduling, and materials procurement',
      'Ensure strict quality assurance and adherence to national building codes',
      'Report timeline progress directly to enterprise stakeholders'
    ]
  },
  {
    id: 'job-3',
    title: 'Business Development Officer',
    division: 'Corporate',
    location: 'BGC, Taguig',
    type: 'FULL-TIME',
    description: 'Identify potential joint ventures, strategic partnerships, and corporate acquisition opportunities.',
    requirements: [
      'Bachelor’s Degree in Business Administration, Finance, or Management',
      '2-4 years experience in corporate sales, B2B partnerships, or consulting',
      'Strong financial modeling and market analysis acumen'
    ],
    responsibilities: [
      'Expand Alpha Premier Group’s corporate client base across key industries',
      'Formulate commercial proposals for enterprise BPO and virtual office contracts',
      'Represent the Group in industry events and chambers of commerce'
    ]
  },
  {
    id: 'job-4',
    title: 'Virtual Office Coordinator',
    division: 'Business Hub',
    location: 'Ortigas Center, Pasig',
    type: 'FULL-TIME',
    description: 'Provide concierge, mail management, and client onboarding support for 88 Prime Virtual Office subscribers.',
    requirements: [
      'Experience in hospitality, executive assistance, or business center operations',
      'Strong written and verbal communication skills in English and Filipino',
      'High attention to detail and customer relationship management'
    ],
    responsibilities: [
      'Manage client mail handling, call forwarding, and conference room reservations',
      'Assist new business subscribers with SEC/DTI registration address permits',
      'Deliver premium front-desk concierge experience at One Corporate Centre'
    ]
  },
  {
    id: 'job-5',
    title: 'Leasing Executive',
    division: 'Real Estate',
    location: 'Quezon City',
    type: 'FULL-TIME',
    description: 'Manage commercial office and retail tenant acquisitions for our managed property portfolio.',
    requirements: [
      'Degree in Real Estate Management, Marketing, or Business',
      '2+ years experience in commercial leasing or tenant relations'
    ],
    responsibilities: [
      'Negotiate contract terms and lease renewals with retail & corporate tenants',
      'Maintain high occupancy rates across assigned commercial buildings'
    ]
  },
  {
    id: 'job-6',
    title: 'Customs Broker Associate',
    division: 'Swift Clear',
    location: 'Port Area, Manila',
    type: 'FULL-TIME',
    description: 'Coordinate customs clearance, freight documentation, and specialized logistics for corporate clients.',
    requirements: [
      'Licensed Customs Broker (LCB) preferred or BS Customs Administration graduate',
      'Familiarity with BOC e-Customs systems and tariff regulations'
    ],
    responsibilities: [
      'Process import/export clearance documents and tax assessments',
      'Liaise with Bureau of Customs and port authorities for seamless operations'
    ]
  },
  {
    id: 'job-7',
    title: 'Marketing Specialist',
    division: 'Corporate',
    location: 'Hybrid / Ortigas',
    type: 'FULL-TIME',
    description: 'Execute multi-channel digital marketing campaigns, corporate PR, and brand activations for the conglomerate.',
    requirements: [
      '2+ years in digital marketing, social media strategy, or brand management',
      'Proficiency with Meta Ads Manager, LinkedIn Campaign Manager, and Google Analytics'
    ],
    responsibilities: [
      'Develop content strategies for all 7 Alpha Premier Group subsidiary brands',
      'Analyze campaign performance and lead generation metrics'
    ]
  },
  {
    id: 'job-8',
    title: 'Finance & Accounting Officer',
    division: 'Corporate',
    location: 'Ortigas Center, Pasig',
    type: 'FULL-TIME',
    description: 'Oversee multi-entity financial accounting, BIR compliance, and treasury operations.',
    requirements: [
      'CPA (Certified Public Accountant) license required',
      '3+ years experience in corporate accounting or audit firm',
      'Proficient in SAP or QuickBooks Enterprise'
    ],
    responsibilities: [
      'Prepare consolidated financial statements for Alpha Premier Group entities',
      'Ensure monthly and annual BIR tax filings and statutory compliance'
    ]
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-featured',
    category: 'REAL ESTATE',
    date: 'July 14, 2025',
    title: 'Why Ortigas Center Remains the Top Choice for Corporate Offices in 2025',
    summary: 'As Metro Manila\'s business districts continue to evolve, Ortigas Center retains its edge with superior connectivity, lower lease rates than BGC, and a growing ecosystem of enterprise tenants.',
    content: `Ortigas Center has consistently proven itself as the strategic heart of Metro Manila's commercial real estate landscape. Situated at the crossroads of Pasig, Mandaluyong, and Quezon City, this vibrant Central Business District (CBD) offers an unbeatable combination of central accessibility, cost-efficient Grade A office spaces, and modern infrastructure.

### Strategic Location & Infrastructure Development
With major transit developments such as the Metro Manila Subway Project (MMSP) and the Ortigas-BGC Link Bridge, commuting times between key financial hubs have drastically decreased. Corporate tenants benefit from seamless access for employees residing in northern, eastern, and southern Metro Manila.

### Competitive Lease Rates vs. Value Proposition
While BGC and Makati command premium rental rates exceeding ₱1,200 to ₱1,500 per square meter, Ortigas Center delivers world-class Grade A certified green buildings at rates ranging from ₱750 to ₱1,000 per sq.m. This cost advantage allows growing multinationals, BPOs, and tech enterprises to optimize operational expenditure without sacrificing corporate prestige.

### The Rise of Hybrid & Virtual Office Models
At Alpha Premier Group's flagship headquarters in One Corporate Centre, we have observed a 40% year-over-year surge in demand for hybrid workspace setups and virtual office subscriptions. Emerging enterprises rely on Ortigas Center addresses to establish instant credibility with institutional clients.`,
    readTime: '5 min read',
    author: {
      name: 'Alpha Real Estate Insights Team',
      role: 'Property Research & Analysis'
    },
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    featured: true
  },
  {
    id: 'blog-1',
    category: 'CONSTRUCTION',
    date: 'July 8, 2025',
    title: '5 Key Trends Reshaping Commercial Construction in the Philippines',
    summary: 'From green building certifications to modular construction methods, the Philippine commercial real estate sector is embracing innovation at every level.',
    content: `Commercial construction in the Philippines is undergoing a monumental paradigm shift. Driven by climate resilience demands and technological adoption, developers are re-engineering building standards.

1. **BERDE and LEED Green Certifications**: Sustainability is no longer optional. Modern corporate tenants demand energy-efficient glazing, rainwater harvesting, and solar power integration.
2. **Modular Construction & Prefabrication**: Accelerating project turnover dates by up to 30% while reducing site waste.
3. **Smart Building Automation**: IoT-driven HVAC control and touchless biometric entry systems.
4. **Biophilic Architectural Design**: Incorporating natural light, indoor gardens, and open terrace lounges to boost employee wellness.
5. **Resilient Structural Engineering**: Enhanced seismic damping and flood prevention infrastructure designed for tropical climate demands.`,
    readTime: '4 min read',
    author: {
      name: 'Engr. Mark Villanueva',
      role: 'Head of Construction, Alpha Premier Construction'
    },
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'blog-2',
    category: 'BUSINESS HUB',
    date: 'June 30, 2025',
    title: 'The Rise of Virtual Offices: How SMEs Are Scaling Without the Overhead',
    summary: 'Thousands of Philippine SMEs are adopting virtual office solutions to access premium business addresses and professional services without long-term lease commitments.',
    content: `For emerging startups and expanding firms, cash flow management is paramount. Committing to a traditional 3 to 5-year commercial lease can drain critical seed capital.

Virtual office plans offered by 88 Prime at One Corporate Centre, Pasig City provide businesses with:
- An official SEC and DTI compliant business registration address in Ortigas CBD.
- Dedicated receptionist services for professional call answering and mail handling.
- On-demand access to high-spec boardrooms for client pitches and board meetings.
- Flexible scalability that adapts to team growth.`,
    readTime: '3 min read',
    author: {
      name: 'Patricia Mendoza',
      role: 'Operations Lead, 88 Prime Business Hub'
    },
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'blog-3',
    category: 'LEADERSHIP',
    date: 'June 22, 2025',
    title: 'Alpha Premier Group CEO on Building a Conglomerate Rooted in Trust',
    summary: 'An exclusive interview exploring the founding vision, growth strategy, and long-term legacy that Alpha Premier Group of Companies is building across the Philippines.',
    content: `"When we established Alpha Premier Group in 2010, our goal was clear: to build a diversified business platform where integrity and execution drive long-term value creation," shares our Chief Executive.

Over the past 15 years, Alpha Premier Group has grown from a specialized real estate brokerage into a multi-subsidiary conglomerate spanning construction, facility sanitation, multimedia creative services, and business outsourcing.`,
    readTime: '6 min read',
    author: {
      name: 'Corporate Communications',
      role: 'Alpha Premier Group'
    },
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'blog-4',
    category: 'LOGISTICS',
    date: 'June 15, 2025',
    title: 'Swift Clear Solutions Expands Customs Brokerage Network to Visayas',
    summary: 'Alpha Premier\'s logistics arm officially launches operations in Cebu and Iloilo, strengthening its nationwide coverage and service capacity.',
    content: `Expanding our nationwide operational footprint, Swift Clear Solutions has officially extended its customs brokerage and specialized facility maintenance services into key Visayas hubs including Cebu City and Iloilo.

This strategic expansion supports growing trade corridors between Luzon and Visayas, providing corporate clients with integrated logistics, freight documentation, and facility sanitation solutions under a single reliable banner.`,
    readTime: '4 min read',
    author: {
      name: 'Swift Clear Press Office',
      role: 'Facility Services Division'
    },
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'blog-5',
    category: 'MARKET UPDATE',
    date: 'June 5, 2025',
    title: 'Q2 2025 Philippine Office Market Report: Demand Surges in Key CBDs',
    summary: 'Office leasing activity recorded a 22% quarter-on-quarter increase as multinational corporations and BPO firms expand their Philippine footprint.',
    content: `The Q2 2025 Metro Manila Property Market Report indicates a robust rebound in commercial office space absorption. Key takeaways include:
- BPO and Information Technology sector expansions accounted for 65% of total office space take-up.
- Ortigas Center registered the highest occupancy growth rate among prime Metro Manila CBDs.
- Demand for flexible workspace units and turnkey furnished offices reached an all-time high.`,
    readTime: '5 min read',
    author: {
      name: 'Alpha Research & Analytics',
      role: 'Market Intelligence Unit'
    },
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
  }
];

