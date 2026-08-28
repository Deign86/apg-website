import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AOS from 'aos';
import { useServices } from '@/hooks/useServices';
import './VirtualOffice.css';

const DEFAULT_PACKAGES = [
  {
    id: 1,
    category: 'virtual-office',
    title: 'Bronze Virtual Office Package',
    price: '₱1,500 / mo',
    description: 'Prestigious business address for SEC/DTI registration, basic mail handling, and 2 hours complimentary meeting room credits monthly.',
    image_url: '/assets/images/landingpage.png',
  },
  {
    id: 2,
    category: 'virtual-office',
    title: 'Silver Business Address & Call Handling',
    price: '₱3,000 / mo',
    description: 'Everything in Bronze plus dedicated local phone number, personalized call answering, call patching, and 4 hours meeting room usage.',
    image_url: '/assets/images/landingpage.png',
  },
  {
    id: 3,
    category: 'virtual-office',
    title: 'Gold Executive Workspace Suite',
    price: '₱5,500 / mo',
    description: 'All Silver features plus unlimited mail & parcel forwarding, 8 hours conference room usage, high-speed fiber internet, and executive lounge access.',
    image_url: '/assets/images/landingpage.png',
  },
  {
    id: 4,
    category: 'virtual-office',
    title: 'Platinum Enterprise Custom Suite',
    price: 'Contact for Price',
    description: 'Fully tailored corporate solution with multi-entity address support, priority boardroom bookings, dedicated receptionist, and concierge services.',
    image_url: '/assets/images/landingpage.png',
  },
];

export default function VirtualOffice() {
  const { services: offices, loading, error } = useServices('virtual-office', DEFAULT_PACKAGES);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <>
      <Helmet>
        <title>Virtual Offices | Alpha Premier Group</title>
        <meta name="description" content="Prestigious SEC & DTI compliant business addresses, mail handling, and meeting facilities at Ortigas Center." />
      </Helmet>

      <section className="vo-hero">
        <h1>Virtual Office</h1>
        <p>Premium business addresses and flexible workspaces at Ortigas Center</p>
      </section>

      <main className="vo-grid" id="vo-list">
        {loading && offices.length === 0 && <p className="loading-text">Loading virtual offices...</p>}
        {error && offices.length === 0 && <p className="error-text">Failed to load virtual offices.</p>}
        {!loading && offices.length === 0 && (
          <div className="vo-no-results">
            <i className="fa-solid fa-building-circle-exclamation"></i>
            <p>No virtual office packages available currently.</p>
          </div>
        )}
        {offices.map((office) => (
          <div key={office.id} className="vo-card" data-aos="fade-up">
            <div className="vo-img-box">
              <span className="vo-status-badge">Available</span>
              <img 
                src={office.image_url || '/assets/images/landingpage.png'} 
                alt={office.title || 'Virtual Office Package'} 
                loading="lazy" 
                onError={(e) => {
                  e.currentTarget.src = '/assets/images/landingpage.png';
                }}
              />
            </div>
            <div className="vo-card-body">
              <span className="vo-price">{office.price || 'Contact for Price'}</span>
              <h3 className="vo-title">{office.title}</h3>
              <p className="vo-location">
                <i className="fa-solid fa-location-dot"></i> Ortigas Center, Pasig City
              </p>
              <p className="vo-description">
                {office.description}
              </p>
              <a href="/inquire" className="vo-inquire-btn">INQUIRE NOW</a>
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
