import React, { useEffect } from 'react';
import { EnterpriseSeo } from '../components/Seo';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link, useSearchParams } from 'react-router-dom';
import { useServices } from '@/hooks/useServices';
import { useContent } from '@/hooks/useContent';
import { VO_FALLBACK_PACKAGES } from '@/data/virtualOffice';
import EnterpriseInquire from './subsidiaries/EnterpriseInquire';
import './VirtualOffice.css';

/** "Gold … (₱4,999 / mo)": the plan as the visitor saw it; travels to the team email. */
const planLabel = (pkg) => (pkg.price ? `${pkg.title} (${pkg.price})` : pkg.title);

export default function VirtualOffice() {
  const { services: offices, loading, error } = useServices('virtual-office', VO_FALLBACK_PACKAGES);
  // Admin-editable copy: content page 'virtual-office'; plans and prices are edited in Services.
  const { content } = useContent('virtual-office');

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <>
      <EnterpriseSeo slug="virtual-office" />

      <section className="vo-hero">
        <h1>{content.hero_title}</h1>
        <p>{content.hero_subtitle}</p>
      </section>

      <div className="vo-grid" id="vo-list">
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
                src={office.image_url || '/assets/images/landingpage.webp'}
                alt={office.title || 'Virtual Office Package'}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/assets/images/landingpage.webp';
                }}
              />
            </div>
            <div className="vo-card-body">
              <span className="vo-price">{office.price || 'Contact for Price'}</span>
              <h3 className="vo-title">{office.title}</h3>
              <p className="vo-location">
                <i className="fa-solid fa-location-dot"></i> {content.location_label}
              </p>
              <p className="vo-description">
                {office.description}
              </p>
              {/* Virtual Office's own inquiry page (also on its subdomain), with this plan pre-selected. */}
              <Link
                to={`/virtual-office/inquire?package=${encodeURIComponent(planLabel(office))}`}
                className="vo-inquire-btn"
                aria-label={`Inquire now about ${office.title}`}
              >
                INQUIRE NOW
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * /virtual-office/inquire (virtual-office.alphapremiergroup.com/inquire): the shared enterprise
 * inquiry form for Virtual Office, with ?package=<plan> pre-filled and the plans as topics.
 */
export function VirtualOfficeInquire() {
  const [searchParams] = useSearchParams();
  const plan = (searchParams.get('package') || '').trim().slice(0, 200);
  const { services: plans } = useServices('virtual-office', VO_FALLBACK_PACKAGES);
  const config = {
    slug: 'virtual-office',
    name: 'Virtual Office',
    botTitle: 'Alpha Premier AI',
    accentColor: '#C5A059',
    quickPrompts: plans.map((pkg) => pkg.title).filter(Boolean),
  };
  return <EnterpriseInquire key={plan} interest={plan} config={config} />;
}
