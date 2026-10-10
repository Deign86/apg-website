import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Menu, ExternalLink, KeyRound } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

export default function Topbar({ onToggleSidebar }) {
  const { profile } = useAuth();
  const [pwOpen, setPwOpen] = useState(false);

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
            <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setPwOpen(true)}>
              <KeyRound size={13} aria-hidden="true" /> Change password
            </button>
          </>
        )}
      </div>
      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} />}
    </header>
  );
}
