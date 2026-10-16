import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/admin/Toast';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import PageHeader from '@/components/admin/PageHeader';
import SegmentedControl from '@/components/admin/SegmentedControl';
import EnterpriseSelect from '@/components/admin/EnterpriseSelect';
import { ENTERPRISE_TABS, ENTERPRISES } from '@/data/enterprises';
import EmptyState from '@/components/admin/EmptyState';
import { openOnRowClick } from '@/components/admin/rowClick';
import { Briefcase, Pen, Plus, Search, Trash2 } from 'lucide-react';

const inputCls = 'rounded-xl border-neutral-800 bg-black/80 focus:border-[#D4AF37]';

const ENTERPRISE_NAMES = Object.fromEntries(ENTERPRISE_TABS.map(e => [e.slug, e.name]));

export default function CareerManager() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [reqInput, setReqInput] = useState('');
  const [form, setForm] = useState({
    title: '',
    location: 'Ortigas Center, Pasig City',
    type: 'Full-Time',
    tag: 'Operations',
    description: '',
    requirements: [],
    responsibilities: [],
    salary: '',
    is_featured: false,
    require_photo: false,
    ask_portfolio: false,
    enterprise_slug: 'corporate',
    status: 'active',
    sort_order: 0,
  });
  const [selectedEnterprise, setSelectedEnterprise] = useState('all');
  const [respInput, setRespInput] = useState('');
  const toast = useToast();
  const { can } = useAuth();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/careers.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setJobs(data.data);
      } else {
        setJobs([]);
      }
    } catch {
      toast.error('Failed to load career listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleOpenAdd = () => {
    setEditingJob(null);
    setReqInput('');
    setRespInput('');
    setForm({
      title: '',
      location: 'Ortigas Center, Pasig City',
      type: 'Full-Time',
      tag: 'Real Estate',
      description: '',
      requirements: [],
      responsibilities: [],
      salary: '',
      is_featured: false,
      require_photo: false,
      ask_portfolio: false,
      enterprise_slug: selectedEnterprise === 'all' ? 'corporate' : selectedEnterprise,
      status: 'active',
      sort_order: jobs.length + 1,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setReqInput('');
    setRespInput('');
    setForm({
      title: job.title,
      location: job.location || 'Ortigas Center, Pasig City',
      type: job.type || 'Full-Time',
      tag: job.tag || '',
      description: job.description || '',
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
      salary: job.salary || '',
      is_featured: Number(job.is_featured) === 1,
      require_photo: Number(job.require_photo) === 1,
      ask_portfolio: Number(job.ask_portfolio) === 1,
      enterprise_slug: job.enterprise_slug || 'corporate',
      status: job.status || 'active',
      sort_order: job.sort_order || 0,
    });
    setModalOpen(true);
  };

  const handleAddRequirement = () => {
    if (!reqInput.trim()) return;
    setForm(prev => ({
      ...prev,
      requirements: [...prev.requirements, reqInput.trim()],
    }));
    setReqInput('');
  };

  const handleRemoveRequirement = (idx) => {
    setForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== idx),
    }));
  };

  const handleAddResponsibility = () => {
    if (!respInput.trim()) return;
    setForm(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, respInput.trim()],
    }));
    setRespInput('');
  };

  const handleRemoveResponsibility = (idx) => {
    setForm(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // Text typed into the requirement/responsibility boxes but not "Add"-ed is kept, not dropped.
    const pendingReq = reqInput.trim();
    const pendingResp = respInput.trim();
    const job = {
      ...form,
      requirements: pendingReq ? [...form.requirements, pendingReq] : form.requirements,
      responsibilities: pendingResp ? [...form.responsibilities, pendingResp] : form.responsibilities,
    };
    if (pendingReq || pendingResp) {
      setForm(job);
      setReqInput('');
      setRespInput('');
    }
    setSaving(true);
    try {
      const method = editingJob ? 'PUT' : 'POST';
      const payload = editingJob ? { ...job, id: editingJob.id } : job;
      const res = await fetch('/api/admin/careers.php', {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingJob ? 'Job opening updated' : 'Job opening created');
        setModalOpen(false);
        fetchJobs();
      } else {
        toast.error(data.error || 'Failed to save job');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleRequestDelete = (job) => {
    setDeleteTarget(job);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/careers.php?id=${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Job opening deleted');
        setDeleteTarget(null);
        fetchJobs();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeleting(false);
    }
  };

  // Closing takes the opening off the careers page, so it is confirmed first; reopening is not.
  const [closeTarget, setCloseTarget] = useState(null);
  const [closingJob, setClosingJob] = useState(false);

  const handleToggleStatus = async (job) => {
    try {
      const newStatus = job.status === 'active' ? 'closed' : 'active';
      const res = await fetch('/api/admin/careers.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...job, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Job marked as ${newStatus}`);
        fetchJobs();
      } else {
        toast.error(data.error || 'Status toggle failed');
      }
    } catch {
      toast.error('Status toggle failed');
    }
  };

  const confirmCloseJob = async () => {
    setClosingJob(true);
    await handleToggleStatus(closeTarget);
    setClosingJob(false);
    setCloseTarget(null);
  };

  const filteredJobs = jobs.filter(j => {
    const matchesEnterprise = selectedEnterprise === 'all' || j.enterprise_slug === selectedEnterprise;
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    const matchesSearch = !searchTerm || j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (j.tag && j.tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesEnterprise && matchesStatus && matchesSearch;
  });

  return (
    <div className="admin-page">
      <Helmet><title>Careers Manager | Admin</title></Helmet>

      <PageHeader
        eyebrow="Recruitment"
        title="Careers Manager"
        description="Create, update, and manage job openings across all APG divisions."
        actions={can('careers') && (
          <button className="admin-btn admin-btn-primary" onClick={handleOpenAdd}>
            <Plus className="size-4" aria-hidden="true" /> New opening
          </button>
        )}
      />

      <div className="admin-toolbar">
        <EnterpriseSelect
          value={selectedEnterprise}
          onChange={setSelectedEnterprise}
          countFor={slug => slug === 'all' ? jobs.length : jobs.filter(j => j.enterprise_slug === slug).length}
        />
        <SegmentedControl
          label="Filter by status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[{ value: 'all', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'closed', label: 'Closed' }]}
        />
        <span className="admin-toolbar-spacer" />
        <label className="admin-search">
          <Search className="size-4" aria-hidden="true" />
          <span className="sr-only">Search job openings</span>
          <input
            type="search"
            className="admin-form-input"
            placeholder="Search titles or divisions"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </label>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="listings-loading" role="status"><div className="admin-spinner" aria-hidden="true" /><span className="sr-only">Loading openings…</span></div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={jobs.length ? 'No openings match these filters' : 'Post your first opening'}
            subtitle={jobs.length ? 'Try another enterprise, status, or search.' : 'Openings appear on the careers page of their enterprise.'}
            action={can('careers') && (
              <button className="admin-btn admin-btn-primary" onClick={handleOpenAdd}>
                <Plus className="size-4" aria-hidden="true" /> New opening
              </button>
            )}
          />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Job Title</th>
                <th style={{ width: '14%' }}>Enterprise</th>
                <th style={{ width: '13%' }}>Division / Tag</th>
                <th style={{ width: '13%' }}>Location</th>
                <th style={{ width: '10%' }}>Type</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(j => (
                <tr
                  key={j.id}
                  className={can('careers') ? 'admin-row-clickable' : undefined}
                  onClick={can('careers') ? (e) => openOnRowClick(e, () => handleOpenEdit(j)) : undefined}
                >
                  <td className="admin-cell-title">{j.title}</td>
                  <td className="admin-cell-muted">{ENTERPRISE_NAMES[j.enterprise_slug] || j.enterprise_slug || '—'}</td>
                  <td><span className="admin-badge">{j.tag || 'General'}</span></td>
                  <td className="admin-cell-muted">{j.location}</td>
                  <td><span className="admin-badge">{j.type}</span></td>
                  <td>
                    <button
                      type="button"
                      onClick={() => (j.status === 'active' ? setCloseTarget(j) : handleToggleStatus(j))}
                      disabled={!can('careers')}
                      className={`admin-pill admin-pill-btn ${j.status === 'active' ? 'admin-pill-green' : 'admin-pill-grey'}`}
                      title={can('careers') ? `Mark as ${j.status === 'active' ? 'closed' : 'active'}` : undefined}
                      aria-label={can('careers') ? `${j.status}, mark ${j.title} as ${j.status === 'active' ? 'closed' : 'active'}` : undefined}
                    >
                      {j.status}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {can('careers') && (
                      <button className="admin-icon-btn" title="Edit" aria-label={`Edit ${j.title}`} onClick={() => handleOpenEdit(j)}>
                        <Pen className="size-4" aria-hidden="true" />
                      </button>
                    )}
                    {can('delete') && (
                      <button className="admin-icon-btn admin-icon-btn-danger" title="Delete" aria-label={`Delete ${j.title}`} onClick={() => handleRequestDelete(j)}>
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Job Opening"
        message={`Are you sure you want to delete the job opening "${deleteTarget?.title || 'this role'}"? This action will permanently remove it from the careers board.`}
        confirmLabel="Delete Opening"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!closeTarget}
        title="Close this opening?"
        message={`"${closeTarget?.title || 'This opening'}" will be taken off the careers page and stop accepting applications. You can reopen it later.`}
        confirmLabel="Close opening"
        loading={closingJob}
        onConfirm={confirmCloseJob}
        onCancel={() => setCloseTarget(null)}
      />

      {/* Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay fixed inset-0 z-50 bg-black/90 backdrop-blur-md" onClick={() => setModalOpen(false)}>
          <div className="admin-modal admin-modal-lg rounded-3xl border border-[#D4AF37]/50 bg-[#0B0905]" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="text-balance text-[#E2B857]">{editingJob ? 'Edit job opening' : 'New job opening'}</h2>
              <button className="admin-modal-close rounded-full border border-[#D4AF37]/30" aria-label="Close dialog" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="admin-form-row">
                <div className="admin-field">
                  <label htmlFor="career-job-title">Job Title</label>
                  <input id="career-job-title"
                    type="text"
                    className={inputCls} value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Senior Commercial Real Estate Broker"
                    required
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="career-location">Location</label>
                  <input id="career-location"
                    type="text"
                    className={inputCls} value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Ortigas Center, Pasig City"
                    required
                  />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-field">
                  <label htmlFor="career-division-tag">Division / Tag</label>
                  <input id="career-division-tag" 
                    type="text" 
                    className={inputCls} value={form.tag} 
                    onChange={e => setForm({ ...form, tag: e.target.value })} 
                    placeholder="e.g. Real Estate, Construction" 
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="career-employment-type">Employment Type</label>
                  <select id="career-employment-type" className={inputCls} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-field">
                  <label htmlFor="career-enterprise">Enterprise</label>
                  <select id="career-enterprise" className={inputCls} value={form.enterprise_slug} onChange={e => setForm({ ...form, enterprise_slug: e.target.value })}>
                    {ENTERPRISES.map(ent => (
                      <option key={ent.slug} value={ent.slug}>{ent.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="career-salary-optional">Salary (optional)</label>
                  <input id="career-salary-optional"
                    type="text"
                    className={inputCls} value={form.salary}
                    onChange={e => setForm({ ...form, salary: e.target.value })}
                    placeholder="e.g. $70k - $95k"
                  />
                </div>
              </div>
              <div className="admin-field">
                <label htmlFor="career-job-description-responsibilities">Job Description & Responsibilities</label>
                <textarea id="career-job-description-responsibilities" 
                  rows={4} 
                  className={inputCls} value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  placeholder="Overview of the position, core responsibilities, and team role..." 
                  required 
                />
              </div>
              
              <div className="admin-form-row">
                {/* Requirements List Builder */}
                <div className="admin-field">
                  <label htmlFor="career-requirements-amp-qualifications">Requirements &amp; Qualifications</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input id="career-requirements-amp-qualifications" 
                      type="text" 
                      className={inputCls} value={reqInput} 
                      onChange={e => setReqInput(e.target.value)} 
                      placeholder="e.g. 3+ years commercial brokerage experience" 
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddRequirement(); } }}
                    />
                    <button type="button" className="admin-btn admin-btn-secondary" onClick={handleAddRequirement}>Add</button>
                  </div>
                  {form.requirements.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                      {form.requirements.map((req, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(18, 14, 5, 0.9)', padding: '6px 10px', borderRadius: 8, fontSize: '0.8rem', color: 'var(--admin-text-1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                          <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>&bull; {req}</span>
                          <button type="button" onClick={() => handleRemoveRequirement(idx)} aria-label="Remove requirement" style={{ background: 'none', border: 'none', color: 'var(--admin-red)', cursor: 'pointer', fontSize: '1rem', flexShrink: 0, minWidth: 40, minHeight: 40 }}>&times;</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Responsibilities List Builder */}
                <div className="admin-field">
                  <label htmlFor="career-responsibilities">Responsibilities</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input id="career-responsibilities"
                      type="text"
                      className={inputCls} value={respInput}
                      onChange={e => setRespInput(e.target.value)}
                      placeholder="e.g. Manage the leasing pipeline end to end"
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddResponsibility(); } }}
                    />
                    <button type="button" className="admin-btn admin-btn-secondary" onClick={handleAddResponsibility}>Add</button>
                  </div>
                  {form.responsibilities.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                      {form.responsibilities.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(18, 14, 5, 0.9)', padding: '6px 10px', borderRadius: 8, fontSize: '0.8rem', color: 'var(--admin-text-1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                          <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>&bull; {item}</span>
                          <button type="button" onClick={() => handleRemoveResponsibility(idx)} aria-label="Remove responsibility" style={{ background: 'none', border: 'none', color: 'var(--admin-red)', cursor: 'pointer', fontSize: '1rem', flexShrink: 0, minWidth: 40, minHeight: 40 }}>&times;</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--admin-text-2)', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                />
                Feature this opening (highlighted on the enterprise careers page)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--admin-text-2)', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={form.require_photo}
                  onChange={e => setForm({ ...form, require_photo: e.target.checked })}
                />
                Require a 2x2 photo (square ID photo, at least 600×600 px)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--admin-text-2)', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={form.ask_portfolio}
                  onChange={e => setForm({ ...form, ask_portfolio: e.target.checked })}
                />
                Ask for portfolio links (optional for applicants)
              </label>

              <div className="admin-form-row">
                <div className="admin-field">
                  <label htmlFor="career-status">Status</label>
                  <select id="career-status" className={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active (Accepting applications)</option>
                    <option value="closed">Closed (Archived)</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="career-sort-order">Sort Order</label>
                  <input id="career-sort-order" 
                    type="number" 
                    className={inputCls} value={form.sort_order} 
                    onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} 
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
