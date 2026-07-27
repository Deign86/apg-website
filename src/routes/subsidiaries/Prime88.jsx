import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
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
};

// ─── Data Definitions ─────────────────────────────────────────────────────────
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

export default function Prime88() {
  const [page, setPage] = useState('home'); // 'home' | 'services' | 'blogs' | 'careers'
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (p) => {
    setPage(p);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>88 Prime | Alpha Premier Group</title>
        <meta
          name="description"
          content="88 Prime Consumer Goods Trading — Supplying Smarter, Delivering Better. B2B corporate supplies, industrial PVC/WPC panels, and HVAC solutions."
        />
      </Helmet>

      <div className="prime88-wrapper">
        {/* ─── 88 PRIME TOPBAR NAVIGATION ─────────────────────────────────── */}
        <header className={`prime88-topbar ${scrolled ? 'scrolled' : ''}`}>
          <div className="prime88-topbar-inner">
            <button type="button" className="prime88-brand" onClick={() => handleNav('home')}>
              <div className="prime88-brand-badge">88</div>
              <div className="prime88-brand-copy">
                <span>ALPHA PREMIER GROUP</span>
                <strong>88 Prime Consumer Goods</strong>
              </div>
            </button>

            <nav className="prime88-nav-links">
              {[
                { id: 'home', label: 'Home' },
                { id: 'services', label: 'Services' },
                { id: 'careers', label: 'Careers' },
                { id: 'blogs', label: 'Blogs' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`prime88-nav-btn ${page === item.id ? 'active' : ''}`}
                  onClick={() => handleNav(item.id)}
                >
                  {item.label}
                </button>
              ))}

              <Link to="/contact" className="prime88-inquire-cta">
                Inquire Now
              </Link>
            </nav>

            <button
              type="button"
              className="prime88-mobile-burger"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle Navigation"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className={`prime88-mobile-menu ${menuOpen ? 'open' : ''}`}>
            {[
              { id: 'home', label: 'Home' },
              { id: 'services', label: 'Services' },
              { id: 'careers', label: 'Careers' },
              { id: 'blogs', label: 'Blogs' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className="prime88-mobile-nav-btn"
                onClick={() => handleNav(item.id)}
              >
                {item.label}
              </button>
            ))}
            <Link to="/contact" className="prime88-inquire-cta" style={{ textAlign: 'center', width: '100%' }}>
              Inquire Now
            </Link>
          </div>
        </header>

        {/* ─── PAGE BODY VIEWS ────────────────────────────────────────────── */}
        <main>
          {page === 'home' && <HomeView handleNav={handleNav} />}
          {page === 'services' && <ServicesView />}
          {page === 'blogs' && <BlogsView />}
          {page === 'careers' && <CareersView />}
        </main>

        {/* ─── 88 PRIME CUSTOM FOOTER ─────────────────────────────────────── */}
        <FooterView handleNav={handleNav} />
      </div>
    </>
  );
}

// ==========================================
// HOME VIEW COMPONENT
// ==========================================
function HomeView({ handleNav }) {
  return (
    <>
      {/* Hero */}
      <section className="prime88-hero">
        <div className="prime88-hero-bg" style={{ backgroundImage: `url(${ASSETS.heroBg})` }} />
        <div className="prime88-hero-overlay" />
        <div className="prime88-hero-line" />

        <div className="prime88-hero-content" data-aos="fade-up">
          <div className="prime88-hero-badge">A Subsidiary of Alpha Premier Group</div>
          <h1 className="prime88-hero-title">
            SUPPLYING SMARTER.
            <br />
            <span>DELIVERING BETTER.</span>
          </h1>
          <p className="prime88-hero-desc">Everyday Essentials, Delivered Exceptionally.</p>

          <div className="prime88-hero-actions">
            <button type="button" className="prime88-btn-primary" onClick={() => handleNav('services')}>
              Explore Our Divisions <ChevronRight size={18} />
            </button>
            <Link to="/contact" className="prime88-btn-secondary">
              Request a Quote
            </Link>
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
      </section>

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
                <Link to="/contact" className="prime88-division-cta">
                  Request Quote <ArrowRight size={14} />
                </Link>
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
                  <Link to="/contact" className="prime88-product-btn" style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                    Inquire
                  </Link>
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
              <Link to="/about" className="prime88-btn-primary">
                Know More About Us <ArrowRight size={14} />
              </Link>
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
// SERVICES VIEW COMPONENT
// ==========================================
function ServicesView() {
  const services = [
    { icon: <Package size={28} />, title: "Bulk Supply Solutions", desc: "Efficient sourcing and distribution of office goods, consumables, and corporate supplies at scale — designed for businesses that need volume reliability.", detail: "✓ MOQ flexibility  ·  ✓ Consolidated invoicing  ·  ✓ Dedicated account management" },
    { icon: <Truck size={28} />, title: "Fast Delivery Logistics", desc: "Timely, trackable delivery services keeping your operations running without interruption — across Metro Manila and key provincial hubs.", detail: "✓ Same-day Metro Manila  ·  ✓ Real-time tracking  ·  ✓ Fleet-managed distribution" },
    { icon: <Layers size={28} />, title: "Interior Panels & PVC", desc: "Premium WPC and PVC wall panels with a wide pattern library — engineered for speed of installation and long-term durability in commercial environments.", detail: "✓ 80+ textures & finishes  ·  ✓ Click-lock installation  ·  ✓ VOC-free certified" },
    { icon: <Thermometer size={28} />, title: "HVAC Solutions", desc: "In exclusive partnership with Golden Dragon — a complete lineup of split-type and cassette inverter aircon units built for the Philippine climate.", detail: "✓ 1.0–3.0 HP range  ·  ✓ R32 refrigerant  ·  ✓ 5-star energy rated" },
  ];

  return (
    <>
      <section className="prime88-page-hero">
        <div className="prime88-dark-cta-pattern" />
        <div className="prime88-hero-content" data-aos="fade-up">
          <div className="prime88-section-label light">
            <div className="line" />
            <span>What We Offer</span>
            <div className="line" />
          </div>
          <h1 className="prime88-heading light">Our Services</h1>
          <p className="prime88-subheading light">
            From bulk procurement to last-mile delivery — four integrated service pillars designed around your operational demands.
          </p>
        </div>
        <div className="prime88-hero-line" />
      </section>

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
                <div className="prime88-service-detail">{svc.detail}</div>
                <Link to="/contact" className="prime88-division-cta">
                  Learn More <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '5rem 1.5rem', background: '#ffffff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="prime88-section-label" data-aos="fade-up">
            <div className="line" />
            <span>How It Works</span>
            <div className="line" />
          </div>
          <h2 className="prime88-heading" data-aos="fade-up">From Inquiry to Delivery</h2>

          <div className="prime88-process-grid" style={{ marginTop: '3.5rem' }}>
            {['Send Inquiry', 'Get a Quote', 'Confirm Order', 'Delivered'].map((step, idx) => (
              <div key={step} className="prime88-process-step" data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="prime88-process-num">{idx + 1}</div>
                <div style={{ fontSize: '0.6875rem', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A8832A', marginBottom: '0.25rem' }}>
                  Step {idx + 1}
                </div>
                <div className="prime88-process-title">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DarkCta headline="Partner with Us" sub="Tell us what you need — we'll build the supply solution around your business." btnLabel="Contact Sales" />
    </>
  );
}

// ==========================================
// BLOGS VIEW COMPONENT
// ==========================================
function BlogsView() {
  const featured = BLOG_POSTS[0];
  const rest = BLOG_POSTS.slice(1);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <section className="prime88-page-hero">
        <div className="prime88-dark-cta-pattern" />
        <div className="prime88-hero-content" data-aos="fade-up">
          <div className="prime88-section-label light">
            <div className="line" />
            <span>Industry Insights</span>
            <div className="line" />
          </div>
          <h1 className="prime88-heading light">Blogs & Insights</h1>
          <p className="prime88-subheading light">
            Procurement intelligence, product spotlights, and logistics thinking — curated for B2B decision-makers.
          </p>
        </div>
        <div className="prime88-hero-line" />
      </section>

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
              <Link to="/contact" className="prime88-btn-primary" style={{ width: 'fit-content' }}>
                Read Article <ArrowRight size={14} />
              </Link>
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
  const [openIdx, setOpenIdx] = useState(null);

  const perks = [
    { icon: <TrendingUp size={26} />, title: "Career Growth", desc: "Structured learning paths, mentorship from senior leaders, and real opportunities to grow within the Alpha Premier Group network." },
    { icon: <ShieldCheck size={26} />, title: "Comprehensive Benefits", desc: "Competitive base salary, HMO coverage from day one, performance bonuses, and government-mandated benefits — plus a little more." },
    { icon: <Heart size={26} />, title: "Great Culture", desc: "A collaborative, no-bureaucracy team where results are recognized, ideas are heard, and Fridays finish on time." },
  ];

  return (
    <>
      <section className="prime88-page-hero">
        <div className="prime88-dark-cta-pattern" />
        <div className="prime88-hero-content" data-aos="fade-up">
          <div className="prime88-section-label light">
            <div className="line" />
            <span>Join the Team</span>
            <div className="line" />
          </div>
          <h1 className="prime88-heading light">Build Your Career With 88 Prime.</h1>
          <p className="prime88-subheading light">
            We're a fast-moving B2B trading company backed by Alpha Premier Group. We hire people who take ownership, move fast, and care about the work.
          </p>
        </div>
        <div className="prime88-hero-line" />
      </section>

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

      {/* Positions Accordion */}
      <section style={{ padding: '5rem 1.5rem 7rem 1.5rem', background: '#F4F6F9' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div className="prime88-section-label" data-aos="fade-up">
            <div className="line" />
            <span>Open Positions</span>
            <div className="line" />
          </div>
          <h2 className="prime88-heading" data-aos="fade-up">Find Your Role</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '2.5rem' }}>
            {JOBS.map((job, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={job.title} className={`prime88-job-row ${isOpen ? 'open' : ''}`} data-aos="fade-up" data-aos-delay={idx * 60}>
                  <button type="button" className="prime88-job-header" onClick={() => setOpenIdx(isOpen ? null : idx)}>
                    <div>
                      <div className="prime88-job-title">{job.title}</div>
                      <div className="prime88-job-meta">{job.dept} · {job.loc}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '99px', background: 'rgba(12,31,63,0.07)', color: '#0C1F3F' }}>
                        {job.type}
                      </span>
                      <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                    </div>
                  </button>

                  <div className="prime88-job-drawer" style={{ maxHeight: isOpen ? '260px' : '0' }}>
                    <div className="prime88-job-drawer-inner">
                      <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: '1.6', marginBottom: '1rem' }}>
                        We're looking for a driven and detail-oriented <strong style={{ color: '#0C1F3F' }}>{job.title}</strong> to join our team. You'll work closely with cross-functional partners across procurement, logistics, and client-facing roles.
                      </p>
                      <Link to="/contact" className="prime88-btn-primary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }}>
                        Apply Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '3rem', borderRadius: '12px', padding: '2rem', background: '#ffffff', border: '1px solid rgba(12, 31, 63, 0.08)', textAlign: 'center' }} data-aos="fade-up">
            <GraduationCap size={28} style={{ color: '#A8832A', margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0C1F3F', marginBottom: '0.5rem' }}>Don't see your role?</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.25rem' }}>We're always open to talented people. Send us your CV and we'll reach out when the right opportunity comes up.</p>
            <Link to="/contact" className="prime88-btn-primary">
              Submit General Application <ArrowRight size={14} />
            </Link>
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
        <Link to="/contact" className="prime88-dark-cta-btn">
          {btnLabel} <ArrowRight size={16} />
        </Link>
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
