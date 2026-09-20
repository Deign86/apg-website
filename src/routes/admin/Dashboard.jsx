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
  ArrowRight,
  CheckCircle2,
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
      title: 'Live Chat & Triage',
      desc: 'Real-time concierge queue, live human broker handoff, and visitor message dispatch.',
      to: '/admin/live-chat',
      Icon: Headset,
      count: stats.waitingChatsCount,
      countLabel: stats.waitingChatsCount > 0 ? `${stats.waitingChatsCount} waiting` : (stats.activeChatsCount > 0 ? `${stats.activeChatsCount} active` : 'Active Queue'),
    },
    {
      title: 'Content Editor',
      desc: 'Customize static headlines, blurbs, and text cards across Home, Virtual Office, and subsidiary pages.',
      to: '/admin/content',
      Icon: PenSquare,
      count: stats.contentCount,
      countLabel: 'Blocks',
    },
    {
      title: 'Property Listings',
      desc: 'Manage commercial, office, warehouse, and luxury residential properties, specifications, and photo galleries.',
      to: '/admin/listings',
      Icon: Building2,
      count: stats.listingsCount,
      countLabel: 'Listings',
    },
    {
      title: 'Services & Packages',
      desc: 'Manage Virtual Office packages and subsidiary service cards (Realty, Construction, 88 Prime, Swift Clear, etc.).',
      to: '/admin/services',
      Icon: Layers,
      count: stats.servicesCount,
      countLabel: 'Services',
    },
    {
      title: 'Careers Manager',
      desc: 'Create, update, and manage active and closed job openings across all APG divisions.',
      to: '/admin/careers',
      Icon: Briefcase,
      count: stats.jobsCount,
      countLabel: 'Openings',
    },
    {
      title: 'Job Applicants (ATS)',
      desc: 'Review candidate applications, download vault resumes, track hiring pipeline, and record evaluation notes.',
      to: '/admin/applicants',
      Icon: UserCheck,
      count: stats.applicantsCount,
      countLabel: stats.newApplicantsCount > 0 ? `${stats.newApplicantsCount} new` : 'Applicants',
    },
    {
      title: 'Blog Manager',
      desc: 'Publish, draft, and edit news articles, market insights, and press releases across corporate and subsidiaries.',
      to: '/admin/blogs',
      Icon: Newspaper,
      count: stats.blogsCount,
      countLabel: 'Articles',
    },
  ];

  return (
    <div className="admin-page">
      <Helmet><title>Admin Dashboard | Alpha Premier</title></Helmet>

      <div className="admin-header mb-6">
        <div>
          <h1 className="text-balance text-2xl font-bold text-white">
            Welcome, {user?.name || 'Administrator'}
          </h1>
          <p className="mt-1 text-pretty text-sm text-neutral-400">
            Alpha Premier Group — Unified Content & Portfolio CMS
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950 px-3 py-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="size-3.5" aria-hidden="true" /> Backend Active (PHP + MySQL)
          </span>
        </div>
      </div>

      {/* Module Cards */}
      <div className="mb-8 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        {modules.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className="flex flex-col justify-between rounded-2xl border border-[#D4AF37]/30 bg-[#120E05]/90 p-6 text-inherit no-underline transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF37]"
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/15 text-[#E2B857]">
                  <m.Icon className="size-5" aria-hidden="true" />
                </div>
                <span className="text-2xl font-extrabold tabular-nums text-white">
                  {stats.loading ? '—' : m.count}
                  <span className="ml-1 text-xs font-normal text-neutral-500">{m.countLabel}</span>
                </span>
              </div>
              <h3 className="mb-2 text-balance text-lg font-semibold text-white">{m.title}</h3>
              <p className="text-pretty text-sm leading-relaxed text-neutral-400">{m.desc}</p>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[#D4AF37]/15 pt-3.5 text-sm font-semibold text-[#E2B857]">
              <span>Manage {m.title.split(' ')[0]}</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>

      {/* System Notice */}
      <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#120E05]/90 p-6">
        <h3 className="mb-3 flex items-center gap-2 text-balance text-base text-white">
          <span className="flex size-8 items-center justify-center rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/15 text-[#E2B857]">
            <Mail className="size-4" aria-hidden="true" />
          </span>
          Inquiries & Direct Communication
        </h3>
        <p className="text-pretty text-sm leading-relaxed text-neutral-400">
          All client inquiries from the website contact forms, Virtual Office reservations, and career applicant resumes are automatically dispatched to <code className="rounded-xl border border-[#D4AF37]/30 bg-black/80 px-1.5 py-0.5 text-[#E2B857]">contact@alphapremiergroup.com</code> via Hostinger SMTP, with active forwarders mirroring copies to executive inboxes (<code className="rounded-xl border border-[#D4AF37]/30 bg-black/80 px-1.5 py-0.5 text-[#E2B857]">thealphapremiergroup@gmail.com</code> &amp; <code className="rounded-xl border border-[#D4AF37]/30 bg-black/80 px-1.5 py-0.5 text-[#E2B857]">seanandrei888@gmail.com</code>).
        </p>
      </div>
    </div>
  );
}
