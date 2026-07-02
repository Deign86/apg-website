import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import './Home.css';

const subsidiaries = [
  { name: 'Alpha Premier Realty', href: '/subsidiaries/realty', icon: 'fa-building' },
  { name: 'Virtual Office', href: '/virtual-office', icon: 'fa-briefcase' },
  { name: 'Alpha Premier Construction', href: '/subsidiaries/construction', icon: 'fa-hard-hat' },
  { name: 'Swift Clear', href: '/subsidiaries/swiftclear', icon: 'fa-broom' },
  { name: 'Dynamic Tree', href: '/subsidiaries/dynamic-tree', icon: 'fa-tree' },
  { name: 'Luxe Prime', href: '/subsidiaries/luxe-prime', icon: 'fa-crown' },
  { name: 'Alta Venture', href: '/subsidiaries/alta-venture', icon: 'fa-rocket' },
  { name: '88 Prime', href: '/subsidiaries/88prime', icon: 'fa-star' },
];

const coreValues = [
  { title: 'Excellence', description: 'We set the highest standards, leading by example and ensuring there are no shortcuts—only meticulous execution and uncompromising quality.',
    icon: 'fa-gem' },
  { title: 'Partnership', description: 'We believe in mutual growth, working closely with our clients and teams to achieve shared success and long-term value.',
    icon: 'fa-handshake' },
  { title: 'Innovation', description: 'We embrace change, continuously evolving and leading in every industry by anticipating needs and creating impactful solutions.',
    icon: 'fa-lightbulb' },
  { title: 'Integrity', description: 'We build trust through transparency and deliver on our promises, always acting with honesty and responsibility.',
    icon: 'fa-shield' },
  { title: 'Legacy', description: 'We build enduring businesses that make a meaningful impact, inspiring future generations through innovation, purpose, and dedication.',
    icon: 'fa-monument' },
];

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

      {/* Video background */}
      <video id="hero-video" autoPlay muted loop playsInline>
        <source src="/assets/images/wallbody.jpg" type="video/mp4" />
      </video>
      <div className="hero-video-overlay"></div>

      {/* Hero */}
      <section id="hero">
        <div className="hero-content" data-aos="zoom-in">
          <div className="hero-logo">
            <img src="/assets/images/viber1.png" alt="Alpha Premier Group" />
          </div>
          <Link to="/contact" className="hero-btn">Inquire Now!</Link>
        </div>
      </section>

      {/* About */}
      <section className="about-section" data-aos="fade-up">
        <h2 className="section-title">About Alpha Premier</h2>
        <p className="about-text">
          Alpha Premier is a dynamic group of companies dedicated to
          delivering excellence across diverse industries. With a commitment
          to innovation, integrity, and partnership, we build enduring businesses
          that make a meaningful impact.
        </p>
      </section>

      {/* Subsidiaries */}
      <section className="subsidiaries-section" data-aos="fade-up">
        <h2 className="section-title">Our Companies</h2>
        <div className="subsidiaries-grid">
          {subsidiaries.map((sub) => (
            <Link to={sub.href} key={sub.name} className="subsidiary-card" data-aos="fade-up">
              <i className={`fa-solid ${sub.icon}`}></i>
              <h3>{sub.name}</h3>
            </Link>
          ))}
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
      </section>
    </>
  );
}
