import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/admin/Toast';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { ENTERPRISE_TABS, ENTERPRISES } from '@/data/enterprises';

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
          <button className="admin-btn admin-btn-primary" onClick={handleOpenAdd}>
            <i className="fa-solid fa-plus" /> Post New Job Opening
          </button>
        )}
      </div>

      {/* Enterprise Tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
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
              <span>{ent.name}</span>
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
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'active', 'closed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                background: statusFilter === s ? '#c5a059' : '#141620',
                color: statusFilter === s ? '#000' : '#aaa',
                border: '1px solid',
                borderColor: statusFilter === s ? '#c5a059' : '#232738',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                cursor: 'pointer',
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <input 
          type="text" 
          placeholder="Search job titles or divisions..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          style={{ width: 260, padding: '8px 12px', background: '#0b0d14', border: '1px solid #232738', borderRadius: 6, color: '#fff', fontSize: '0.85rem' }} 
        />
      </div>

      {/* Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
            <div className="admin-spinner" style={{ margin: '0 auto 12px' }} />
            <p>Loading openings...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
            <i className="fa-solid fa-briefcase" style={{ fontSize: 36, color: '#444', marginBottom: 12 }} />
            <p>No job postings found.</p>
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
                    <button className="admin-icon-btn" title="Edit" onClick={() => handleOpenEdit(j)}>
                      <i className="fa-solid fa-pen" />
                    </button>
                    {can('delete') && (
                      <button className="admin-icon-btn admin-icon-btn-danger" title="Delete" onClick={() => handleRequestDelete(j)}>
                        <i className="fa-solid fa-trash" />
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
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <div className="admin-modal-header">
              <h2>{editingJob ? 'Edit Job Opening' : 'Post New Job Opening'}</h2>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="admin-field">
                <label>Job Title</label>
                <input 
                  type="text" 
                  value={form.title} 
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
                    value={form.tag} 
                    onChange={e => setForm({ ...form, tag: e.target.value })} 
                    placeholder="e.g. Real Estate, Construction" 
                  />
                </div>
                <div className="admin-field">
                  <label>Employment Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
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
                  value={form.location} 
                  onChange={e => setForm({ ...form, location: e.target.value })} 
                  placeholder="e.g. Ortigas Center, Pasig City" 
                  required 
                />
              </div>
              <div className="admin-field">
                <label>Job Description & Responsibilities</label>
                <textarea 
                  rows={4} 
                  value={form.description} 
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
                    value={reqInput} 
                    onChange={e => setReqInput(e.target.value)} 
                    placeholder="e.g. 3+ years commercial brokerage experience" 
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddRequirement(); } }}
                  />
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={handleAddRequirement}>Add</button>
                </div>
                {form.requirements.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                    {form.requirements.map((req, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#12141c', padding: '6px 10px', borderRadius: 4, fontSize: '0.8rem', color: '#ddd' }}>
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
                    value={respInput}
                    onChange={e => setRespInput(e.target.value)}
                    placeholder="e.g. Manage the leasing pipeline end to end"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddResponsibility(); } }}
                  />
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={handleAddResponsibility}>Add</button>
                </div>
                {form.responsibilities.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                    {form.responsibilities.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#12141c', padding: '6px 10px', borderRadius: 4, fontSize: '0.8rem', color: '#ddd' }}>
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
                  <select value={form.enterprise_slug} onChange={e => setForm({ ...form, enterprise_slug: e.target.value })}>
                    {ENTERPRISES.map(ent => (
                      <option key={ent.slug} value={ent.slug}>{ent.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Salary (optional)</label>
                  <input
                    type="text"
                    value={form.salary}
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
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active (Accepting applications)</option>
                    <option value="closed">Closed (Archived)</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label>Sort Order</label>
                  <input 
                    type="number" 
                    value={form.sort_order} 
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
