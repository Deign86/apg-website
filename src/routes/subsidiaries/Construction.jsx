import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import './Subsidiary.css';

export default function Construction() {
  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);
  return (
    <>
      <Helmet><title>Alpha Premier Construction | Alpha Premier</title></Helmet>
      <section className="subsidiary-hero" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url(/assets/images/construction-services-img.png)' }}>
        <h1>Alpha Premier Construction</h1>
        <p>Construction services and materials supply built on integrity and excellence.</p>
      </section>
      <section className="subsidiary-content" data-aos="fade-up">
        <p>Alpha Premier Construction provides comprehensive construction services and high-quality construction materials supply. From residential developments to commercial projects, we deliver structures that stand the test of time. Our team of experienced professionals ensures every project meets the highest standards of safety, quality, and efficiency.</p>
      </section>
      <section className="subsidiary-cta" data-aos="fade-up">
        <h2>Start Your Construction Project</h2>
        <Link to="/contact">Inquire Now!</Link>
      </section>
    </>
  );
}
