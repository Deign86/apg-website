import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import StatusPill from '@/components/admin/StatusPill';

const ENTERPRISES = [
  { id: 'all', label: 'All Enterprises' },
  { id: 'realty', label: 'Alpha Realty' },
  { id: 'luxe-prime', label: 'Luxe Prime' },
  { id: 'construction', label: 'Construction' },
  { id: 'swift-clear', label: 'Swift Clear' },
  { id: 'dynamic-tree', label: 'Dynamic Tree' },
  { id: 'alta-venture', label: 'Alta Venture' },
  { id: '88-prime', label: '88 Prime' },
  { id: 'virtual-office', label: 'Virtual Office' },
  { id: 'general', label: 'Corporate Group' },
];

const STATUS_OPTIONS = [
  { id: 'all', label: 'All Statuses' },
  { id: 'new', label: 'New', color: 'blue' },
  { id: 'reviewed', label: 'Reviewed', color: 'gold' },
  { id: 'interviewing', label: 'Interviewing', color: 'gold' },
  { id: 'hired', label: 'Hired', color: 'green' },
  { id: 'rejected', label: 'Rejected', color: 'red' },
];

export default function ApplicantsManager() {
  const [applicants, setApplicants] = useState([]);
  const [summary, setSummary] = useState({ total: 0, new: 0, interviewing: 0, hired: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedEnterprise, setSelectedEnterprise] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail / Notes Modal State
  const [activeApplicant, setActiveApplicant] = useState(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/applicants.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setApplicants(data.data);
        if (data.summary) {
          setSummary(data.summary);
        }
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

  const filteredApplicants = useMemo(() => {
    return applicants.filter(a => {
      const matchesEnt = selectedEnterprise === 'all' || a.enterprise_slug === selectedEnterprise;
      const matchesStat = selectedStatus === 'all' || a.status === selectedStatus;
      const q = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        a.full_name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phone?.toLowerCase().includes(q) ||
        a.job_title?.toLowerCase().includes(q);
      return matchesEnt && matchesStat && matchesSearch;
    });
  }, [applicants, selectedEnterprise, selectedStatus, searchTerm]);

  return (
    <div className="admin-page">
      <Helmet><title>Applicant Tracking & Talent Acquisition | Admin</title></Helmet>

      {/* Header */}
      <div className="admin-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
              Job Applicants &amp; ATS
            </h1>
            {summary.new > 0 && (
              <span style={{ background: '#1d4ed8', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: 12 }}>
                {summary.new} New
              </span>
            )}
          </div>
          <p style={{ color: '#888', margin: '4px 0 0', fontSize: '0.85rem' }}>
            Unified applicant tracking system across all 7 APG subsidiaries and group careers catalog
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="admin-btn admin-btn-secondary" onClick={fetchApplicants} title="Refresh applicant list">
            <i className="fa-solid fa-rotate-right" /> Refresh
          </button>
        </div>
      </div>

      {/* Enterprise Tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
        {ENTERPRISES.map(ent => {
          const isActive = selectedEnterprise === ent.id;
          const count = ent.id === 'all' 
            ? applicants.length 
            : applicants.filter(a => a.enterprise_slug === ent.id).length;
          
          return (
            <button
              key={ent.id}
              onClick={() => setSelectedEnterprise(ent.id)}
              style={{
                background: isActive ? '#c5a059' : '#12141c',
                color: isActive ? '#000' : '#aaa',
                border: '1px solid',
                borderColor: isActive ? '#c5a059' : '#232738',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <span>{ent.label}</span>
              <span style={{
                background: isActive ? 'rgba(0,0,0,0.2)' : '#1c2030',
                color: isActive ? '#000' : '#888',
                padding: '1px 6px',
                borderRadius: 10,
                fontSize: '0.7rem',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map(s => {
            const isActive = selectedStatus === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(s.id)}
                style={{
                  background: isActive ? '#1e293b' : '#0b0d14',
                  color: isActive ? '#fff' : '#888',
                  border: '1px solid',
                  borderColor: isActive ? '#c5a059' : '#232738',
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          placeholder="Search by name, email, phone, role..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            width: 280,
            padding: '8px 12px',
            background: '#0b0d14',
            border: '1px solid #232738',
            borderRadius: 6,
            color: '#fff',
            fontSize: '0.85rem',
          }}
        />
      </div>

      {/* Applicants Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: 50, textAlign: 'center', color: '#888' }}>
            <div className="admin-spinner" style={{ margin: '0 auto 12px' }} />
            <p>Loading candidate pipeline...</p>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div style={{ padding: 50, textAlign: 'center', color: '#888' }}>
            <i className="fa-solid fa-user-tie" style={{ fontSize: 40, color: '#333', marginBottom: 12 }} />
            <h3 style={{ color: '#aaa', margin: '0 0 4px', fontSize: '1.1rem' }}>No Applicants Found</h3>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>No candidates match the selected enterprise, status, or search query.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '24%' }}>Candidate Name &amp; Contact</th>
                <th style={{ width: '22%' }}>Position &amp; Division</th>
                <th style={{ width: '16%' }}>Status Pipeline</th>
                <th style={{ width: '12%' }}>Submitted</th>
                <th style={{ width: '12%' }}>Resume</th>
                <th style={{ width: '14%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map(a => {
                const dateStr = a.submitted_at ? new Date(a.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                const hasResume = !!a.resume_path;

                return (
                  <tr key={a.id} style={a.status === 'new' ? { background: 'rgba(59, 130, 246, 0.04)' } : {}}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{a.full_name}</div>
                      <div style={{ color: '#888', fontSize: '0.8rem', marginTop: 2 }}>
                        <i className="fa-regular fa-envelope" style={{ marginRight: 5, color: '#c5a059' }} />
                        <a href={`mailto:${a.email}`} style={{ color: '#aaa', textDecoration: 'none' }}>{a.email}</a>
                      </div>
                      <div style={{ color: '#888', fontSize: '0.8rem', marginTop: 2 }}>
                        <i className="fa-solid fa-phone" style={{ marginRight: 5, color: '#c5a059' }} />
                        <span>{a.phone}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#60a5fa', fontSize: '0.9rem' }}>
                        {a.job_title || 'General Application'}
                      </div>
                      <span className="admin-badge" style={{ color: '#c5a059', marginTop: 4, textTransform: 'uppercase' }}>
                        {a.enterprise_slug || 'General'}
                      </span>
                    </td>

                    <td>
                      <select
                        value={a.status}
                        onChange={(e) => handleUpdateStatus(a.id, e.target.value)}
                        style={{
                          background: a.status === 'new' ? '#1e3a8a' : a.status === 'hired' ? '#064e3b' : a.status === 'rejected' ? '#7f1d1d' : '#334155',
                          color: a.status === 'new' ? '#93c5fd' : a.status === 'hired' ? '#6ee7b7' : a.status === 'rejected' ? '#fca5a5' : '#cbd5e1',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 14,
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          outline: 'none',
                          textTransform: 'capitalize',
                        }}
                      >
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>

                    <td style={{ color: '#aaa', fontSize: '0.8rem' }}>
                      {dateStr}
                    </td>

                    <td>
                      {hasResume ? (
                        <a
                          href={`/api/admin/applicants.php?action=resume&id=${a.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-btn admin-btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                        >
                          <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444' }} /> View CV
                        </a>
                      ) : (
                        <span style={{ color: '#555', fontSize: '0.75rem' }}>No File</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="admin-icon-btn"
                        title="Review Details & Notes"
                        onClick={() => handleOpenDetail(a)}
                        style={{ color: '#c5a059' }}
                      >
                        <i className="fa-solid fa-eye" />
                      </button>
                      <button
                        className="admin-icon-btn admin-icon-btn-danger"
                        title="Delete Applicant"
                        onClick={() => setDeleteTarget(a)}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
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
        <div className="admin-modal-overlay" onClick={() => setActiveApplicant(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="admin-modal-header">
              <div>
                <span className="admin-badge" style={{ color: '#c5a059', textTransform: 'uppercase', marginBottom: 4 }}>
                  {activeApplicant.enterprise_slug} DIVISION
                </span>
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{activeApplicant.full_name}</h2>
              </div>
              <button className="admin-modal-close" onClick={() => setActiveApplicant(null)}>&times;</button>
            </div>

            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Profile Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, background: '#0b0d14', padding: 16, borderRadius: 8, border: '1px solid #1c2030' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Position Applied</div>
                  <div style={{ fontSize: '0.9rem', color: '#60a5fa', fontWeight: 600, marginTop: 2 }}>{activeApplicant.job_title}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: 2 }}>
                    <a href={`mailto:${activeApplicant.email}`} style={{ color: '#c5a059', textDecoration: 'none' }}>{activeApplicant.email}</a>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Phone / Mobile</div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: 2 }}>{activeApplicant.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Current Status</div>
                  <div style={{ marginTop: 4 }}>
                    <select
                      value={activeApplicant.status}
                      onChange={(e) => handleUpdateStatus(activeApplicant.id, e.target.value)}
                      style={{
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid #334155',
                        borderRadius: 6,
                        padding: '3px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
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

              {/* Resume Download Action */}
              {activeApplicant.resume_path && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#12141c', padding: 14, borderRadius: 8, border: '1px solid #232738' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <i className="fa-solid fa-file-pdf" style={{ fontSize: 24, color: '#ef4444' }} />
                    <div>
                      <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>{activeApplicant.resume_filename || 'Candidate_Resume.pdf'}</div>
                      <div style={{ color: '#888', fontSize: '0.75rem' }}>Securely authenticated resume stored in vault</div>
                    </div>
                  </div>
                  <a
                    href={`/api/admin/applicants.php?action=resume&id=${activeApplicant.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn admin-btn-primary"
                    style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                  >
                    <i className="fa-solid fa-download" style={{ marginRight: 6 }} /> Open Resume
                  </a>
                </div>
              )}

              {/* Cover Letter / Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#c5a059', textTransform: 'uppercase', marginBottom: 6 }}>
                  Cover Note / Applicant Submission Message:
                </label>
                <div style={{ background: '#0b0d14', border: '1px solid #1c2030', borderRadius: 6, padding: 14, color: '#ddd', fontSize: '0.85rem', lineHeight: 1.6, maxHeight: 160, overflowY: 'auto' }}>
                  {activeApplicant.cover_letter ? activeApplicant.cover_letter : <em style={{ color: '#666' }}>No cover note provided by candidate.</em>}
                </div>
              </div>

              {/* Internal Recruiter Notes */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c5a059', textTransform: 'uppercase' }}>
                    <i className="fa-solid fa-lock" style={{ marginRight: 5 }} /> Internal Recruiter &amp; Interview Notes:
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#888' }}>Visible only to administrators</span>
                </div>
                <textarea
                  rows={4}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add private evaluation notes, interview schedules, compensation discussions, or recruiter feedback..."
                  style={{
                    width: '100%',
                    background: '#0b0d14',
                    border: '1px solid #232738',
                    borderRadius: 6,
                    color: '#fff',
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
