import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Menu, ExternalLink } from 'lucide-react';

export default function Topbar({ onToggleSidebar }) {
  const { profile } = useAuth();

  return (
    <header className="admin-topbar">
      <button className="admin-drawer-toggle" onClick={onToggleSidebar} aria-label="Toggle navigation menu">
        <Menu size={18} aria-hidden="true" />
      </button>
      <div className="admin-topbar-title">Admin Panel</div>
      <div className="admin-topbar-right">
        <Link to="/" className="admin-view-site" rel="noopener noreferrer" target="_blank">
          <ExternalLink size={13} aria-hidden="true" /> View site
        </Link>
        {profile && (
          <>
            <span className={`admin-role-badge ${profile.role}`}>{profile.role}</span>
            <span className="admin-topbar-user" title={profile.full_name || profile.email}>
              {profile.full_name || profile.email}
            </span>
          </>
        )}
      </div>
    </header>
  );
}
