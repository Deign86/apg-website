import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import PageHeader from '@/components/admin/PageHeader';
import SegmentedControl from '@/components/admin/SegmentedControl';
import EnterpriseSelect from '@/components/admin/EnterpriseSelect';
import StatusPill from '@/components/admin/StatusPill';
import { useAuth } from '@/context/AuthContext';
import { ENTERPRISE_TABS } from '@/data/enterprises';
import { CalendarCheck, Download, ExternalLink, Eye, FileText, Gauge, Lock, Mail, Phone, RotateCw, Search, Trash2, UserSearch } from 'lucide-react';

const ENTERPRISE_NAMES = Object.fromEntries(ENTERPRISE_TABS.map(e => [e.slug, e.name]));
const inputCls = 'rounded-xl border-neutral-800 bg-black/80 focus:border-[#D4AF37]';

/** Green = shortlisted (score >= server threshold), amber = borderline, red = below. */
function AtsBadge({ applicant }) {
  if (applicant.ats_score === null || applicant.ats_score === undefined) {
    return <span className="admin-cell-muted">Pending</span>;
  }
  const tone = Number(applicant.ats_shortlisted) === 1
    ? 'admin-pill-green'
    : applicant.ats_details?.recommendation === 'maybe' ? 'admin-pill-gold' : 'admin-pill-red';
  return (
    <span className={`admin-pill admin-ats-score ${tone}`} title={applicant.ats_details?.summary || 'ATS score'}>
      {applicant.ats_score}/100
    </span>
  );
}

/** "2026-10-20 14:00:00" (server, Asia/Manila) -> "Tue, Oct 20, 2026, 2:00 PM". */
const formatDateTime = (value) => {
  const date = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

/** Local "YYYY-MM-DDTHH:MM" for <input type="datetime-local"> min/defaults. */
const toLocalInput = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** Only http(s) links are rendered as anchors (the API validates them too). */
const safeHref = (url) => (/^https?:\/\//i.test(url) ? url : null);

const STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'reviewed', label: 'Reviewed' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'hired', label: 'Hired' },
  { id: 'rejected', label: 'Rejected' },
];

export default function ApplicantsManager() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnterprise, setSelectedEnterprise] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [shortlistedOnly, setShortlistedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [rescreening, setRescreening] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteAt, setInviteAt] = useState('');
  const [inviteNote, setInviteNote] = useState('');
  const [inviting, setInviting] = useState(false);

  // Detail / Notes Modal State
  const [activeApplicant, setActiveApplicant] = useState(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();
  const { can } = useAuth();

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/applicants.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setApplicants(data.data);
      } else {
        setApplicants([]);
      }
    } catch {
      toast.error('Failed to load applicant records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleOpenDetail = (applicant) => {
    setInviteOpen(false);
    setActiveApplicant(applicant);
    setInternalNotes(applicant.internal_notes || '');
  };

  const handleUpdateStatus = async (applicantId, newStatus) => {
    try {
      const res = await fetch('/api/admin/applicants.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: applicantId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Applicant marked as ${newStatus}`);
        setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, status: newStatus } : a));
        if (activeApplicant && activeApplicant.id === applicantId) {
          setActiveApplicant(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch {
      toast.error('Network error updating status');
    }
  };

  const handleSaveNotes = async () => {
    if (!activeApplicant) return;
    setSavingNotes(true);
    try {
      const res = await fetch('/api/admin/applicants.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: activeApplicant.id, internal_notes: internalNotes }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Internal recruiter notes saved');
        setApplicants(prev => prev.map(a => a.id === activeApplicant.id ? { ...a, internal_notes: internalNotes } : a));
        setActiveApplicant(prev => ({ ...prev, internal_notes: internalNotes }));
      } else {
        toast.error(data.error || 'Failed to save notes');
      }
    } catch {
      toast.error('Network error saving notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleRescreen = async () => {
    if (!activeApplicant) return;
    setRescreening(true);
    try {
      const res = await fetch('/api/admin/applicants.php?action=rescreen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: activeApplicant.id }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const ats = data.data;
        toast.success(`Re-screened: ${ats.ats_score}/100`);
        setApplicants(prev => prev.map(a => a.id === activeApplicant.id ? { ...a, ...ats } : a));
        setActiveApplicant(prev => ({ ...prev, ...ats }));
      } else {
        toast.error(data.error || 'Failed to re-screen applicant');
      }
    } catch {
      toast.error('Network error re-screening applicant');
    } finally {
      setRescreening(false);
    }
  };

  const openInvite = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setInviteAt(toLocalInput(tomorrow));
    setInviteNote('');
    setInviteOpen(true);
  };

  const handleSendInvite = async () => {
    if (!activeApplicant) return;
    if (!inviteAt || new Date(inviteAt) <= new Date()) {
      toast.error('Pick an interview date and time in the future.');
      return;
    }
    setInviting(true);
    try {
      const res = await fetch('/api/admin/applicants.php?action=invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: activeApplicant.id, interview_at: inviteAt, note: inviteNote.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        const update = { ...data.data, auto_rejected_at: null, decision_emailed_at: data.emailed ? new Date().toISOString() : activeApplicant.decision_emailed_at };
        setApplicants(prev => prev.map(a => a.id === activeApplicant.id ? { ...a, ...update } : a));
        setActiveApplicant(prev => ({ ...prev, ...update }));
        setInviteOpen(false);
        if (data.emailed) toast.success(data.message);
        else toast.error(data.message);
      } else {
        toast.error(data.error || 'Failed to send the interview invitation');
      }
    } catch {
      toast.error('Network error sending the interview invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/applicants.php?id=${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Applicant record and attached resume deleted');
        if (activeApplicant && activeApplicant.id === deleteTarget.id) {
          setActiveApplicant(null);
        }
        setDeleteTarget(null);
        fetchApplicants();
      } else {
        toast.error(data.error || 'Failed to delete applicant');
      }
    } catch {
      toast.error('Network error deleting applicant');
    } finally {
      setDeleting(false);
    }
  };

  // Derived from the loaded list (the list is unfiltered) so status edits update it immediately.
  const newCount = applicants.filter(a => a.status === 'new').length;

  const filteredApplicants = useMemo(() => {
    const rows = applicants.filter(a => {
      const matchesEnt = selectedEnterprise === 'all' || a.enterprise_slug === selectedEnterprise;
      const matchesStat = selectedStatus === 'all' || a.status === selectedStatus;
      const matchesShortlist = !shortlistedOnly || Number(a.ats_shortlisted) === 1;
      const q = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        a.full_name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phone?.toLowerCase().includes(q) ||
        a.job_title?.toLowerCase().includes(q);
      return matchesEnt && matchesStat && matchesShortlist && matchesSearch;
    });
    // Server already returns newest first; only score sorting needs a client sort.
    if (sortBy === 'score') {
      return [...rows].sort((x, y) => (y.ats_score ?? -1) - (x.ats_score ?? -1));
    }
    return rows;
  }, [applicants, selectedEnterprise, selectedStatus, shortlistedOnly, sortBy, searchTerm]);

  return (
    <div className="admin-page">
      <Helmet><title>Applicant Tracking & Talent Acquisition | Admin</title></Helmet>

      <PageHeader
        eyebrow="Recruitment"
        title="Job Applicants & ATS"
        badge={newCount > 0 && <span className="admin-pill admin-pill-gold tabular-nums">{newCount} new</span>}
        description="Every application across the 7 APG subsidiaries and the group careers catalog, scored by the ATS."
        actions={
          <button className="admin-btn admin-btn-secondary" onClick={fetchApplicants}>
            <RotateCw className="size-4" aria-hidden="true" /> Refresh
          </button>
        }
      />

      <div className="admin-toolbar">
        <EnterpriseSelect
          value={selectedEnterprise}
          onChange={setSelectedEnterprise}
          countFor={slug => slug === 'all' ? applicants.length : applicants.filter(a => a.enterprise_slug === slug).length}
        />
        <SegmentedControl
          label="Filter by status"
          value={selectedStatus}
          onChange={setSelectedStatus}
          options={STATUS_OPTIONS.map(s => ({ value: s.id, label: s.label }))}
        />
        <button
          type="button"
          aria-pressed={shortlistedOnly}
          onClick={() => setShortlistedOnly(v => !v)}
          className="admin-btn admin-btn-secondary admin-toggle-btn"
        >
          <Gauge className="size-4" aria-hidden="true" /> Shortlisted
        </button>
        <span className="admin-toolbar-spacer" />
        <select
          aria-label="Sort applicants"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="admin-select"
        >
          <option value="newest">Newest first</option>
          <option value="score">Highest ATS score</option>
        </select>
        <label className="admin-search">
          <Search className="size-4" aria-hidden="true" />
          <span className="sr-only">Search applicants</span>
          <input
            type="search"
            className="admin-form-input"
            placeholder="Search applicants"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </label>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="listings-loading" role="status"><div className="admin-spinner" aria-hidden="true" /><span className="sr-only">Loading applicants…</span></div>
        ) : filteredApplicants.length === 0 ? (
          <EmptyState
            icon={UserSearch}
            title={applicants.length ? 'No applicants match these filters' : 'No applications yet'}
            subtitle={applicants.length ? 'Try another enterprise, status, or search.' : 'Applications from every careers page land here, scored by the ATS.'}
            action={applicants.length > 0 && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => { setSelectedEnterprise('all'); setSelectedStatus('all'); setShortlistedOnly(false); setSearchTerm(''); }}
              >
                Clear filters
              </button>
            )}
          />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Candidate Name &amp; Contact</th>
                <th style={{ width: '20%' }}>Position &amp; Division</th>
                <th style={{ width: '10%' }}>ATS Score</th>
                <th style={{ width: '14%' }}>Status Pipeline</th>
                <th style={{ width: '11%' }}>Submitted</th>
                <th style={{ width: '11%' }}>Resume</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map(a => {
                const dateStr = a.submitted_at ? new Date(a.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                const hasResume = !!a.resume_path;

                return (
                  <tr key={a.id} className={a.status === 'new' ? 'admin-row-new' : undefined}>
                    <td>
                      <div className="admin-cell-title">{a.full_name}</div>
                      <div className="admin-contact-line">
                        <Mail className="size-3" aria-hidden="true" />
                        <a href={`mailto:${a.email}`}>{a.email}</a>
                      </div>
                      <div className="admin-contact-line">
                        <Phone className="size-3" aria-hidden="true" />
                        <span>{a.phone}</span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-cell-title">{a.job_title || 'General Application'}</div>
                      <div className="admin-cell-muted">{ENTERPRISE_NAMES[a.enterprise_slug] || a.enterprise_slug || 'General'}</div>
                    </td>

                    <td>
                      <AtsBadge applicant={a} />
                    </td>

                    <td>
                      <select
                        value={a.status}
                        onChange={(e) => handleUpdateStatus(a.id, e.target.value)}
                        aria-label={`Status for ${a.full_name}`}
                        className="admin-select admin-status-select"
                        data-status={a.status}
                      >
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>

                    <td className="admin-cell-muted">{dateStr}</td>

                    <td>
                      {hasResume ? (
                        <a
                          href={`/api/admin/applicants.php?action=resume&id=${a.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                        >
                          <FileText className="size-3" aria-hidden="true" /> View CV
                        </a>
                      ) : (
                        <span className="admin-cell-muted">No file</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="admin-icon-btn"
                        title="Review Details & Notes"
                        aria-label={`Review ${a.full_name}`}
                        onClick={() => handleOpenDetail(a)}
                      >
                        <Eye className="size-4" aria-hidden="true" />
                      </button>
                      {can('delete') && (
                        <button
                          className="admin-icon-btn admin-icon-btn-danger"
                          title="Delete Applicant"
                          aria-label={`Delete ${a.full_name}`}
                          onClick={() => setDeleteTarget(a)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Applicant Detail & Internal Notes Drawer / Modal */}
      {activeApplicant && (
        <div className="admin-modal-overlay fixed inset-0 z-50 bg-black/90 backdrop-blur-md" onClick={() => setActiveApplicant(null)}>
          <div className="admin-modal rounded-3xl border border-[#D4AF37]/50 bg-[#0B0905]" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="admin-modal-header">
              <div>
                <span className="admin-badge text-[#E2B857]" style={{ textTransform: 'uppercase', marginBottom: 4 }}>
                  {activeApplicant.enterprise_slug} DIVISION
                </span>
                <h2 className="text-balance text-[#E2B857]" style={{ margin: 0, fontSize: '1.3rem' }}>{activeApplicant.full_name}</h2>
              </div>
              <button className="admin-modal-close rounded-full border border-[#D4AF37]/30" aria-label="Close dialog" onClick={() => setActiveApplicant(null)}>&times;</button>
            </div>

            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Profile Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, background: 'var(--admin-surface-3)', padding: 16, borderRadius: 8, border: '1px solid var(--admin-line)' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-3)', textTransform: 'uppercase', fontWeight: 700 }}>Position Applied</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--admin-text-1)', fontWeight: 600, marginTop: 2 }}>{activeApplicant.job_title}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-3)', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-1)', marginTop: 2 }}>
                    <a href={`mailto:${activeApplicant.email}`} style={{ color: 'var(--admin-gold-soft)', textDecoration: 'none' }}>{activeApplicant.email}</a>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-3)', textTransform: 'uppercase', fontWeight: 700 }}>Phone / Mobile</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-1)', marginTop: 2 }}>{activeApplicant.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-3)', textTransform: 'uppercase', fontWeight: 700 }}>Current Status</div>
                  <div style={{ marginTop: 4 }}>
                    <select
                      value={activeApplicant.status}
                      onChange={(e) => handleUpdateStatus(activeApplicant.id, e.target.value)}
                      aria-label="Applicant status"
                      className="admin-select admin-status-select"
                      data-status={activeApplicant.status}
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Hiring decision: auto-reject notice, interview schedule, accept-for-interview form */}
              <div style={{ background: 'var(--admin-surface-3)', border: '1px solid var(--admin-line)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-gold-soft)', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center' }}>
                    <CalendarCheck className="size-3" aria-hidden="true" style={{ marginRight: 5 }} /> Hiring Decision
                  </span>
                  {!inviteOpen && (
                    <button
                      type="button"
                      onClick={openInvite}
                      className="admin-btn admin-btn-primary"
                      style={{ fontSize: '0.75rem', padding: '6px 14px' }}
                    >
                      {activeApplicant.interview_at ? 'Reschedule Interview' : 'Accept for Interview'}
                    </button>
                  )}
                </div>
                {activeApplicant.status === 'rejected' && activeApplicant.auto_rejected_at && (
                  <p className="text-pretty" style={{ margin: 0, color: '#E08A81', fontSize: '0.8rem' }}>
                    {activeApplicant.decision_emailed_at
                      ? `Auto-rejected by the ATS. The rejection email was sent ${formatDateTime(activeApplicant.decision_emailed_at)}.`
                      : 'Auto-rejected by the ATS. A polite rejection email goes out at the next daily run (8:00 AM) unless you change the status first.'}
                  </p>
                )}
                {activeApplicant.interview_at && (
                  <p className="text-pretty" style={{ margin: 0, color: 'var(--admin-green)', fontSize: '0.8rem' }}>
                    Interview scheduled for {formatDateTime(activeApplicant.interview_at)}
                    {activeApplicant.interview_note ? ` · Note: ${activeApplicant.interview_note}` : ''}
                  </p>
                )}
                {inviteOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p className="text-pretty" style={{ margin: 0, color: 'var(--admin-text-2)', fontSize: '0.8rem' }}>
                      The applicant is emailed that they're accepted for an interview, with this schedule, the office address and what to bring. Status becomes Interviewing.
                    </p>
                    <div className="admin-field" style={{ margin: 0 }}>
                      <label htmlFor="invite-at">Interview date &amp; time</label>
                      <input
                        id="invite-at"
                        type="datetime-local"
                        required
                        min={toLocalInput(new Date())}
                        value={inviteAt}
                        onChange={(e) => setInviteAt(e.target.value)}
                        className={inputCls}
                        style={{ color: 'var(--admin-text-1)', padding: 10 }}
                      />
                    </div>
                    <div className="admin-field" style={{ margin: 0 }}>
                      <label htmlFor="invite-note">Note to the applicant (optional)</label>
                      <textarea
                        id="invite-note"
                        rows={2}
                        maxLength={1000}
                        value={inviteNote}
                        onChange={(e) => setInviteNote(e.target.value)}
                        placeholder="e.g. Ask for Ms. Santos at the reception."
                        className={inputCls}
                        style={{ color: 'var(--admin-text-1)', padding: 10, fontSize: '0.85rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setInviteOpen(false)} disabled={inviting}>Cancel</button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={handleSendInvite}
                        disabled={inviting}
                      >
                        {inviting ? 'Sending...' : 'Send Invitation'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2x2 photo and portfolio links (only for openings that ask for them) */}
              {(activeApplicant.photo_path || (activeApplicant.portfolio_links || []).length > 0) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, background: 'var(--admin-surface-2)', padding: 14, borderRadius: 8, border: '1px solid var(--admin-line)' }}>
                  {activeApplicant.photo_path && (
                    <a href={`/api/admin/applicants.php?action=photo&id=${activeApplicant.id}`} target="_blank" rel="noopener noreferrer" title="Open the full-size photo">
                      <img
                        src={`/api/admin/applicants.php?action=photo&id=${activeApplicant.id}`}
                        alt={`2x2 photo of ${activeApplicant.full_name}`}
                        width={120}
                        height={120}
                        style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--admin-line-strong)' }}
                      />
                    </a>
                  )}
                  {(activeApplicant.portfolio_links || []).length > 0 && (
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-3)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Portfolio</div>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {activeApplicant.portfolio_links.map((url) => (
                          <li key={url} style={{ overflowWrap: 'anywhere', fontSize: '0.85rem' }}>
                            {safeHref(url) ? (
                              <a href={safeHref(url)} target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'var(--admin-gold-soft)' }}>
                                {url} <ExternalLink className="inline size-3" aria-hidden="true" />
                              </a>
                            ) : url}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Resume Download Action */}
              {activeApplicant.resume_path && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: 'var(--admin-surface-2)', padding: 14, borderRadius: 8, border: '1px solid var(--admin-line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, overflowWrap: 'anywhere' }}>
                    <FileText className="size-6" aria-hidden="true" style={{ color: 'var(--admin-gold-soft)' }} />
                    <div>
                      <div style={{ color: 'var(--admin-text-1)', fontSize: '0.85rem', fontWeight: 600 }}>{activeApplicant.resume_filename || 'Candidate_Resume.pdf'}</div>
                      <div style={{ color: 'var(--admin-text-3)', fontSize: '0.75rem' }}>Securely authenticated resume stored in vault</div>
                    </div>
                  </div>
                  <a
                    href={`/api/admin/applicants.php?action=resume&id=${activeApplicant.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn admin-btn-primary"
                    style={{ fontSize: '0.8rem', padding: '6px 14px', whiteSpace: 'nowrap' }}
                  >
                    <Download className="size-4" aria-hidden="true" style={{ marginRight: 6 }} /> Open Resume
                  </a>
                </div>
              )}

              {/* ATS Screening */}
              <div style={{ background: 'var(--admin-surface-3)', border: '1px solid var(--admin-line)', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-gold-soft)', textTransform: 'uppercase', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                      <Gauge className="size-3" aria-hidden="true" style={{ marginRight: 5 }} /> ATS Screening
                    </span>
                    <AtsBadge applicant={activeApplicant} />
                    {activeApplicant.ats_method && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-3)', textTransform: 'uppercase' }}>
                        {activeApplicant.ats_method === 'ai' ? 'AI scored' : 'Keyword scored'}
                      </span>
                    )}
                  </div>
                  {can('applicants') && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={handleRescreen}
                      disabled={rescreening}
                      style={{ fontSize: '0.75rem', padding: '4px 12px', whiteSpace: 'nowrap' }}
                    >
                      <RotateCw className="size-3" aria-hidden="true" style={{ marginRight: 5 }} />
                      {rescreening ? 'Screening...' : 'Re-screen'}
                    </button>
                  )}
                </div>
                {activeApplicant.ats_details ? (
                  <div style={{ color: 'var(--admin-text-1)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    <p style={{ margin: '0 0 8px' }}>{activeApplicant.ats_details.summary}</p>
                    {[
                      ['Strengths', activeApplicant.ats_details.strengths, 'var(--admin-green)'],
                      ['Gaps', activeApplicant.ats_details.gaps, '#E08A81'],
                    ].map(([label, items, color]) => Array.isArray(items) && items.length > 0 && (
                      <div key={label} style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: '0.7rem', color, fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
                        <ul style={{ margin: '2px 0 0', paddingLeft: 18 }}>
                          {items.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    ))}
                    {Array.isArray(activeApplicant.ats_details.keywords) && activeApplicant.ats_details.keywords.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-3)' }}>
                        Matched keywords: {activeApplicant.ats_details.keywords.join(', ')}
                      </div>
                    )}
                  </div>
                ) : (
                  <em style={{ color: 'var(--admin-text-3)', fontSize: '0.85rem' }}>Not screened yet.</em>
                )}
              </div>

              {/* Cover Letter / Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-gold-soft)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Cover Note / Applicant Submission Message:
                </label>
                <div style={{ background: 'var(--admin-surface-3)', border: '1px solid var(--admin-line)', borderRadius: 6, padding: 14, color: 'var(--admin-text-1)', fontSize: '0.85rem', lineHeight: 1.6, maxHeight: 160, overflowY: 'auto' }}>
                  {activeApplicant.cover_letter ? activeApplicant.cover_letter : <em style={{ color: 'var(--admin-text-3)' }}>No cover note provided by candidate.</em>}
                </div>
              </div>

              {/* Internal Recruiter Notes */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px 12px', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-gold-soft)', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center' }}>
                    <Lock className="size-3" aria-hidden="true" style={{ marginRight: 5 }} /> Internal Recruiter &amp; Interview Notes:
                  </label>
                  <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-3)' }}>Visible only to administrators</span>
                </div>
                <textarea
                  rows={4}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add private evaluation notes, interview schedules, compensation discussions, or recruiter feedback..."
                  className={inputCls}
                  style={{
                    width: '100%',
                    color: 'var(--admin-text-1)',
                    padding: 12,
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                  }}
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setActiveApplicant(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                >
                  {savingNotes ? 'Saving Notes...' : 'Save Recruiter Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Candidate Record"
        message={`Are you sure you want to permanently delete the application record and attached resume for "${deleteTarget?.full_name || 'this candidate'}"? This action cannot be undone.`}
        confirmLabel="Delete Record"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
