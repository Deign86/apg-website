import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import './Subsidiary.css';

export default function DynamicTree() {
  useEffect(() => { AOS.init({ duration: 800, once: true }); }, []);
  return (
    <>
      <Helmet><title>Dynamic Tree | Alpha Premier</title></Helmet>
      <section className="subsidiary-hero">
        <img src="/assets/images/dynamictreelogo.jpg" alt="Dynamic Tree" />
        <h1>Dynamic Tree</h1>
        <p>Modeling and talent management — cultivating the stars of tomorrow.</p>
      </section>
      <section className="subsidiary-content" data-aos="fade-up">
        <p>Dynamic Tree is a premier modeling and talent management company dedicated to discovering, developing, and representing exceptional talent across the Philippines. We provide comprehensive career guidance, portfolio development, and booking services for fashion, commercial, and entertainment industry professionals.</p>
      </section>
      <section className="subsidiary-cta" data-aos="fade-up">
        <h2>Join Our Talent Pool</h2>
        <Link to="/contact">Inquire Now!</Link>
      </section>
    </>
  );
}
