import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JobPosition } from '../types';
import { OPEN_POSITIONS } from '../data/companyData';
import { supabase } from '../lib/supabase';
import {
  Briefcase,
  MapPin,
  Search,
  ArrowRight,
  CheckCircle2,
  Building,
  Users,
  Award,
  HeartPulse,
  GraduationCap,
  DollarSign,
  Plane,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  UserCheck,
  FileText,
  Send,
  Star,
  Building2,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Layers,
  Crown,
  Compass,
  Radio,
  Quote,
  Zap,
  Plus,
  X,
  MessageSquarePlus
} from 'lucide-react';

interface CareersViewProps {
  onApplyJob: (job: JobPosition) => void;
  onGeneralApply: () => void;
}

export const CareersView: React.FC<CareersViewProps> = ({ onApplyJob, onGeneralApply }) => {
  const [positionsList, setPositionsList] = useState<JobPosition[]>(OPEN_POSITIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('job_openings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped: JobPosition[] = data.map((j) => ({
            id: String(j.id),
            title: j.title,
            division: j.department || j.division || 'Real Estate',
            location: j.location || 'Ortigas Center, Pasig City',
            type: j.type || 'Full-time',
            experience: j.experience || j.tag || '1-3 Years Experience',
            description: j.description || '',
            responsibilities: Array.isArray(j.responsibilities) ? j.responsibilities : [
              'Execute strategic deliverables and align with executive objectives.',
              'Collaborate cross-functionally across Alpha Premier enterprises.',
              'Maintain high standards of client advisory and documentation.'
            ],
            requirements: Array.isArray(j.requirements) ? j.requirements : [
              'Demonstrated track record of performance in the domain.',
              'Excellent English written and verbal communication skills.',
              'Strong organizational capabilities and high ethical standards.'
            ],
            perks: Array.isArray(j.perks) ? j.perks : [
              'Comprehensive HMO from Day 1',
              'Performance-based merit bonuses & profit share',
              'Direct executive mentorship & leadership track'
            ],
            postedDate: j.created_at ? new Date(j.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'
          }));
          setPositionsList(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Active hover/tap states for card reveals
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Feedback Modal state
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    name: '',
    role: '',
    division: 'Alpha Premier Realty',
    quote: '',
    rating: 5
  });

  // Employee Testimonials State
  const [testimonialsList, setTestimonialsList] = useState([
    {
      id: 'test-1',
      quote: "Joining Alpha Premier Group was the pivotal turning point in my real estate career. Within 4 years, I progressed from Property Consultant to Director leading a team of 20 brokers.",
      name: "Maria Santos",
      role: "Senior Director, Property Sales",
      division: "Alpha Premier Realty",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: 'test-2',
      quote: "In Alpha Premier Construction, we don't just build structures—we execute architectural benchmarks with absolute precision, safety, and accountability.",
      name: "Engr. David Reyes",
      role: "Lead Project Director",
      division: "Alpha Premier Construction",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: 'test-3',
      quote: "The synergy across our 7 enterprises creates an extraordinary environment. Every day brings cross-sector collaboration with top corporate leaders.",
      name: "Patricia Mendoza",
      role: "Operations Manager",
      division: "88 Prime & Alta Venture",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80"
    }
  ]);

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.name.trim() || !newFeedback.quote.trim() || !newFeedback.role.trim()) {
      return;
    }

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    ];
    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const newItem = {
      id: `test-${Date.now()}`,
      name: newFeedback.name.trim(),
      role: newFeedback.role.trim(),
      division: newFeedback.division,
      quote: newFeedback.quote.trim(),
      avatar: randomAvatar
    };

    setTestimonialsList([newItem, ...testimonialsList]);
    setNewFeedback({
      name: '',
      role: '',
      division: 'Alpha Premier Realty',
      quote: '',
      rating: 5
    });
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setIsFeedbackModalOpen(false);
    }, 1400);
  };

  const divisions = ['ALL', 'Real Estate', 'Construction', 'Corporate', 'Business Hub', 'Swift Clear'];

  const filteredJobs = positionsList.filter((job) => {
    const matchesDiv = selectedDivision === 'ALL' || job.division.toLowerCase() === selectedDivision.toLowerCase();
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDiv && matchesSearch;
  });

  const toggleExpandJob = (id: string) => {
    setExpandedJobId(expandedJobId === id ? null : id);
  };

  const scrollToOpenings = () => {
    const element = document.getElementById('open-positions');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCulture = () => {
    const element = document.getElementById('why-join-us');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Why Join Us Pillars Data
  const whyJoinUsPillars = [
    {
      id: 'why-1',
      icon: Building,
      title: 'Prestige Projects & Assets',
      tagline: 'High-Profile Assets',
      description: 'Work on iconic commercial towers, PEZA-accredited business centers, luxury penthouses, and large-scale civil construction developments.'
    },
    {
      id: 'why-2',
      icon: DollarSign,
      title: 'Uncapped Earning Potential',
      tagline: 'Lucrative Commissions',
      description: 'Benefit from industry-leading sales commissions, performance-based quarterly merit bonuses, and annual group profit-sharing pools.'
    },
    {
      id: 'why-3',
      icon: Award,
      title: 'Accelerated Mentorship',
      tagline: 'Executive Growth',
      description: 'Receive direct guidance from veteran real estate brokers, licensed structural engineers, and corporate executives committed to your success.'
    },
    {
      id: 'why-4',
      icon: Users,
      title: 'Cross-Sector Synergy',
      tagline: '7 Integrated Divisions',
      description: 'Expand your expertise by collaborating across our 7 integrated enterprises spanning real estate, construction, creative media, and logistics.'
    }
  ];

  // Our Core Operating Pillars Data
  const corePillars = [
    {
      id: 'pillar-1',
      icon: ShieldCheck,
      title: 'Integrity & Legal Transparency',
      tagline: 'Uncompromising Ethics',
      description: 'Every property transaction, construction contract, and corporate deal is executed with absolute legal transparency and total integrity.'
    },
    {
      id: 'pillar-2',
      icon: TrendingUp,
      title: 'High-Impact Meritocracy',
      tagline: 'Performance Recognition',
      description: 'We reward dedication, sales excellence, and innovation with swift career advancement, quarterly incentives, and executive empowerment.'
    },
    {
      id: 'pillar-3',
      icon: Layers,
      title: 'Cross-Sector Synergy',
      tagline: '7 Integrated Divisions',
      description: 'Our professionals collaborate seamlessly across real estate, structural engineering, corporate services, creative media, and business hubs.'
    },
    {
      id: 'pillar-4',
      icon: Users,
      title: 'Direct Executive Mentorship',
      tagline: 'Industry Leadership',
      description: 'Work directly alongside veteran brokers, licensed structural engineers, and corporate executives dedicated to your professional mastery.'
    },
    {
      id: 'pillar-5',
      icon: Sparkles,
      title: 'Innovation & Digital Readiness',
      tagline: 'Modern Technology',
      description: 'Leveraging cutting-edge property technology, 3D structural modeling, and automated business tools to stay ahead of market demands.'
    },
    {
      id: 'pillar-6',
      icon: Building2,
      title: 'Community & Lasting Impact',
      tagline: 'Building Future Value',
      description: 'Creating sustainable developments, vibrant corporate workspaces, and long-term economic growth for clients and communities alike.'
    }
  ];

  // Employee Testimonials
  const testimonials = [
    {
      id: 'test-1',
      quote: "Joining Alpha Premier Group was the pivotal turning point in my real estate career. Within 4 years, I progressed from Property Consultant to Director leading a team of 20 brokers.",
      name: "Maria Santos",
      role: "Senior Director, Property Sales",
      division: "Alpha Premier Realty",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: 'test-2',
      quote: "In Alpha Premier Construction, we don't just build structures—we execute architectural benchmarks with absolute precision, safety, and accountability.",
      name: "Engr. David Reyes",
      role: "Lead Project Director",
      division: "Alpha Premier Construction",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: 'test-3',
      quote: "The synergy across our 7 enterprises creates an extraordinary environment. Every day brings cross-sector collaboration with top corporate leaders.",
      name: "Patricia Mendoza",
      role: "Operations Manager",
      division: "88 Prime & Alta Venture",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80"
    }
  ];

  return (
    <div className="bg-transparent text-neutral-100 font-sans min-h-screen pb-24">
      
      {/* 1. HERO BANNER & VALUE PROPOSITION */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden border-b border-[#D4AF37]/30 bg-[#120E05]/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto space-y-6 relative z-10 flex flex-col items-center">
          
          {/* Radial Gold Backdrop Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.22)_0%,_transparent_75%)] blur-2xl pointer-events-none" />

          {/* Rotated Gold Diamond Emblem with Crown */}
          <div className="relative w-12 h-12 rotate-45 bg-[#1C1508] border-2 border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center justify-center z-10">
            <Crown className="w-6 h-6 -rotate-45 text-[#D4AF37] drop-shadow-[0_0_8px_#D4AF37]" />
          </div>

          {/* Filigree Line Dividers with Star Diamond Nodes */}
          <div className="flex items-center justify-center w-full max-w-xl gap-3 z-10">
            <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#1A1408] border border-[#D4AF37] rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#FFF3D1] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>BUILD YOUR LEGACY WITH US</span>
            </div>
            <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-tight z-10">
            Shape The Future Of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]">
              Real Estate & Enterprise
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-neutral-300 max-w-3xl mx-auto leading-relaxed font-light">
            Alpha Premier Group of Companies is a multi-sector conglomerate shaping prime commercial districts, luxury residential holdings, construction engineering, and corporate outsourcing across the Philippines. Explore how your expertise can flourish in a culture built on excellence and opportunity.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={scrollToOpenings}
              className="px-6 py-3.5 bg-[#D4AF37] hover:bg-[#FFF3D1] text-neutral-950 font-extrabold text-xs tracking-widest uppercase flex items-center gap-2.5 transition-all shadow-lg rounded-xl transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              <span>EXPLORE OPEN POSITIONS</span>
            </button>

            <button
              onClick={scrollToCulture}
              className="px-6 py-3.5 bg-black/60 hover:bg-black border border-[#D4AF37]/50 text-white font-extrabold text-xs tracking-widest uppercase flex items-center gap-2 transition-all rounded-xl hover:border-[#D4AF37] cursor-pointer"
            >
              <span>WHY JOIN US</span>
              <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>

        </div>
      </section>

      {/* 2. WHY BUILD YOUR CAREER HERE (ANIMATED CENTERED HOVER CARDS) */}
      <section id="why-join-us" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        
        {/* Section Header 1: Crown Heraldic Diamond Crest & Filigree Wing Bars */}
        <div className="relative flex flex-col items-center text-center space-y-4 max-w-4xl mx-auto py-2">
          {/* Ambient Radial Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.2)_0%,_transparent_70%)] blur-2xl pointer-events-none" />

          {/* Central Rotated Gold Diamond Emblem with Crown Icon */}
          <div className="relative w-12 h-12 rotate-45 bg-[#1C1508] border-2 border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center justify-center z-10">
            <Crown className="w-6 h-6 -rotate-45 text-[#D4AF37] drop-shadow-[0_0_8px_#D4AF37]" />
          </div>

          {/* Filigree Wing Line Dividers & Star Accents */}
          <div className="flex items-center justify-center w-full max-w-xl gap-3 z-10">
            <span className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs">✦</span>
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#1A1408] border border-[#D4AF37] rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#FFF3D1] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
              <span>01 // CAREER ADVANTAGE</span>
            </div>
            <span className="text-[#D4AF37] text-xs">✦</span>
            <span className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
          </div>

          {/* Main Title */}
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-wider leading-tight z-10">
            Why Build Your Career At{' '}
            <span className="bg-gradient-to-r from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              Alpha Premier
            </span>
            ?
          </h2>
        </div>

        {/* 4 Clean Centered Cards: Title/Icon centered, moves up smoothly on hover to reveal text */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyJoinUsPillars.map((item) => {
            const IconComp = item.icon;
            const isHovered = hoveredCard === item.id;

            return (
              <motion.div
                key={item.id}
                onMouseEnter={() => setHoveredCard(item.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setHoveredCard(hoveredCard === item.id ? null : item.id)}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className={`relative bg-[#120E05]/90 border transition-all duration-300 p-6 rounded-2xl cursor-pointer backdrop-blur-md overflow-hidden flex flex-col items-center justify-center min-h-[240px] text-center shadow-xl ${
                  isHovered
                    ? 'border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.25)] bg-gradient-to-b from-[#1C1508] via-[#120E05] to-[#0A0803]'
                    : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/70'
                }`}
              >
                {/* Gold Sliding Vertical Accent Bar on Left Edge */}
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] rounded-l-2xl origin-top shadow-[0_0_15px_#D4AF37]"
                />

                {/* Gold Shimmer Light Sweep Effect */}
                <motion.div
                  initial={{ x: '-120%' }}
                  animate={{ x: isHovered ? '250%' : '-120%' }}
                  transition={{ duration: 0.65, ease: 'easeInOut' }}
                  className="absolute top-0 bottom-0 w-28 bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent -skew-x-12 pointer-events-none"
                />

                {/* Centered Header Block: Icon & Title - Moves Up when Hovered */}
                <motion.div
                  animate={{ y: isHovered ? -42 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="flex flex-col items-center justify-center space-y-2 z-10 w-full"
                >
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                      isHovered
                        ? 'bg-[#D4AF37] text-neutral-950 border-[#FFF3D1] shadow-lg scale-105'
                        : 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#D4AF37]'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  <h3
                    className={`text-xs sm:text-sm font-extrabold transition-colors duration-200 uppercase tracking-wide px-2 leading-tight ${
                      isHovered ? 'text-[#D4AF37]' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </h3>
                </motion.div>

                {/* Subtitle Tagline & Description - Slides in from Right to Center */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: 80 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 60 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      className="absolute bottom-3 left-4 right-4 z-10 flex flex-col items-center space-y-1.5 text-center"
                    >
                      <motion.span
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: 0.05 }}
                        className="text-[9px] font-bold text-[#D4AF37] bg-[#D4AF37]/15 border border-[#D4AF37]/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block"
                      >
                        {item.tagline}
                      </motion.span>

                      <p className="text-[11px] sm:text-xs text-neutral-200 leading-relaxed font-light px-1">
                        {item.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </section>

      {/* 3. EMPLOYEE TESTIMONIALS / LIFE AT THE COMPANY */}
      <section className="bg-black/60 border-y border-[#D4AF37]/20 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Section Header 3: Golden Quote Emblem & Dual Star Crown Seal */}
          <div className="relative flex flex-col items-center text-center space-y-4 max-w-4xl mx-auto py-4">
            {/* Ambient Radial Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.18)_0%,_transparent_70%)] blur-2xl pointer-events-none" />

            {/* Circular Double Ring Seal with Quote Icon */}
            <div className="relative w-12 h-12 rounded-full border-2 border-[#D4AF37] p-1 bg-[#1A1408] shadow-[0_0_25px_rgba(212,175,55,0.35)] flex items-center justify-center z-10">
              <div className="w-full h-full rounded-full border border-[#D4AF37]/50 flex items-center justify-center bg-gradient-to-b from-[#2A1F0D] to-[#120E05]">
                <Quote className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]/20" />
              </div>
            </div>

            {/* Arched Star Crown Array & Monospace Label */}
            <div className="flex items-center gap-3 z-10">
              <span className="text-xs text-[#D4AF37]">•••</span>
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#120E05] border border-[#D4AF37]/80 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <div className="flex gap-0.5 text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-[#D4AF37]" />
                  ))}
                </div>
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#FFF3D1] uppercase">
                  02 // VOICES OF OUR PEOPLE
                </span>
              </div>
              <span className="text-xs text-[#D4AF37]">•••</span>
            </div>

            {/* Main Title */}
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-wider leading-tight z-10">
              Life At{' '}
              <span className="bg-gradient-to-r from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                Alpha Premier
              </span>
            </h2>

            {/* Add Feedback Action Button */}
            <div className="pt-2 z-10">
              <button
                onClick={() => setIsFeedbackModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#FFF3D1] to-[#AA7C11] text-neutral-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-neutral-950 stroke-[3]" />
                <span>Add Feedback / Share Experience</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsList.map((t) => {
              const isHovered = hoveredCard === t.id;

              return (
                <motion.div
                  key={t.id}
                  onMouseEnter={() => setHoveredCard(t.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className={`relative bg-[#120E05]/90 border p-6 rounded-2xl flex flex-col items-center justify-between text-center shadow-xl transition-all duration-300 backdrop-blur-md min-h-[260px] overflow-hidden ${
                    isHovered
                      ? 'border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.25)] bg-[#1A1408]'
                      : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
                  }`}
                >
                  {/* Gold Vertical Accent Line on Left Edge */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] rounded-l-2xl" />

                  {/* Profile Header */}
                  <div className="flex flex-col items-center justify-center space-y-1.5 z-10 w-full">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37]"
                    />
                    <div>
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">{t.name}</h4>
                      <p className="text-[10px] text-[#D4AF37] font-semibold">{t.role}</p>
                      <p className="text-[9px] text-neutral-400 font-medium">{t.division}</p>
                    </div>

                    <div className="flex gap-1 text-[#D4AF37] pt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-[#D4AF37]" />
                      ))}
                    </div>
                  </div>

                  {/* Always Visible Testimonial Quote */}
                  <div className="z-10 mt-4 w-full">
                    <p className="text-xs sm:text-sm italic text-neutral-200 leading-relaxed font-light px-2">
                      "{t.quote}"
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. OUR CORE OPERATING PILLARS SHOWCASE */}
      <section className="bg-black/50 border-y border-[#D4AF37]/20 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Section Header 2: Shield Medallion Octagon Frame & Star Nodes */}
          <div className="relative flex flex-col items-center text-center space-y-3 max-w-4xl mx-auto py-4 px-6 border border-[#D4AF37]/30 bg-[#0F0B04]/60 rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.1)]">
            {/* Corner Brackets */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37]" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]" />

            {/* Octagonal Shield Crest */}
            <div className="w-11 h-11 bg-gradient-to-br from-[#2A1F0D] to-[#120E05] border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.35)] flex items-center justify-center rounded-lg rotate-45">
              <ShieldCheck className="w-5 h-5 -rotate-45 text-[#D4AF37] drop-shadow-[0_0_8px_#D4AF37]" />
            </div>

            {/* Label with Star Nodes */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1 text-[#D4AF37] text-xs">
                <span>✦</span>
                <span>✦</span>
              </div>
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.3em] text-[#FFF3D1] uppercase px-3 py-0.5 bg-[#1C1508] border border-[#D4AF37]/60 rounded">
                03 // EXCELLENCE &amp; CULTURE
              </span>
              <div className="flex gap-1 text-[#D4AF37] text-xs">
                <span>✦</span>
                <span>✦</span>
              </div>
            </div>

            {/* Main Title */}
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-wider leading-tight">
              Our Core Operating{' '}
              <span className="bg-gradient-to-r from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                Pillars
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {corePillars.map((b) => {
              const IconComp = b.icon;
              const isHovered = hoveredCard === b.id;

              return (
                <motion.div
                  key={b.id}
                  onMouseEnter={() => setHoveredCard(b.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => setHoveredCard(hoveredCard === b.id ? null : b.id)}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className={`relative bg-[#120E05]/90 border rounded-2xl p-6 transition-all duration-300 cursor-pointer backdrop-blur-md flex flex-col items-center justify-center min-h-[240px] text-center overflow-hidden shadow-xl ${
                    isHovered
                      ? 'border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.25)] bg-[#1A1408]'
                      : 'border-neutral-800 hover:border-[#D4AF37]/60'
                  }`}
                >
                  {/* Gold Sliding Vertical Accent Bar on Left Edge */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] rounded-l-2xl origin-top shadow-[0_0_15px_#D4AF37]"
                  />

                  {/* Gold Shimmer Light Sweep Effect across card */}
                  <motion.div
                    initial={{ x: '-120%' }}
                    animate={{ x: isHovered ? '250%' : '-120%' }}
                    transition={{ duration: 0.65, ease: 'easeInOut' }}
                    className="absolute top-0 bottom-0 w-28 bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent -skew-x-12 pointer-events-none"
                  />

                  {/* Centered Header Block (Icon & Title) - Shifts Up to Top of Card on Hover */}
                  <motion.div
                    animate={{ y: isHovered ? -42 : 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    className="flex flex-col items-center justify-center space-y-2 z-10 w-full"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                        isHovered ? 'bg-[#D4AF37] text-neutral-950 border-[#FFF3D1] shadow-md' : 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>

                    <h3 className={`text-xs sm:text-sm font-extrabold transition-colors uppercase tracking-wide px-2 leading-tight ${isHovered ? 'text-[#D4AF37]' : 'text-white'}`}>
                      {b.title}
                    </h3>
                  </motion.div>

                  {/* Subtitle Tagline & Description Content - Both Slide from the Right Side to Center */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: 80 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 60 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="absolute bottom-3 left-4 right-4 z-10 flex flex-col items-center space-y-2 text-center"
                      >
                        {/* Subtitle Badge sliding from right */}
                        <motion.span
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: 0.05 }}
                          className="text-[9px] font-bold text-[#D4AF37] bg-[#D4AF37]/15 border border-[#D4AF37]/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block"
                        >
                          {b.tagline}
                        </motion.span>

                        {/* Subtitle / Description text */}
                        <p className="text-[11px] sm:text-xs text-neutral-200 leading-relaxed font-light px-1">
                          {b.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. OPEN POSITIONS SECTION (WITH FILTER & EXPANDABLE DETAILS) */}
      <section id="open-positions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 space-y-8">
        
        {/* Section Header 4: Cyber Command Console Box Archetype (Focus 2) */}
        <div className="relative bg-[#0D0A04] border border-[#D4AF37]/50 p-6 sm:p-8 rounded-xl max-w-4xl mx-auto shadow-[0_0_30px_rgba(212,175,55,0.12)] space-y-3 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden">
          {/* Subtle Ambient Background Corner Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D4AF37]/10 blur-3xl pointer-events-none rounded-full" />

          <div className="space-y-2 z-10 max-w-xl">
            {/* Monospace Command Prompt Tag */}
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-[0.25em]">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
              <span>&gt; SYSTEM.PORTAL // RECRUITMENT_LIVE</span>
            </div>

            {/* Main Title */}
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide leading-tight">
              Current Open{' '}
              <span className="bg-gradient-to-r from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                Positions
              </span>
            </h2>

            <p className="text-xs text-neutral-300 leading-relaxed font-light">
              Select or expand a position to inspect key requirements and submit your application directly to our talent acquisition team.
            </p>
          </div>

          {/* Right Live Counter / Quick Filter Shield */}
          <div className="shrink-0 flex sm:flex-col items-center justify-center bg-[#1A1408] border border-[#D4AF37]/60 px-5 py-3 rounded-lg shadow-inner gap-2 z-10">
            <span className="text-2xl font-black text-[#D4AF37] font-mono leading-none">
              {positionsList.length}
            </span>
            <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-[#FFF3D1] uppercase">
              ACTIVE ROLES
            </span>
          </div>
        </div>

        {/* Filter & Search Control Bar */}
        <div className="bg-[#0B0D12] border border-neutral-800 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl shadow-xl">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search roles, skills, locations..."
              className="w-full bg-black border border-neutral-800 focus:border-[#D4AF37] pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 outline-none rounded-lg transition-colors"
            />
          </div>

          {/* Division Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {divisions.map((div) => (
              <button
                key={div}
                onClick={() => setSelectedDivision(div)}
                className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all rounded-lg cursor-pointer ${
                  selectedDivision === div
                    ? 'bg-[#D4AF37] text-neutral-950 font-extrabold shadow-md'
                    : 'bg-black text-neutral-400 border border-neutral-800 hover:text-white hover:border-[#D4AF37]'
                }`}
              >
                {div}
              </button>
            ))}
          </div>

        </div>

        {/* Job Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => {
            const isExpanded = expandedJobId === job.id;

            return (
              <motion.div
                key={job.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="bg-[#120E05]/90 border border-[#D4AF37]/30 hover:border-[#D4AF37] p-6 space-y-4 flex flex-col justify-between transition-all duration-200 group rounded-xl backdrop-blur-md shadow-xl"
              >
                <div className="space-y-3">
                  
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase block mb-0.5">
                        {job.division}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                        {job.title}
                      </h3>
                    </div>
                    <span className="bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-extrabold px-2.5 py-1 tracking-wider shrink-0 rounded-md">
                      {job.type}
                    </span>
                  </div>

                  {/* Location & Perks Tag */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{job.location}</span>
                    </div>
                    <span className="text-neutral-600">•</span>
                    <div className="flex items-center gap-1 text-[11px] text-[#D4AF37] font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>HMO Day 1 + Growth Path</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Expandable Section: Responsibilities & Requirements */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="pt-3 border-t border-neutral-800 space-y-3 text-xs text-neutral-300"
                      >
                        {job.responsibilities && job.responsibilities.length > 0 && (
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                              Key Responsibilities:
                            </h4>
                            <ul className="list-disc list-inside text-[11px] text-neutral-300 space-y-1">
                              {job.responsibilities.map((resp, i) => (
                                <li key={i}>{resp}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="space-y-1">
                          <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                            Key Requirements:
                          </h4>
                          <ul className="list-disc list-inside text-[11px] text-neutral-300 space-y-1">
                            {job.requirements.map((req, i) => (
                              <li key={i}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Card Footer Buttons */}
                <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => toggleExpandJob(job.id)}
                    className="text-[11px] font-bold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? 'Less Details' : 'View Full Details'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => onApplyJob(job)}
                    className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#FFF3D1] text-neutral-950 font-extrabold text-xs tracking-widest uppercase flex items-center gap-2 transition-all shadow-md rounded-lg transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>APPLY NOW</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </motion.div>
            );
          })}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12 bg-[#0B0D12] border border-neutral-800 rounded-xl">
            <p className="text-xs text-neutral-400">No open roles found matching your search term or division filter.</p>
          </div>
        )}

      </section>

      {/* 7. GENERAL APPLICATION / TALENT NETWORK BANNER (Focus 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="relative bg-[#0D0A04] border-2 border-[#D4AF37]/60 p-8 sm:p-12 text-center space-y-6 rounded-2xl backdrop-blur-md shadow-[0_0_50px_rgba(212,175,55,0.15)] overflow-hidden">
          {/* Filigree Corner Brackets */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37]" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37]" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37]" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37]" />

          {/* Top Architectural Tag */}
          <div className="inline-flex items-center gap-2 px-5 py-1 bg-[#1A1408] border border-[#D4AF37] text-[10px] sm:text-xs font-mono font-bold tracking-[0.3em] text-[#D4AF37] uppercase">
            <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>EXECUTIVE TALENT ARCHIVE</span>
          </div>

          <h3 className="text-xl sm:text-3xl font-black text-white uppercase tracking-wider leading-tight max-w-3xl mx-auto">
            Don't See A Position That Matches Your{' '}
            <span className="bg-gradient-to-r from-[#FFF3D1] via-[#D4AF37] to-[#AA7C11] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              Expertise
            </span>
            ?
          </h3>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto leading-relaxed font-light">
            We are continuously expanding across real estate brokerage, civil construction, creative design, digital marketing, and business process outsourcing. Submit a general resume to our HR talent database.
          </p>

          <div className="pt-2">
            <button
              onClick={onGeneralApply}
              className="px-8 py-3.5 bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-neutral-950 font-extrabold text-xs tracking-widest uppercase transition-all rounded-xl shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
            >
              SUBMIT GENERAL RESUME
            </button>
          </div>

        </div>
      </section>

      {/* FEEDBACK MODAL DIALOG */}
      <AnimatePresence>
        {isFeedbackModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#120E05] border border-[#D4AF37]/60 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(212,175,55,0.3)] space-y-6 text-left"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/60 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-[#D4AF37] text-xs font-mono font-bold tracking-widest uppercase">
                  <Quote className="w-3.5 h-3.5" />
                  <span>Employee & Client Voice</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                  Add Your Feedback
                </h3>
                <p className="text-xs text-neutral-400">
                  Share your experience at Alpha Premier Group.
                </p>
              </div>

              {feedbackSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-[#1A1408] border border-[#D4AF37] rounded-xl text-center space-y-3"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase">Feedback Submitted!</h4>
                  <p className="text-xs text-neutral-300">Thank you for sharing your testimonial with us.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleAddFeedback} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Santos"
                      value={newFeedback.name}
                      onChange={(e) => setNewFeedback({ ...newFeedback, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black/70 border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl text-white text-xs outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1.5">
                        Role / Position *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Property Consultant"
                        value={newFeedback.role}
                        onChange={(e) => setNewFeedback({ ...newFeedback, role: e.target.value })}
                        className="w-full px-4 py-2.5 bg-black/70 border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl text-white text-xs outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1.5">
                        Division *
                      </label>
                      <select
                        value={newFeedback.division}
                        onChange={(e) => setNewFeedback({ ...newFeedback, division: e.target.value })}
                        className="w-full px-4 py-2.5 bg-black/70 border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl text-white text-xs outline-none transition-colors"
                      >
                        <option value="Alpha Premier Realty">Alpha Premier Realty</option>
                        <option value="Alpha Premier Construction">Alpha Premier Construction</option>
                        <option value="Ortigas Virtual Workspaces">Ortigas Virtual Workspaces</option>
                        <option value="Swift Clear Logistics">Swift Clear Logistics</option>
                        <option value="Dynamic Tree Media">Dynamic Tree Media</option>
                        <option value="Alpha Business Hub">Alpha Business Hub</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1.5">
                      Rating
                    </label>
                    <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
                          className="p-1 text-[#D4AF37] hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= newFeedback.rating ? 'fill-[#D4AF37]' : 'text-neutral-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1.5">
                      Feedback / Testimonial *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share your experience working with or at Alpha Premier Group..."
                      value={newFeedback.quote}
                      onChange={(e) => setNewFeedback({ ...newFeedback, quote: e.target.value })}
                      className="w-full px-4 py-2.5 bg-black/70 border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl text-white text-xs outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsFeedbackModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-neutral-700 text-neutral-300 text-xs font-bold uppercase hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#FFF3D1] text-neutral-950 font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all cursor-pointer"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
