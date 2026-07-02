import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import './Home.css';

const enterprises = [
  { name: 'Alpha Premier Realty', href: '/subsidiaries/realty', img: '/assets/images/sstcompany-realtyncons.png' },
  { name: 'Swift Clear', href: '/subsidiaries/swiftclear', img: '/assets/images/sstcompany-swiftclear.png' },
  { name: 'Dynamic Tree', href: '/subsidiaries/dynamic-tree', img: '/assets/images/sstcompany-dynamictree.png' },
  { name: 'Luxe Prime', href: '/subsidiaries/luxe-prime', img: '/assets/images/logo-horizontal-transparent.png' },
  { name: 'AltaVenture', href: '/subsidiaries/alta-venture', img: '/assets/images/logo-horizontal-transparent.png' },
  { name: 'Alpha Premier Construction', href: '/subsidiaries/construction', img: '/assets/images/sstcompany-realtyncons.png' },
  { name: '88 Prime', href: '/subsidiaries/88prime', img: '/assets/images/logo-horizontal-transparent.png' },
];

const propTypes = [
  { name: 'Condominium', img: '/assets/images/realty-condominium.png', href: '/properties' },
  { name: 'Commercial Space', img: '/assets/images/realty-officespaces.png', href: '/properties' },
  { name: 'Office Space', img: '/assets/images/realty-officespaces.png', href: '/properties' },
  { name: 'Warehouse', img: '/assets/images/realty-warehouse.png', href: '/properties' },
];

const coreValues = [
  { title: 'Excellence', description: 'We set the highest standards, leading by example and ensuring there are no shortcuts\u2014only meticulous execution and uncompromising quality.', short: 'We set the highest standards, leading by example and ensuring there are no shortcuts.', icon: 'fa-gem' },
  { title: 'Partnership', description: 'We believe in mutual growth, working closely with our clients and teams to achieve shared success and long-term value.', short: 'We believe in mutual growth, working closely with our clients.', icon: 'fa-handshake' },
  { title: 'Innovation', description: 'We embrace change, continuously evolving and leading in every industry by anticipating needs and creating impactful solutions.', short: 'We embrace change, continuously evolving.', icon: 'fa-lightbulb' },
  { title: 'Integrity', description: 'We build trust through transparency and deliver on our promises, always acting with honesty and responsibility.', short: 'We build trust through transparency.', icon: 'fa-shield' },
  { title: 'Legacy', description: 'We build enduring businesses that make a meaningful impact, inspiring future generations through innovation, purpose, and dedication.', short: 'We build enduring businesses.', icon: 'fa-monument' },
];

const aboutText = 'Alpha Premier Group of Companies is a diversified Philippine-based business group serving as the parent organization of several companies operating across real estate, business support, construction, and professional services. With a commitment to innovation, professionalism, and service excellence, the group provides integrated solutions that support businesses, investors, and entrepreneurs in achieving sustainable growth. Leading the organization is Mr. Mark Anthony Abito-Santos, President and Chief Executive Officer, whose vision and leadership continue to drive the expansion of the group across multiple industries. Under his guidance, Alpha Premier Group has developed a strong network of partnerships and business opportunities throughout the Philippines. At the forefront of the organization is Alpha Premier Realty, the flagship company of the group and one of the leading brokerage firms in the Philippines. The company specializes in residential, commercial, and industrial real estate, offering brokerage and advisory services for commercial spaces, warehouses, office buildings, and residential properties. Through its extensive market knowledge and strong industry network, Alpha Premier Realty connects property owners, developers, and investors with strategic real estate opportunities across the country. Expanding beyond real estate, Alpha Premier Group of Companies also operates a range of complementary businesses designed to support the operational and growth needs of modern enterprises. These include Alpha Premier Virtual Office \u2013 Ortigas Business Center, strategically located at the Philippine Stock Exchange Centre, Tektite East Tower, Ortigas Center, Pasig City, providing premium virtual office services, prestigious business addresses, and flexible workspace solutions for startups, entrepreneurs, and expanding companies. The group\u2019s portfolio also includes companies providing business solutions and corporate support services, professional cleaning and facility services, modeling and talent management, as well as construction services and construction materials supply. By bringing together these specialized services under one organization, Alpha Premier Group is able to deliver comprehensive solutions tailored to the needs of its diverse clientele. Guided by a strong vision for growth and excellence, Alpha Premier Group of Companies continues to expand its network and strengthen its presence across key industries. Through its companies and partnerships, the group remains committed to building long-term relationships with businesses, developers, investors, and communities throughout the Philippines.';

const missionBullets = [
  'Strengthen Alpha Premier Realty as one of the leading brokerage firms in the Philippines, specializing in residential, commercial, and industrial real estate, including commercial spaces, warehouses, and office developments.',
  'Provide businesses and entrepreneurs with strategic support through Alpha Premier Realty Virtual Office \u2013 Ortigas Business Center, offering prestigious business addresses and flexible workspace solutions in prime business districts.',
  'Expand and develop complementary industries including business solutions, professional cleaning and facility services, modeling and talent management, and construction services and materials supply.',
  'Foster long-term partnerships with developers, corporations, investors, and entrepreneurs through professionalism, integrity, and operational excellence.',
  'Continuously innovate and grow our group of companies while creating opportunities that contribute to the development of businesses, communities, and the national economy.',
];

const visionText = 'To become a leading and globally recognized Philippine business group, setting the standard in real estate brokerage, business services, and diversified industries by delivering innovative solutions, creating sustainable value, and contributing to the economic growth of the Philippines.';

export default function Home() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    setTimeout(() => document.body.classList.add('loaded'), 100);
  }, []);

  return (
    <>
      <Helmet>
        <title>Alpha Premier | Group of Companies</title>
      </Helmet>

      {/* Hero background */}
      <div id="hero-bg"></div>
      <div className="hero-video-overlay"></div>

      {/* Hero */}
      <section id="hero">
        <div className="hero-content" data-aos="zoom-in">
          <h1 className="hero-headline">Where Connections Grow Into Success</h1>
          <p className="hero-quote">&ldquo;We don&rsquo;t just close deals. We bring visions to life. We don&rsquo;t just offer services. We design solutions that transform opportunities into realities.&rdquo;</p>
        </div>
      </section>

      {/* Enterprises */}
      <section className="enterprises-section" data-aos="fade-up">
        <h2 className="section-title">Our Enterprises</h2>
        <div className="enterprises-grid">
          {enterprises.map((e) => (
            <Link to={e.href} key={e.name} className="enterprise-card" data-aos="fade-up">
              <img src={e.img} alt={e.name} />
              <h3>{e.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="about-section" data-aos="fade-up">
        <h2 className="section-title">ABOUT US</h2>
        <p className="about-text">{aboutText}</p>
      </section>

      {/* Unique Homes */}
      <section className="uniqueprops-section" data-aos="fade-up">
        <h2 className="section-title">Unique Homes, Outstanding Destinations</h2>
        <p className="uniqueprops-quote">&ldquo;Welcome to ALPHA PREMIER GROUP, your trusted partner in premier locations. We deliver industry-leading property management and strategic investment solutions, defined by integrity, performance, and long-term value.&rdquo;</p>
        <div className="prop-type-grid">
          {propTypes.map((p) => (
            <Link to={p.href} key={p.name} className="prop-type-card" data-aos="fade-up">
              <img src={p.img} alt={p.name} />
              <h3>{p.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-section" data-aos="fade-up">
        <h2 className="section-title">Mission &amp; Vision</h2>
        <div className="mission-grid">
          <div className="mission-block" data-aos="fade-right">
            <h3>Mission</h3>
            <p>Alpha Premier Group of Companies is committed to building a diversified and forward thinking organization that delivers excellence across its portfolio of companies. We aim to:</p>
            <ul>
              {missionBullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
          <div className="vision-block" data-aos="fade-left">
            <h3>Vision</h3>
            <p>{visionText}</p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section id="core-values" data-aos="fade-up">
        <h2 className="section-title">Core Values</h2>
        <div className="values-grid">
          {coreValues.map((v) => (
            <div key={v.title} className="value-card" data-aos="flip-up">
              <div className="icon-box"><i className={`fa-solid ${v.icon} value-icon`}></i></div>
              <h3>{v.title}</h3>
              <p>{v.description}</p>
            </div>
          ))}
        </div>
        <div className="values-marquee" data-aos="fade-up">
          {coreValues.map((v) => <span key={v.title}>{v.title} — {v.short}</span>)}
        </div>
      </section>

      {/* Inquire CTA */}
      <section className="inquire-section" data-aos="fade-up">
        <h2>Ready to Get Started?</h2>
        <Link to="/contact" className="hero-btn">Inquire Now!</Link>
      </section>
    </>
  );
}
