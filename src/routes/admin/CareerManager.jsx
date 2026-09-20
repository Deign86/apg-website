import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/admin/Toast';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { ENTERPRISE_TABS, ENTERPRISES } from '@/data/enterprises';
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
    setSaving(true);
    try {
      const method = editingJob ? 'PUT' : 'POST';
      const payload = editingJob ? { ...form, id: editingJob.id } : form;
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
      }
    } catch {
      toast.error('Status toggle failed');
    }
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

      <div className="admin-header">
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Careers Manager</h1>
          <p style={{ color: '#888', margin: '4px 0 0', fontSize: '0.85rem' }}>Create, update, and manage job openings across all APG divisions</p>
        </div>
        {can('careers') && (
          <button className="admin-btn admin-btn-primary rounded-full bg-[#D4AF37] uppercase tracking-widest" onClick={handleOpenAdd}>
            <Plus className="size-4" aria-hidden="true" /> Post New Job Opening
          </button>
        )}
      </div>

      {/* Enterprise Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-full border border-[#D4AF37]/30 bg-[#161109]/90 p-1.5">
        {ENTERPRISE_TABS.map(ent => {
          const isActive = selectedEnterprise === ent.slug;
          const count = ent.slug === 'all'
            ? jobs.length
            : jobs.filter(j => j.enterprise_slug === ent.slug).length;
          return (
            <button
              key={ent.slug}
              type="button"
              onClick={() => setSelectedEnterprise(ent.slug)}
              className={`rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-widest transition-colors duration-200 ${isActive ? 'bg-[#D4AF37] text-black' : 'text-neutral-400 hover:text-[#E2B857]'}`}
            >
              <span>{ent.name}</span>
              <span className="tabular-nums" style={{
                background: isActive ? 'rgba(0,0,0,0.2)' : '#1c2030',
                color: isActive ? '#000' : '#888',
                padding: '1px 6px',
                borderRadius: 10,
                fontSize: '0.7rem',
                marginLeft: 6,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'active', 'closed'].map(s => {
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold uppercase tracking-widest transition-colors duration-200 ${isActive ? 'bg-[#D4AF37] text-black' : 'border border-[#D4AF37]/30 text-neutral-400 hover:text-[#E2B857]'}`}
              >
                {s}
              </button>
            );
          })}
        </div>
        <div className="relative" style={{ width: 260 }}>
          <Search className="size-4 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search job titles or divisions..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={inputCls}
            style={{ width: '100%', padding: '8px 12px 8px 36px', color: '#fff', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container rounded-2xl border border-[#D4AF37]/30 bg-[#120E05]/90">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
            <div className="admin-spinner" style={{ margin: '0 auto 12px' }} />
            <p>Loading openings...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
            <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/15 text-[#E2B857]">
              <Briefcase className="size-5" aria-hidden="true" />
            </span>
            <p className="text-pretty">No job postings found.</p>
            {can('careers') && (
              <button className="admin-btn admin-btn-primary rounded-full bg-[#D4AF37] uppercase tracking-widest" style={{ marginTop: 12 }} onClick={handleOpenAdd}>
                <Plus className="size-4" aria-hidden="true" /> Post New Job Opening
              </button>
            )}
          </div>
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
                <tr key={j.id}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{j.title}</td>
                  <td><span className="admin-badge" style={{ color: '#7dd3fc' }}>{ENTERPRISE_NAMES[j.enterprise_slug] || j.enterprise_slug || '—'}</span></td>
                  <td><span className="admin-badge" style={{ color: '#c5a059' }}>{j.tag || 'General'}</span></td>
                  <td style={{ color: '#aaa', fontSize: '0.85rem' }}>{j.location}</td>
                  <td><span className="admin-badge">{j.type}</span></td>
                  <td>
                    <button 
                      onClick={() => handleToggleStatus(j)}
                      style={{
                        background: j.status === 'active' ? '#064e3b' : '#374151',
                        color: j.status === 'active' ? '#34d399' : '#9ca3af',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {j.status}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="admin-icon-btn" title="Edit" aria-label={`Edit ${j.title}`} onClick={() => handleOpenEdit(j)}>
                      <Pen className="size-4" aria-hidden="true" />
                    </button>
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

      {/* Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay fixed inset-0 z-50 bg-black/90 backdrop-blur-md" onClick={() => setModalOpen(false)}>
          <div className="admin-modal rounded-3xl border border-[#D4AF37]/50 bg-[#0B0905]" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <div className="admin-modal-header">
              <h2 className="text-balance text-[#E2B857]">{editingJob ? 'Edit Job Opening' : 'Post New Job Opening'}</h2>
              <button className="admin-modal-close rounded-full border border-[#D4AF37]/30" aria-label="Close dialog" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="admin-field">
                <label>Job Title</label>
                <input 
                  type="text" 
                  className={inputCls} value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  placeholder="e.g. Senior Commercial Real Estate Broker" 
                  required 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="admin-field">
                  <label>Division / Tag</label>
                  <input 
                    type="text" 
                    className={inputCls} value={form.tag} 
                    onChange={e => setForm({ ...form, tag: e.target.value })} 
                    placeholder="e.g. Real Estate, Construction" 
                  />
                </div>
                <div className="admin-field">
                  <label>Employment Type</label>
                  <select className={inputCls} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>
              <div className="admin-field">
                <label>Location</label>
                <input 
                  type="text" 
                  className={inputCls} value={form.location} 
                  onChange={e => setForm({ ...form, location: e.target.value })} 
                  placeholder="e.g. Ortigas Center, Pasig City" 
                  required 
                />
              </div>
              <div className="admin-field">
                <label>Job Description & Responsibilities</label>
                <textarea 
                  rows={4} 
                  className={inputCls} value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  placeholder="Overview of the position, core responsibilities, and team role..." 
                  required 
                />
              </div>
              
              {/* Requirements List Builder */}
              <div className="admin-field">
                <label>Requirements &amp; Qualifications</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input 
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
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(18, 14, 5, 0.9)', padding: '6px 10px', borderRadius: 8, fontSize: '0.8rem', color: '#ddd', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                        <span>&bull; {req}</span>
                        <button type="button" onClick={() => handleRemoveRequirement(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}>&times;</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Responsibilities List Builder */}
              <div className="admin-field">
                <label>Responsibilities</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
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
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(18, 14, 5, 0.9)', padding: '6px 10px', borderRadius: 8, fontSize: '0.8rem', color: '#ddd', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                        <span>&bull; {item}</span>
                        <button type="button" onClick={() => handleRemoveResponsibility(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}>&times;</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="admin-field">
                  <label>Enterprise</label>
                  <select className={inputCls} value={form.enterprise_slug} onChange={e => setForm({ ...form, enterprise_slug: e.target.value })}>
                    {ENTERPRISES.map(ent => (
                      <option key={ent.slug} value={ent.slug}>{ent.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Salary (optional)</label>
                  <input
                    type="text"
                    className={inputCls} value={form.salary}
                    onChange={e => setForm({ ...form, salary: e.target.value })}
                    placeholder="e.g. $70k - $95k"
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#aaa', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                />
                Feature this opening (highlighted on the enterprise careers page)
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="admin-field">
                  <label>Status</label>
                  <select className={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active (Accepting applications)</option>
                    <option value="closed">Closed (Archived)</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label>Sort Order</label>
                  <input 
                    type="number" 
                    className={inputCls} value={form.sort_order} 
                    onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} 
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary rounded-full bg-[#D4AF37] uppercase tracking-widest" disabled={saving}>
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
