import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import './Careers.css';

const jobs = [
  { title: 'Real Estate Agent', location: 'Pasig', type: 'Full-time' },
  { title: 'Marketing Specialist', location: 'Pasig', type: 'Full-time' },
  { title: 'Customer Service Representative', location: 'Remote', type: 'Part-time' },
];

export default function Careers() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <>
      <Helmet><title>Careers | Alpha Premier</title></Helmet>
      <section className="careers-hero">
        <h1>Join Our Team</h1>
        <p>Build your career with Alpha Premier Group</p>
      </section>
      <section className="careers-content" data-aos="fade-up">
        <h2 className="section-title">Open Positions</h2>
        <div className="job-list">
          {jobs.map((job, i) => (
            <div key={i} className="job-card" data-aos="fade-up">
              <h3>{job.title}</h3>
              <p className="job-meta">
                <span><i className="fa-solid fa-location-dot"></i> {job.location}</span>
                <span><i className="fa-solid fa-clock"></i> {job.type}</span>
              </p>
              <a href="/contact" className="apply-btn">Apply Now</a>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
