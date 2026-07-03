import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

export default function Topbar({ onToggleSidebar }) {
  const { profile } = useAuth();

  return (
    <header className="admin-topbar">
      <button className="admin-drawer-toggle" onClick={onToggleSidebar}>
        <i className="fa-solid fa-bars" />
      </button>
      <div className="admin-topbar-title">Admin Panel</div>
      <div className="admin-topbar-right">
        <Link to="/" target="_blank" className="admin-view-site" rel="noopener noreferrer">
          <i className="fa-solid fa-arrow-up-right-from-square" /> View Site
        </Link>
        {profile && (
          <>
            <span className={`admin-role-badge ${profile.role}`}>{profile.role}</span>
            <span style={{ fontSize: '0.85rem', color: '#aaa' }}>
              {profile.full_name || profile.email}
            </span>
          </>
        )}
      </div>
    </header>
  );
}
