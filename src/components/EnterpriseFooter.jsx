import { useLocation } from 'react-router-dom';
import { getEnterpriseConfig } from '../data/enterpriseConfig';
import './EnterpriseFooter.css';

// EnterpriseFooter — mirrors APG's Footer layout (two-column with logo + nav on right,
// bottom bar with copyright + socials). Content per-enterprise via config. Nav
// buttons call window.enterpriseNavigate(key) — same global bridge used by
// EnterpriseHeader.
function onNavClick(key) {
  if (typeof window !== 'undefined' && typeof window.enterpriseNavigate === 'function') {
    window.enterpriseNavigate(key);
  } else {
    window.location.href = '/';
  }
}

export default function EnterpriseFooter() {
  const location = useLocation();
  const config = getEnterpriseConfig(location.pathname);
  if (!config) return null;

  const { footer } = config;
  const footerNavItems = footer.navItemKeys
    .map((key) => config.navItems.find((item) => item.key === key))
    .filter(Boolean);

  return (
    <footer className="enterprise-footer" style={{ '--enterprise-accent': config.accentColor }}>
      <div className="enterprise-footer-main">
        <div className="enterprise-footer-left">
          <div className="enterprise-footer-logo">
            <img src={footer.logoSrc} alt={footer.logoAlt} />
          </div>
          <p className="enterprise-footer-blurb">{footer.blurb}</p>
          <button
            type="button"
            className="enterprise-footer-inquire"
            onClick={() => onNavClick(config.inquireKey)}
          >
            Inquire Now
          </button>
        </div>
        <div className="enterprise-footer-right">
          <h2>{config.name}</h2>
          <ul className="enterprise-footer-nav">
            {footerNavItems.map((item) => (
              <li key={item.key}>
                <button type="button" onClick={() => onNavClick(item.key)}>{item.label}</button>
              </li>
            ))}
          </ul>
          <div className="enterprise-footer-connect">
            <h4>Connect</h4>
            <p>{footer.connect.email}</p>
            <p>{footer.connect.phone}</p>
            <p className="enterprise-footer-address">
              {footer.connect.addressLines.map((line) => (
                <span key={line}>{line}<br/></span>
              ))}
            </p>
          </div>
        </div>
      </div>
      <div className="enterprise-footer-bottom">
        <p>{footer.copyright}</p>
        <ul className="enterprise-footer-socials">
          {footer.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
              >
                <i className={'fab ' + s.icon}></i>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
