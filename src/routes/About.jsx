import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import './About.css';

export default function About() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <>
      <Helmet><title>About | Alpha Premier</title></Helmet>
      <section className="about-hero">
        <h1>About Alpha Premier</h1>
        <p>Excellence Across Industries</p>
      </section>
      <section className="about-content" data-aos="fade-up">
        <div className="about-text-block">
          <h2>Who We Are</h2>
          <p>Alpha Premier is a dynamic group of companies dedicated to delivering
          excellence across diverse industries including real estate, construction,
          business services, and lifestyle. With a commitment to innovation,
          integrity, and partnership, we build enduring businesses that make a
          meaningful impact.</p>
          <p>Founded with a vision to create sustainable value, Alpha Premier has grown
          into a trusted name, serving clients across the Philippines and beyond.</p>
        </div>
        <div className="about-text-block" data-aos="fade-up">
          <h2>Our Mission</h2>
          <p>To empower businesses and communities through innovative solutions,
          unwavering integrity, and a commitment to excellence in every endeavor.</p>
        </div>
        <div className="about-text-block" data-aos="fade-up">
          <h2>Our Vision</h2>
          <p>To be a leading conglomerate that sets the standard for excellence,
          creating sustainable value, and contributing to the economic growth
          of the Philippines.</p>
        </div>
      </section>
    </>
  );
}
