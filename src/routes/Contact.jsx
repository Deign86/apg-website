import { getTurnstileToken } from '@/lib/turnstile';
import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Mail, MapPin, Phone } from 'lucide-react';
import Seo from '../components/Seo';
import { useContent } from '../hooks/useContent';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useFieldErrors } from '../hooks/useFieldErrors';
import { emailError, nameError, textError } from '../lib/formValidation';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [ticket, setTicket] = useState('');
  const formStartedAt = useRef(Date.now());
  const { content: copy } = useContent('contact');
  const settings = useSiteSettings();
  const fields = useFieldErrors({
    name: nameError,
    email: emailError,
    subject: (v) => textError(v, { label: 'Subject', max: 200 }),
    message: (v) => textError(v, { label: 'Message', required: true, min: 10, max: 5000 }),
  });

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    fields.recheck(e.target.name, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fields.validate(form)) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/inquire.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source: 'Contact Page',
          website: '',
          form_started_at: formStartedAt.current,
          turnstile_token: await getTurnstileToken(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setStatus('success');
        setTicket(data.ticket || '');
        setForm({ name: '', email: '', subject: '', message: '' });
        fields.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Seo path="/contact" title="Contact Us | Alpha Premier Group" description="Contact Alpha Premier Group at Unit 3104, Tektite East Tower, Ortigas Center, Pasig City. Call 0915 888 9482 / (02) 8 650 2540 or send us a message." />
      <section className="contact-hero">
        <h1>{copy.hero_title}</h1>
        <p>{copy.hero_subtitle}</p>
      </section>
      <section className="contact-content" data-aos="fade-up">
        <div className="contact-info">
          <div className="contact-detail">
            <Phone aria-hidden="true" />
            <div>
              <h3>Phone</h3>
              <p>{settings.phone}</p>
            </div>
          </div>
          <div className="contact-detail">
            <Mail aria-hidden="true" />
            <div>
              <h3>Email</h3>
              <p>{settings.email}</p>
            </div>
          </div>
          <div className="contact-detail">
            <MapPin aria-hidden="true" />
            <div>
              <h3>Address</h3>
              <p>{settings.address_short}</p>
            </div>
          </div>
          {String(settings.business_hours).trim() !== '' && (
            <div className="contact-detail">
              <Clock aria-hidden="true" />
              <div>
                <h3>Business Hours</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{settings.business_hours}</p>
              </div>
            </div>
          )}
        </div>
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />
          <h2>Send us a message</h2>
          {status === 'success' && (
            <div className="form-alert success">
              <CheckCircle2 aria-hidden="true" /> Message sent successfully!
              {ticket && <span className="ticket-num"> Ticket: {ticket}</span>}
            </div>
          )}
          {status === 'error' && (
            <div className="form-alert error" role="alert">
              <AlertCircle aria-hidden="true" /> Something went wrong. Please try again or email us directly at {settings.email}.
            </div>
          )}
          <div className="form-group">
            <input {...fields.field('name')} type="text" name="name" aria-label="Your name" placeholder="Your Name" autoComplete="name" value={form.name} onChange={handleChange} required maxLength={100} disabled={status === 'sending'} />
            <FieldError fields={fields} name="name" />
          </div>
          <div className="form-group">
            <input {...fields.field('email')} type="email" name="email" aria-label="Your email" placeholder="Your Email" inputMode="email" autoComplete="email" value={form.email} onChange={handleChange} required maxLength={254} disabled={status === 'sending'} />
            <FieldError fields={fields} name="email" />
          </div>
          <div className="form-group">
            <input {...fields.field('subject')} type="text" name="subject" aria-label="Subject" placeholder="Subject" value={form.subject} onChange={handleChange} maxLength={200} disabled={status === 'sending'} />
            <FieldError fields={fields} name="subject" />
          </div>
          <div className="form-group">
            <textarea {...fields.field('message')} name="message" rows="5" aria-label="Your message" placeholder="Your Message" value={form.message} onChange={handleChange} required minLength={10} maxLength={5000} disabled={status === 'sending'}></textarea>
            <FieldError fields={fields} name="message" />
          </div>
          <button type="submit" className="submit-btn" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </section>
    </>
  );
}

function FieldError({ fields, name }) {
  const message = fields.errors[name];
  return message ? <p id={fields.errorId(name)} className="field-error">{message}</p> : null;
}
