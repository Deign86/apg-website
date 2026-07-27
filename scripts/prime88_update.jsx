import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  Factory,
  ShieldCheck,
  Truck,
  Users,
  Wind,
  Menu,
  X,
} from 'lucide-react';
import '../src/routes/subsidiaries/Prime88.css';

const heroImage = '/assets/88prime/hero.jpg';
const supplyImage = '/assets/88prime/support.jpg';
const materialsImage = '/assets/88prime/feature.jpg';
const hvacImage = '/assets/88prime/insight.jpg';
const blogImage = '/assets/88prime/blog.jpg';

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'careers', label: 'Careers' },
  { id: 'blogs', label: 'Blogs' },
];

const divisions = [
  {
    label: 'DIVISION 01',
    title: 'Corporate Essentials',
    description: 'A comprehensive catalog of premium office supplies, consumables, and workplace essentials sourced directly and delivered in bulk.',
    image: supplyImage,
    button: 'Inquire',
  },
  {
    label: 'DIVISION 02',
    title: 'Industrial Materials',
    description: 'High-performance PVC and WPC panels with a wide pattern library, engineered for fast installation and long-term durability.',
    image: materialsImage,
    button: 'Request Quote',
  },
  {
    label: 'DIVISION 03',
    title: 'HVAC Solutions',
    description: 'In partnership with Golden Dragon, we deliver split-type and cassette solutions for commercial environments.',
    image: hvacImage,
    button: 'Learn More',
  },
];

const advantageCards = [
  {
    title: 'Expertise & Cost-Effectiveness',
    text: 'Direct sourcing relationships allow us to pass real cost efficiencies to your bottom line. No unnecessary margins.',
    icon: Briefcase,
  },
  {
    title: 'Unmatched Quality & Design',
    text: 'Our PVC and WPC product lines meet international durability standards for heavy-use commercial environments.',
    icon: ShieldCheck,
  },
  {
    title: 'Efficiency & Sustainability',
    text: 'Click-and-track delivery systems reduce on-site installation time by up to 60% versus traditional alternatives.',
    icon: Truck,
  },
  {
    title: 'Wide Pattern Variety',
    text: 'Over 80 surface textures and finishes — from timber grain to stone — to match any interior brief.',
    icon: Factory,
  },
];

const processSteps = [
  { label: 'STEP 1', title: 'Send Inquiry' },
  { label: 'STEP 2', title: 'Get a Quote' },
  { label: 'STEP 3', title: 'Confirm Order' },
  { label: 'STEP 4', title: 'Delivered' },
];

const blogPosts = [
  {
    title: 'WPC vs PVC Panels: Which Is Right for Your Fit-Out?',
    description: 'A practical breakdown of both material choices for durability, moisture resistance, and installation speed.',
    label: 'Product Spotlight',
    image: materialsImage,
  },
  {
    title: 'Same-Day Delivery: Inside Our Metro Manila Dispatch System',
    description: 'How our logistics team maintains a 98% on-time rate across 12 cities in the National Capital Region.',
    label: 'Logistics',
    image: supplyImage,
  },
  {
    title: 'The Role of Dependable Partners in Operational Continuity',
    description: 'Why resilient business partnerships make a measurable difference when timelines and expectations shift.',
    label: 'Operations',
    image: hvacImage,
  },
];

export default function Prime88() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const toggleMenu = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <Helmet>
        <title>88 Prime | Alpha Premier</title>
        <meta
          name="description"
          content="88 Prime delivers premium B2B supply, logistics, and procurement support as a trusted subsidiary of Alpha Premier Group."
        />
      </Helmet>

      <div className="prime88-page">
        <header className="prime88-topbar">
          <div className="prime88-topbar-inner">
            <Link to="/subsidiaries/88prime" className="prime88-brand" onClick={closeMenu}>
              <span className="prime88-brand-badge">88</span>
              <div className="prime88-brand-copy">
                <span>ALPHA PREMIER GROUP</span>
                <strong>88 Prime Consumer Goods</strong>
              </div>
            </Link>

            <nav className={`prime88-links ${menuOpen ? 'open' : ''}`}>
              {navItems.map((item) => (
                <a key={item.id} href={`#${item.id}`} onClick={closeMenu}>
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="prime88-topbar-actions">
              <Link to="/contact" className="prime88-cta" onClick={closeMenu}>
                Inquire Now
              </Link>
              <button type="button" className="prime88-burger" onClick={toggleMenu}>
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </header>

        <main>
          <section className="prime88-hero" id="home">
            <div className="prime88-hero-bg" style={{ backgroundImage: `url(${heroImage})` }} />
            <div className="prime88-hero-overlay" />
            <div className="prime88-hero-copy">
              <span className="prime88-eyebrow">A Subsidiary of Alpha Premier Group</span>
              <h1>
                Supplying smarter.
                <br />
                <span>Delivering better.</span>
              </h1>
              <p>Everyday essentials, delivered exceptionally for businesses that demand premium execution.</p>

              <div className="prime88-hero-buttons">
                <a href="#services" className="prime88-btn" onClick={closeMenu}>
                  Explore Our Divisions <ChevronRight size={18} />
                </a>
                <Link to="/contact" className="prime88-btn-alt" onClick={closeMenu}>
                  Request a Quote
                </Link>
              </div>

              <div className="prime88-hero-stats">
                <div className="prime88-hero-stat">
                  <strong>500+</strong>
                  <span>Active Corporate Clients</span>
                </div>
                <div className="prime88-hero-stat">
                  <strong>12+</strong>
                  <span>Years in Operation</span>
                </div>
                <div className="prime88-hero-stat">
                  <strong>80+</strong>
                  <span>Panel Textures Available</span>
                </div>
              </div>
            </div>
          </section>

          <section className="prime88-section prime88-section-light" id="services">
            <div className="prime88-section-header">
              <span>CORE DIVISIONS</span>
              <h2>What We Supply</h2>
              <p>Three specialized divisions designed to cover your business from office floor to facility ceiling.</p>
            </div>

            <div className="prime88-grid prime88-grid-3">
              {divisions.map((division) => (
                <article key={division.title} className="prime88-card prime88-service-card" data-aos="fade-up">
                  <div className="prime88-card-media">
                    <img src={division.image} alt={division.title} />
                  </div>
                  <div className="prime88-card-body">
                    <span>{division.label}</span>
                    <h3>{division.title}</h3>
                    <p>{division.description}</p>
                    <div className="prime88-card-action">
                      <span>{division.button}</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="prime88-section prime88-section-white">
            <div className="prime88-section-header">
              <span>WHY 88 PRIME</span>
              <h2>The 88 Prime Advantage</h2>
              <p>Precision sourcing, premium quality, and operational efficiency — built into every engagement.</p>
            </div>

            <div className="prime88-grid prime88-grid-4">
              {advantageCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.title} className="prime88-card prime88-advantage-card" data-aos="fade-up">
                    <div className="prime88-card-icon">
                      <Icon size={18} />
                    </div>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="prime88-section prime88-section-light">
            <div className="prime88-section-header">
              <span>HOW IT WORKS</span>
              <h2>From Inquiry to Delivery</h2>
            </div>

            <div className="prime88-process-grid">
              {processSteps.map((step) => (
                <div key={step.title} className="prime88-process-step" data-aos="fade-up">
                  <div className="prime88-step-number">{step.label}</div>
                  <h3>{step.title}</h3>
                </div>
              ))}
            </div>
          </section>

          <section className="prime88-section prime88-section-white">
            <div className="prime88-stats-block" data-aos="fade-up">
              <div className="prime88-metric-card">
                <strong>500+</strong>
                <span>Active Corporate Clients</span>
              </div>
              <div className="prime88-metric-card">
                <strong>98%</strong>
                <span>On-Time Delivery Rate</span>
              </div>
              <div className="prime88-metric-card">
                <strong>80+</strong>
                <span>Panel Textures Available</span>
              </div>
              <div className="prime88-metric-card">
                <strong>12+</strong>
                <span>Years in Operation</span>
              </div>
            </div>
          </section>

          <section className="prime88-section prime88-section-dark">
            <div className="prime88-cta-panel" data-aos="fade-up">
              <div>
                <span>PARTNER WITH US</span>
                <h2>Ready to Supply Smarter?</h2>
                <p>Let our procurement specialists design a tailored supply solution for your business.</p>
              </div>
              <Link to="/contact" className="prime88-cta prime88-cta-panel-btn" onClick={closeMenu}>
                Request a Consultation
              </Link>
            </div>
          </section>

          <section className="prime88-section prime88-section-light" id="blogs">
            <div className="prime88-section-header">
              <span>INDUSTRY INSIGHTS</span>
              <h2>Blogs & Insights</h2>
              <p>Procurement intelligence, product spotlights, and logistics thinking — curated for B2B decision-makers.</p>
            </div>

            <div className="prime88-featured-article" data-aos="fade-up">
              <img src={blogImage} alt="Latest insight" />
              <div className="prime88-featured-body">
                <span>LATEST INSIGHT</span>
                <h3>How Direct Sourcing Cuts Cost Without Cutting Corners</h3>
                <p>We break down the economics of B2B direct procurement and show how smart supplier relationships translate to margin wins.</p>
                <div className="prime88-card-action">
                  <span>Read Article</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>

            <div className="prime88-grid prime88-grid-3 prime88-more-articles">
              {blogPosts.map((post) => (
                <article key={post.title} className="prime88-card prime88-list-card" data-aos="fade-up">
                  <div className="prime88-list-image">
                    <img src={post.image} alt={post.title} />
                  </div>
                  <div className="prime88-card-body">
                    <span>{post.label}</span>
                    <h3>{post.title}</h3>
                    <p>{post.description}</p>
                    <div className="prime88-card-action">
                      <span>Read</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <footer className="prime88-footer">
            <div className="prime88-footer-inner">
              <div className="prime88-footer-brand">
                <span className="prime88-brand-badge">88</span>
                <div>
                  <span>ALPHA PREMIER GROUP</span>
                  <strong>88 Prime Consumer Goods Trading</strong>
                </div>
              </div>
              <p>Supplying businesses across the Philippines with premium goods, industrial materials, and HVAC solutions — backed by Alpha Premier Group.</p>
            </div>
            <div className="prime88-footer-links">
              <div>
                <p>Navigation</p>
                <a href="#home">Home</a>
                <a href="#services">Services</a>
                <a href="#careers">Careers</a>
                <a href="#blogs">Blogs</a>
              </div>
              <div>
                <p>Contact</p>
                <a href="tel:+63281234567">+63 2 8123 4567</a>
                <a href="mailto:info@88prime.com.ph">info@88prime.com.ph</a>
                <span>Mandaluyong City, Metro Manila</span>
              </div>
            </div>

            <p className="prime88-copy">© 2026 88 Prime Consumer Goods Trading. A Subsidiary of Alpha Premier Group. All Rights Reserved.</p>
          </footer>
        </main>
      </div>
    </>
  );
}
