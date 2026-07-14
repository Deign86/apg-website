import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: 'fa-chart-pie', roles: ['admin'] },
  { to: '/admin/properties', label: 'Properties', icon: 'fa-building', roles: ['admin','editor'] },
  { to: '/admin/leads', label: 'Leads', icon: 'fa-users', roles: ['admin'] },
  { to: '/admin/blogs', label: 'Blogs', icon: 'fa-newspaper', roles: ['admin','editor'] },
  { to: '/admin/careers', label: 'Careers', icon: 'fa-briefcase', roles: ['admin','editor'] },
  { to: '/admin/chatbot', label: 'Chatbot', icon: 'fa-robot', roles: ['admin','editor'] },
  { to: '/admin/facebook-context', label: 'Facebook', icon: 'fa-facebook', roles: ['admin','editor'] },
  { to: '/admin/activity', label: 'Activity', icon: 'fa-clock-rotate', roles: ['admin'] },
  { to: '/admin/settings', label: 'Settings', icon: 'fa-gear', roles: ['admin'] },
  { to: '/admin/users', label: 'Users', icon: 'fa-user-shield', roles: ['admin'] },
];

export default function Sidebar({ open, onClose }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const visibleItems = navItems.filter(
    item => profile && item.roles.includes(profile.role)
  );

  return (
    <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
      <div className="admin-sidebar-logo">
        <h2>ALPHA PREMIER</h2>
      </div>
      <nav className="admin-sidebar-nav">
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <i className={`fa-solid ${item.icon}`} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <button className="admin-logout-btn" onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket" /> Logout
        </button>
      </div>
    </aside>
  );
}
