import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import './Subsidiary.css';

export default function Prime88() {
  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);
  return (
    <>
      <Helmet><title>88 Prime | Alpha Premier</title></Helmet>
      <section className="subsidiary-hero">
        <h1>88 Prime</h1>
        <p>Specialized professional services delivered with precision and excellence.</p>
      </section>
      <section className="subsidiary-content" data-aos="fade-up">
        <p>88 Prime offers specialized professional services across multiple domains. Leveraging deep industry expertise and a commitment to excellence, we provide consulting, advisory, and implementation services that help organizations achieve their strategic objectives. Our team of seasoned professionals brings decades of combined experience to every engagement.</p>
      </section>
      <section className="subsidiary-cta" data-aos="fade-up">
        <h2>Work With Experts</h2>
        <Link to="/contact">Inquire Now!</Link>
      </section>
    </>
  );
}
