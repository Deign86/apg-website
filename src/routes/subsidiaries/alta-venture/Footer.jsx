import { Link } from 'react-router-dom';
import { useSiteSettings, companyContact } from '@/hooks/useSiteSettings';
import { SocialIcon } from '@/components/redesign/SocialIcon';
import '../../../components/Footer.css';
import './av-footer.css';

const ROOT = '/subsidiaries/alta-venture';

const navLinks = [
  { to: `${ROOT}`, label: 'Home' },
  { to: `${ROOT}/services`, label: 'Services' },
  { to: `${ROOT}/blogs`, label: 'Blogs' },
  { to: `${ROOT}/careers`, label: 'Careers' },
  { to: `${ROOT}/inquire`, label: 'Inquire' },
];

export default function AltaVentureFooter() {
  const { socials } = companyContact(useSiteSettings(), 'alta-venture');
  return (
    <footer className="site-footer av-footer">
      <div className="footer-main-content">
        <div className="footer-left-section">
          <div className="footer-logo">
            <img
              src="/assets/alta-venture/3._Alta_Venture_-_Logo.png"
              alt="Alta Venture Outsourcing"
            />
          </div>
          <Link to={`${ROOT}/inquire`} className="inquire-btn">Inquire Now!</Link>
        </div>
        <div className="footer-right-section">
          <h2>Alta Venture</h2>
          <ul className="footer-nav-links">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom-bar">
        <p>&copy; 2026 Alta Venture Outsourcing. All rights reserved.</p>
        {socials.length > 0 && (
          <ul className="social-icons-list">
            {socials.map((social) => (
              <li key={social.key}>
                <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`Alta Venture on ${social.label}`}>
                  <SocialIcon platform={social.key} className="w-5 h-5" tiktokSize={19} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
