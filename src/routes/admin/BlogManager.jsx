import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/admin/Toast';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import DataTable from '@/components/admin/DataTable';
import StatusPill from '@/components/admin/StatusPill';
import { ENTERPRISE_TABS, ENTERPRISES } from '@/data/enterprises';

const CATEGORIES = [
  'CORPORATE',
  'REAL ESTATE',
  'CONSTRUCTION',
  'BUSINESS HUB',
  'LEADERSHIP',
  'LOGISTICS',
  'MARKET UPDATE',
];

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Draft' },
];

const ENTERPRISE_NAMES = Object.fromEntries(ENTERPRISE_TABS.map(e => [e.slug, e.name]));

const EMPTY_FORM = {
  title: '',
  slug: '',
  category: 'CORPORATE',
  enterprise_slug: 'corporate',
  excerpt: '',
  content: '',
  cover_image_url: '',
  read_time: '',
  is_featured: false,
  published_at: '',
  status: 'draft',
};

function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** SQL DATETIME ("2026-06-28 09:00:00") -> <input type="datetime-local"> value. */
function toDatetimeLocal(value) {
  if (!value) return '';
  const d = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return '';
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Strip scripts/event-handlers/javascript: URLs for safe live preview. */
function sanitizeHtml(html) {
  let out = String(html || '');
  out = out.replace(/<script[\s\S]*?<\/script\s*>/gi, '');
  out = out.replace(/<style[\s\S]*?<\/style\s*>/gi, '');
  out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  out = out.replace(/(href|src)\s*=\s*("|\')\s*javascript:[^"']*("|\')/gi, '$1="#"');
  return out;
}

function wrapSelection(textarea, before, after, placeholder) {
  if (!textarea) return null;
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  const sel = value.slice(s, e) || placeholder;
  return { next: value.slice(0, s) + before + sel + after + value.slice(e), caret: [s + before.length, s + before.length + sel.length] };
}

export default function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [enterpriseFilter, setEnterpriseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const contentRef = useRef(null);

  const toast = useToast();
  const { can } = useAuth();

  const applyWrap = (before, after, placeholder) => {
    const ta = contentRef.current;
    const r = wrapSelection(ta, before, after, placeholder);
    if (!r) return;
    setForm(prev => ({ ...prev, content: r.next }));
    requestAnimationFrame(() => { if (ta) { ta.focus(); ta.setSelectionRange(r.caret[0], r.caret[1]); } });
  };

  const applyLink = () => {
    const ta = contentRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.slice(s, e) || 'link text';
    const next = `${value.slice(0, s)}<a href="https://">${sel}</a>${value.slice(e)}`;
    setForm(prev => ({ ...prev, content: next }));
  };

  const handleCoverFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Invalid format. Allowed: JPG, PNG, WebP');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Max 5MB');
      e.target.value = '';
      return;
    }
    const fd = new FormData();
    fd.append('image', file);
    setUploadingCover(true);
    setUploadPct(0);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/blogs.php?action=upload_image', true);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setUploadPct(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data?.success && (data.url || data.image_url)) {
          setForm(prev => ({ ...prev, cover_image_url: data.url || data.image_url }));
          toast.success('Cover image uploaded');
        } else {
          toast.error(data?.error || `Upload failed (HTTP ${xhr.status})`);
        }
      } catch {
        toast.error('Upload failed: bad server response');
      }
      setUploadingCover(false);
      e.target.value = '';
    };
    xhr.onerror = () => {
      toast.error('Network error while uploading image');
      setUploadingCover(false);
      e.target.value = '';
    };
    xhr.send(fd);
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/blogs.php', { credentials: 'include' });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        const message = data?.error || `Request failed with HTTP ${res.status}`;
        setLoadError(message);
        setBlogs([]);
        toast.error(message);
        return;
      }

      setBlogs(Array.isArray(data.data) ? data.data : []);
      setLoadError(null);
    } catch (err) {
      const message = err?.message || 'Network error loading articles';
      setLoadError(message);
      setBlogs([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setEditingPost(null);
    setFormError(null);
    setForm({
      ...EMPTY_FORM,
      enterprise_slug: enterpriseFilter === 'all' ? 'corporate' : enterpriseFilter,
    });
    setModalOpen(true);
  };

  const openEdit = (post) => {
    setEditingPost(post);
    setFormError(null);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      category: post.category || 'CORPORATE',
      enterprise_slug: post.enterprise_slug || 'corporate',
      excerpt: post.excerpt || '',
      content: post.content || '',
      cover_image_url: post.cover_image_url || '',
      read_time: post.read_time || '',
      is_featured: Number(post.is_featured) === 1,
      published_at: toDatetimeLocal(post.published_at),
      status: post.status || 'draft',
    });
    setModalOpen(true);
  };

  const handleTitleChange = (value) => {
    setForm(prev => ({
      ...prev,
      title: value,
      // Only auto-derive the slug while creating; never clobber a live URL.
      slug: editingPost ? prev.slug : slugify(value),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const res = await fetch('/api/admin/blogs.php', {
        method: editingPost ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingPost ? { ...form, id: editingPost.id } : form),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        const message = data?.error || `Save failed with HTTP ${res.status}`;
        setFormError(message);
        toast.error(message);
        return;
      }

      toast.success(editingPost ? 'Article updated' : 'Article created');
      setModalOpen(false);
      fetchBlogs();
    } catch (err) {
      const message = err?.message || 'Network error saving article';
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blogs.php?id=${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        toast.error(data?.error || `Delete failed with HTTP ${res.status}`);
        return;
      }

      toast.success('Article deleted');
      setDeleteTarget(null);
      fetchBlogs();
    } catch (err) {
      toast.error(err?.message || 'Network error deleting article');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (post) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch('/api/admin/blogs.php', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: post.id, status: nextStatus }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        toast.error(data?.error || 'Status update failed');
        return;
      }

      toast.success(nextStatus === 'published' ? 'Article published' : 'Article moved to draft');
      fetchBlogs();
    } catch (err) {
      toast.error(err?.message || 'Status update failed');
    }
  };

  const filteredBlogs = useMemo(() => blogs.filter(post => {
    const matchesEnterprise = enterpriseFilter === 'all' || post.enterprise_slug === enterpriseFilter;
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesEnterprise && matchesStatus;
  }), [blogs, enterpriseFilter, statusFilter]);

  const columns = useMemo(() => [
    {
      key: 'title',
      header: 'Title & Slug',
      render: (row) => (
        <>
          <strong style={{ color: '#fff', display: 'block' }}>{row.title}</strong>
          <code style={{ color: '#666', fontSize: '0.75rem' }}>/{row.slug}</code>
        </>
      ),
    },
    {
      key: 'enterprise_slug',
      header: 'Enterprise',
      render: (row) => (
        <span className="admin-badge" style={{ color: '#7dd3fc' }}>
          {ENTERPRISE_NAMES[row.enterprise_slug] || row.enterprise_slug || '—'}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => <span className="admin-badge" style={{ color: '#c5a059' }}>{row.category}</span>,
    },
    {
      key: 'published_at',
      header: 'Published',
      render: (row) => <span style={{ color: '#aaa', fontSize: '0.85rem' }}>{formatDate(row.published_at)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleTogglePublish(row)}
          title={`Click to ${row.status === 'published' ? 'unpublish' : 'publish'}`}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <StatusPill status={row.status} />
        </button>
      ),
    },
    {
      key: 'is_featured',
      header: 'Featured',
      render: (row) => (Number(row.is_featured) === 1
        ? <i className="fa-solid fa-star" style={{ color: '#c5a059' }} title="Featured article" />
        : <span style={{ color: '#444' }}>—</span>),
    },
  ], []);

  const formCategories = useMemo(() => {
    const current = form.category;
    return current && !CATEGORIES.includes(current) ? [current, ...CATEGORIES] : CATEGORIES;
  }, [form.category]);

  return (
    <div className="admin-page">
      <Helmet><title>Blog Manager | Admin</title></Helmet>

      <div className="admin-header">
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Blog Manager</h1>
          <p style={{ color: '#888', margin: '4px 0 0', fontSize: '0.85rem' }}>
            Write, edit, and publish articles for every APG enterprise from one place
          </p>
        </div>
        {can('blogs') && (
          <button className="admin-btn admin-btn-primary" onClick={openAdd}>
            <i className="fa-solid fa-plus" /> New Article
          </button>
        )}
      </div>

      {loadError && (
        <div className="admin-alert admin-alert-error" role="alert" style={{ marginBottom: 16 }}>
          <i className="fa-solid fa-triangle-exclamation" /> {loadError}
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={fetchBlogs} style={{ marginLeft: 12 }}>
            Retry
          </button>
        </div>
      )}

      {/* Enterprise tabs — same pattern as ApplicantsManager */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
        {ENTERPRISE_TABS.map(ent => {
          const isActive = enterpriseFilter === ent.slug;
          const count = ent.slug === 'all'
            ? blogs.length
            : blogs.filter(b => b.enterprise_slug === ent.slug).length;

          return (
            <button
              key={ent.slug}
              onClick={() => setEnterpriseFilter(ent.slug)}
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

      <DataTable
        columns={columns}
        rows={filteredBlogs}
        loading={loading}
        search={searchTerm}
        onSearch={setSearchTerm}
        pageSize={25}
        sortKey="published_at"
        sortDir="desc"
        emptyIcon="fa-newspaper"
        emptyTitle="No articles found"
        emptySubtitle={
          enterpriseFilter === 'all'
            ? 'Create the first article to get started.'
            : `No articles for ${ENTERPRISE_NAMES[enterpriseFilter] || enterpriseFilter} yet. Corporate articles are used as a fallback on the public site.`
        }
        emptyAction={can('blogs') ? <button className="admin-btn admin-btn-primary" onClick={openAdd}>New Article</button> : null}
        filterComponent={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {STATUS_FILTERS.map(s => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                style={{
                  background: statusFilter === s.id ? '#c5a059' : '#141620',
                  color: statusFilter === s.id ? '#000' : '#aaa',
                  border: '1px solid',
                  borderColor: statusFilter === s.id ? '#c5a059' : '#232738',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        }
        actions={(row) => {
          const list = [{ icon: 'fa-pen', label: 'Edit', onClick: () => openEdit(row) }];
          if (can('delete')) {
            list.push({ icon: 'fa-trash', label: 'Delete', color: '#ef4444', onClick: () => setDeleteTarget(row) });
          }
          return list;
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Blog Article"
        message={`Are you sure you want to delete "${deleteTarget?.title || 'this article'}"? This permanently removes it from the database and from every public page.`}
        confirmLabel="Delete Article"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="admin-modal-header">
              <h2>{editingPost ? 'Edit Article' : 'Create Article'}</h2>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {formError && (
                <div className="admin-alert admin-alert-error" role="alert">
                  <i className="fa-solid fa-triangle-exclamation" /> {formError}
                </div>
              )}

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
                  <label>Enterprise</label>
                  <select
                    value={form.enterprise_slug}
                    onChange={e => setForm({ ...form, enterprise_slug: e.target.value })}
                  >
                    {ENTERPRISES.map(ent => (
                      <option key={ent.slug} value={ent.slug}>{ent.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {formCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
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
                  <label>Read Time (optional)</label>
                  <input
                    type="text"
                    value={form.read_time}
                    onChange={e => setForm({ ...form, read_time: e.target.value })}
                    placeholder="e.g. 6 min read"
                  />
                </div>
              </div>

              <div className="admin-field">
                <label>Cover Image URL</label>
                <input
                  type="text"
                  value={form.cover_image_url}
                  onChange={e => setForm({ ...form, cover_image_url: e.target.value })}
                  placeholder="/uploads/blogs/... or https://..."
                />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                  <label className="admin-btn admin-btn-ghost admin-btn-sm" style={{ cursor: 'pointer' }}>
                    <i className="fa-solid fa-upload" style={{ marginRight: 6 }} />
                    {uploadingCover ? `Uploading... ${uploadPct}%` : 'Upload image file'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleCoverFile} disabled={uploadingCover} />
                  </label>
                  {uploadingCover && <span style={{ color: '#888', fontSize: '0.8rem' }}>{uploadPct}%</span>}
                </div>
                {form.cover_image_url ? (
                  <img
                    src={form.cover_image_url}
                    alt="Cover preview"
                    style={{ marginTop: 8, maxWidth: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 6, border: '1px solid #232738' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : null}
              </div>

              <div className="admin-field">
                <label>Summary / Excerpt</label>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={e => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Brief 1-2 sentence preview shown on cards..."
                />
              </div>

              <div className="admin-field">
                <label>Full Content</label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => applyWrap('<strong>', '</strong>', 'bold text')}><strong>B</strong></button>
                  <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => applyWrap('<em>', '</em>', 'italic text')}><em>I</em></button>
                  <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => applyWrap('<ul>\n  <li>', '</li>\n</ul>', 'list item')}>• List</button>
                  <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => applyWrap('<ol>\n  <li>', '</li>\n</ol>', 'list item')}>1. List</button>
                  <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={applyLink}>Link</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <textarea
                    ref={contentRef}
                    rows={8}
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                    placeholder="Write the full article body... (HTML allowed)"
                    required
                  />
                  <div style={{ border: '1px solid #232738', borderRadius: 6, padding: 10, minHeight: 120, maxHeight: 260, overflowY: 'auto', background: '#0d0f16' }}>
                    <div style={{ color: '#666', fontSize: '0.7rem', marginBottom: 6 }}>LIVE PREVIEW</div>
                    <div style={{ color: '#ddd', fontSize: '0.85rem' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(form.content) }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="admin-field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="draft">Draft (private)</option>
                    <option value="published">Published (live)</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label>Publish Date</label>
                  <input
                    type="datetime-local"
                    value={form.published_at}
                    disabled={form.status !== 'published'}
                    onChange={e => setForm({ ...form, published_at: e.target.value })}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#aaa', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                />
                Feature this article (shown as the hero card on the enterprise page)
              </label>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
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
