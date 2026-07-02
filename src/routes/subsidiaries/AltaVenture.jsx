import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import './Subsidiary.css';

export default function AltaVenture() {
  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);
  return (
    <>
      <Helmet><title>AltaVenture | Alpha Premier</title></Helmet>
      <section className="subsidiary-hero">
        <h1>AltaVenture</h1>
        <p>Business solutions and corporate support services powering enterprise growth.</p>
      </section>
      <section className="subsidiary-content" data-aos="fade-up">
        <p>AltaVenture provides comprehensive business solutions and corporate support services designed to help modern enterprises operate efficiently and scale effectively. Our services include business process outsourcing, administrative support, HR solutions, and corporate consulting. We partner with businesses to streamline operations, reduce costs, and drive sustainable growth.</p>
      </section>
      <section className="subsidiary-cta" data-aos="fade-up">
        <h2>Power Your Business</h2>
        <Link to="/contact">Inquire Now!</Link>
      </section>
    </>
  );
}
