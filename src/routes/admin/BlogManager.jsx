import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

const CATEGORIES = [
  'CORPORATE',
  'REAL ESTATE',
  'CONSTRUCTION',
  'BUSINESS HUB',
  'LEADERSHIP',
  'LOGISTICS',
  'MARKET UPDATE',
];

export default function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: 'CORPORATE',
    excerpt: '',
    content: '',
    cover_image_url: '',
    status: 'draft',
  });
  const toast = useToast();

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/blogs.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBlogs(data.data);
      } else {
        setBlogs([]);
      }
    } catch {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenAdd = () => {
    setEditingPost(null);
    setForm({
      title: '',
      slug: '',
      category: 'CORPORATE',
      excerpt: '',
      content: '',
      cover_image_url: '',
      status: 'draft',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (post) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      category: post.category || 'CORPORATE',
      excerpt: post.excerpt || '',
      content: post.content || '',
      cover_image_url: post.cover_image_url || '',
      status: post.status || 'draft',
    });
    setModalOpen(true);
  };

  const handleTitleChange = (val) => {
    setForm(prev => ({
      ...prev,
      title: val,
      slug: editingPost ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingPost ? 'PUT' : 'POST';
      const payload = editingPost ? { ...form, id: editingPost.id } : form;
      const res = await fetch('/api/admin/blogs.php', {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingPost ? 'Article updated' : 'Article published/saved');
        setModalOpen(false);
        fetchBlogs();
      } else {
        toast.error(data.error || 'Failed to save blog');
      }
    } catch {
      toast.error('Network error saving article');
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleRequestDelete = (post) => {
    setDeleteTarget(post);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blogs.php?id=${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Article deleted');
        setDeleteTarget(null);
        fetchBlogs();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (post) => {
    try {
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      const res = await fetch('/api/admin/blogs.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...post, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Article ${newStatus === 'published' ? 'Published' : 'moved to Draft'}`);
        fetchBlogs();
      }
    } catch {
      toast.error('Status update failed');
    }
  };

  const filteredBlogs = blogs.filter(b => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch = !searchTerm || b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.category && b.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="admin-page">
      <Helmet><title>Blog Manager | Admin</title></Helmet>

      <div className="admin-header">
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Blog Manager</h1>
          <p style={{ color: '#888', margin: '4px 0 0', fontSize: '0.85rem' }}>Write, edit, and publish press releases and newsroom articles</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleOpenAdd}>
          <i className="fa-solid fa-plus" /> New Blog Article
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'published', 'draft'].map(s => (
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
          placeholder="Search articles..." 
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
            <p>Loading articles...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
            <i className="fa-solid fa-newspaper" style={{ fontSize: 36, color: '#444', marginBottom: 12 }} />
            <p>No blog articles found.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Title & Slug</th>
                <th style={{ width: '15%' }}>Category</th>
                <th style={{ width: '15%' }}>Published Date</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map(b => (
                <tr key={b.id}>
                  <td>
                    <strong style={{ color: '#fff', display: 'block' }}>{b.title}</strong>
                    <code style={{ color: '#666', fontSize: '0.75rem' }}>/{b.slug}</code>
                  </td>
                  <td><span className="admin-badge" style={{ color: '#c5a059' }}>{b.category}</span></td>
                  <td style={{ color: '#aaa', fontSize: '0.85rem' }}>
                    {b.published_at ? new Date(b.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleTogglePublish(b)}
                      style={{
                        background: b.status === 'published' ? '#064e3b' : '#374151',
                        color: b.status === 'published' ? '#34d399' : '#9ca3af',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {b.status}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="admin-icon-btn" title="Edit" onClick={() => handleOpenEdit(b)}>
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button className="admin-icon-btn admin-icon-btn-danger" title="Delete" onClick={() => handleRequestDelete(b)}>
                      <i className="fa-solid fa-trash" />
                    </button>
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
        title="Delete Blog Article"
        message={`Are you sure you want to delete "${deleteTarget?.title || 'this article'}"? This action will permanently remove it from the database and newsroom.`}
        confirmLabel="Delete Article"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
            <div className="admin-modal-header">
              <h2>{editingPost ? 'Edit Blog Article' : 'Create Blog Article'}</h2>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="admin-field">
                <label>Article Title</label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={e => handleTitleChange(e.target.value)} 
                  placeholder="e.g. Metro Manila Commercial Real Estate Outlook 2026" 
                  required 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="admin-field">
                  <label>URL Slug</label>
                  <input 
                    type="text" 
                    value={form.slug} 
                    onChange={e => setForm({ ...form, slug: e.target.value })} 
                    placeholder="e.g. metro-manila-real-estate-2026" 
                    required 
                  />
                </div>
                <div className="admin-field">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-field">
                <label>Cover Image URL</label>
                <input 
                  type="text" 
                  value={form.cover_image_url} 
                  onChange={e => setForm({ ...form, cover_image_url: e.target.value })} 
                  placeholder="/assets/images/placeholder.svg or https://..." 
                />
              </div>
              <div className="admin-field">
                <label>Summary / Excerpt</label>
                <textarea 
                  rows={2} 
                  value={form.excerpt} 
                  onChange={e => setForm({ ...form, excerpt: e.target.value })} 
                  placeholder="Brief 1-2 sentence preview of the article..." 
                />
              </div>
              <div className="admin-field">
                <label>Full Content (Markdown or HTML supported)</label>
                <textarea 
                  rows={8} 
                  value={form.content} 
                  onChange={e => setForm({ ...form, content: e.target.value })} 
                  placeholder="Write the full article body..." 
                  required 
                />
              </div>
              <div className="admin-field">
                <label>Publish Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="draft">Draft (Private / Work in progress)</option>
                  <option value="published">Published (Visible on Newsroom)</option>
                </select>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
