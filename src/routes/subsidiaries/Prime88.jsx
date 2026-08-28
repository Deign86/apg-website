import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AOS from 'aos';
import {
  Menu, X, ChevronRight, Briefcase, Layers, Wind, Users, TrendingDown,
  Star, Palette, Zap, Leaf, Phone, Mail, MapPin, Linkedin, Facebook,
  Instagram, ArrowRight, Package, Truck, Thermometer, ChevronDown,
  Calendar, Clock, Send, TrendingUp, ShieldCheck, Heart, GraduationCap,
} from 'lucide-react';
import './Prime88.css';

// ─── Media Assets ─────────────────────────────────────────────────────────────
const ASSETS = {
  heroBg: '/assets/88prime/hero_background.jpg',
  shippingContainerYard: '/assets/88prime/Shipping_container_yard.jpg',
  woodPanelRoom: '/assets/88prime/Wood_panel_room.jpg',
  businessNewspaper: '/assets/88prime/Business_newspaper.jpg',
  warehouseBoxes: '/assets/88prime/Warehouse-boxes.jpg',
  coworkersAtLaptop: '/assets/88prime/Coworkers_at_laptop.jpg',
  cargoContainers: '/assets/88prime/Cargo_containers.jpg',
  teamAtTable: '/assets/88prime/Team_at_table__tall__col_1__careers.jpg',
  womanAtDesk: '/assets/88prime/Woman_at_desk__top_right__careers.jpg',
  groupWithLaptops: '/assets/88prime/Group_with_laptops__bottom_right__careers.jpg',
  allianceBg: '/assets/88prime/alliance-bg.jpg',
  productChair: '/assets/88prime/product-chair.jpg',
  productPanel: '/assets/88prime/product-wallpanel.jpg',
  productAc: '/assets/88prime/product-ac.jpg',
  productPaper: '/assets/88prime/product-paper.jpg',
  deliveryTruck: '/assets/88prime/delivery_truck.png',
};

// ─── Data Definitions ─────────────────────────────────────────────────────────
const PARTNERSHIP_BRANDS = [
  {
    id: 'daikin',
    name: 'Daikin',
    tagline: 'World Leader in VRV & Inverter Climate Control',
    logo: '/assets/88prime/partnership_daikin.png',
    specs: ['Split-Type & VRV Commercial Systems', 'R32 Inverter Technology with 5-Star Energy Rating', 'Engineered for High-Density Commercial Facilities'],
    type: 'Commercial & Multi-Split Solutions'
  },
  {
    id: 'carrier',
    name: 'Carrier',
    tagline: 'Pioneering Commercial Air Conditioning Systems',
    logo: '/assets/88prime/partnership_carrier.png',
    specs: ['High-Capacity Ductless & Ceiling Cassettes', 'Advanced Air Filtration & Dehumidification', 'Heavy-Duty Operational Durability'],
    type: 'High-Capacity Industrial Aircon'
  },
  {
    id: 'mitsubishi',
    name: 'Mitsubishi Electric',
    tagline: 'Precision Japanese HVAC & Airflow Engineering',
    logo: '/assets/88prime/partnership_mitsubishi electric.png',
    specs: ['Whisper-Quiet Operation (Under 20dB)', '3D i-See Sensor Temperature Distribution', 'Industrial Grade Heavy Duty Compressors'],
    type: 'Precision Energy-Efficient HVAC'
  },
  {
    id: 'lg',
    name: 'LG',
    tagline: 'Smart Dual Inverter Commercial Units',
    logo: '/assets/88prime/partnership_lg.png',
    specs: ['Dual Inverter Compressor Technology', 'ThinQ Smart Connectivity & Remote Monitoring', 'Fast Cooling Performance for Retail & Office'],
    type: 'Smart Enterprise Cooling'
  },
  {
    id: 'samsung',
    name: 'Samsung',
    tagline: 'WindFree™ Draught-Free Commercial Aircon',
    logo: '/assets/88prime/partnership_samsung.png',
    specs: ['WindFree™ Micro-Hole Air Dispersion', 'Digital Inverter Boost Energy Efficiency', 'Sleek Modern Aesthetic for Corporate Spaces'],
    type: 'Corporate Architectural HVAC'
  },
  {
    id: 'midea',
    name: 'Midea',
    tagline: 'Cost-Effective High-Volume Commercial Solutions',
    logo: '/assets/88prime/partnership_midea.png',
    specs: ['High ROI Volume Commercial Packages', 'Inverter Split & Floor-Standing Units', 'Low Maintenance & Easy Serviceability'],
    type: 'Volume Commercial Procurement'
  },
  {
    id: 'gree',
    name: 'Gree',
    tagline: 'Global Leader in Commercial HVAC Manufacturing',
    logo: '/assets/88prime/partnership_gree.png',
    specs: ['G10 Inverter Ultra-Low Frequency Control', 'Heavy Commercial Ceiling Cassettes', 'Eco-Friendly Refrigerants & Corrosion Protection'],
    type: 'Heavy Duty Commercial Systems'
  },
  {
    id: 'koppel',
    name: 'Koppel',
    tagline: 'Trusted Philippine Commercial & Industrial Aircon',
    logo: '/assets/88prime/partnership_koppel.png',
    specs: ['Proven Local After-Sales & Parts Availability', 'Super Inverter Energy Saving Units', 'R32 High Efficiency Commercial Lineup'],
    type: 'Local Fleet & Enterprise Solutions'
  },
  {
    id: 'tosot',
    name: 'Tosot',
    tagline: 'Advanced Commercial Split & Inverter Units',
    logo: '/assets/88prime/partnership_tosot.png',
    specs: ['Smart Temperature Sense Remote Monitoring', 'Multi-Stage Air Purifying Filters', 'High Value B2B Package Offerings'],
    type: 'Enterprise Value Procurement'
  },
];

const PRODUCTS = [
  { img: ASSETS.productChair, cat: "Corporate Essentials", name: "Executive Ergonomic Chair", specs: "Mesh back · Lumbar support · Adjustable armrests · 5-year warranty", badge: "Bestseller" },
  { img: ASSETS.productPanel, cat: "Industrial Materials", name: "WPC Wall Panel – Timber Oak", specs: "2.9m × 0.18m · Click-lock · 8mm thick · VOC-free finish", badge: "New Arrival" },
  { img: ASSETS.productAc, cat: "HVAC Solutions", name: "Golden Dragon Split-Type AC", specs: "1.5 HP · Inverter · 5-star energy rating · R32 refrigerant", badge: "Featured" },
  { img: ASSETS.productPaper, cat: "Corporate Essentials", name: "A4 Copy Paper — Premium Ream", specs: "80 GSM · Acid-free · 500 sheets · Carton pricing available", badge: "High Volume" },
];

const BLOG_POSTS = [
  { img: ASSETS.shippingContainerYard, cat: "Logistics", catColor: "#2563EB", title: "How Direct Sourcing Cuts Cost Without Cutting Corners", excerpt: "We break down the economics of B2B direct procurement and show exactly how smart supplier relationships translate to margin wins for your business.", date: "June 28, 2025", read: "6 min read", featured: true },
  { img: ASSETS.woodPanelRoom, cat: "Product Spotlight", catColor: "#7C3AED", title: "WPC vs PVC Panels: Which is Right for Your Fit-Out?", excerpt: "A practical breakdown of both materials — comparing durability, moisture resistance, install time, and cost per sqm.", date: "June 14, 2025", read: "5 min read" },
  { img: ASSETS.businessNewspaper, cat: "Industry Trends", catColor: "#059669", title: "The Rise of Inverter HVAC in Philippine Commercial Spaces", excerpt: "Inverter technology is now the baseline expectation — here's what the shift means for facility managers and procurement teams.", date: "June 3, 2025", read: "4 min read" },
  { img: ASSETS.warehouseBoxes, cat: "Operations", catColor: "#DC2626", title: "5 Office Supply Procurement Mistakes That Drain Budgets", excerpt: "From fragmented vendors to reactive restocking — the common patterns that silently inflate your procurement overhead.", date: "May 22, 2025", read: "5 min read" },
  { img: ASSETS.coworkersAtLaptop, cat: "Company News", catColor: "#D97706", title: "88 Prime and Golden Dragon Deepen HVAC Partnership", excerpt: "Our expanded agreement brings Golden Dragon's full commercial unit range to Philippine buyers, backed by local after-sales support.", date: "May 10, 2025", read: "3 min read" },
  { img: ASSETS.cargoContainers, cat: "Logistics", catColor: "#2563EB", title: "Same-Day Delivery: Inside Our Metro Manila Dispatch System", excerpt: "How our logistics team maintains a 98% on-time rate across 17 cities in the National Capital Region.", date: "April 30, 2025", read: "4 min read" },
];

const JOBS = [
  { title: "B2B Sales Executive", dept: "Sales & Business Development", loc: "Mandaluyong City", type: "Full-time" },
  { title: "Procurement Specialist", dept: "Supply Chain", loc: "Mandaluyong City", type: "Full-time" },
  { title: "Logistics Coordinator", dept: "Operations", loc: "Metro Manila", type: "Full-time" },
  { title: "Interior Solutions Consultant", dept: "Industrial Materials", loc: "Hybrid", type: "Full-time" },
  { title: "HVAC Technical Sales Rep", dept: "HVAC Solutions", loc: "Metro Manila", type: "Full-time" },
  { title: "Marketing & Content Associate", dept: "Marketing", loc: "Remote", type: "Full-time" },
];

import { useEnterpriseNav } from '../../context/EnterpriseNavContext';
import EnterpriseInquire from './EnterpriseInquire';

export default function Prime88() {
  const location = useLocation();
  const { setCurrentPage, registerNavigator } = useEnterpriseNav();

  const getPageFromLocation = (loc) => {
    const path = loc.pathname || '';
    const hash = (loc.hash || '').replace('#', '');

    if (path.endsWith('/services') || hash === 'services') return 'services';
    if (path.endsWith('/blogs') || hash === 'blogs') return 'blogs';
    if (path.endsWith('/careers') || hash === 'careers') return 'careers';
    if (path.endsWith('/inquire') || hash === 'inquire') return 'inquire';
    return 'home';
  };

  const [page, setPage] = useState(() => getPageFromLocation(location));
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  if (typeof window !== 'undefined') {
    window.enterpriseCurrentPage = page;
  }

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const p = getPageFromLocation(location);
    setPage(p);
  }, [location.pathname, location.hash]);

  const handleNav = (p) => {
    setPage(p);
    setMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    registerNavigator((p) => {
      setPage(p);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }, [registerNavigator]);

  useEffect(() => {
    setCurrentPage(page);
  }, [page, setCurrentPage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.enterpriseNavigate = handleNav;
      window.enterpriseCurrentPage = page;
    }
    return () => {
      if (typeof window !== 'undefined') {
        if (window.enterpriseNavigate === handleNav) window.enterpriseNavigate = undefined;
        if (window.enterpriseCurrentPage === page) window.enterpriseCurrentPage = undefined;
      }
    };
  }, [page]);

  return (
    <>
      <Helmet>
        <title>88 Prime Trading & Virtual Office | Enterprise Solutions</title>
        <meta
          name="description"
          content="88 Prime Consumer Goods Trading — Supplying Smarter, Delivering Better. B2B corporate supplies, industrial PVC/WPC panels, and HVAC solutions."
        />
        <link rel="icon" type="image/png" href="/assets/images/sstcompany-88prime11.png" />
      </Helmet>

      <div className="prime88-wrapper">
        {/* ─── PAGE BODY VIEWS ────────────────────────────────────────────── */}
        <main>
          {page === 'home' && <HomeView handleNav={handleNav} />}
          {page === 'services' && <ServicesView handleNav={handleNav} />}
          {page === 'blogs' && <BlogsView handleNav={handleNav} />}
          {page === 'careers' && <CareersView handleNav={handleNav} />}
          {page === 'inquire' && <EnterpriseInquire />}
        </main>
      </div>
    </>
  );
}

// ==========================================
// INTERACTIVE PAGE HERO HEADER COMPONENT
// ==========================================
function PageHeroHeader({ children, className = "prime88-page-hero" }) {
  const [spotlight, setSpotlight] = useState({ x: '50%', y: '40%' });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSpotlight({ x: `${x}px`, y: `${y}px` });
  };

  return (
    <section
      className={className}
      onMouseMove={handleMouseMove}
      style={{
        '--mouse-x': spotlight.x,
        '--mouse-y': spotlight.y,
      }}
    >
      <div className="prime88-hero-spotlight" />
      <div className="prime88-tech-grid-overlay" />
      <div className="prime88-light-beam" />
      <div className="prime88-particle-orb prime88-particle-orb-1" />
      <div className="prime88-particle-orb prime88-particle-orb-2" />
      {children}
      <div className="prime88-hero-line" />
    </section>
  );
}

// ==========================================
// HOME VIEW COMPONENT
// ==========================================
function HomeView({ handleNav }) {
  const [selectedBrand, setSelectedBrand] = useState(PARTNERSHIP_BRANDS[0]);

  return (
    <>
      {/* Hero */}
      <PageHeroHeader className="prime88-hero">
        <div className="prime88-hero-bg" style={{ backgroundImage: `url(${ASSETS.heroBg})` }} />
        <div className="prime88-hero-overlay" />

        <div className="prime88-hero-content" data-aos="fade-up">
          <div className="prime88-hero-badge">A Subsidiary of Alpha Premier Group</div>
          <h1 className="prime88-hero-title">
            SUPPLYING SMARTER.
            <br />
            <span className="prime88-shimmer-text">DELIVERING BETTER.</span>
          </h1>
          <p className="prime88-hero-desc">Everyday Essentials, Delivered Exceptionally.</p>

          <div className="prime88-hero-actions">
            <button type="button" className="prime88-btn-primary" onClick={() => handleNav('services')}>
              Explore Our Divisions <ChevronRight size={18} />
            </button>
            <button type="button" onClick={() => handleNav("inquire")} className="prime88-btn-secondary">
              Request a Quote
            </button>
          </div>

          <div className="prime88-stats-grid">
            <div className="prime88-stat-card">
              <span className="prime88-stat-value">500+</span>
              <span className="prime88-stat-label">Corporate Clients</span>
            </div>
            <div className="prime88-stat-card">
              <span className="prime88-stat-value">12+</span>
              <span className="prime88-stat-label">Years of Service</span>
            </div>
            <div className="prime88-stat-card">
              <span className="prime88-stat-value">3</span>
              <span className="prime88-stat-label">Core Divisions</span>
            </div>
          </div>
        </div>
      </PageHeroHeader>

      {/* Core Divisions */}
      <section className="prime88-divisions-section">
        <div className="prime88-divisions-container">
          <div className="prime88-section-label" data-aos="fade-up">
            <div className="line" />
            <span>Core Divisions</span>
            <div className="line" />
          </div>
          <h2 className="prime88-heading" data-aos="fade-up">What We Supply</h2>
          <p className="prime88-subheading" data-aos="fade-up">
            Three specialized divisions designed to cover your business from office floor to facility ceiling.
          </p>

          <div className="prime88-divisions-grid">
            <div className="prime88-division-card" data-aos="fade-up" data-aos-delay="100">
              <div className="prime88-division-img-box">
                <img src={ASSETS.warehouseBoxes} alt="Corporate Essentials" className="prime88-division-img" />
                <div className="prime88-division-overlay" />
                <div className="prime88-division-icon">
                  <Briefcase size={24} />
                </div>
              </div>
              <div className="prime88-division-body">
                <div className="prime88-division-tag">Division 01</div>
                <h3 className="prime88-division-title">Corporate Essentials</h3>
                <p className="prime88-division-desc">
                  A comprehensive catalog of premium office supplies, consumables, and workplace essentials — sourced directly and delivered in bulk.
                </p>
                <button type="button" className="prime88-division-cta" onClick={() => handleNav('services')}>
                  View Products <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="prime88-division-card" data-aos="fade-up" data-aos-delay="200">
              <div className="prime88-division-img-box">
                <img src={ASSETS.woodPanelRoom} alt="Industrial Materials" className="prime88-division-img" />
                <div className="prime88-division-overlay" />
                <div className="prime88-division-icon">
                  <Layers size={24} />
                </div>
              </div>
              <div className="prime88-division-body">
                <div className="prime88-division-tag">Division 02</div>
                <h3 className="prime88-division-title">Industrial Materials</h3>
                <p className="prime88-division-desc">
                  High-performance PVC and WPC panels with wide pattern variety, engineered for fast installation and commercial specifications.
                </p>
                <button type="button" onClick={() => handleNav("inquire")} className="prime88-division-cta">
                  Request Quote <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="prime88-division-card" data-aos="fade-up" data-aos-delay="300">
              <div className="prime88-division-img-box">
                <img src={ASSETS.shippingContainerYard} alt="HVAC Solutions" className="prime88-division-img" />
                <div className="prime88-division-overlay" />
                <div className="prime88-division-icon">
                  <Wind size={24} />
                </div>
                <div className="prime88-division-badge">In Partnership with Golden Dragon</div>
              </div>
              <div className="prime88-division-body">
                <div className="prime88-division-tag">Division 03</div>
                <h3 className="prime88-division-title">HVAC Solutions</h3>
                <p className="prime88-division-desc">
                  In partnership with Golden Dragon — energy-efficient split-type and cassette air-conditioning units engineered for commercial environments.
                </p>
                <button type="button" className="prime88-division-cta" onClick={() => handleNav('services')}>
                  Learn More <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why 88 Prime Bento */}
      <section className="prime88-bento-section">
        <div className="prime88-bento-container">
          <div className="prime88-section-label" data-aos="fade-up">
            <div className="line" />
            <span>Why 88 Prime</span>
            <div className="line" />
          </div>
          <h2 className="prime88-heading" data-aos="fade-up">The 88 Prime Advantage</h2>
          <p className="prime88-subheading" data-aos="fade-up">
            Precision sourcing, premium quality, and operational efficiency — built into every engagement.
          </p>

          <div className="prime88-bento-grid">
            <div className="prime88-bento-col" data-aos="fade-up" data-aos-delay="100">
              <div className="prime88-bento-header">
                <div className="prime88-bento-header-tag">A</div>
                <span>Expertise & Cost-Effectiveness</span>
              </div>
              <div className="prime88-bento-card">
                <div className="prime88-bento-icon"><Users size={22} /></div>
                <h4 className="prime88-bento-title">Professional Staff</h4>
                <p className="prime88-bento-desc">Dedicated account managers and logistics coordinators ensure seamless procurement from inquiry to delivery.</p>
              </div>
              <div className="prime88-bento-card">
                <div className="prime88-bento-icon"><TrendingDown size={22} /></div>
                <h4 className="prime88-bento-title">Optimized Pricing</h4>
                <p className="prime88-bento-desc">Direct-sourcing relationships allow us to pass real cost efficiencies to your bottom line — no unnecessary margins.</p>
              </div>
            </div>

            <div className="prime88-bento-col" data-aos="fade-up" data-aos-delay="200">
              <div className="prime88-bento-header">
                <div className="prime88-bento-header-tag">B</div>
                <span>Unmatched Quality & Design</span>
              </div>
              <div className="prime88-bento-card">
                <div className="prime88-bento-icon"><Star size={22} /></div>
                <h4 className="prime88-bento-title">High-End Materials</h4>
                <p className="prime88-bento-desc">Our PVC and WPC product lines meet international durability standards for heavy-use commercial environments.</p>
              </div>
              <div className="prime88-bento-card">
                <div className="prime88-bento-icon"><Palette size={22} /></div>
                <h4 className="prime88-bento-title">Wide Pattern Variety</h4>
                <p className="prime88-bento-desc">Over 80 surface textures and finishes — from timber grain to stone — to match any interior brief.</p>
              </div>
            </div>

            <div className="prime88-bento-col" data-aos="fade-up" data-aos-delay="300">
              <div className="prime88-bento-header">
                <div className="prime88-bento-header-tag">C</div>
                <span>Efficiency & Sustainability</span>
              </div>
              <div className="prime88-bento-card">
                <div className="prime88-bento-icon"><Zap size={22} /></div>
                <h4 className="prime88-bento-title">Fast Installation</h4>
                <p className="prime88-bento-desc">Click-and-lock systems reduce on-site installation time by up to 60% versus traditional alternatives.</p>
              </div>
              <div className="prime88-bento-card">
                <div className="prime88-bento-icon"><Leaf size={22} /></div>
                <h4 className="prime88-bento-title">Eco-Friendly Solutions</h4>
                <p className="prime88-bento-desc">VOC-free finishes, recyclable materials, and energy-efficient HVAC options support your sustainability goals.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Products - Aircon Business Focused (Golden Dragon Partnership Split Showcase) */}
      <motion.section
        className="prime88-partnership-section"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="prime88-partnership-bg-pattern" />
        <div className="prime88-partnership-container">
          <motion.div
            className="prime88-section-label light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
          >
            <div className="line" />
            <span>Additional Products</span>
            <div className="line" />
          </motion.div>

          <motion.div
            className="prime88-partnership-header-box"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="prime88-partnership-badge">In Partnership with Golden Dragon</div>
            <h2 className="prime88-heading light">Aircon Business Focused</h2>
            <p className="prime88-subheading light" style={{ marginBottom: '2.5rem' }}>
              Delivering top-tier commercial and industrial climate control solutions. Select an authorized brand below to view specialized unit specifications.
            </p>
          </motion.div>

          <div className="prime88-partnership-split-grid">
            {/* Left Column: Interactive Spotlight Card */}
            <motion.div
              className="prime88-spotlight-card"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            >
              <div className="prime88-spotlight-top">
                <span className="prime88-spotlight-tag">Active Portfolio Selection</span>
                <span className="prime88-spotlight-type">{selectedBrand.type}</span>
              </div>

              <div key={selectedBrand.id} className="prime88-spotlight-inner-content">
                <div className="prime88-spotlight-logo-box">
                  <img
                    src={selectedBrand.logo}
                    alt={selectedBrand.name}
                    className="prime88-spotlight-logo"
                  />
                </div>

                <h3 className="prime88-spotlight-title">{selectedBrand.name} Systems</h3>
                <p className="prime88-spotlight-tagline">{selectedBrand.tagline}</p>

                <div className="prime88-spotlight-specs">
                  {selectedBrand.specs.map((spec, i) => (
                    <div key={i} className="prime88-spotlight-spec-item">
                      <span className="prime88-spotlight-check">✓</span>
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="prime88-spotlight-cta-wrap">
                <Link
                  to="/contact"
                  className="prime88-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', background: '#A8832A', borderColor: '#A8832A' }}
                >
                  Inquire {selectedBrand.name} Systems <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>

            {/* Right Column: Brand Grid */}
            <motion.div
              className="prime88-brand-selector-grid"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
            >
              {PARTNERSHIP_BRANDS.map((brand, idx) => {
                const isActive = selectedBrand.id === brand.id;
                return (
                  <motion.button
                    key={brand.id}
                    type="button"
                    className={`prime88-brand-tile ${isActive ? 'active' : ''}`}
                    initial={{ opacity: 0, scale: 0.88, y: 15 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.4, delay: 0.15 + idx * 0.05 }}
                    whileHover={{ scale: 1.04, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedBrand(brand)}
                    onMouseEnter={() => setSelectedBrand(brand)}
                  >
                    {isActive && <div className="prime88-brand-tile-badge">✓ Selected</div>}
                    <div className="prime88-brand-tile-logo-box">
                      <img src={brand.logo} alt={brand.name} className="prime88-brand-tile-logo" />
                    </div>
                    <span className="prime88-brand-tile-name">{brand.name}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Featured Products */}
      <section className="prime88-products-section">
        <div className="prime88-products-container">
          <div className="prime88-section-label" data-aos="fade-up">
            <div className="line" />
            <span>Featured Products</span>
            <div className="line" />
          </div>
          <h2 className="prime88-heading" data-aos="fade-up">Products Built for Business</h2>
          <p className="prime88-subheading" data-aos="fade-up">
            From everyday consumables to bespoke fit-out materials — a unified quality standard across every SKU.
          </p>

          <div className="prime88-products-grid">
            {PRODUCTS.map((prod, idx) => (
              <div key={prod.name} className="prime88-product-card" data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="prime88-product-img-box">
                  <img src={prod.img} alt={prod.name} className="prime88-product-img" />
                  <div className="prime88-product-badge">{prod.badge}</div>
                </div>
                <div className="prime88-product-body">
                  <div className="prime88-product-cat">{prod.cat}</div>
                  <h4 className="prime88-product-name">{prod.name}</h4>
                  <p className="prime88-product-specs">{prod.specs}</p>
                  <button type="button" onClick={() => handleNav("inquire")} className="prime88-product-btn" style={{ textAlign: 'center', width: '100%' }}>
                    Inquire
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alliance Banner */}
      <section className="prime88-alliance-section">
        <div className="prime88-alliance-container" data-aos="fade-up">
          <div className="prime88-alliance-card">
            <div className="prime88-alliance-img">
              <div className="prime88-alliance-bg" style={{ backgroundImage: `url(${ASSETS.allianceBg})` }} />
            </div>
            <div className="prime88-alliance-body">
              <div className="prime88-alliance-tag">Our Strong Alliance</div>
              <h2 className="prime88-alliance-title">Backed by Alpha Premier Group</h2>
              <p className="prime88-alliance-desc">
                As a proud subsidiary of Alpha Premier Group, we share a commitment to excellence, innovation, and customer satisfaction. Our collaboration empowers us to deliver premium solutions with global standards while remaining locally grounded.
              </p>
              <button type="button" onClick={() => handleNav("services")} className="prime88-btn-primary">
                Know More About Us <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dark CTA */}
      <DarkCta headline="Ready to Supply Smarter?" sub="Let our procurement specialists design a tailored supply solution for your business." btnLabel="Request a Consultation" />
    </>
  );
}

// ==========================================
// HOW IT WORKS - INTERACTIVE TRUCK DELIVERY SECTION
// ==========================================
function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { num: 1, title: 'Send Inquiry', desc: 'Submit specifications or RFQ online', badge: 'RFQ Dispatched' },
    { num: 2, title: 'Get a Quote', desc: 'Receive wholesale B2B package quote', badge: 'Quote Ready' },
    { num: 3, title: 'Confirm Order', desc: 'Lock in pricing & dispatch schedule', badge: 'Order Processing' },
    { num: 4, title: 'Delivered', desc: 'Fast delivery straight to your location', badge: 'Delivered Successfully! 🎉' },
  ];

  const trackPositionPercent = (activeStep / (steps.length - 1)) * 100;

  return (
    <section style={{ padding: '6rem 1.5rem 7rem 1.5rem', background: '#ffffff', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div className="prime88-section-label" data-aos="fade-up">
          <div className="line" />
          <span>How It Works</span>
          <div className="line" />
        </div>
        <h2 className="prime88-heading" data-aos="fade-up">From Inquiry to Delivery</h2>
        <p className="prime88-subheading" data-aos="fade-up">
          Hover over each step to watch our logistics delivery truck in motion.
        </p>

        <div className="prime88-process-wrapper" data-aos="fade-up">
          {/* Main Delivery Road Track behind cards */}
          <div className="prime88-delivery-road-track">
            <div className="prime88-road-line-dashed" />
            <div className="prime88-road-fill-active" style={{ width: `${trackPositionPercent}%` }} />

            {/* Driving Delivery Truck */}
            <div className="prime88-track-truck-runner" style={{ left: `${trackPositionPercent}%` }}>
              <div className="prime88-track-truck-body">
                <img src={ASSETS.deliveryTruck} alt="Delivery Truck" className="prime88-truck-custom-icon" />
                <span>88 PRIME EXPRESS</span>
                <div className="prime88-truck-headlight" />
              </div>
              <div className="prime88-truck-dust-trail">
                <div className="prime88-dust-particle" />
                <div className="prime88-dust-particle" />
                <div className="prime88-dust-particle" />
              </div>
            </div>
          </div>

          {/* Steps Grid */}
          <div className="prime88-process-grid">
            {steps.map((step, idx) => {
              const isHovered = activeStep === idx;
              return (
                <div
                  key={step.title}
                  className={`prime88-process-step ${isHovered ? 'hovered' : ''}`}
                  onMouseEnter={() => setActiveStep(idx)}
                >
                  {isHovered && (
                    <div className="prime88-package-drop-badge">
                      <Package size={12} /> {step.badge}
                    </div>
                  )}

                  <div className="prime88-process-num">
                    {step.num}
                  </div>

                  <div style={{ fontSize: '0.6875rem', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A8832A', marginBottom: '0.35rem' }}>
                    Step {step.num}
                  </div>
                  <div className="prime88-process-title">{step.title}</div>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.4rem', lineHeight: '1.45' }}>{step.desc}</p>

                  {/* Mini Card Road with Driving Truck */}
                  <div className="prime88-step-hover-road">
                    <div className="prime88-step-mini-truck">
                      <img src={ASSETS.deliveryTruck} alt="Truck" className="prime88-mini-truck-icon" />
                      <Package size={10} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// SERVICES VIEW COMPONENT
// ==========================================
function ServicesView() {
  const services = [
    {
      icon: <Package size={28} />,
      title: "Bulk Supply Solutions",
      desc: "Efficient sourcing and distribution of office goods, consumables, and corporate supplies at scale — designed for businesses that need volume reliability.",
      tags: ["MOQ flexibility", "Consolidated invoicing", "Dedicated account management"]
    },
    {
      icon: <Truck size={28} />,
      title: "Fast Delivery Logistics",
      desc: "Timely, trackable delivery services keeping your operations running without interruption — across Metro Manila and key provincial hubs.",
      tags: ["Same-day Metro Manila", "Real-time tracking", "Fleet-managed distribution"]
    },
    {
      icon: <Layers size={28} />,
      title: "Interior Panels & PVC",
      desc: "Premium WPC and PVC wall panels with a wide pattern library — engineered for speed of installation and long-term durability in commercial environments.",
      tags: ["80+ textures & finishes", "Click-lock installation", "VOC-free certified"]
    },
    {
      icon: <Thermometer size={28} />,
      title: "HVAC Solutions",
      desc: "In exclusive partnership with Golden Dragon — a complete lineup of split-type and cassette inverter aircon units built for the Philippine climate.",
      tags: ["1.0–3.0 HP range", "R32 refrigerant", "5-star energy rated"]
    },
  ];

  return (
    <>
      <PageHeroHeader>
        <div className="prime88-hero-content" data-aos="fade-up">
          <div className="prime88-live-status-pill">
            <span className="prime88-live-dot" />
            <span>4 INTEGRATED SERVICE DIVISIONS</span>
          </div>
          <div className="prime88-section-label light">
            <div className="line" />
            <span>What We Offer</span>
            <div className="line" />
          </div>
          <h1 className="prime88-heading light prime88-shimmer-text">Our Services</h1>
          <p className="prime88-subheading light">
            From bulk procurement to last-mile delivery — four integrated service pillars designed around your operational demands.
          </p>
          <div className="prime88-hero-filters">
            {['Bulk Procurement', 'Fast Delivery', 'WPC Wall Panels', 'HVAC Systems'].map((pillar) => (
              <span key={pillar} className="prime88-filter-pill">
                ✓ {pillar}
              </span>
            ))}
          </div>
        </div>
      </PageHeroHeader>

      <section style={{ padding: '7rem 1.5rem', background: '#F4F6F9' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="prime88-section-label" data-aos="fade-up">
            <div className="line" />
            <span>Service Pillars</span>
            <div className="line" />
          </div>
          <h2 className="prime88-heading" data-aos="fade-up">Built Around Your Operations</h2>
          <p className="prime88-subheading" data-aos="fade-up">
            Each service is purpose-built, not bolted on — meaning the people, systems, and partners behind every offering are specialists, not generalists.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {services.map((svc, idx) => (
              <div key={svc.title} className="prime88-service-card" data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="prime88-service-icon">{svc.icon}</div>
                <h3 className="prime88-service-title">{svc.title}</h3>
                <p className="prime88-service-desc">{svc.desc}</p>
                
                {/* Modern Tag Chips */}
                <div className="prime88-service-tags-container">
                  {svc.tags.map((tag) => (
                    <span key={tag} className="prime88-service-chip">
                      <span className="prime88-chip-check">✓</span>
                      {tag}
                    </span>
                  ))}
                </div>

                <button type="button" onClick={() => handleNav("inquire")} className="prime88-division-cta">
                  Learn More <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works with Interactive Delivery Truck */}
      <HowItWorksSection />

      <DarkCta headline="Partner with Us" sub="Tell us what you need — we'll build the supply solution around your business." btnLabel="Contact Sales" />
    </>
  );
}

// ==========================================
// BLOGS VIEW COMPONENT
// ==========================================
function BlogsView({ handleNav }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const categories = ['All', 'Logistics', 'Product Spotlight', 'Industry Trends', 'Operations', 'Company News'];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCat = selectedCategory === 'All' || post.cat.toLowerCase() === selectedCategory.toLowerCase();
    const matchesQuery = !searchQuery || post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const featured = filteredPosts.length > 0 ? filteredPosts[0] : BLOG_POSTS[0];
  const rest = filteredPosts.length > 1 ? filteredPosts.slice(1) : filteredPosts.length === 1 && filteredPosts[0] !== BLOG_POSTS[0] ? [] : BLOG_POSTS.slice(1);

  return (
    <>
      <PageHeroHeader>
        <div className="prime88-hero-content" data-aos="fade-up">
          <div className="prime88-live-status-pill">
            <span className="prime88-live-dot" />
            <span>{BLOG_POSTS.length} INSIGHT ARTICLES PUBLISHED</span>
          </div>

          <div className="prime88-section-label light">
            <div className="line" />
            <span>Industry Insights</span>
            <div className="line" />
          </div>

          <h1 className="prime88-heading light prime88-shimmer-text">Blogs & Insights</h1>
          <p className="prime88-subheading light">
            Procurement intelligence, product spotlights, and logistics thinking — curated for B2B decision-makers.
          </p>

          {/* Interactive Search Bar */}
          <div className="prime88-hero-search-box">
            <input
              type="text"
              placeholder="Search procurement articles, logistics, HVAC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="prime88-hero-search-input"
            />
            <span style={{ color: '#D4A53A', paddingRight: '0.5rem', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
              🔍
            </span>
          </div>

          {/* Interactive Filter Pills */}
          <div className="prime88-hero-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`prime88-filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </PageHeroHeader>

      {/* Featured Insight */}
      <section style={{ padding: '5rem 1.5rem', background: '#F8F9FB' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8832A', marginBottom: '1.5rem' }}>
            Latest Insight
          </div>

          <div className="prime88-alliance-card" data-aos="fade-up">
            <div className="prime88-alliance-img" style={{ minHeight: '340px' }}>
              <img src={featured.img} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="prime88-alliance-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="prime88-blog-meta" style={{ marginBottom: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {featured.date}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {featured.read}</span>
              </div>
              <h2 className="prime88-alliance-title">{featured.title}</h2>
              <p className="prime88-alliance-desc">{featured.excerpt}</p>
              <button type="button" onClick={() => handleNav("inquire")} className="prime88-btn-primary" style={{ width: 'fit-content' }}>
                Read Article <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section style={{ padding: '4rem 1.5rem 6rem 1.5rem', background: '#F8F9FB' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 className="prime88-heading" style={{ textAlign: 'left', fontSize: '1.5rem', marginBottom: '2rem' }}>
            More Articles
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {rest.map((post, idx) => (
              <div key={post.title} className="prime88-blog-card" data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="prime88-blog-img-box">
                  <img src={post.img} alt={post.title} className="prime88-blog-img" />
                  <span className="prime88-blog-cat" style={{ background: post.catColor }}>{post.cat}</span>
                </div>
                <div className="prime88-blog-body">
                  <h3 className="prime88-blog-title">{post.title}</h3>
                  <p className="prime88-blog-excerpt">{post.excerpt}</p>
                  <div className="prime88-blog-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={11} /> {post.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={11} /> {post.read}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ padding: '4rem 1.5rem 6rem 1.5rem', background: '#ffffff' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }} data-aos="fade-up">
          <div style={{ borderRadius: '16px', padding: '3.5rem 2.5rem', background: 'linear-gradient(135deg, #0C1F3F 0%, #1A3560 100%)', color: '#ffffff' }}>
            <div className="prime88-section-label light">
              <div className="line" />
              <span>Stay Informed</span>
              <div className="line" />
            </div>
            <h2 className="prime88-heading light" style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Industry Insights, Monthly</h2>
            <p className="prime88-subheading light" style={{ marginBottom: '2rem' }}>No fluff — just relevant procurement, logistics, and product intelligence delivered to your inbox.</p>
            {submitted ? (
              <div style={{ color: '#D4A53A', fontWeight: '700' }}>✓ You're subscribed — thank you!</div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '460px', margin: '0 auto' }}>
                <input
                  type="email"
                  placeholder="your@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: '#ffffff', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => email && setSubmitted(true)}
                  className="prime88-btn-primary"
                  style={{ background: '#A8832A', border: 'none' }}
                >
                  Subscribe <Send size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ==========================================
// CAREERS VIEW COMPONENT
// ==========================================
function CareersView() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [candidateForm, setCandidateForm] = useState({ fullName: '', email: '', phone: '', coverNote: '' });
  const [resumeFileName, setResumeFileName] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = React.useRef(null);

  const perks = [
    { icon: <TrendingUp size={26} />, title: "Career Growth", desc: "Structured learning paths, mentorship from senior leaders, and real opportunities to grow within the Alpha Premier Group network." },
    { icon: <ShieldCheck size={26} />, title: "Comprehensive Benefits", desc: "Competitive base salary, HMO coverage from day one, performance bonuses, and government-mandated benefits — plus a little more." },
    { icon: <Heart size={26} />, title: "Great Culture", desc: "A collaborative, no-bureaucracy team where results are recognized, ideas are heard, and Fridays finish on time." },
  ];

  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!candidateForm.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!candidateForm.email.trim() || !/\S+@\S+\.\S+/.test(candidateForm.email)) errs.email = 'Valid Email Address is required';
    if (!candidateForm.phone.trim()) errs.phone = 'Mobile Number is required';
    if (!resumeFileName) errs.resume = 'Please attach your Resume file';
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fullName', candidateForm.fullName.trim());
      formData.append('email', candidateForm.email.trim());
      formData.append('phone', candidateForm.phone.trim());
      formData.append('coverLetter', candidateForm.coverNote.trim());
      formData.append('jobTitle', 'Spontaneous Application / Talent Pool');
      formData.append('enterprise', '88-prime');

      if (fileInputRef.current?.files?.[0]) {
        formData.append('resume', fileInputRef.current.files[0]);
      }

      const res = await fetch('/api/applicants.php', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok && result.success !== false) {
        setTicket(result.ticket || `APG-APP-${Date.now().toString().slice(-8)}`);
        setFormSubmitted(true);
      } else {
        setFormErrors({ submit: result.error || 'Submission failed. Please try again.' });
      }
    } catch {
      setFormErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeroHeader>
        <div className="prime88-hero-content" data-aos="fade-up">
          <div className="prime88-live-status-pill">
            <span className="prime88-live-dot" />
            <span>ACCEPTING SPONTANEOUS APPLICATIONS</span>
          </div>
          <div className="prime88-section-label light">
            <div className="line" />
            <span>Join the Team</span>
            <div className="line" />
          </div>
          <h1 className="prime88-heading light prime88-shimmer-text">Build Your Career With 88 Prime.</h1>
          <p className="prime88-subheading light">
            While we don't have active open roles right now, we are always excited to connect with proactive talent. Send us your resume anytime!
          </p>

          <div className="prime88-hero-filters">
            {['Sales & BD', 'Supply Chain', 'Operations', 'HVAC', 'Marketing'].map((dept) => (
              <span key={dept} className="prime88-filter-pill">
                ✦ {dept}
              </span>
            ))}
          </div>
        </div>
      </PageHeroHeader>

      {/* Perks */}
      <section style={{ padding: '6rem 1.5rem', background: '#ffffff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="prime88-section-label" data-aos="fade-up">
            <div className="line" />
            <span>Why Join Us</span>
            <div className="line" />
          </div>
          <h2 className="prime88-heading" data-aos="fade-up">A Place to Grow, Not Just Work</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '3rem' }}>
            {perks.map((perk, idx) => (
              <div key={perk.title} className="prime88-bento-card" style={{ textAlign: 'center', padding: '2rem' }} data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="prime88-service-icon" style={{ margin: '0 auto 1.25rem auto' }}>{perk.icon}</div>
                <h3 className="prime88-bento-title" style={{ fontSize: '1.15rem' }}>{perk.title}</h3>
                <p className="prime88-bento-desc">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* No Active Openings / General Resume Submission */}
      <section style={{ padding: '5rem 1.5rem 7rem 1.5rem', background: '#F4F6F9' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div className="prime88-section-label" data-aos="fade-up">
            <div className="line" />
            <span>Careers & Talent Pool</span>
            <div className="line" />
          </div>
          <h2 className="prime88-heading" data-aos="fade-up">No Active Openings Right Now</h2>
          <p className="prime88-subheading" data-aos="fade-up">
            We are constantly expanding! Send your resume directly to our talent database or email us, and our HR team will reach out as soon as a fitting position opens up.
          </p>

          {/* General Application Card */}
          <div className="prime88-general-app-card" data-aos="fade-up">
            {/* Direct Email Box */}
            <div className="prime88-email-direct-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                <div className="prime88-email-icon-circle">
                  <Mail size={22} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0C1F3F' }}>Direct Email Submission</h3>
                  <p style={{ fontSize: '0.825rem', color: '#64748B' }}>Email your resume & portfolio directly to our hiring team</p>
                </div>
              </div>
              <a
                href="mailto:careers@88prime.ph?subject=Spontaneous%20Job%20Application%20-%20Resume"
                className="prime88-btn-primary"
                style={{ width: '100%', justifyContent: 'center', background: '#0C1F3F', borderColor: '#0C1F3F', textDecoration: 'none' }}
              >
                <Mail size={16} /> Send Email to careers@88prime.ph <ArrowRight size={14} />
              </a>
            </div>

            <div style={{ textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.1em', color: '#94A3B8', textAlign: 'center', margin: '2rem 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              <span>OR SUBMIT YOUR RESUME ONLINE</span>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            </div>

            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#10B981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 1.25rem auto' }}>✓</div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0C1F3F', marginBottom: '0.5rem' }}>Resume Submitted Successfully!</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                  Thank you <strong style={{ color: '#A8832A' }}>{candidateForm.fullName}</strong>. Your resume has been logged into 88 Prime's talent acquisition database.
                </p>
                <div style={{ padding: '0.75rem 1rem', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#0C1F3F', maxWidth: '320px', margin: '0 auto 1.5rem auto' }}>
                  APPLICATION REF: <strong style={{ color: '#A8832A' }}>{ticket || `APG-APP-${Date.now().toString().slice(-8)}`}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => { setFormSubmitted(false); setCandidateForm({ fullName: '', email: '', phone: '', coverNote: '' }); setResumeFileName(''); }}
                  className="prime88-btn-primary"
                  style={{ background: '#0C1F3F', borderColor: '#0C1F3F' }}
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0C1F3F', marginBottom: '0.25rem', textAlign: 'left' }}>Candidate Information</h3>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#0C1F3F', marginBottom: '0.35rem' }}>FULL NAME *</label>
                  <input
                    type="text"
                    value={candidateForm.fullName}
                    onChange={(e) => setCandidateForm({ ...candidateForm, fullName: e.target.value })}
                    placeholder="Juan dela Cruz"
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '0.75rem', borderRadius: '10px', fontSize: '0.875rem', outline: 'none' }}
                  />
                  {formErrors.fullName && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.fullName}</p>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', textAlign: 'left' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#0C1F3F', marginBottom: '0.35rem' }}>EMAIL ADDRESS *</label>
                    <input
                      type="email"
                      value={candidateForm.email}
                      onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                      placeholder="juan@example.com"
                      style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '0.75rem', borderRadius: '10px', fontSize: '0.875rem', outline: 'none' }}
                    />
                    {formErrors.email && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.email}</p>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#0C1F3F', marginBottom: '0.35rem' }}>MOBILE NUMBER *</label>
                    <input
                      type="tel"
                      value={candidateForm.phone}
                      onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                      placeholder="+63 9XX XXX XXXX"
                      style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '0.75rem', borderRadius: '10px', fontSize: '0.875rem', outline: 'none' }}
                    />
                    {formErrors.phone && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.phone}</p>}
                  </div>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#0C1F3F', marginBottom: '0.35rem' }}>ATTACH RESUME (PDF/DOC) *</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setResumeFileName(f.name); }}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '0.5rem 0.75rem', borderRadius: '10px' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ background: '#A8832A', color: '#ffffff', border: 'none', padding: '0.55rem 1.15rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      ⬆ BROWSE FILE
                    </button>
                    <span style={{ fontSize: '0.875rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resumeFileName || "No file selected"}</span>
                  </div>
                  {formErrors.resume && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{formErrors.resume}</p>}
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#0C1F3F', marginBottom: '0.35rem' }}>COVER NOTE / CAREER INTENT</label>
                  <textarea
                    rows={3}
                    value={candidateForm.coverNote}
                    onChange={(e) => setCandidateForm({ ...candidateForm, coverNote: e.target.value })}
                    placeholder="Briefly describe your background or the areas of B2B sales, procurement, or trade you specialize in..."
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '0.75rem', borderRadius: '10px', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>

                {formErrors.submit && (
                  <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#B91C1C', fontSize: '0.8rem', fontWeight: 600 }}>
                    {formErrors.submit}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="prime88-btn-primary"
                  style={{ width: '100%', padding: '1rem', justifyContent: 'center', marginTop: '0.5rem', background: '#A8832A', borderColor: '#A8832A', opacity: submitting ? 0.6 : 1 }}
                >
                  <Send size={16} /> {submitting ? 'SUBMITTING RESUME...' : 'SUBMIT RESUME TO TALENT POOL'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ==========================================
// SHARED DARK CTA COMPONENT
// ==========================================
function DarkCta({ headline, sub, btnLabel }) {
  return (
    <section className="prime88-dark-cta">
      <div className="prime88-dark-cta-pattern" />
      <div className="prime88-dark-cta-content" data-aos="fade-up">
        <h2 className="prime88-dark-cta-title">{headline}</h2>
        <p className="prime88-dark-cta-sub">{sub}</p>
        <button type="button" onClick={() => window.enterpriseNavigate ? window.enterpriseNavigate("inquire") : null} className="prime88-dark-cta-btn">
          {btnLabel} <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

// ==========================================
// CUSTOM FOOTER COMPONENT
// ==========================================
function FooterView({ handleNav }) {
  return (
    <footer className="prime88-footer">
      <div className="prime88-footer-container">
        <div className="prime88-footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="prime88-brand-badge" style={{ background: '#A8832A' }}>88</div>
              <div>
                <div style={{ fontSize: '0.625rem', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8832A' }}>ALPHA PREMIER GROUP</div>
                <div className="prime88-footer-brand-title">88 Prime Consumer Goods Trading</div>
              </div>
            </div>
            <p className="prime88-footer-desc">
              Supplying businesses across the Philippines with premium goods, industrial materials, and HVAC solutions — backed by Alpha Premier Group.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              {[Linkedin, Facebook, Instagram].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyCenter: 'center', textDecoration: 'none' }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="prime88-footer-title">Navigation</div>
            <div className="prime88-footer-list">
              {[
                { id: 'home', label: 'Home' },
                { id: 'services', label: 'Services' },
                { id: 'careers', label: 'Careers' },
                { id: 'blogs', label: 'Blogs' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="prime88-footer-link"
                  onClick={() => handleNav(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="prime88-footer-title">Contact</div>
            <div className="prime88-footer-list">
              <div className="prime88-footer-contact-item">
                <span><Phone size={14} /></span>
                +63 2 8123 4567
              </div>
              <div className="prime88-footer-contact-item">
                <span><Mail size={14} /></span>
                info@88prime.com.ph
              </div>
              <div className="prime88-footer-contact-item">
                <span><MapPin size={14} /></span>
                Mandaluyong City, Metro Manila
              </div>
            </div>
          </div>
        </div>

        <div className="prime88-footer-bottom">
          <div>© {new Date().getFullYear()} 88 Prime Consumer Goods Trading. A Subsidiary of Alpha Premier Group. All Rights Reserved.</div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
