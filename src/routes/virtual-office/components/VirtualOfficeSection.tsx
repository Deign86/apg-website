import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { PageBackground } from './PageBackground';
import logoImg from '../assets/logo.png';
import ap2Img from '../assets/images/AP2.JPG';
import pp1Img from '../assets/images/PP1.png';
import pa1Img from '../assets/images/PA1.png';
import boardRoomImg from '../assets/images/boardroom.png';
import workingSpaceImg from '../assets/images/working_space.png';
import privateOfficeImg from '../assets/images/private_office.JPG';
import frontDeskImg from '../assets/images/front_desk.jpg';
import lobbyImg from '../assets/images/lobby.jpg';
import kitchenPantryImg from '../assets/images/kitchen_pantry.jpg';
import stockroomImg from '../assets/images/stockroom.jpg';
import { 
  Building2, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  Users, 
  Lock, 
  Coffee, 
  FileCheck2, 
  Calculator, 
  Calendar,
  X,
  Send,
  MonitorCheck,
  Laptop,
  Package,
  Layers,
  Sparkles,
  Clock,
  TrendingUp,
  Shield,
  Building,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export interface VirtualOfficePlan {
  id: string;
  category: string;
  name: string;
  badge?: string;
  image: string;
  imageAlt: string;
  monthlyPrice: number;
  idealFor?: string;
  highlighted?: boolean;
  packageInclusions: string[];
}

const PLANS: VirtualOfficePlan[] = [
  {
    id: 'premier-access',
    category: 'VIRTUAL OFFICE',
    name: 'PREMIER ACCESS',
    badge: 'Starter',
    image: pa1Img,
    imageAlt: 'Premier Access - Shared Coworking Space at Unit 3104',
    monthlyPrice: 2899,
    idealFor: 'Ideal for startups, freelancers & remote businesses',
    packageInclusions: [
      'Use of Prestigious Business Address',
      'Access to Shared Coworking Space (once per month)',
      'Mail Receiving & Handling',
      'Company Name Display on Digital Signage',
      'Complimentary Internet Access (during coworking use)'
    ]
  },
  {
    id: 'premier-prestige',
    category: 'VIRTUAL OFFICE',
    name: 'PREMIER PRESTIGE',
    badge: 'Most Popular',
    highlighted: true,
    image: pp1Img,
    imageAlt: 'Premier Prestige - Executive Board Room at Alpha Premier Unit 3104',
    monthlyPrice: 3499,
    idealFor: 'Ideal for growing SMEs & professional consultancies',
    packageInclusions: [
      'Use of Prestigious Business Address',
      'Access to Shared Coworking Space (once per month)',
      'Handling Mail',
      'Company Name Displayed on Digital Signage',
      'Complimentary Internet Access',
      'Free Water',
      'Access to Admin Printing Services (10 pages)',
      'Use of Board Room Once (1) a Month'
    ]
  },
  {
    id: 'alpha-premier',
    category: 'VIRTUAL OFFICE',
    name: 'ALPHA PREMIER',
    badge: 'Executive Suite',
    image: ap2Img,
    imageAlt: 'Alpha Premier - Private CEO Office for Contract Signing at Unit 3104',
    monthlyPrice: 4999,
    idealFor: 'Ideal for corporations & C-level executives',
    packageInclusions: [
      'Use of Prestigious Business Address',
      'Front Desk Reception Access',
      'Mail Receiving & Handling',
      'Complimentary Internet Access',
      'Free Drinking Water',
      'Access to Admin Printing Services (up to 10 pages per month)',
      'Use of Board Room (twice per month)',
      'Access to CEO\'s Office (for contract signing with your client)'
    ]
  }
];

export interface AmenityItem {
  id: 'front-desk' | 'board-room' | 'lobby' | 'working-space' | 'private-office' | 'kitchen-pantry' | 'stockroom';
  label: string;
  badge: string;
  title: string;
  desc: string;
  inclusions: string[];
  footerNote: string;
  image: string;
  imageAlt: string;
  facilityCode: string;
  highlightLabel: string;
  highlightDesc: string;
  planLevel: string;
  icon: any;
}

const AMENITY_DETAILS: AmenityItem[] = [
  {
    id: 'front-desk',
    label: 'Front Desk',
    badge: 'On-Site Reception • Mon–Fri 8AM–5PM',
    title: 'Front Desk Reception',
    desc: 'Professional receptionists greeting your walk-in guests, logging official deliveries, and coordinating on-site visits.',
    inclusions: [
      'Executive client greeting',
      'Mail & parcel logging',
      'Digital company directory',
      'On-site concierge assistance'
    ],
    footerNote: 'Included in Alpha Premier; digital signage in all plans.',
    image: frontDeskImg,
    imageAlt: 'Front Desk Reception and Digital Signage Display at Tektite East Tower Unit 3104',
    facilityCode: 'TK-FD3104',
    highlightLabel: 'Digital Directory Display',
    highlightDesc: 'Displays your company name on reception screens for arriving visitors.',
    planLevel: 'Front Desk & Reception Concierge',
    icon: Building2
  },
  {
    id: 'board-room',
    label: 'Board Room',
    badge: 'Premier Prestige (1x/mo) • Alpha Premier (2x/mo)',
    title: 'Executive Board Room',
    desc: 'Equipped executive conference room for high-stakes investor meetings, board presentations, and hybrid team pitches.',
    inclusions: [
      '4K wireless casting display',
      'Enterprise fiber internet',
      'Ergonomic 12-seat table',
      'Complimentary drinking water'
    ],
    footerNote: 'Advance booking coordination through front desk.',
    image: boardRoomImg,
    imageAlt: 'Executive Board Room at Alpha Premier Unit 3104',
    facilityCode: 'TK-BR3104',
    highlightLabel: 'Executive Pitch Suite',
    highlightDesc: 'Equipped for investor presentations, board meetings, and strategy reviews.',
    planLevel: 'Executive Boardroom Suite',
    icon: Users
  },
  {
    id: 'lobby',
    label: 'Lobby',
    badge: 'Corporate Guest Arrival • Unit 3104',
    title: 'Commercial Reception Lobby',
    desc: 'Air-conditioned commercial greeting lounge with high ceilings on the 31st floor of Tektite East Tower.',
    inclusions: [
      'High-speed elevator access',
      'Executive waiting lounge',
      '24/7 building security',
      'Bank & BIR inspection ready'
    ],
    footerNote: 'Available to all package holders and registered visitors.',
    image: lobbyImg,
    imageAlt: 'Commercial Reception Lobby at Philippine Stock Exchange Centre Tektite East Tower',
    facilityCode: 'TK-LB3104',
    highlightLabel: '31st Floor Guest Arrival',
    highlightDesc: 'Authoritative corporate entrance for clients, bankers, and government assessors.',
    planLevel: 'Grade-A Corporate Arrival',
    icon: Layers
  },
  {
    id: 'working-space',
    label: 'Working Space',
    badge: 'Included Monthly in Premier Access & Prestige',
    title: 'Shared Coworking Space',
    desc: 'Quiet, air-conditioned shared workstations with high-speed fiber internet and power ports for productive work.',
    inclusions: [
      'Ultra-fast fiber Wi-Fi',
      'Ergonomic desk stations',
      'Dedicated charging outlets',
      'Quiet professional floor'
    ],
    footerNote: 'Book your monthly work session via front desk admin.',
    image: workingSpaceImg,
    imageAlt: 'Premier Shared Coworking Space at Unit 3104',
    facilityCode: 'TK-CW3104',
    highlightLabel: 'Executive Coworking',
    highlightDesc: 'High-speed fiber connectivity and ergonomic seating for work sessions.',
    planLevel: 'Enterprise Coworking Area',
    icon: Laptop
  },
  {
    id: 'private-office',
    label: 'Private Office',
    badge: 'Alpha Premier Exclusive • Contract Signing Privileges',
    title: "Private Office / CEO's Office",
    desc: 'Private CEO suite designed for signing high-value partnerships, closing corporate deals, and executive consultations.',
    inclusions: [
      'Soundproof signing suite',
      'Executive leather furnishings',
      'Ortigas skyline views',
      'Confidential deal closure'
    ],
    footerNote: 'Scheduled by reservation through account manager.',
    image: privateOfficeImg,
    imageAlt: "Alpha Premier Private Executive Office for Corporate Contract Signing",
    facilityCode: 'TK-CEO3104',
    highlightLabel: 'CEO Contract Signing',
    highlightDesc: 'Private executive environment for closing major business contracts.',
    planLevel: 'Alpha Premier Exclusive',
    icon: Lock
  },
  {
    id: 'kitchen-pantry',
    label: 'Kitchen & Pantry',
    badge: 'Complimentary Refreshment Station • Unit 3104',
    title: 'Kitchen & Executive Pantry',
    desc: 'Clean, fully stocked executive pantry providing complimentary drinking water, coffee facilities, and microwave amenities.',
    inclusions: [
      'Unlimited filtered water',
      'Coffee & tea station',
      'Microwave & refrigerator',
      'Daily sanitized facilities'
    ],
    footerNote: 'Complimentary for all members during scheduled sessions.',
    image: kitchenPantryImg,
    imageAlt: 'Executive Kitchen and Refreshment Pantry at Tektite East Tower Unit 3104',
    facilityCode: 'TK-KP3104',
    highlightLabel: 'Executive Pantry Bar',
    highlightDesc: 'Complimentary refreshments and sanitized amenities during your visit.',
    planLevel: 'Executive Pantry & Refreshments',
    icon: Coffee
  },
  {
    id: 'stockroom',
    label: 'Stockroom',
    badge: 'Secure Logistics & Archiving',
    title: 'Secure Storage & Mailroom',
    desc: 'Climate-controlled, access-restricted logistics room for official mail, parcels, and stored business documents.',
    inclusions: [
      'Locked parcel lockers',
      'Dedicated shelving bays',
      'CCTV-monitored security',
      'Courier dispatch & intake'
    ],
    footerNote: 'Standard parcel holding included; dedicated bays optional.',
    image: stockroomImg,
    imageAlt: 'Secure Document Stockroom and Mail Holding Facility at Tektite East Tower Unit 3104',
    facilityCode: 'TK-SR3104',
    highlightLabel: 'Tracked Logistics & Mail',
    highlightDesc: 'Real-time notifications for incoming deliveries with signature logging.',
    planLevel: 'Secure Logistics & Archiving',
    icon: Package
  }
];

export const VirtualOfficeSection: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<VirtualOfficePlan>(PLANS[1]);
  const [hoveredPlanId, setHoveredPlanId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAmenityTab, setActiveAmenityTab] = useState<
    'front-desk' | 'board-room' | 'lobby' | 'working-space' | 'private-office' | 'kitchen-pantry' | 'stockroom'
  >('stockroom');

  const navScrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const currentIndex = AMENITY_DETAILS.findIndex((a) => a.id === activeAmenityTab);
  const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentAmenity = AMENITY_DETAILS[safeCurrentIndex];

  const handlePrevAmenity = () => {
    const prevIdx = (safeCurrentIndex - 1 + AMENITY_DETAILS.length) % AMENITY_DETAILS.length;
    setActiveAmenityTab(AMENITY_DETAILS[prevIdx].id);
  };

  const handleNextAmenity = () => {
    const nextIdx = (safeCurrentIndex + 1) % AMENITY_DETAILS.length;
    setActiveAmenityTab(AMENITY_DETAILS[nextIdx].id);
  };

  useEffect(() => {
    const activeEl = tabRefs.current[activeAmenityTab];
    if (activeEl && navScrollRef.current) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeAmenityTab]);

  // Calculator states
  const [teamSize, setTeamSize] = useState<number>(5);
  const traditionalCost = (teamSize * 7500) + (teamSize * 2200) + 24000;
  const currentPlanCost = selectedPlan.monthlyPrice;
  const savingsMonthly = traditionalCost - currentPlanCost;

  // Form submission state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    bookTour: true
  });

  const handleOpenPlan = (plan: VirtualOfficePlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <section className="relative w-full bg-transparent text-white pt-8 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 font-sans selection:bg-black selection:text-[#f7e7a9] overflow-hidden">
      {/* Interactive Glassmorphic Tri-Tone Background (Continuously moving even without hover) */}
      <PageBackground />

      {/* Seamless Atmospheric Gradient Blend into Virtual Office (No straight lines, pure organic gradient dissolve) */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center pt-4 pb-12 pointer-events-none" aria-hidden="true">
        {/* Soft radial golden mist aura bridging the sections */}
        <div className="w-[600px] sm:w-[900px] h-36 bg-gradient-to-b from-[#d4af37]/25 via-[#f7e7a9]/10 to-transparent rounded-full blur-[70px]" />
        {/* Soft pearl light bleed */}
        <div className="w-[350px] sm:w-[550px] h-20 bg-gradient-to-b from-white/20 via-white/05 to-transparent rounded-full blur-[50px] -mt-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-16 sm:space-y-24">
        
        {/* =========================================================
            1. SECTION HERO & COMMERCIAL HUB OVERVIEW (Black Glassmorphism with Gold Accents)
           ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl sm:rounded-3xl border border-white/20 bg-black/60 backdrop-blur-2xl backdrop-saturate-150 text-white p-5 sm:p-10 lg:p-14 shadow-[0_30px_70px_rgba(0,0,0,0.85)] overflow-hidden [box-shadow:inset_0_1.5px_2px_rgba(255,255,255,0.25),_inset_0_0_30px_rgba(255,255,255,0.02)]"
        >
          {/* Subtle Top Specular Glass Sheen */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
          
          {/* Subtle Ambient Gold Radial Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/10 blur-[130px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#d4af37]/05 blur-[100px] pointer-events-none rounded-full" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Core Value Proposition, Benefits & Actions */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-[#d4af37]">
                <ShieldCheck className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>Executive Virtual Office Solutions</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] text-balance">
                Corporate Business Registration &amp; Executive Presence
              </h2>

              <p className="text-xs sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
                Establish an authoritative commercial address in Metro Manila's premier financial district. Fully compliant with SEC, BIR RDO 043, and Pasig City LGU, paired with executive boardroom and CEO suite privileges.
              </p>

              {/* Fast Trust Indicators with Gold Accents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-zinc-300">
                {[
                  '100% SEC, DTI & BIR Form 2303 Compliant',
                  'Same-Day Notarized Contract Release',
                  'Front Desk Reception & Mail Receiving',
                  "Board Room & Access to CEO's Office"
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.15 + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons with Gold Accents */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href="#pricing-plans"
                  className="w-full sm:w-auto text-center px-6 py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e8c558] to-[#c59b27] hover:brightness-110 text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#d4af37]/25 transition-all cursor-pointer whitespace-nowrap"
                >
                  View Packages from PHP 2,899
                </a>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto text-center px-5 py-3.5 sm:py-3 rounded-xl border border-[#d4af37]/40 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Book Tektite Site Visit</span>
                </button>
              </div>
            </div>

            {/* Right Column: Commercial Hub Details with Black Glassmorphism */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 w-full"
            >
              <div className="rounded-2xl border border-white/20 bg-black/55 backdrop-blur-xl p-4 sm:p-6 space-y-4 shadow-xl [box-shadow:inset_0_1px_1px_rgba(255,255,255,0.18)]">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Commercial Hub Details
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#d4af37] bg-[#d4af37]/15 px-2 py-0.5 rounded border border-[#d4af37]/35">
                    Unit 3104 Active
                  </span>
                </div>

                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="flex flex-col sm:flex-row sm:justify-between py-1.5 sm:py-1 border-b border-white/5 gap-0.5 sm:gap-2">
                    <span className="text-zinc-400">Building:</span>
                    <span className="font-semibold text-white sm:text-right">Philippine Stock Exchange Centre</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-1.5 sm:py-1 border-b border-white/5 gap-0.5 sm:gap-2">
                    <span className="text-zinc-400">Tower &amp; Unit:</span>
                    <span className="font-mono text-[#d4af37] font-semibold sm:text-right">Tektite East Tower, Unit 3104</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-1.5 sm:py-1 border-b border-white/5 gap-0.5 sm:gap-2">
                    <span className="text-zinc-400">Street Address:</span>
                    <span className="text-zinc-200 sm:text-right">Exchange Road, Ortigas Center</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-1.5 sm:py-1 border-b border-white/5 gap-0.5 sm:gap-2">
                    <span className="text-zinc-400">Barangay &amp; City:</span>
                    <span className="text-zinc-200 sm:text-right">San Antonio, Pasig City</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-1.5 sm:py-1 border-b border-white/5 gap-0.5 sm:gap-2">
                    <span className="text-zinc-400">BIR Tax District:</span>
                    <span className="text-zinc-200 sm:text-right">Revenue District Office (RDO 043)</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-1.5 sm:py-1 border-b border-white/5 gap-0.5 sm:gap-2">
                    <span className="text-zinc-400">Office Hours:</span>
                    <span className="text-white font-medium sm:text-right">Monday – Friday, 8:00 AM – 5:00 PM</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-1.5 sm:py-1 border-b border-white/5 gap-0.5 sm:gap-2">
                    <span className="text-zinc-400">Walk-in Inquiries:</span>
                    <span className="text-[#d4af37] font-medium sm:text-right">Welcome &bull; On-site Staff on Duty</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-1.5 sm:py-1 gap-0.5 sm:gap-2">
                    <span className="text-zinc-400">Turnaround Time:</span>
                    <span className="text-white font-medium sm:text-right">Within 24 Hours</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-zinc-400 border-t border-white/10 flex items-center justify-between">
                  <span>Part of Alpha Premier Group</span>
                  <button
                    onClick={() => handleOpenPlan(PLANS[1])}
                    className="text-[#d4af37] font-semibold hover:text-[#f7e7a9] underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    Quick Reserve &rarr;
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* =========================================================
            2. VIRTUAL OFFICE PRICING PACKAGES (On Gold Canvas)
           ========================================================= */}
        <motion.div
          id="pricing-plans"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative space-y-8"
        >
          {/* Header Typography with Gold Accent & High Contrast over Tri-Tone Canvas */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d4af37] bg-black/85 backdrop-blur-md px-4 py-1.5 rounded-full shadow-xl border border-[#d4af37]/45">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Official Virtual Office Packages</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight text-balance drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
              Transparent Workspace Packages Built to Scale
            </h2>
            <p className="text-xs sm:text-sm text-zinc-200 font-medium max-w-xl mx-auto leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Straightforward monthly rates with zero hidden fees. Select the package that fits your corporate registration and executive workspace needs.
            </p>
          </div>

          {/* Pricing Cards Grid with Rich Gold Accents & Dynamic Hover */}
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-6 sm:pt-8"
            onMouseLeave={() => setHoveredPlanId(null)}
          >
            {PLANS.map((plan, planIdx) => {
              // Active spotlight: whichever card is hovered; defaults to Most Popular (Premier Prestige) when idle
              const isCardActive = hoveredPlanId !== null ? hoveredPlanId === plan.id : Boolean(plan.highlighted);

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: planIdx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  onMouseEnter={() => setHoveredPlanId(plan.id)}
                  onClick={() => handleOpenPlan(plan)}
                  className={`group relative flex flex-col justify-between rounded-2xl transition-all duration-300 ease-out cursor-pointer backdrop-blur-2xl backdrop-saturate-150 md:[&:nth-child(3)]:col-span-2 lg:[&:nth-child(3)]:col-span-1 md:[&:nth-child(3)]:max-w-md md:[&:nth-child(3)]:mx-auto md:[&:nth-child(3)]:w-full lg:[&:nth-child(3)]:max-w-none ${
                    isCardActive
                      ? 'border-2 border-[#d4af37] bg-black/70 text-white shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(212,175,55,0.3)] ring-1 ring-[#d4af37]/60 -translate-y-2 [box-shadow:inset_0_1.5px_2px_rgba(255,255,255,0.35),_inset_0_0_25px_rgba(212,175,55,0.08)]'
                      : 'border border-white/20 bg-black/55 text-white shadow-[0_20px_50px_rgba(0,0,0,0.75)] hover:border-[#d4af37]/70 hover:bg-black/65 hover:-translate-y-1.5 [box-shadow:inset_0_1px_1.5px_rgba(255,255,255,0.2)]'
                  }`}
                >
                  {/* Frosted Glass Specular Sheen Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.09] via-transparent to-transparent pointer-events-none rounded-2xl" />
                  
                  {/* Floating Badge: Centered and positioned slightly outside the box (medyo labas sa box) */}
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                      <span
                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest font-mono whitespace-nowrap shadow-2xl transition-all duration-300 ${
                          isCardActive
                            ? 'bg-gradient-to-r from-[#d4af37] via-[#f7e7a9] to-[#c59b27] text-black font-extrabold shadow-xl scale-105 ring-1 ring-[#d4af37]'
                            : 'bg-black/90 text-[#d4af37] border border-[#d4af37]/50 backdrop-blur-md shadow-xl scale-100'
                        }`}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}

                   {/* 1. Title with Gold Accent */}
                  <div className="p-5 sm:p-7 pt-7 pb-4">
                    <div className="mb-2 min-h-[64px]">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37] font-mono block mb-1">
                        {plan.category}
                      </span>
                      <h3 className={`text-xl sm:text-2xl font-extrabold tracking-tight transition-colors duration-300 ${
                        isCardActive ? 'text-[#f7e7a9]' : 'text-white'
                      }`}>
                        {plan.name}
                      </h3>
                    </div>

                    {/* 2. Ideal for */}
                    {plan.idealFor && (
                      <p className="text-xs text-zinc-400 italic truncate">
                        {plan.idealFor}
                      </p>
                    )}
                  </div>

                  {/* 3. Picture */}
                  <div className={`relative w-full h-44 sm:h-52 overflow-hidden border-y transition-colors duration-300 bg-black ${
                    isCardActive ? 'border-[#d4af37]/50' : 'border-white/15'
                  }`}>
                    <img
                      src={plan.image}
                      alt={plan.imageAlt}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out brightness-95 ${
                        isCardActive ? 'scale-105' : 'group-hover:scale-102'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                  </div>

                  {/* 4. Price & 5. Inclusions with Gold Accents */}
                  <div className="p-5 sm:p-7 pt-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Price - PHP Format */}
                      <div className="mb-5 sm:mb-6 pb-4 sm:pb-5 border-b border-white/10 transition-colors">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-[#d4af37] tracking-wider">PHP</span>
                          <span className="font-mono text-3xl sm:text-5xl font-extrabold text-white tabular-nums tracking-tight">
                            {plan.monthlyPrice.toLocaleString()}
                          </span>
                          <span className="text-xs text-zinc-400 font-medium">/ month</span>
                        </div>
                      </div>

                      {/* Package Inclusions */}
                      <div className="space-y-3 mb-6 sm:mb-8">
                        <span className="text-[11px] uppercase font-bold tracking-wider text-[#d4af37] block">
                          Package Inclusions:
                        </span>
                        <ul className="space-y-2.5 text-xs text-zinc-200">
                          {plan.packageInclusions.map((inclusion, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-300 ${
                                isCardActive 
                                  ? 'bg-[#d4af37] text-black font-bold shadow-sm shadow-[#d4af37]/30' 
                                  : 'bg-white/10 text-[#d4af37] border border-[#d4af37]/20'
                              }`}>
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                              <span className="leading-tight text-zinc-200 font-normal">{inclusion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Plan CTA Button */}
                    <div className="pt-4 border-t border-white/10 mt-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPlan(plan);
                        }}
                        className={`w-full py-3.5 sm:py-3 px-4 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                          isCardActive
                            ? 'bg-gradient-to-r from-[#d4af37] via-[#e8c558] to-[#c59b27] hover:brightness-110 text-black font-bold shadow-lg shadow-[#d4af37]/25 ring-1 ring-[#d4af37]/40'
                            : 'bg-white text-black hover:bg-[#d4af37] hover:text-black font-bold'
                        }`}
                      >
                        <span>Choose {plan.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-[10px] text-center text-zinc-400 mt-2">
                        Includes notarized commercial lease & consent form
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* =========================================================
            3. PHYSICAL AMENITIES SHOWCASE: Editorial Architectural Observation Suite
           ========================================================= */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative space-y-6 pt-4"
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
            <div className="space-y-1.5 text-left">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Tektite Hub Physical Facilities
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                Inspect the actual on-site facilities at Unit 3104 Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 text-zinc-300 text-xs font-medium backdrop-blur-md shrink-0 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
              <span>Ortigas Center &bull; 31st Floor</span>
            </div>
          </div>

          {/* Section-level Carousel Chassis with Outer Side Navigation Arrows */}
          <div className="relative">
            {/* Outer Left Arrow - Side of the Whole Section */}
            <button
              type="button"
              onClick={handlePrevAmenity}
              aria-label="Previous facility"
              className="absolute -left-2 sm:-left-5 lg:-left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#0d0f14]/90 hover:bg-[#d4af37] text-zinc-300 hover:text-black border border-white/20 hover:border-[#d4af37] shadow-[0_10px_30px_rgba(0,0,0,0.85)] backdrop-blur-xl flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer group"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-translate-x-0.5" />
            </button>

            {/* Outer Right Arrow - Side of the Whole Section */}
            <button
              type="button"
              onClick={handleNextAmenity}
              aria-label="Next facility"
              className="absolute -right-2 sm:-right-5 lg:-right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#0d0f14]/90 hover:bg-[#d4af37] text-zinc-300 hover:text-black border border-white/20 hover:border-[#d4af37] shadow-[0_10px_30px_rgba(0,0,0,0.85)] backdrop-blur-xl flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer group"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Unified Showcase Chassis Card */}
            <div className="rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0e1015]/90 backdrop-blur-2xl p-4 sm:p-6 lg:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.85)] [box-shadow:inset_0_1.5px_2px_rgba(255,255,255,0.15)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                {/* Left: Facility Visual Column (5 Cols) */}
                <motion.div
                  initial={{ opacity: 0, x: -25 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/11] lg:aspect-auto lg:h-full min-h-[340px] sm:min-h-[460px] bg-black border border-white/10 group flex flex-col justify-between"
                >
                  <img
                    key={currentAmenity.id}
                    src={currentAmenity.image}
                    alt={currentAmenity.imageAlt}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700 ease-out brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none" />

                  {/* Top badges */}
                  <div className="relative z-10 p-3.5 sm:p-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono font-semibold text-zinc-300">
                      UNIT 3104 &bull; 31F
                    </span>
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono font-bold text-[#d4af37]">
                      {safeCurrentIndex + 1} / {AMENITY_DETAILS.length}
                    </span>
                  </div>

                  {/* Bottom floating card overlay */}
                  <div className="relative z-10 m-3 sm:m-4 p-3.5 sm:p-4 rounded-xl bg-black/80 backdrop-blur-xl border border-white/15 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center shrink-0 text-[#d4af37]">
                      <currentAmenity.icon className="w-5 h-5 text-[#d4af37]" />
                    </div>
                    <div className="text-left min-w-0">
                      <h5 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                        {currentAmenity.highlightLabel}
                      </h5>
                      <p className="text-[11px] sm:text-xs text-zinc-300 mt-0.5 line-clamp-2 leading-relaxed">
                        {currentAmenity.highlightDesc}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Right: Amenities Nav & Architectural Specs (7 Cols) */}
                <motion.div
                  initial={{ opacity: 0, x: 25 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="lg:col-span-7 flex flex-col justify-between gap-6"
                >
                  {/* 1. Amenities Navigation Bar */}
                  <div className="w-full pb-2 border-b border-white/10">
                    <div
                      ref={navScrollRef}
                      className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth py-1"
                    >
                      {AMENITY_DETAILS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeAmenityTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            ref={(el) => { tabRefs.current[tab.id] = el; }}
                            onClick={() => setActiveAmenityTab(tab.id)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                              isActive
                                ? 'bg-[#d4af37] text-black font-extrabold shadow-md shadow-[#d4af37]/25 scale-[1.02]'
                                : 'bg-zinc-900/70 text-zinc-300 hover:text-white hover:bg-zinc-800/80 border border-white/5'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Architectural Spec & Inclusions Content */}
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                        <span className="font-mono text-xs uppercase tracking-widest text-[#d4af37] font-bold">
                          ARCHITECTURAL SPEC
                        </span>
                      </div>
                      <span className="text-xs font-medium text-zinc-300 bg-zinc-800/80 border border-zinc-700/60 px-3 py-1 rounded-full whitespace-nowrap">
                        {currentAmenity.planLevel}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {currentAmenity.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                        {currentAmenity.desc}
                      </p>
                    </div>

                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                        VERIFIED INFRASTRUCTURE INCLUSIONS:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        {currentAmenity.inclusions.map((inc, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                            className="p-3 sm:p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-3 text-xs text-zinc-200"
                          >
                            <div className="w-4 h-4 rounded-full border border-[#d4af37]/70 text-[#d4af37] flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span className="leading-snug">{inc}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. Bottom Scope / Policy & CTA */}
                  <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-left space-y-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                        POLICY / SCOPE
                      </span>
                      <span className="text-xs font-semibold text-[#d4af37] block">
                        {currentAmenity.footerNote}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="px-6 py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f7e7a9] to-[#c59b27] hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_8px_25px_rgba(212,175,55,0.4)] hover:shadow-[0_12px_32px_rgba(212,175,55,0.6)] hover:scale-[1.02] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
                    >
                      <Building2 className="w-4 h-4 text-black" />
                      <span>SCHEDULE WALKTHROUGH</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* =========================================================
            4. PHILIPPINE REGULATORY PROCESS: Open Chronological Stepped Conduit Pipeline
           ========================================================= */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative space-y-6 pt-6"
        >
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-2 px-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-[#d4af37]/40 backdrop-blur-xl">
              <FileCheck2 className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#d4af37]">Philippine Regulatory Compliance Pipeline</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              From Registration to Full Legal Operation
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">
              All virtual office packages furnish the notarized commercial lease and lessor consent required by Philippine statutory agencies.
            </p>
          </div>

          {/* Stepped Conduit Pipeline Track with Geometric Pods */}
          <div className="relative">
            {/* Glowing Interconnected Conduit Line (desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-[#d4af37]/10 via-[#d4af37]/50 to-[#d4af37]/10 -translate-y-6 z-0 pointer-events-none" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
              {[
                {
                  step: '01',
                  agency: 'SEC / DTI',
                  title: 'Corporate Incorporation',
                  desc: 'Use the official Tektite East Tower lease agreement and consent document to register company articles with SEC or business name with DTI.',
                  badge: 'Notarized Contract',
                  cornerShape: 'rounded-tl-2xl sm:rounded-tl-3xl rounded-br-2xl sm:rounded-br-3xl rounded-tr-xl rounded-bl-xl',
                  accentBorder: 'border-white/20 hover:border-[#d4af37]/70',
                  icon: FileText
                },
                {
                  step: '02',
                  agency: 'Pasig City LGU',
                  title: 'Barangay & Mayors Permit',
                  desc: 'Pass local zoning seamlessly. Unit 3104 is located in an established Grade-A commercial building zoned for corporate enterprises.',
                  badge: 'Zoning & Clearance',
                  cornerShape: 'rounded-tr-2xl sm:rounded-tr-3xl rounded-bl-2xl sm:rounded-bl-3xl rounded-tl-xl rounded-br-xl',
                  accentBorder: 'border-white/20 hover:border-[#d4af37]/70',
                  icon: Building
                },
                {
                  step: '03',
                  agency: 'BIR RDO 043',
                  title: 'Form 2303 & Receipts',
                  desc: 'Register under Revenue District Office 043 (Pasig). Receive official business registration and authority to print invoices.',
                  badge: 'Tax District 043',
                  cornerShape: 'rounded-bl-2xl sm:rounded-bl-3xl rounded-tr-2xl sm:rounded-tr-3xl rounded-tl-xl rounded-br-xl',
                  accentBorder: 'border-white/20 hover:border-[#d4af37]/70',
                  icon: Shield
                },
                {
                  step: '04',
                  agency: 'Universal Banks',
                  title: 'Corporate Bank Account',
                  desc: 'BDO, BPI, Metrobank, and Security Bank routinely verify and clear accounts registered at Philippine Stock Exchange Centre.',
                  badge: 'Bank KYB Verified',
                  cornerShape: 'rounded-br-2xl sm:rounded-br-3xl rounded-tl-2xl sm:rounded-tl-3xl rounded-tr-xl rounded-bl-xl',
                  accentBorder: 'border-white/20 hover:border-[#d4af37]/70',
                  icon: Check
                }
              ].map((item) => {
                const StepIcon = item.icon;
                return (
                  <div
                    key={item.step}
                    className={`relative ${item.cornerShape} ${item.accentBorder} bg-black/65 backdrop-blur-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] group [box-shadow:inset_0_1.5px_2px_rgba(255,255,255,0.2)]`}
                  >
                    {/* Top Step Emblem Header */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f7e7a9] to-[#c59b27]">
                            {item.step}
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            {item.agency}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/35 flex items-center justify-center text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-black transition-colors">
                          <StepIcon className="w-4 h-4" />
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-white mb-2 group-hover:text-[#d4af37] transition-colors text-left">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-300 leading-relaxed text-left">
                        {item.desc}
                      </p>
                    </div>

                    {/* Bottom Proof Stamp */}
                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#d4af37] font-semibold bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/30">
                        {item.badge}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <Sparkles className="w-3 h-3 text-[#d4af37]" />
                        <span>Included</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* =========================================================
            5. OVERHEAD COMPARISON: Executive Financial Cockpit & Radial Savings Dial
           ========================================================= */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl sm:rounded-3xl border border-[#d4af37]/30 bg-gradient-to-b from-black/85 via-black/75 to-black/90 backdrop-blur-2xl p-5 sm:p-9 shadow-[0_30px_70px_rgba(0,0,0,0.85)] overflow-hidden [box-shadow:inset_0_1.5px_2px_rgba(255,255,255,0.25)]"
        >
          {/* Ambient Corner Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Console: Controls & Presets (7 cols) */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-[#d4af37]/40 backdrop-blur-xl">
                <Calculator className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#d4af37]">Financial Optimization Simulator</span>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Overhead Comparison Cockpit
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
                  Compare traditional physical commercial leasing in Ortigas CBD against our compliant Virtual Office infrastructure.
                </p>
              </div>

              {/* Quick Select Preset Buttons */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Quick Scale Presets:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Solo Founder', size: 1 },
                    { label: 'Core Team (5)', size: 5 },
                    { label: 'Growth Hub (10)', size: 10 },
                    { label: 'Enterprise (20)', size: 20 },
                  ].map((preset) => (
                    <button
                      key={preset.size}
                      onClick={() => setTeamSize(preset.size)}
                      className={`px-3 py-2.5 sm:py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[40px] flex items-center justify-center ${
                        teamSize === preset.size
                          ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#d4af37] font-bold shadow-sm'
                          : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fine-Tuning Slider Bar */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/15 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-medium">Custom Simulated Team Size:</span>
                  <span className="font-mono text-base font-extrabold text-[#d4af37]">
                    {teamSize} {teamSize === 1 ? 'Desk' : 'Desks'} / Members
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full accent-[#d4af37] bg-zinc-800 h-2.5 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>1 desk (Solo)</span>
                  <span>10 desks</span>
                  <span>20 desks (Enterprise)</span>
                </div>
              </div>

              {/* Cost Factors Tag Row */}
              <div className="flex flex-wrap gap-2 text-[10px] text-zinc-400">
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">Rent &plus; Escalation: ~PHP 7,500/seat</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">Utilities &amp; Dues: ~PHP 2,200/seat</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">Reception &amp; Security: PHP 24,000/mo</span>
              </div>
            </div>

            {/* Right Console: Radial Savings Dial & Capital Retained Readout (5 cols) */}
            <div className="lg:col-span-5 relative w-full">
              <div className="rounded-2xl sm:rounded-3xl border border-white/20 bg-black/80 backdrop-blur-2xl p-5 sm:p-7 space-y-6 shadow-2xl [box-shadow:inset_0_1.5px_2px_rgba(255,255,255,0.2)]">
                {/* Radial Gauge & Retained Metric */}
                <div className="flex flex-col sm:flex-row items-center justify-around gap-4 border-b border-white/10 pb-5">
                  {/* Radial Gauge */}
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-zinc-800"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-[#d4af37]"
                        strokeWidth="8"
                        strokeDasharray="264"
                        strokeDashoffset="21"
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-black font-mono text-[#d4af37] leading-none">92%</span>
                      <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-400">SAVINGS</span>
                    </div>
                  </div>

                  <div className="text-center sm:text-left space-y-1">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                      Annual Capital Retained
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f7e7a9] to-[#c59b27] tabular-nums break-words">
                      PHP {(savingsMonthly * 12).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-zinc-300 flex items-center justify-center sm:justify-start gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Reinvest directly in your business</span>
                    </div>
                  </div>
                </div>

                {/* Direct Monthly Comparison Readout */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-white/[0.02] border border-white/10">
                    <span className="text-zinc-400">Physical Ortigas Lease:</span>
                    <span className="font-mono text-white font-bold">
                      ~PHP {traditionalCost.toLocaleString()} / mo
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/40">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span className="text-[#d4af37] font-bold">{selectedPlan.name}:</span>
                    </div>
                    <span className="font-mono text-[#d4af37] font-extrabold text-sm">
                      PHP {currentPlanCost.toLocaleString()} / mo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* =========================================================
            6. BOTTOM CTA: Dual Asymmetric Concierge Gateway
           ========================================================= */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4"
        >
          {/* Major Module (8 cols): VIP Fast-Track Activation Gateway */}
          <div className="lg:col-span-8 relative rounded-2xl sm:rounded-3xl border border-[#d4af37]/40 bg-gradient-to-br from-black/85 via-black/75 to-black/90 backdrop-blur-2xl p-5 sm:p-8 flex flex-col justify-between shadow-[0_25px_60px_rgba(0,0,0,0.85)] [box-shadow:inset_0_1.5px_2px_rgba(255,255,255,0.25)]">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-[#d4af37]/40">
                <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4af37]">24-Hour Guarantee &bull; Ortigas Center</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Ready to Activate Your Ortigas CBD Business Presence?
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
                Get your official notarized commercial lease and lessor consent documents within 24 hours. Start your SEC, BIR, or bank registration immediately.
              </p>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => handleOpenPlan(PLANS[1])}
                className="w-full sm:w-auto text-center px-6 py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f7e7a9] to-[#c59b27] hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#d4af37]/30 transition-all cursor-pointer whitespace-nowrap min-h-[44px] flex items-center justify-center"
              >
                Activate PREMIER PRESTIGE &bull; PHP 3,499/mo
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto text-center px-5 py-3.5 sm:py-3 rounded-xl border border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap min-h-[44px] flex items-center justify-center gap-2"
              >
                Inquire or Request Custom Quote
              </button>
            </div>
          </div>

          {/* Minor Module (4 cols): Tektite Concierge Desk Pass */}
          <div className="lg:col-span-4 relative rounded-2xl sm:rounded-3xl border border-white/20 bg-black/70 backdrop-blur-2xl p-5 sm:p-7 flex flex-col justify-between shadow-[0_25px_60px_rgba(0,0,0,0.85)] [box-shadow:inset_0_1.5px_2px_rgba(255,255,255,0.2)]">
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">CONCIERGE DESK</span>
                <span className="text-[10px] font-mono text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/30">
                  TK-3104-OR
                </span>
              </div>
              <div>
                <h5 className="text-sm font-bold text-white">Physical Tour &amp; Inspection</h5>
                <p className="text-xs text-zinc-300 mt-1">
                  Visit Unit 3104 East Tower, Exchange Road, Ortigas Center. Meet our on-duty front desk officers.
                </p>
              </div>
              <div className="space-y-1 text-[11px] text-zinc-300 pt-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Reception Hours:</span>
                  <span className="text-white font-mono">Mon–Fri, 8AM–5PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Turnaround:</span>
                  <span className="text-[#d4af37] font-mono">Within 24 Hours</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 mt-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3.5 sm:py-2.5 px-4 min-h-[44px] rounded-xl border border-[#d4af37]/50 bg-black/60 hover:bg-[#d4af37]/15 hover:border-[#d4af37] text-[#d4af37] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Book On-Site Visit</span>
              </button>
            </div>
          </div>
        </motion.section>

      </div>

      {/* =========================================================
          7. INQUIRY & RESERVATION MODAL (Black Glassmorphism with Gold Accents)
         ========================================================= */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Virtual office reservation"
            className="relative flex max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/25 bg-black/90 backdrop-blur-3xl text-white shadow-[0_35px_90px_rgba(0,0,0,0.95)] [box-shadow:inset_0_1.5px_2px_rgba(255,255,255,0.3)]"
          >
            {/* Subtle Top Specular Glass Sheen */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />

            {/* Header row: title + close button in the same flex row so they never overlap */}
            <div className="relative z-10 flex shrink-0 items-start justify-between gap-3 p-5 sm:p-8 pb-0">
              {formSubmitted ? (
                <div />
              ) : (
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold tracking-wide text-[#d4af37] block">
                    Alpha Premier Virtual Office
                  </span>
                  <h3 id="virtual-office-reservation-title" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Select Your Package
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Complete this quick reservation to secure Unit 3104 for your business registration.
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close reservation form"
                className="shrink-0 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer mt-0.5"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
            {formSubmitted ? (
              <div className="relative z-10 text-center p-5 sm:p-8 pt-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h3 className="text-xl font-bold text-white">Reservation Request Logged</h3>
                <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-white">{formData.fullName || 'Executive'}</strong>. Your inquiry for <strong className="text-[#d4af37]">{selectedPlan.name}</strong> (PHP {selectedPlan.monthlyPrice.toLocaleString()}/mo) has been received.
                </p>
                <div className="p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-left text-xs space-y-2">
                  <div className="flex justify-between text-zinc-400">
                    <span>Reference:</span>
                    <span className="font-mono text-[#d4af37] font-bold">APG-VO-{Math.floor(100000 + Math.random() * 900000)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Location:</span>
                    <span className="text-white font-semibold">Tektite East Tower Unit 3104</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Account Manager:</span>
                    <span className="text-[#d4af37] font-semibold">Within 24 Hours</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormSubmitted(false);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e8c558] to-[#c59b27] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#d4af37]/25 min-h-[44px]"
                >
                  Close Confirmation
                </button>
              </div>
            ) : (
              <div className="relative z-10 space-y-5 sm:space-y-6 p-5 sm:p-8 pt-4 sm:pt-5">

                {/* Plan Picker Tabs */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {PLANS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlan(p)}
                      className={`p-2 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedPlan.id === p.id
                          ? 'border-[#d4af37] bg-[#d4af37]/20 text-white font-bold ring-1 ring-[#d4af37]/40 shadow-md backdrop-blur-md'
                          : 'border-white/15 bg-black/50 backdrop-blur-md text-zinc-300 hover:border-[#d4af37]/40'
                      }`}
                    >
                      <div className="text-[9px] sm:text-[10px] uppercase tracking-wider truncate font-semibold">
                        {p.name.replace('PREMIER ', '')}
                      </div>
                      <div className="font-mono text-[11px] sm:text-xs font-extrabold mt-0.5 text-[#d4af37] truncate">
                        PHP {p.monthlyPrice.toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Selected Plan Inclusions Summary */}
                <div className="p-3.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 text-xs space-y-1.5">
                  <div className="font-semibold text-white">
                    Included with <span className="text-[#d4af37]">{selectedPlan.name}</span>:
                  </div>
                  <ul className="text-[11px] text-zinc-300 space-y-1">
                    {selectedPlan.packageInclusions.slice(0, 4).map((inc, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-[#d4af37] shrink-0" />
                        <span className="truncate">{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Fast Reservation Form */}
                <form onSubmit={handleFormSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Juan Dela Cruz"
                        className="w-full rounded-lg border border-white/20 bg-black/60 backdrop-blur-md px-3 py-2.5 sm:py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                        Company / Trade Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Alpha Solutions Inc."
                        className="w-full rounded-lg border border-white/20 bg-black/60 backdrop-blur-md px-3 py-2.5 sm:py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                        Corporate Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="ceo@company.ph"
                        className="w-full rounded-lg border border-white/20 bg-black/60 backdrop-blur-md px-3 py-2.5 sm:py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                        Contact Mobile *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+63 917 123 4567"
                        className="w-full rounded-lg border border-white/20 bg-black/60 backdrop-blur-md px-3 py-2.5 sm:py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="bookTourCheck"
                      checked={formData.bookTour}
                      onChange={(e) => setFormData({ ...formData, bookTour: e.target.checked })}
                      className="rounded border-zinc-600 bg-zinc-900 text-[#d4af37] focus:ring-[#d4af37] cursor-pointer w-4 h-4 shrink-0"
                    />
                    <label htmlFor="bookTourCheck" className="text-xs text-zinc-300 cursor-pointer">
                      Schedule a physical tour at Unit 3104 Tektite East Tower
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#d4af37] via-[#e8c558] to-[#c59b27] hover:brightness-110 text-black shadow-lg shadow-[#d4af37]/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 min-h-[44px]"
                  >
                    <span>Confirm Reservation for {selectedPlan.name}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};
