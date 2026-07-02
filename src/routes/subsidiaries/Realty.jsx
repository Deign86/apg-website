import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import './Subsidiary.css';

export default function Realty() {
  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);
  return (
    <>
      <Helmet><title>Alpha Premier Realty | Alpha Premier</title></Helmet>
      <section className="subsidiary-hero" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url(/assets/images/realty-banner-img.png)' }}>
        <img src="/assets/images/realty-logo.png" alt="Alpha Premier Realty" />
        <h1>Alpha Premier Realty</h1>
        <p>Connecting You to Alpha Premier, Building What Matters.</p>
      </section>
      <section className="subsidiary-content" data-aos="fade-up">
        <p>Alpha Premier Realty is the flagship company of Alpha Premier Group and one of the leading brokerage firms in the Philippines. We specialize in residential, commercial, and industrial real estate, offering brokerage and advisory services for commercial spaces, warehouses, office buildings, and residential properties. Through our extensive market knowledge and strong industry network, we connect property owners, developers, and investors with strategic real estate opportunities across the country.</p>
      </section>
      <section className="subsidiary-cta" data-aos="fade-up">
        <h2>Find Your Perfect Property</h2>
        <Link to="/contact">Inquire Now!</Link>
      </section>
    </>
  );
}
