import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const location = useLocation();
  const socials = {
    facebook: 'https://www.facebook.com/alphapremierRealty',
    instagram: 'https://www.instagram.com/alphapremier_rec/',
    tiktok: 'https://www.tiktok.com/@alphapremierr',
  };
  const siteName = 'Alpha Premier Group';

  if (location.pathname.startsWith('/subsidiaries/88prime')) {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="footer-main-content">
        <div className="footer-left-section">
          <div className="footer-logo">
            <img src="/assets/images/viber1.png" alt="Alpha Premier Group Logo" />
          </div>
          <Link to="/inquire" className="inquire-btn">Inquire Now!</Link>
        </div>
        <div className="footer-right-section">
          <h2>{siteName}</h2>
          <ul className="footer-nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/virtual-office">Virtual Office</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/blogs">Blogs</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom-bar">
        <p>&copy; {new Date().getFullYear()} Alpha Premier Group. All rights reserved.</p>
        <ul className="social-icons-list">
          <li><a href={socials.facebook} target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a></li>
          <li><a href={socials.instagram} target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a></li>
          <li><a href={socials.tiktok} target="_blank" rel="noopener noreferrer"><i className="fab fa-tiktok"></i></a></li>
        </ul>
      </div>
    </footer>
  );
}
