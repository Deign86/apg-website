import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import './Contact.css';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <>
      <Helmet><title>Contact Us | Alpha Premier</title></Helmet>
      <section className="contact-hero">
        <h1>Contact Us</h1>
        <p>Get in touch with Alpha Premier Group</p>
      </section>
      <section className="contact-content" data-aos="fade-up">
        <div className="contact-info">
          <div className="contact-detail">
            <i className="fa-solid fa-phone"></i>
            <div>
              <h3>Phone</h3>
              <p>+63 (2) 1234 5678</p>
            </div>
          </div>
          <div className="contact-detail">
            <i className="fa-solid fa-envelope"></i>
            <div>
              <h3>Email</h3>
              <p>info@alphapremiergroup.com</p>
            </div>
          </div>
          <div className="contact-detail">
            <i className="fa-solid fa-location-dot"></i>
            <div>
              <h3>Address</h3>
              <p>Ortigas Center, Pasig City, Philippines</p>
            </div>
          </div>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send us a message</h2>
          <div className="form-group">
            <input type="text" placeholder="Your Name" required />
          </div>
          <div className="form-group">
            <input type="email" placeholder="Your Email" required />
          </div>
          <div className="form-group">
            <input type="text" placeholder="Subject" />
          </div>
          <div className="form-group">
            <textarea rows="5" placeholder="Your Message" required></textarea>
          </div>
          <button type="submit" className="submit-btn">
            {submitted ? 'Message Sent!' : 'Send Message'}
          </button>
        </form>
      </section>
    </>
  );
}
