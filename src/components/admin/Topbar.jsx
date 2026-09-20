import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Menu, ExternalLink } from 'lucide-react';

export default function Topbar({ onToggleSidebar }) {
  const { profile } = useAuth();

  return (
    <header className="admin-topbar bg-[#0A0803] text-neutral-100">
      <button className="admin-drawer-toggle" onClick={onToggleSidebar} aria-label="Toggle navigation menu">
        <Menu size={20} aria-hidden="true" />
      </button>
      <div className="admin-topbar-title text-balance">Admin Panel</div>
      <div className="admin-topbar-right">
        <Link
          to="/"
          target="_blank"
          className="admin-view-site rounded-full border border-[#D4AF37] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors inline-flex items-center gap-1.5"
          rel="noopener noreferrer"
        >
          <ExternalLink size={14} aria-hidden="true" /> View Site
        </Link>
        {profile && (
          <>
            <span className={`admin-role-badge rounded-full uppercase tracking-widest ${profile.role}`}>{profile.role}</span>
            <span className="text-sm text-neutral-300">
              {profile.full_name || profile.email}
            </span>
          </>
        )}
      </div>
    </header>
  );
}
