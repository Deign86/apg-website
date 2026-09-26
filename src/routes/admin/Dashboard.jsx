import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Headset,
  PenSquare,
  Building2,
  Layers,
  Briefcase,
  UserCheck,
  Newspaper,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    waitingChatsCount: 0,
    activeChatsCount: 0,
    servicesCount: 0,
    listingsCount: 0,
    jobsCount: 0,
    applicantsCount: 0,
    newApplicantsCount: 0,
    blogsCount: 0,
    contentCount: 0,
    loading: true,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [servicesRes, listingsRes, jobsRes, applicantsRes, blogsRes, contentRes, chatRes] = await Promise.allSettled([
          fetch('/api/admin/services.php', { credentials: 'include' }).then(r => r.json()),
          fetch('/api/admin/listings.php', { credentials: 'include' }).then(r => r.json()),
          fetch('/api/admin/careers.php', { credentials: 'include' }).then(r => r.json()),
          fetch('/api/admin/applicants.php', { credentials: 'include' }).then(r => r.json()),
          fetch('/api/admin/blogs.php', { credentials: 'include' }).then(r => r.json()),
          fetch('/api/admin/content.php', { credentials: 'include' }).then(r => r.json()),
          fetch('/api/admin/chat.php', { credentials: 'include' }).then(r => r.json()),
        ]);

        setStats({
          waitingChatsCount: chatRes.status === 'fulfilled' && chatRes.value?.summary ? (chatRes.value.summary.waiting || 0) : 0,
          activeChatsCount: chatRes.status === 'fulfilled' && chatRes.value?.summary ? (chatRes.value.summary.active || 0) : 0,
          servicesCount: servicesRes.status === 'fulfilled' && servicesRes.value?.data ? servicesRes.value.data.length : 0,
          listingsCount: listingsRes.status === 'fulfilled' && listingsRes.value?.data ? listingsRes.value.data.length : 0,
          jobsCount: jobsRes.status === 'fulfilled' && jobsRes.value?.data ? jobsRes.value.data.length : 0,
          applicantsCount: applicantsRes.status === 'fulfilled' && applicantsRes.value?.data ? applicantsRes.value.data.length : 0,
          newApplicantsCount: applicantsRes.status === 'fulfilled' && applicantsRes.value?.summary ? applicantsRes.value.summary.new : 0,
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
      title: 'Live Chat',
      desc: 'Visitor queue, agent handoff, and message history.',
      to: '/admin/live-chat',
      Icon: Headset,
      count: stats.waitingChatsCount,
      countLabel: stats.waitingChatsCount > 0 ? 'waiting' : (stats.activeChatsCount > 0 ? 'active' : 'in queue'),
    },
    {
      title: 'Content Editor',
      desc: 'Headlines, blurbs, and text blocks across site pages.',
      to: '/admin/content',
      Icon: PenSquare,
      count: stats.contentCount,
      countLabel: 'blocks',
    },
    {
      title: 'Property Listings',
      desc: 'Commercial, office, warehouse, and residential entries.',
      to: '/admin/listings',
      Icon: Building2,
      count: stats.listingsCount,
      countLabel: 'listings',
    },
    {
      title: 'Services & Packages',
      desc: 'Virtual Office packages and subsidiary service cards.',
      to: '/admin/services',
      Icon: Layers,
      count: stats.servicesCount,
      countLabel: 'services',
    },
    {
      title: 'Careers',
      desc: 'Open and closed job postings across APG divisions.',
      to: '/admin/careers',
      Icon: Briefcase,
      count: stats.jobsCount,
      countLabel: 'openings',
    },
    {
      title: 'Job Applicants',
      desc: 'Candidate applications, resumes, and pipeline notes.',
      to: '/admin/applicants',
      Icon: UserCheck,
      count: stats.newApplicantsCount > 0 ? stats.newApplicantsCount : stats.applicantsCount,
      countLabel: stats.newApplicantsCount > 0 ? 'new' : 'applicants',
    },
    {
      title: 'Blog Manager',
      desc: 'Articles, market insights, and press releases.',
      to: '/admin/blogs',
      Icon: Newspaper,
      count: stats.blogsCount,
      countLabel: 'articles',
    },
  ];

  const greeting = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <div className="admin-page">
      <Helmet><title>Admin Dashboard | Alpha Premier</title></Helmet>

      <div className="admin-header">
        <div>
          <h1>Welcome, {greeting}</h1>
          <p className="admin-muted">Alpha Premier Group content and portfolio CMS.</p>
        </div>
      </div>

      <div className="admin-modules-grid">
        {modules.map((m) => (
          <Link key={m.to} to={m.to} className="admin-module-card">
            <div className="admin-module-top">
              <m.Icon size={16} aria-hidden="true" />
              <span className="admin-module-count">
                {stats.loading ? '-' : m.count}
                <span className="admin-module-count-label">{m.countLabel}</span>
              </span>
            </div>
            <h3>{m.title}</h3>
            <p>{m.desc}</p>
          </Link>
        ))}
      </div>

      <section className="admin-card admin-notice">
        <h4>
          <Mail size={14} aria-hidden="true" />
          Inquiries and applications
        </h4>
        <p>
          Contact forms, Virtual Office reservations, and applicant resumes are emailed to{' '}
          <code>contact@alphapremiergroup.com</code> via Hostinger SMTP. Forwarders copy{' '}
          <code>thealphapremiergroup@gmail.com</code> and <code>seanandrei888@gmail.com</code>.
        </p>
      </section>
    </div>
  );
}
