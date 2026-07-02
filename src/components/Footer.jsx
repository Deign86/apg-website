import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
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
          <h2>Alpha Premier</h2>
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
          <li><a href="https://www.facebook.com/alphapremierRealty" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a></li>
          <li><a href="https://www.instagram.com/alphapremier_rec/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a></li>
          <li><a href="https://www.tiktok.com/@alphapremierr" target="_blank" rel="noopener noreferrer"><i className="fab fa-tiktok"></i></a></li>
        </ul>
      </div>
    </footer>
  );
}
