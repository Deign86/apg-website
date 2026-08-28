import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    servicesCount: 0,
    jobsCount: 0,
    blogsCount: 0,
    contentCount: 0,
    loading: true,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [servicesRes, jobsRes, blogsRes, contentRes] = await Promise.allSettled([
          fetch('/api/admin/services.php', { credentials: 'include' }).then(r => r.json()),
          fetch('/api/admin/careers.php', { credentials: 'include' }).then(r => r.json()),
          fetch('/api/admin/blogs.php', { credentials: 'include' }).then(r => r.json()),
          fetch('/api/admin/content.php', { credentials: 'include' }).then(r => r.json()),
        ]);

        setStats({
          servicesCount: servicesRes.status === 'fulfilled' && servicesRes.value?.data ? servicesRes.value.data.length : 0,
          jobsCount: jobsRes.status === 'fulfilled' && jobsRes.value?.data ? jobsRes.value.data.length : 0,
          blogsCount: blogsRes.status === 'fulfilled' && blogsRes.value?.data ? blogsRes.value.data.length : 0,
          contentCount: contentRes.status === 'fulfilled' && contentRes.value?.data ? contentRes.value.data.length : 0,
          loading: false,
        });
      } catch {
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    loadStats();
  }, []);

  const modules = [
    {
      title: 'Content Editor',
      desc: 'Customize static headlines, blurbs, and text cards across Home, Virtual Office, and subsidiary pages.',
      to: '/admin/content',
      icon: 'fa-pen-to-square',
      color: '#3b82f6',
      count: stats.contentCount,
      countLabel: 'Blocks',
    },
    {
      title: 'Services & Packages',
      desc: 'Manage Virtual Office packages and subsidiary service cards (Realty, Construction, 88 Prime, Swift Clear, etc.).',
      to: '/admin/services',
      icon: 'fa-layer-group',
      color: '#c5a059',
      count: stats.servicesCount,
      countLabel: 'Services',
    },
    {
      title: 'Careers Manager',
      desc: 'Create, update, and manage active and closed job openings across all APG divisions.',
      to: '/admin/careers',
      icon: 'fa-briefcase',
      color: '#10b981',
      count: stats.jobsCount,
      countLabel: 'Openings',
    },
    {
      title: 'Blog Manager',
      desc: 'Publish, draft, and edit news articles, market insights, and press releases.',
      to: '/admin/blogs',
      icon: 'fa-newspaper',
      color: '#f59e0b',
      count: stats.blogsCount,
      countLabel: 'Articles',
    },
  ];

  return (
    <div className="admin-page">
      <Helmet><title>Admin Dashboard | Alpha Premier</title></Helmet>
      
      <div className="admin-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: '#fff' }}>
            Welcome, {user?.name || 'Administrator'}
          </h1>
          <p style={{ color: '#888', margin: '4px 0 0', fontSize: '0.9rem' }}>
            Alpha Premier Group — Unified Content & Portfolio CMS
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#10b981', background: '#064e3b', padding: '6px 12px', borderRadius: 20, fontWeight: 600 }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} /> Backend Active (PHP + MySQL)
          </span>
        </div>
      </div>

      {/* 4 Core Modules Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
        {modules.map((m, idx) => (
          <Link
            key={idx}
            to={m.to}
            style={{
              background: '#12141c',
              border: '1px solid #232738',
              borderRadius: 12,
              padding: 24,
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#c5a059';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#232738';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${m.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color, fontSize: '1.2rem' }}>
                  <i className={`fa-solid ${m.icon}`} />
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  {stats.loading ? '—' : m.count}
                  <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: 4, fontWeight: 400 }}>{m.countLabel}</span>
                </span>
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', color: '#fff', fontWeight: 600 }}>{m.title}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#888', lineHeight: 1.5 }}>{m.desc}</p>
            </div>
            <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #1a1d29', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#c5a059', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Manage {m.title.split(' ')[0]}</span>
              <i className="fa-solid fa-arrow-right" />
            </div>
          </Link>
        ))}
      </div>

      {/* System Notice */}
      <div style={{ background: '#12141c', border: '1px solid #232738', borderRadius: 12, padding: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem', color: '#fff' }}>
          <i className="fa-solid fa-envelope-circle-check" style={{ color: '#c5a059', marginRight: 8 }} />
          Inquiries & Direct Communication
        </h3>
        <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6 }}>
          All client inquiries from the website contact forms, Virtual Office reservations, and career applicant resumes are automatically dispatched directly to the official company email inbox (<code style={{ color: '#c5a059', background: '#1c1f2e', padding: '2px 6px', borderRadius: 4 }}>inquiries@alphapremiergroup.com</code>) via Hostinger SMTP.
        </p>
      </div>
    </div>
  );
}
