import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import './Footer.css';

export default function Footer() {
  const [socials, setSocials] = useState({
    facebook: 'https://www.facebook.com/alphapremierRealty',
    instagram: 'https://www.instagram.com/alphapremier_rec/',
    tiktok: 'https://www.tiktok.com/@alphapremierr',
  });
  const [siteName, setSiteName] = useState('Alpha Premier');

  useEffect(() => {
    supabase.from('site_settings').select('key,value').in('key', ['social_facebook','social_instagram','social_tiktok','site_name'])
      .then(({ data }) => {
        if (data?.length) {
          const map = {};
          data.forEach(s => { map[s.key] = s.value; });
          if (map.site_name) setSiteName(map.site_name);
          setSocials(prev => ({
            facebook: map.social_facebook || prev.facebook,
            instagram: map.social_instagram || prev.instagram,
            tiktok: map.social_tiktok || prev.tiktok,
          }));
        }
      })
      .catch(() => { /* fallback */ });
  }, []);
  return (
    <footer className="site-footer">
      <div className="footer-main-content">
        <div className="footer-left-section">
          <div className="footer-logo">
            <img src="/assets/images/viber1.png" alt="Alpha Premier Group Logo" />
          </div>
          <Link to="/contact" className="inquire-btn">Inquire Now!</Link>
        </div>
        <div className="footer-right-section">
          <h2>{siteName}</h2>
          <ul className="footer-nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/properties">Properties</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/blogs">Blogs</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom-bar">
        <p>&copy; 2025 Alpha Premier Group. All rights reserved.</p>
        <ul className="social-icons-list">
          <li><a href={socials.facebook} target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a></li>
          <li><a href={socials.instagram} target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a></li>
          <li><a href={socials.tiktok} target="_blank" rel="noopener noreferrer"><i className="fab fa-tiktok"></i></a></li>
        </ul>
      </div>
    </footer>
  );
}
