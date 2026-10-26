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
  Inbox,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/admin/PageHeader';

export default function Dashboard() {
  const { user, can } = useAuth();
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
    unreadInquiries: 0,
    loading: true,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Only fetch counts for cards this role can see: the rest would just 403.
        const adminJson = (capability, url) =>
          can(capability) ? fetch(url, { credentials: 'include' }).then(r => r.json()) : null;
        const [servicesRes, listingsRes, jobsRes, applicantsRes, blogsRes, contentRes, chatRes, inquiriesRes] = await Promise.allSettled([
          adminJson('services', '/api/admin/services.php'),
          fetch('/api/listings.php').then(r => r.json()),
          adminJson('careers', '/api/admin/careers.php'),
          adminJson('applicants', '/api/admin/applicants.php?action=summary'),
          adminJson('blogs', '/api/admin/blogs.php?per_page=1'),
          adminJson('content', '/api/admin/content.php'),
          adminJson('chat', '/api/admin/chat.php?summary=1'),
          adminJson('inquiries', '/api/admin/inquiries.php?action=summary'),
        ]);

        setStats({
          waitingChatsCount: chatRes.status === 'fulfilled' && chatRes.value?.summary ? (chatRes.value.summary.waiting || 0) : 0,
          activeChatsCount: chatRes.status === 'fulfilled' && chatRes.value?.summary ? (chatRes.value.summary.active || 0) : 0,
          servicesCount: servicesRes.status === 'fulfilled' && servicesRes.value?.data ? servicesRes.value.data.length : 0,
          listingsCount: listingsRes.status === 'fulfilled' && listingsRes.value?.data ? listingsRes.value.data.length : 0,
          jobsCount: jobsRes.status === 'fulfilled' && jobsRes.value?.data ? jobsRes.value.data.length : 0,
          applicantsCount: applicantsRes.status === 'fulfilled' && applicantsRes.value?.summary ? applicantsRes.value.summary.total : 0,
          newApplicantsCount: applicantsRes.status === 'fulfilled' && applicantsRes.value?.summary ? applicantsRes.value.summary.new : 0,
          blogsCount: blogsRes.status === 'fulfilled' && blogsRes.value?.success ? Number(blogsRes.value.total) || 0 : 0,
          contentCount: contentRes.status === 'fulfilled' && contentRes.value?.data ? contentRes.value.data.length : 0,
          unreadInquiries: inquiriesRes.status === 'fulfilled' && inquiriesRes.value?.summary ? inquiriesRes.value.summary.unread : 0,
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
      title: 'Inquiries',
      desc: 'Contact, listing, payment and feedback forms from every APG site, plus newsletter sign-ups.',
      to: '/admin/inquiries',
      capability: 'inquiries',
      Icon: Inbox,
      count: stats.unreadInquiries,
      countLabel: 'unread',
      attention: stats.unreadInquiries > 0,
    },
    {
      title: 'Live Chat',
      desc: 'Visitor queue, agent handoff, and message history.',
      to: '/admin/live-chat',
      capability: 'chat',
      Icon: Headset,
      count: stats.waitingChatsCount,
      countLabel: stats.waitingChatsCount > 0 ? 'waiting' : (stats.activeChatsCount > 0 ? 'active' : 'in queue'),
      attention: stats.waitingChatsCount > 0,
    },
    {
      title: 'Content Editor',
      desc: 'Headlines, blurbs, and text blocks across site pages.',
      to: '/admin/content',
      capability: 'content',
      Icon: PenSquare,
      count: stats.contentCount,
      countLabel: 'blocks',
    },
    {
      title: 'Property Listings',
      desc: can('listings')
        ? 'Live from the APR Google Drive (synced every 15 min). Hide, feature, order or re-price them here.'
        : 'Live from the APR Google Drive (synced every 15 min). Add, edit or move folders in Drive.',
      to: can('listings') ? '/admin/listings' : '/properties',
      Icon: Building2,
      count: stats.listingsCount,
      countLabel: 'on the site',
    },
    {
      title: 'Services & Packages',
      desc: 'Virtual Office packages and subsidiary service cards.',
      to: '/admin/services',
      capability: 'services',
      Icon: Layers,
      count: stats.servicesCount,
      countLabel: 'services',
    },
    {
      title: 'Careers',
      desc: 'Open and closed job postings across APG divisions.',
      to: '/admin/careers',
      capability: 'careers',
      Icon: Briefcase,
      count: stats.jobsCount,
      countLabel: 'openings',
    },
    {
      title: 'Job Applicants',
      desc: 'Candidate applications, resumes, and pipeline notes.',
      to: '/admin/applicants',
      capability: 'applicants',
      Icon: UserCheck,
      count: stats.newApplicantsCount > 0 ? stats.newApplicantsCount : stats.applicantsCount,
      countLabel: stats.newApplicantsCount > 0 ? 'new' : 'applicants',
      attention: stats.newApplicantsCount > 0,
    },
    {
      title: 'Blog Manager',
      desc: 'Articles, market insights, and press releases.',
      to: '/admin/blogs',
      capability: 'blogs',
      Icon: Newspaper,
      count: stats.blogsCount,
      countLabel: 'articles',
    },
  ];

  const greeting = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <div className="admin-page">
      <Helmet><title>Admin Dashboard | Alpha Premier</title></Helmet>

      <PageHeader
        eyebrow="Overview"
        title={`Welcome, ${greeting}`}
        description="Alpha Premier Group content and portfolio CMS. Highlighted cards need someone's attention."
      />

      <div className="admin-modules-grid">
        {modules.filter((m) => !m.capability || can(m.capability)).map((m) => (
          <Link key={m.to} to={m.to} className={`admin-module-card${m.attention ? ' is-attention' : ''}`}>
            <div className="admin-module-top">
              <m.Icon size={16} aria-hidden="true" />
              <span className="admin-module-count">
                {stats.loading ? '–' : m.count}
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
