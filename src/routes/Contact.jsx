import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [ticket, setTicket] = useState('');

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setTicket(data.ticket || '');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
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
          {status === 'success' && (
            <div className="form-alert success">
              <i className="fa-solid fa-check-circle"></i> Message sent!
              {ticket && <span className="ticket-num"> Ticket: {ticket}</span>}
            </div>
          )}
          {status === 'error' && (
            <div className="form-alert error">
              <i className="fa-solid fa-exclamation-circle"></i> Something went wrong. Please try again or email us directly.
            </div>
          )}
          <div className="form-group">
            <input type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required disabled={status === 'sending'} />
          </div>
          <div className="form-group">
            <input type="email" name="email" placeholder="Your Email" value={form.email} onChange={handleChange} required disabled={status === 'sending'} />
          </div>
          <div className="form-group">
            <input type="text" name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} disabled={status === 'sending'} />
          </div>
          <div className="form-group">
            <textarea name="message" rows="5" placeholder="Your Message" value={form.message} onChange={handleChange} required disabled={status === 'sending'}></textarea>
          </div>
          <button type="submit" className="submit-btn" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </section>
    </>
  );
}
