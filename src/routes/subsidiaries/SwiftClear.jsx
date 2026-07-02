import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import './Subsidiary.css';

export default function SwiftClear() {
  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);
  return (
    <>
      <Helmet><title>Swift Clear | Alpha Premier</title></Helmet>
      <section className="subsidiary-hero" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url(/assets/images/sc-deepCleaning.png)' }}>
        <img src="/assets/images/swiftclear-logo.png" alt="Swift Clear" />
        <h1>Swift Clear</h1>
        <p>Professional cleaning and facility services. We ensure every space is healthy, safe, and spotless.</p>
      </section>
      <section className="subsidiary-content" data-aos="fade-up">
        <p>Swift Clear provides professional cleaning and facility services including deep cleaning, air fumigation, cold fogging disinfection, floor cleaning, steam sterilization, and UV light sanitization. Our team uses state-of-the-art equipment and eco-friendly products to deliver exceptional results for residential, commercial, and industrial clients.</p>
      </section>
      <section className="subsidiary-cta" data-aos="fade-up">
        <h2>Book a Cleaning Service</h2>
        <Link to="/contact">Inquire Now!</Link>
      </section>
    </>
  );
}
