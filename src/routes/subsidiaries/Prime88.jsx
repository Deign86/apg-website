import { getTurnstileToken } from '@/lib/turnstile';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { EnterpriseSeo } from '../../components/Seo';
import { motion } from 'framer-motion';
import AOS from 'aos';
import {
  ChevronRight, Briefcase, Layers, Wind, Users, TrendingDown,
  Star, Palette, Zap, Leaf, Mail, ArrowRight, ArrowLeft, Package, Truck, Thermometer,
  Calendar, Clock, Send, TrendingUp, ShieldCheck, Heart,
} from 'lucide-react';
import './Prime88.css';

// ─── Media Assets ─────────────────────────────────────────────────────────────
const ASSETS = {
  heroBg: '/assets/88prime/hero_background.webp',
  shippingContainerYard: '/assets/88prime/Shipping_container_yard.webp',
  woodPanelRoom: '/assets/88prime/Wood_panel_room.webp',
  businessNewspaper: '/assets/88prime/Business_newspaper.webp',
  warehouseBoxes: '/assets/88prime/Warehouse-boxes.webp',
  coworkersAtLaptop: '/assets/88prime/Coworkers_at_laptop.webp',
  cargoContainers: '/assets/88prime/Cargo_containers.webp',
  teamAtTable: '/assets/88prime/Team_at_table__tall__col_1__careers.webp',
  womanAtDesk: '/assets/88prime/Woman_at_desk__top_right__careers.webp',
  groupWithLaptops: '/assets/88prime/Group_with_laptops__bottom_right__careers.webp',
  allianceBg: '/assets/88prime/alliance-bg.jpg',
  productChair: '/assets/88prime/product-chair.jpg',
  productPanel: '/assets/88prime/product-wallpanel.jpg',
  productAc: '/assets/88prime/product-ac.jpg',
  productPaper: '/assets/88prime/product-paper.jpg',
  deliveryTruck: '/assets/88prime/delivery_truck.png',
};

// ─── Data Definitions ─────────────────────────────────────────────────────────
// Page copy, division cards and the aircon brand showcase are in the content registry
// (page '88prime', api/data/content-schema.json); icons stay here, assigned by position.
const DIVISION_ICONS = [Briefcase, Layers, Wind];
const ADVANTAGE_ICONS = [[Users, TrendingDown], [Star, Palette], [Zap, Leaf]];
const PERK_ICONS = [TrendingUp, ShieldCheck, Heart];

/** "a\nb" -> ["a", "b"] (repeater fields typed one item per line). */
const lines = (text) => String(text || '').split('\n').map((line) => line.trim()).filter(Boolean);

// Catalog products and service pillars live in service_items (category '88prime', kind
// 'product' / 'service'; seeded by api/migrate.php, edited in /admin/services). Products map
// tag -> category line, summary -> badge, description -> specs. This list renders while loading
// and replaces the data only if the request fails.
const CATALOG_FALLBACK = [
  { id: 'p1', kind: 'product', image_url: ASSETS.productChair, tag: "Corporate Essentials", title: "Executive Ergonomic Chair", description: "Mesh back · Lumbar support · Adjustable armrests · 5-year warranty", summary: "Bestseller" },
  { id: 'p2', kind: 'product', image_url: ASSETS.productPanel, tag: "Industrial Materials", title: "WPC Wall Panel – Timber Oak", description: "2.9m × 0.18m · Click-lock · 8mm thick · VOC-free finish", summary: "New Arrival" },
  { id: 'p3', kind: 'product', image_url: ASSETS.productAc, tag: "HVAC Solutions", title: "Golden Dragon Split-Type AC", description: "1.5 HP · Inverter · 5-star energy rating · R32 refrigerant", summary: "Featured" },
  { id: 'p4', kind: 'product', image_url: ASSETS.productPaper, tag: "Corporate Essentials", title: "A4 Copy Paper — Premium Ream", description: "80 GSM · Acid-free · 500 sheets · Carton pricing available", summary: "High Volume" },
  { id: 's1', kind: 'service', title: "Bulk Supply Solutions", description: "Efficient sourcing and distribution of office goods, consumables, and corporate supplies at scale — designed for businesses that need volume reliability.", features: ["MOQ flexibility", "Consolidated invoicing", "Dedicated account management"] },
  { id: 's2', kind: 'service', title: "Fast Delivery Logistics", description: "Timely, trackable delivery services keeping your operations running without interruption — across Metro Manila and key provincial hubs.", features: ["Same-day Metro Manila", "Real-time tracking", "Fleet-managed distribution"] },
  { id: 's3', kind: 'service', title: "Interior Panels & PVC", description: "Premium WPC and PVC wall panels with a wide pattern library — engineered for speed of installation and long-term durability in commercial environments.", features: ["80+ textures & finishes", "Click-lock installation", "VOC-free certified"] },
  { id: 's4', kind: 'service', title: "HVAC Solutions", description: "In exclusive partnership with Golden Dragon — a complete lineup of split-type and cassette inverter aircon units built for the Philippine climate.", features: ["1.0–3.0 HP range", "R32 refrigerant", "5-star energy rated"] },
];

// Category accent colours used by the blog filter pills and card badges.
const CATEGORY_COLORS = {
  'Logistics': '#2563EB',
  'Product Spotlight': '#7C3AED',
  'Industry Trends': '#059669',
  'Operations': '#DC2626',
  'Company News': '#D97706',
};

import { useEnterpriseNav, useEnterpriseSection } from '../../context/EnterpriseNavContext';
import EnterpriseInquire from './EnterpriseInquire';
import { useContent } from '@/hooks/useContent';
import { useCareers } from '@/hooks/useCareers';
import { useSiteSettings, companyContact } from '@/hooks/useSiteSettings';
import { useServices } from '@/hooks/useServices';
import { useNewsletter } from '@/hooks/useNewsletter';
import { useBlogPostParam } from '@/hooks/useBlogPostParam';
import { BlogBody } from '@/components/BlogBody';
import { resumeFileError } from '@/lib/resumeFile';
import { ApplicantExtrasFields, useApplicantExtras } from '@/components/careers/ApplicantExtrasFields';
import { emailError, nameError, phoneError, textError } from '@/lib/formValidation';
import { MAIN_SITE_HREF } from '../../lib/enterpriseHost';

export default function Prime88() {
  const { setCurrentPage, registerNavigator } = useEnterpriseNav();
  const [page, goSection] = useEnterpriseSection();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // `interest` (optional): the product/brand/service an "Inquire" button was clicked on.
  const [inquiryInterest, setInquiryInterest] = useState('');
  const handleNav = useCallback((p, interest = '') => {
    setInquiryInterest(typeof interest === 'string' ? interest : '');
    goSection(p);
  }, [goSection]);

  useEffect(() => registerNavigator((p) => handleNav(p)), [registerNavigator, handleNav]);

  useEffect(() => {
    setCurrentPage(page);
  }, [page, setCurrentPage]);

  return (
    <>
      <EnterpriseSeo slug="88prime" page={page} />
      <Helmet>
        <link rel="icon" type="image/png" href="/assets/images/sstcompany-88prime11.png" />
      </Helmet>

      <div className="prime88-wrapper">
        {/* ─── PAGE BODY VIEWS ────────────────────────────────────────────── */}
        <div>
          {page === 'home' && <HomeView handleNav={handleNav} />}
          {page === 'services' && <ServicesView handleNav={handleNav} />}
          {page === 'blogs' && <BlogsView handleNav={handleNav} />}
          {page === 'careers' && <CareersView handleNav={handleNav} />}
          {page === 'inquire' && <EnterpriseInquire key={inquiryInterest} interest={inquiryInterest} />}
        </div>
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
  const { services: catalog } = useServices('88prime', CATALOG_FALLBACK);
  const products = catalog.filter((item) => item.kind === 'product');

  // Admin-editable copy (content page '88prime'); defaults = the original copy.
  const { content } = useContent('88prime');
  const brands = content.brands.map((brand) => ({ ...brand, specs: lines(brand.specs) }));
  const [selectedBrandIdx, setSelectedBrandIdx] = useState(0);
  const selectedBrand = brands[selectedBrandIdx] || brands[0];

  return (
    <>
      {/* Hero */}
      <PageHeroHeader className="prime88-hero">
        <div className="prime88-hero-bg" style={{ backgroundImage: `url(${ASSETS.heroBg})` }} />
        <div className="prime88-hero-overlay" />

        <div className="prime88-hero-content" data-aos="fade-up">
          <div className="prime88-hero-badge">{content.hero_badge}</div>
          <h1 className="prime88-hero-title">
            {content.hero_line1}
            <br />
            <span className="prime88-shimmer-text">{content.hero_line2}</span>
          </h1>
          <p className="prime88-hero-desc">{content.hero_subtext}</p>

          <div className="prime88-hero-actions">
            <button type="button" className="prime88-btn-primary" onClick={() => handleNav('services')}>
              Explore Our Divisions <ChevronRight size={18} />
            </button>
            <button type="button" onClick={() => handleNav("inquire")} className="prime88-btn-secondary">
              Request a Quote
            </button>
          </div>

          <div className="prime88-stats-grid">
            {content.hero_stats.map((stat, idx) => (
              <div key={idx} className="prime88-stat-card">
                <span className="prime88-stat-value">{stat.value}</span>
                <span className="prime88-stat-label">{stat.label}</span>
              </div>
            ))}
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
            {content.divisions_intro}
          </p>

          <div className="prime88-divisions-grid">
            {content.divisions.map((division, idx) => {
              const Icon = DIVISION_ICONS[idx % DIVISION_ICONS.length];
              const toInquiry = division.button_action === 'Inquiry form';
              return (
                <div key={idx} className="prime88-division-card" data-aos="fade-up" data-aos-delay={(idx + 1) * 100}>
                  <div className="prime88-division-img-box">
                    <img src={division.image} alt={division.title} className="prime88-division-img" />
                    <div className="prime88-division-overlay" />
                    <div className="prime88-division-icon">
                      <Icon size={24} />
                    </div>
                    {division.badge && <div className="prime88-division-badge">{division.badge}</div>}
                  </div>
                  <div className="prime88-division-body">
                    <div className="prime88-division-tag">{division.tag}</div>
                    <h3 className="prime88-division-title">{division.title}</h3>
                    <p className="prime88-division-desc">
                      {division.desc}
                    </p>
                    <button type="button" className="prime88-division-cta" onClick={() => handleNav(toInquiry ? 'inquire' : 'services', toInquiry ? division.title : '')}>
                      {division.button_label} <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
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
            {content.advantage_intro}
          </p>

          <div className="prime88-bento-grid">
            {content.advantage_columns.map((column, idx) => {
              const [Icon1, Icon2] = ADVANTAGE_ICONS[idx % ADVANTAGE_ICONS.length];
              return (
                <div key={idx} className="prime88-bento-col" data-aos="fade-up" data-aos-delay={(idx + 1) * 100}>
                  <div className="prime88-bento-header">
                    <div className="prime88-bento-header-tag">{String.fromCharCode(65 + (idx % 26))}</div>
                    <span>{column.title}</span>
                  </div>
                  <div className="prime88-bento-card">
                    <div className="prime88-bento-icon"><Icon1 size={22} /></div>
                    <h4 className="prime88-bento-title">{column.point1_title}</h4>
                    <p className="prime88-bento-desc">{column.point1_text}</p>
                  </div>
                  <div className="prime88-bento-card">
                    <div className="prime88-bento-icon"><Icon2 size={22} /></div>
                    <h4 className="prime88-bento-title">{column.point2_title}</h4>
                    <p className="prime88-bento-desc">{column.point2_text}</p>
                  </div>
                </div>
              );
            })}
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
              {content.brands_intro}
            </p>
          </motion.div>

          {selectedBrand && (
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

              <div key={selectedBrandIdx} className="prime88-spotlight-inner-content">
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
                <button
                  type="button"
                  onClick={() => handleNav('inquire', `${selectedBrand.name} systems`)}
                  className="prime88-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', background: '#A8832A', borderColor: '#A8832A' }}
                >
                  Inquire {selectedBrand.name} Systems <ArrowRight size={16} />
                </button>
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
              {brands.map((brand, idx) => {
                const isActive = selectedBrandIdx === idx;
                return (
                  <motion.button
                    key={idx}
                    type="button"
                    className={`prime88-brand-tile ${isActive ? 'active' : ''}`}
                    initial={{ opacity: 0, scale: 0.88, y: 15 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.4, delay: 0.15 + idx * 0.05 }}
                    whileHover={{ scale: 1.04, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    aria-pressed={isActive}
                    onClick={() => setSelectedBrandIdx(idx)}
                    onMouseEnter={() => setSelectedBrandIdx(idx)}
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
          )}
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

          {products.length === 0 && (
            <p className="prime88-subheading" data-aos="fade-up">Our product catalog is being updated — send us an inquiry for current items and pricing.</p>
          )}
          <div className="prime88-products-grid">
            {products.map((prod, idx) => (
              <div key={prod.id} className="prime88-product-card" data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="prime88-product-img-box">
                  <img src={prod.image_url || ASSETS.warehouseBoxes} alt={prod.title} loading="lazy" decoding="async" className="prime88-product-img" />
                  {prod.summary && <div className="prime88-product-badge">{prod.summary}</div>}
                </div>
                <div className="prime88-product-body">
                  {prod.tag && <div className="prime88-product-cat">{prod.tag}</div>}
                  <h4 className="prime88-product-name">{prod.title}</h4>
                  {prod.description && <p className="prime88-product-specs">{prod.description}</p>}
                  {prod.price && <p className="prime88-product-price">{prod.price}</p>}
                  <button type="button" onClick={() => handleNav("inquire", prod.title)} className="prime88-product-btn" style={{ textAlign: 'center', width: '100%' }}>
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
              <h2 className="prime88-alliance-title">{content.alliance_title}</h2>
              <p className="prime88-alliance-desc">
                {content.alliance_desc}
              </p>
              <a href={`${MAIN_SITE_HREF}enterprises`} className="prime88-btn-primary" style={{ textDecoration: 'none' }}>
                Know More About Us <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Dark CTA */}
      <DarkCta headline={content.cta_heading} sub={content.cta_text} btnLabel="Request a Consultation" />
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
          Hover over or tap each step to watch our logistics delivery truck in motion.
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
                  onClick={() => setActiveStep(idx)}
                >
                  {isHovered && (
                    <div className="prime88-package-drop-badge">
                      <Package size={12} /> {step.badge}
                    </div>
                  )}

                  <div className="prime88-process-num">
                    {step.num}
                  </div>

                  <div style={{ fontSize: '0.875rem', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A8832A', marginBottom: '0.35rem' }}>
                    Step {step.num}
                  </div>
                  <div className="prime88-process-title">{step.title}</div>
                  <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.4rem', lineHeight: '1.45' }}>{step.desc}</p>

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
function ServicesView({ handleNav }) {
  // Icons stay in code, assigned by position.
  const icons = [<Package size={28} />, <Truck size={28} />, <Layers size={28} />, <Thermometer size={28} />];
  const { services: catalog } = useServices('88prime', CATALOG_FALLBACK);
  const serviceList = catalog
    .filter((item) => item.kind === 'service')
    .map((s, i) => ({
      key: s.id,
      icon: icons[i % icons.length],
      title: s.title,
      desc: s.description || s.summary || '',
      price: s.price || '',
      tags: Array.isArray(s.features) ? s.features : [],
    }));

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

          {serviceList.length === 0 && (
            <p className="prime88-subheading" data-aos="fade-up">Our service lineup is being updated — contact our sales team for what we can supply today.</p>
          )}
          <div className="prime88-grid-2" style={{ gap: '1.5rem' }}>
            {serviceList.map((svc, idx) => (
              <div key={svc.key} className="prime88-service-card" data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="prime88-service-icon">{svc.icon}</div>
                <h3 className="prime88-service-title">{svc.title}</h3>
                {svc.price && <p className="prime88-service-price">{svc.price}</p>}
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

                <button type="button" onClick={() => handleNav("inquire", svc.title)} className="prime88-division-cta">
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
function BlogsView() {
  const { postSlug, closePost, postLink } = useBlogPostParam();
  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const newsletter = useNewsletter('88prime');

  useEffect(() => {
    fetch('/api/blogs.php?enterprise=88prime')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || !Array.isArray(data.data)) {
          setPosts([]);
          return;
        }
        setPosts(data.data.map((p) => ({
          id: String(p.id),
          slug: p.slug || String(p.id),
          content: p.content || p.excerpt || '',
          img: p.cover_image_url || ASSETS.businessNewspaper,
          cat: p.category || 'Company News',
          catColor: CATEGORY_COLORS[p.category] || '#D97706',
          title: p.title,
          excerpt: p.excerpt || '',
          date: p.published_at
            ? new Date(String(p.published_at).replace(' ', 'T')).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : '',
          read: p.read_time || '4 min read',
          featured: Number(p.is_featured) === 1,
        })));
      })
      .catch(() => setPosts([]))
      .finally(() => setLoaded(true));
  }, []);

  const categories = ['All', ...Array.from(new Set(posts.map((p) => p.cat).filter(Boolean)))];

  const filteredPosts = posts.filter((post) => {
    const matchesCat = selectedCategory === 'All' || post.cat.toLowerCase() === selectedCategory.toLowerCase();
    const matchesQuery = !searchQuery || post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const featured = filteredPosts.find((p) => p.featured) ?? filteredPosts[0];
  const rest = filteredPosts.filter((p) => p !== featured);

  if (postSlug) {
    // Wait for the posts before deciding a deep-linked article doesn't exist.
    if (!loaded) return <div style={{ minHeight: '100vh', background: '#F8F9FB' }} role="status" aria-label="Loading article" />;
    const post = posts.find((p) => p.slug === postSlug);
    return <BlogArticle post={post} related={posts.filter((p) => p !== post).slice(0, 3)} postLink={postLink} onBack={closePost} />;
  }

  return (
    <>
      <PageHeroHeader>
        <div className="prime88-hero-content" data-aos="fade-up">
          <div className="prime88-live-status-pill">
            <span className="prime88-live-dot" />
            <span>{posts.length} INSIGHT ARTICLES PUBLISHED</span>
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
              aria-label="Search articles"
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

      {!featured && (
        <section style={{ padding: '5rem 1.5rem', background: '#F8F9FB', textAlign: 'center' }}>
          <p className="prime88-subheading" role="status">
            {posts.length > 0 ? 'No articles match your search.' : 'New articles are on the way — check back soon.'}
          </p>
        </section>
      )}

      {/* Featured Insight */}
      {featured && (
      <section style={{ padding: '5rem 1.5rem', background: '#F8F9FB' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A8832A', marginBottom: '1.5rem' }}>
            Latest Insight
          </div>

          <div className="prime88-alliance-card" data-aos="fade-up">
            {featured && (
            <>
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
              <a {...postLink(featured.slug)} className="prime88-btn-primary" style={{ width: 'fit-content', textDecoration: 'none' }}>
                Read Article <ArrowRight size={14} />
              </a>
            </div>
            </>
            )}
          </div>
        </div>
      </section>
      )}

      {/* Articles Grid */}
      {rest.length > 0 && (
      <section style={{ padding: '4rem 1.5rem 6rem 1.5rem', background: '#F8F9FB' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 className="prime88-heading" style={{ textAlign: 'left', fontSize: '1.5rem', marginBottom: '2rem' }}>
            More Articles
          </h2>
          <div className="prime88-grid-3" style={{ gap: '1.5rem' }}>
            {rest.map((post, idx) => (
              <div key={post.id} className="prime88-blog-card" data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="prime88-blog-img-box">
                  <img src={post.img} alt={post.title} loading="lazy" decoding="async" className="prime88-blog-img" />
                  <span className="prime88-blog-cat" style={{ background: post.catColor }}>{post.cat}</span>
                </div>
                <div className="prime88-blog-body">
                  <h3 className="prime88-blog-title">
                    <a {...postLink(post.slug)} style={{ color: 'inherit', textDecoration: 'none' }}>{post.title}</a>
                  </h3>
                  <p className="prime88-blog-excerpt">{post.excerpt}</p>
                  <div className="prime88-blog-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={11} /> {post.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={11} /> {post.read}</span>
                  </div>
                  <a {...postLink(post.slug)} className="prime88-division-cta" aria-label={`Read article: ${post.title}`} style={{ textDecoration: 'none', marginTop: '1rem' }}>
                    Read Article <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Newsletter */}
      <section style={{ padding: '4rem 1.5rem 6rem 1.5rem', background: '#ffffff' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }} data-aos="fade-up">
          <div style={{ borderRadius: '16px', padding: '3.5rem clamp(1.25rem, 5vw, 2.5rem)', background: 'linear-gradient(135deg, #0C1F3F 0%, #1A3560 100%)', color: '#ffffff' }}>
            <div className="prime88-section-label light">
              <div className="line" />
              <span>Stay Informed</span>
              <div className="line" />
            </div>
            <h2 className="prime88-heading light" style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Industry Insights, Monthly</h2>
            <p className="prime88-subheading light" style={{ marginBottom: '2rem' }}>No fluff — just relevant procurement, logistics, and product intelligence delivered to your inbox.</p>
            {newsletter.status === 'done' ? (
              <div role="status" style={{ color: '#D4A53A', fontWeight: '700' }}>✓ You're subscribed — check your inbox for a confirmation.</div>
            ) : (
              <form noValidate onSubmit={newsletter.subscribe} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', maxWidth: '460px', margin: '0 auto' }}>
                <input
                  {...newsletter.inputProps}
                  aria-label="Your email address"
                  placeholder="your@company.com"
                  value={newsletter.email}
                  onChange={(e) => newsletter.setEmail(e.target.value)}
                  style={{ flex: '1 1 12rem', minWidth: 0, padding: '0.75rem 1rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: '#ffffff' }}
                />
                <button
                  type="submit"
                  disabled={newsletter.status === 'sending'}
                  className="prime88-btn-primary"
                  style={{ background: '#A8832A', border: 'none' }}
                >
                  {newsletter.status === 'sending' ? 'Subscribing…' : 'Subscribe'} <Send size={14} />
                </button>
              </form>
            )}
            {newsletter.status === 'error' && (
              <p id={newsletter.errorId} role="alert" style={{ color: '#FCA5A5', fontWeight: '600', marginTop: '0.75rem' }}>{newsletter.error}</p>
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
  const contact = companyContact(useSiteSettings(), '88prime');
  const formStartedAt = useRef(Date.now());
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [candidateForm, setCandidateForm] = useState({ fullName: '', email: '', phone: '', coverNote: '' });
  const [resumeFileName, setResumeFileName] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = React.useRef(null);

  // Admin-editable copy (content page '88prime'); openings via useCareers('88prime').
  const { content: careerCopy } = useContent('88prime');
  const { jobs } = useCareers('88prime', []);
  const [selectedJob, setSelectedJob] = useState(null);
  const appCardRef = useRef(null);

  const perks = careerCopy.careers_perks.map((perk, i) => {
    const Icon = PERK_ICONS[i % PERK_ICONS.length];
    return { ...perk, icon: <Icon size={26} /> };
  });

  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState('');
  const extras = useApplicantExtras(selectedJob);

  const candidateFieldError = (field, value) => {
    if (field === 'fullName') return nameError(value);
    if (field === 'email') return emailError(value);
    if (field === 'phone') return phoneError(value);
    return textError(value, { label: 'Cover note', max: 5000 });
  };
  const updateCandidate = (field, value) => {
    setCandidateForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        const problem = candidateFieldError(field, value);
        if (problem) next[field] = problem;
        else delete next[field];
        return next;
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    for (const field of ['fullName', 'email', 'phone', 'coverNote']) {
      const problem = candidateFieldError(field, candidateForm[field]);
      if (problem) errs[field] = problem;
    }
    if (!resumeFileName) errs.resume = 'Please attach your Resume file';
    const extrasProblem = extras.validate();
    if (Object.keys(errs).length > 0 || extrasProblem) {
      setFormErrors(errs);
      const first = Object.keys(errs)[0];
      const ids = { fullName: 'p88-apply-fullName', email: 'p88-apply-email', phone: 'p88-apply-phone', resume: 'p88-apply-resume-browse', coverNote: 'p88-apply-note' };
      if (first) document.getElementById(ids[first])?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fullName', candidateForm.fullName.trim());
      formData.append('email', candidateForm.email.trim());
      formData.append('phone', candidateForm.phone.trim());
      formData.append('coverLetter', candidateForm.coverNote.trim());
      formData.append('jobTitle', selectedJob ? selectedJob.title : 'Spontaneous Application / Talent Pool');
      if (selectedJob && /^\d+$/.test(String(selectedJob.id))) formData.append('jobId', String(selectedJob.id));
      formData.append('enterprise', '88-prime');

      if (fileInputRef.current?.files?.[0]) {
        formData.append('resume', fileInputRef.current.files[0]);
      }
      extras.append(formData);

      formData.append('form_started_at', String(formStartedAt.current));
      formData.append('turnstile_token', await getTurnstileToken());
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
            <span>{jobs.length > 0 ? `${jobs.length} OPEN ROLE${jobs.length === 1 ? '' : 'S'} · NOW HIRING` : 'ACCEPTING SPONTANEOUS APPLICATIONS'}</span>
          </div>
          <div className="prime88-section-label light">
            <div className="line" />
            <span>Join the Team</span>
            <div className="line" />
          </div>
          <h1 className="prime88-heading light prime88-shimmer-text">{careerCopy.careers_heading}</h1>
          <p className="prime88-subheading light">
            {jobs.length > 0 ? careerCopy.careers_subtext_open : careerCopy.careers_subtext}
          </p>

          <div className="prime88-hero-filters">
            {careerCopy.careers_departments.map((dept) => (
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

          <div className="prime88-grid-3" style={{ gap: '1.5rem', marginTop: '3rem' }}>
            {perks.map((perk, idx) => (
              <div key={idx} className="prime88-bento-card" style={{ textAlign: 'center', padding: '2rem' }} data-aos="fade-up" data-aos-delay={idx * 100}>
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
          <h2 className="prime88-heading" data-aos="fade-up">{jobs.length > 0 ? 'Current Openings' : 'No Active Openings Right Now'}</h2>
          <p className="prime88-subheading" data-aos="fade-up">
            {jobs.length > 0
              ? 'Explore our current openings below, or send your resume directly to our talent database — our HR team will reach out as soon as a fitting position opens up.'
              : 'We are constantly expanding! Send your resume directly to our talent database or email us, and our HR team will reach out as soon as a fitting position opens up.'}
          </p>

          {jobs.length > 0 && (
            <div className="prime88-grid-2" style={{ gap: '1.25rem', marginBottom: '2.5rem', textAlign: 'left' }} data-aos="fade-up">
              {jobs.map((j) => (
                <div key={j.id} style={{ background: '#ffffff', border: selectedJob && selectedJob.id === j.id ? '2px solid #A8832A' : '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A8832A', marginBottom: '0.5rem' }}>
                    {j.tag || 'General'} • {j.type || 'Full-time'}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0C1F3F', marginBottom: '0.5rem' }}>{j.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.75rem', lineHeight: '1.5' }}>{j.description}</p>
                  {[j.location, j.salary].filter(Boolean).length > 0 && (
                    <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem' }}>
                      {[j.location, j.salary].filter(Boolean).join(' • ')}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => { setSelectedJob(j); appCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                    className="prime88-btn-primary"
                    style={{ background: '#0C1F3F', borderColor: '#0C1F3F' }}
                  >
                    Apply for this Role <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

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
                  <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Email your resume & portfolio directly to our hiring team</p>
                </div>
              </div>
              <a
                href={`mailto:${contact.email}?subject=Spontaneous%20Job%20Application%20-%20Resume`}
                className="prime88-btn-primary"
                style={{ width: '100%', justifyContent: 'center', background: '#0C1F3F', borderColor: '#0C1F3F', textDecoration: 'none' }}
              >
                <Mail size={16} /> Send Email to {contact.email} <ArrowRight size={14} />
              </a>
            </div>

            <div style={{ textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: '800', letterSpacing: '0.1em', color: '#94A3B8', textAlign: 'center', margin: '2rem 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                <div style={{ padding: '0.75rem 1rem', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'monospace', color: '#0C1F3F', maxWidth: '320px', margin: '0 auto 1.5rem auto' }}>
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
              <form noValidate ref={appCardRef} onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', scrollMarginTop: '96px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0C1F3F', marginBottom: '0.25rem', textAlign: 'left' }}>Candidate Information</h3>
                {selectedJob && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#0C1F3F', background: '#FEF9EC', border: '1px solid #A8832A', borderRadius: '8px', padding: '0.6rem 0.85rem', textAlign: 'left' }}>
                    <span>Applying for: <strong style={{ color: '#A8832A' }}>{selectedJob.title}</strong></span>
                    <button type="button" onClick={() => setSelectedJob(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#64748B', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}>
                      General application instead
                    </button>
                  </div>
                )}

                <div style={{ textAlign: 'left' }}>
                  <label htmlFor="p88-apply-fullName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', textTransform: 'uppercase', color: '#0C1F3F', marginBottom: '0.35rem' }}>FULL NAME *</label>
                  <input
                    type="text"
                    id="p88-apply-fullName"
                    autoComplete="name"
                    required
                    maxLength={100}
                    aria-invalid={!!formErrors.fullName}
                    aria-describedby={formErrors.fullName ? 'p88-apply-fullName-error' : undefined}
                    value={candidateForm.fullName}
                    onChange={(e) => updateCandidate('fullName', e.target.value)}
                    placeholder="Juan dela Cruz"
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '0.75rem', borderRadius: '10px', fontSize: '1rem' }}
                  />
                  {formErrors.fullName && <p id="p88-apply-fullName-error" style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{formErrors.fullName}</p>}
                </div>

                <div className="prime88-grid-2" style={{ gap: '1rem', textAlign: 'left' }}>
                  <div>
                    <label htmlFor="p88-apply-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', textTransform: 'uppercase', color: '#0C1F3F', marginBottom: '0.35rem' }}>EMAIL ADDRESS *</label>
                    <input
                      type="email"
                      id="p88-apply-email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      aria-invalid={!!formErrors.email}
                      aria-describedby={formErrors.email ? 'p88-apply-email-error' : undefined}
                      value={candidateForm.email}
                      onChange={(e) => updateCandidate('email', e.target.value)}
                      placeholder="juan@example.com"
                      style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '0.75rem', borderRadius: '10px', fontSize: '1rem' }}
                    />
                    {formErrors.email && <p id="p88-apply-email-error" style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{formErrors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="p88-apply-phone" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', textTransform: 'uppercase', color: '#0C1F3F', marginBottom: '0.35rem' }}>MOBILE NUMBER *</label>
                    <input
                      type="tel"
                      id="p88-apply-phone"
                      autoComplete="tel"
                      required
                      inputMode="tel"
                      maxLength={30}
                      aria-invalid={!!formErrors.phone}
                      aria-describedby={formErrors.phone ? 'p88-apply-phone-error' : undefined}
                      value={candidateForm.phone}
                      onChange={(e) => updateCandidate('phone', e.target.value)}
                      placeholder="+63 9XX XXX XXXX"
                      style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '0.75rem', borderRadius: '10px', fontSize: '1rem' }}
                    />
                    {formErrors.phone && <p id="p88-apply-phone-error" style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{formErrors.phone}</p>}
                  </div>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label htmlFor="p88-apply-resume" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', textTransform: 'uppercase', color: '#0C1F3F', marginBottom: '0.35rem' }}>ATTACH RESUME (PDF/DOC) *</label>
                  <input
                    id="p88-apply-resume"
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const error = resumeFileError(f);
                      if (error) {
                        e.target.value = '';
                        setResumeFileName('');
                        setFormErrors((prev) => ({ ...prev, resume: error }));
                        return;
                      }
                      setResumeFileName(f.name);
                      setFormErrors(({ resume: _cleared, ...rest }) => rest);
                    }}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '0.5rem 0.75rem', borderRadius: '10px' }}>
                    <button
                      type="button"
                      id="p88-apply-resume-browse"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ background: '#A8832A', color: '#ffffff', border: 'none', minHeight: '44px', flexShrink: 0, padding: '0.55rem 1.15rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      ⬆ BROWSE FILE
                    </button>
                    <span style={{ fontSize: '0.875rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resumeFileName || "No file selected"}</span>
                  </div>
                  {formErrors.resume && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{formErrors.resume}</p>}
                </div>

                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <ApplicantExtrasFields
                    extras={extras}
                    labelClassName="block text-sm font-extrabold uppercase text-[#0C1F3F] mb-[0.35rem]"
                    inputClassName="w-full bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded-[10px] text-base file:mr-3 file:rounded-md file:border-0 file:bg-[#A8832A] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
                    hintClassName="text-[#64748B] text-sm mt-1"
                    errorClassName="text-[#EF4444] text-sm mt-1"
                  />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label htmlFor="p88-apply-note" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '800', textTransform: 'uppercase', color: '#0C1F3F', marginBottom: '0.35rem' }}>COVER NOTE / CAREER INTENT</label>
                  <textarea
                    id="p88-apply-note"
                    rows={3}
                    maxLength={5000}
                    aria-invalid={!!formErrors.coverNote}
                    aria-describedby={formErrors.coverNote ? 'p88-apply-note-error' : undefined}
                    value={candidateForm.coverNote}
                    onChange={(e) => updateCandidate('coverNote', e.target.value)}
                    placeholder="Briefly describe your background or the areas of B2B sales, procurement, or trade you specialize in..."
                    style={{ width: '100%', background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '0.75rem', borderRadius: '10px', fontSize: '1rem' }}
                  />
                  {formErrors.coverNote && <p id="p88-apply-note-error" style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{formErrors.coverNote}</p>}
                </div>

                {formErrors.submit && (
                  <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#B91C1C', fontSize: '0.875rem', fontWeight: 600 }}>
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
  const { navigate } = useEnterpriseNav();
  return (
    <section className="prime88-dark-cta">
      <div className="prime88-dark-cta-pattern" />
      <div className="prime88-dark-cta-content" data-aos="fade-up">
        <h2 className="prime88-dark-cta-title">{headline}</h2>
        <p className="prime88-dark-cta-sub">{sub}</p>
        <button type="button" onClick={() => navigate('inquire')} className="prime88-dark-cta-btn">
          {btnLabel} <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

// ==========================================
// BLOG ARTICLE VIEW (?post=<slug>)
// ==========================================
function BlogArticle({ post, related, postLink, onBack }) {
  const backButton = (
    <button type="button" onClick={onBack} className="prime88-division-cta" style={{ minHeight: '44px' }}>
      <ArrowLeft size={14} /> All Articles
    </button>
  );

  if (!post) {
    return (
      <>
        <PageHeroHeader>
          <div className="prime88-hero-content" data-aos="fade-up">
            <h1 className="prime88-heading light">Article not found</h1>
            <p className="prime88-subheading light">This article is no longer available. Browse the latest insights from 88 Prime instead.</p>
          </div>
        </PageHeroHeader>
        <section style={{ padding: '3rem 1.5rem 5rem 1.5rem', background: '#F8F9FB', textAlign: 'center' }}>{backButton}</section>
      </>
    );
  }

  return (
    <article>
      <Helmet><title>{`${post.title} | 88 Prime`}</title></Helmet>
      <PageHeroHeader>
        <div className="prime88-hero-content" data-aos="fade-up">
          <div className="prime88-section-label light">
            <div className="line" />
            <span>{post.cat}</span>
            <div className="line" />
          </div>
          <h1 className="prime88-heading light">{post.title}</h1>
          <div className="prime88-hero-filters">
            {post.date && <span className="prime88-filter-pill"><Calendar size={12} /> {post.date}</span>}
            <span className="prime88-filter-pill"><Clock size={12} /> {post.read}</span>
          </div>
        </div>
      </PageHeroHeader>

      <section style={{ padding: '3.5rem 1.5rem 4rem 1.5rem', background: '#ffffff' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>{backButton}</div>
          <img src={post.img} alt="" style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: '12px', marginBottom: '2.5rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <BlogBody
              content={post.content}
              paragraphClassName="prime88-article-p"
              headingClassName="prime88-article-h"
              strongClassName="prime88-article-strong"
              listClassName="prime88-article-list"
            />
          </div>
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            {backButton}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section style={{ padding: '4rem 1.5rem 6rem 1.5rem', background: '#F8F9FB' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <h2 className="prime88-heading" style={{ textAlign: 'left', fontSize: '1.5rem', marginBottom: '2rem' }}>More Articles</h2>
            <div className="prime88-grid-3" style={{ gap: '1.5rem' }}>
              {related.map((p) => (
                <div key={p.id} className="prime88-blog-card">
                  <div className="prime88-blog-img-box">
                    <img src={p.img} alt="" loading="lazy" decoding="async" className="prime88-blog-img" />
                    <span className="prime88-blog-cat" style={{ background: p.catColor }}>{p.cat}</span>
                  </div>
                  <div className="prime88-blog-body">
                    <h3 className="prime88-blog-title">
                      <a {...postLink(p.slug)} style={{ color: 'inherit', textDecoration: 'none' }}>{p.title}</a>
                    </h3>
                    <p className="prime88-blog-excerpt">{p.excerpt}</p>
                    <a {...postLink(p.slug)} className="prime88-division-cta" aria-label={`Read article: ${p.title}`} style={{ textDecoration: 'none', marginTop: '1rem' }}>
                      Read Article <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
