import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: 'fa-chart-pie' },
  { to: '/admin/live-chat', label: 'Live Chat', icon: 'fa-headset', hasBadge: true },
  { to: '/admin/content', label: 'Content Editor', icon: 'fa-pen-to-square' },
  { to: '/admin/services', label: 'Services & Packages', icon: 'fa-layer-group' },
  { to: '/admin/listings', label: 'Property Listings', icon: 'fa-building' },
  { to: '/admin/careers', label: 'Careers Manager', icon: 'fa-briefcase' },
  { to: '/admin/applicants', label: 'Job Applicants', icon: 'fa-user-tie' },
  { to: '/admin/blogs', label: 'Blog Manager', icon: 'fa-newspaper' },
];

export default function Sidebar({ open, onClose }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [waitingChatsCount, setWaitingChatsCount] = useState(0);

  // Poll for waiting live chats count every 5 seconds
  useEffect(() => {
    const checkWaitingChats = async () => {
      try {
        const res = await fetch('/api/admin/chat.php', { credentials: 'include' });
        const data = await res.json();
        if (data.success && data.summary) {
          setWaitingChatsCount(data.summary.waiting || 0);
        }
      } catch {
        // Silently continue
      }
    };

    checkWaitingChats();
    const interval = setInterval(checkWaitingChats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
      <div className="admin-sidebar-logo">
        <h2>ALPHA PREMIER</h2>
        <span className="admin-badge">PORTFOLIO CMS</span>
      </div>
      <nav className="admin-sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <i className={`fa-solid ${item.icon}`} />
            <span>{item.label}</span>
            {item.hasBadge && waitingChatsCount > 0 && (
              <span className="admin-sidebar-badge" title={`${waitingChatsCount} waiting chats`}>
                {waitingChatsCount}
              </span>
            )}
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
