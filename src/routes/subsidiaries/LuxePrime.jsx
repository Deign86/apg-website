import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import './Subsidiary.css';

export default function LuxePrime() {
  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);
  return (
    <>
      <Helmet><title>Luxe Prime | Alpha Premier</title></Helmet>
      <section className="subsidiary-hero">
        <h1>Luxe Prime</h1>
        <p>Luxury lifestyle and premium experiences redefining elegance and sophistication.</p>
      </section>
      <section className="subsidiary-content" data-aos="fade-up">
        <p>Luxe Prime curates premium lifestyle experiences and luxury services for discerning clientele. From exclusive concierge services to bespoke lifestyle management, Luxe Prime delivers unparalleled quality and attention to detail. Our portfolio spans luxury travel, premium events, fine dining curation, and high-end lifestyle consulting.</p>
      </section>
      <section className="subsidiary-cta" data-aos="fade-up">
        <h2>Experience Luxury</h2>
        <Link to="/contact">Inquire Now!</Link>
      </section>
    </>
  );
}
