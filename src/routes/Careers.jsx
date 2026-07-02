import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import './Careers.css';

const jobs = [
  { title: 'Real Estate Consultant', location: 'Makati City', type: 'Full-time', tag: 'Commission Based', icon: 'fa-location-dot' },
  { title: 'Property Manager', location: 'BGC, Taguig', type: 'Full-time', tag: '2+ Years Exp', icon: 'fa-location-dot' },
  { title: 'Marketing Associate', location: 'Quezon City', type: 'Part-time', tag: 'Digital Marketing', icon: 'fa-location-dot' },
];

const benefits = [
  { title: 'Premium Growth', desc: 'Access to high-value listings and elite training in the real estate industry tailored for future leaders.', icon: 'fa-gem' },
  { title: 'Elite Networking', desc: 'Build lifelong connections with top-tier investors, property developers, and high-net-worth clients.', icon: 'fa-handshake' },
  { title: 'Innovation First', desc: 'Utilize state-of-the-art digital marketing tools and CRM systems to stay ahead of the competition.', icon: 'fa-rocket' },
];

export default function Careers() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <>
      <Helmet><title>Careers | Alpha Premier</title></Helmet>
      <section className="careers-hero">
        <h1>Join Our Elite Team</h1>
        <p>Shape the future of premier real estate with Alpha Premier Group. We are looking for high-caliber individuals to lead the industry.</p>
      </section>
      <section className="careers-container" data-aos="fade-up">
        {jobs.map((job, i) => (
          <div key={i} className="job-card" data-aos="fade-up" data-aos-delay={i * 100}>
            <div className="job-info">
              <h3>{job.title}</h3>
              <div className="job-tags">
                <span><i className="fa-solid fa-location-dot"></i> {job.location}</span>
                <span><i className="fa-solid fa-briefcase"></i> {job.type}</span>
                <span><i className="fa-solid fa-clock"></i> {job.tag}</span>
              </div>
            </div>
            <a href="mailto:careers@alphapremier.com" className="apply-btn">Apply Now</a>
          </div>
        ))}
      </section>
      <section className="benefits-section" data-aos="fade-up">
        <h2 className="section-title">WHY WORK WITH US?</h2>
        <div className="benefits-grid">
          {benefits.map((b, i) => (
            <div key={i} className="benefit-item" data-aos="fade-up" data-aos-delay={i * 100}>
              <i className={`fa-solid ${b.icon}`}></i>
              <h4>{b.title}</h4>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="inquire-section" data-aos="fade-up">
        <h2>Ready to Join?</h2>
        <Link to="/contact" className="inquire-cta-btn">Inquire Now!</Link>
      </section>
    </>
  );
}
