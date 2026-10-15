import { useLocation, useNavigate } from 'react-router-dom';
import { getEnterpriseConfig } from '../data/enterpriseConfig';
import { useEnterpriseNav } from '../context/EnterpriseNavContext';
import { useSiteSettings, companyContact, addressLines } from '../hooks/useSiteSettings';
import { SocialIcon } from './redesign/SocialIcon';
import './EnterpriseFooter.css';

// EnterpriseFooter — mirrors APG's Footer layout (two-column with logo + nav on right,
// bottom bar with copyright + socials). Content per-enterprise via config. Nav
// buttons use the same EnterpriseNavContext bridge as EnterpriseHeader.
export default function EnterpriseFooter() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const { navigate: navToPage } = useEnterpriseNav();
  const config = getEnterpriseConfig(location.pathname);
  const settings = useSiteSettings();
  if (!config || !config.footer) return null;
  // Contacts and socials come from admin Site settings (company overrides, else the main ones).
  const contact = companyContact(settings, config.slug);

  // No enterprise page mounted (e.g. the /inquire route): go to this enterprise's home
  // (previously a full reload to the corporate home page).
  const onNavClick = (key) => {
    if (!navToPage(key)) routerNavigate('/subsidiaries/' + config.slug);
  };

  const { footer } = config;
  const footerNavItems = (footer.navItemKeys || [])
    .map((key) => (config.navItems || []).find((item) => item.key === key))
    .filter(Boolean);

  return (
    <footer className="enterprise-footer" style={{ '--enterprise-accent': config.accentColor }}>
      <div className="enterprise-footer-main">
        <div className="enterprise-footer-left">
          <div className="enterprise-footer-logo">
            <img src={footer.logoSrc} alt={footer.logoAlt} loading="lazy" decoding="async" />
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
            <p>{contact.email}</p>
            <p>{contact.phone}</p>
            <p className="enterprise-footer-address">
              {addressLines(contact.address).map((line) => (
                <span key={line}>{line}<br/></span>
              ))}
            </p>
          </div>
        </div>
      </div>
      <div className="enterprise-footer-bottom">
        <p>{footer.copyright}</p>
        <ul className="enterprise-footer-socials">
          {contact.socials.map((s) => (
            <li key={s.key}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
              >
                <SocialIcon platform={s.key} className="w-4 h-4" viberMark />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
