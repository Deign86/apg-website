import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/admin/Toast';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import PageHeader from '@/components/admin/PageHeader';
import SegmentedControl from '@/components/admin/SegmentedControl';
import EnterpriseSelect from '@/components/admin/EnterpriseSelect';
import DataTable from '@/components/admin/DataTable';
import StatusPill from '@/components/admin/StatusPill';
import { ENTERPRISE_TABS, ENTERPRISES } from '@/data/enterprises';
import { Newspaper, Pen, Plus, Star, TriangleAlert, Trash2, Upload } from 'lucide-react';

const inputCls = 'rounded-xl border-neutral-800 bg-black/80 focus:border-[#D4AF37]';

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

/**
 * Mirrors the public article renderer (src/components/redesign/BlogDetailModal.tsx):
 * blank line = new paragraph, "# " / "## " / "### " = heading, **text** = bold.
 * Article bodies are plain text there, so HTML tags would show up literally.
 */
function renderArticlePreview(content) {
  const blocks = [];
  let paragraph = [];
  const bold = (text) => text.split(/(\*\*.*?\*\*)/g).map((part, i) => (
    part.length > 4 && part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  ));
  const flush = () => {
    const text = paragraph.join(' ').trim();
    if (text) blocks.push(<p key={`p${blocks.length}`} style={{ margin: '0 0 8px' }}>{bold(text)}</p>);
    paragraph = [];
  };
  String(content || '').split('\n').forEach((raw) => {
    const line = raw.trim();
    const heading = line.match(/^#{1,3} (.*)$/);
    if (!line) {
      flush();
    } else if (heading) {
      flush();
      blocks.push(<strong key={`h${blocks.length}`} style={{ display: 'block', color: 'var(--admin-gold-soft)', textTransform: 'uppercase', margin: '4px 0 6px' }}>{heading[1]}</strong>);
    } else {
      paragraph.push(line);
    }
  });
  flush();
  return blocks;
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
  const [contentLoaded, setContentLoaded] = useState(true);
  const editRequestRef = useRef(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const contentRef = useRef(null);

  const toast = useToast();
  const { can } = useAuth();
  const canWrite = can('blogs');

  const applyWrap = (before, after, placeholder) => {
    const ta = contentRef.current;
    const r = wrapSelection(ta, before, after, placeholder);
    if (!r) return;
    setForm(prev => ({ ...prev, content: r.next }));
    requestAnimationFrame(() => { if (ta) { ta.focus(); ta.setSelectionRange(r.caret[0], r.caret[1]); } });
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
    setContentLoaded(true);
    editRequestRef.current = null;
    setForm({
      ...EMPTY_FORM,
      enterprise_slug: enterpriseFilter === 'all' ? 'corporate' : enterpriseFilter,
    });
    setModalOpen(true);
  };

  // The list has no article bodies: the editor opens at once and fills the body from ?id=. Saving
  // stays off until then, because a PUT sends the whole form.
  const openEdit = async (post) => {
    setEditingPost(post);
    setFormError(null);
    setContentLoaded(false);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      category: post.category || 'CORPORATE',
      enterprise_slug: post.enterprise_slug || 'corporate',
      excerpt: post.excerpt || '',
      content: '',
      cover_image_url: post.cover_image_url || '',
      read_time: post.read_time || '',
      is_featured: Number(post.is_featured) === 1,
      published_at: toDatetimeLocal(post.published_at),
      status: post.status || 'draft',
    });
    setModalOpen(true);
    editRequestRef.current = post.id;
    try {
      const res = await fetch(`/api/admin/blogs.php?id=${post.id}`, { credentials: 'include' });
      const data = await res.json().catch(() => null);
      if (editRequestRef.current !== post.id) return; // another article was opened since
      if (!res.ok || !data?.success) throw new Error(data?.error || `Request failed with HTTP ${res.status}`);
      setForm(prev => ({ ...prev, content: data.data.content || '' }));
      setContentLoaded(true);
    } catch (err) {
      if (editRequestRef.current !== post.id) return;
      setFormError(`Could not load the article body: ${err?.message || 'network error'}`);
    }
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
    if (!contentLoaded) return; // a PUT replaces the body: never send it before it has loaded
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
          <span className="admin-cell-title" style={{ display: 'block' }}>{row.title}</span>
          <code className="admin-cell-slug">/{row.slug}</code>
        </>
      ),
    },
    {
      key: 'enterprise_slug',
      header: 'Enterprise',
      render: (row) => (
        <span className="admin-cell-muted">
          {ENTERPRISE_NAMES[row.enterprise_slug] || row.enterprise_slug || '—'}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => <span className="admin-badge">{row.category}</span>,
    },
    {
      key: 'published_at',
      header: 'Published',
      render: (row) => <span className="admin-cell-muted" style={{ whiteSpace: 'nowrap' }}>{formatDate(row.published_at)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleTogglePublish(row)}
          disabled={!canWrite}
          title={canWrite ? `Click to ${row.status === 'published' ? 'unpublish' : 'publish'}` : undefined}
          className="admin-pill-wrap-btn"
        >
          <StatusPill status={row.status} />
        </button>
      ),
    },
    {
      key: 'is_featured',
      header: 'Featured',
      render: (row) => (Number(row.is_featured) === 1
        ? <Star className="size-4 text-[#E2B857]" aria-label="Featured article" />
        : <span style={{ color: 'var(--admin-text-3)' }}>—</span>),
    },
  ], [canWrite]);

  const formCategories = useMemo(() => {
    const current = form.category;
    return current && !CATEGORIES.includes(current) ? [current, ...CATEGORIES] : CATEGORIES;
  }, [form.category]);

  return (
    <div className="admin-page">
      <Helmet><title>Blog Manager | Admin</title></Helmet>

      <PageHeader
        eyebrow="Website"
        title="Blog Manager"
        description="Write, edit, and publish articles for every APG enterprise from one place."
        actions={can('blogs') && (
          <button className="admin-btn admin-btn-primary" onClick={openAdd}>
            <Plus className="size-4" aria-hidden="true" /> New article
          </button>
        )}
      />

      {loadError && (
        <div className="admin-alert admin-alert-error" role="alert" style={{ marginBottom: 16 }}>
          <TriangleAlert className="size-4" aria-hidden="true" /> {loadError}
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={fetchBlogs} style={{ marginLeft: 12 }}>
            Retry
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={filteredBlogs}
        loading={loading}
        search={searchTerm}
        onSearch={setSearchTerm}
        pageSize={25}
        sortKey="published_at"
        sortDir="desc"
        emptyIcon={Newspaper}
        emptyTitle="No articles found"
        emptySubtitle={
          enterpriseFilter === 'all'
            ? 'Create the first article to get started.'
            : `No articles for ${ENTERPRISE_NAMES[enterpriseFilter] || enterpriseFilter} yet.`
        }
        emptyAction={can('blogs') ? <button className="admin-btn admin-btn-primary" onClick={openAdd}>New article</button> : null}
        filterComponent={
          <>
            <EnterpriseSelect
              value={enterpriseFilter}
              onChange={setEnterpriseFilter}
              countFor={slug => slug === 'all' ? blogs.length : blogs.filter(b => b.enterprise_slug === slug).length}
            />
            <SegmentedControl
              label="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_FILTERS.map(f => ({ value: f.id, label: f.label }))}
            />
          </>
        }
        actions={(row) => {
          const list = can('blogs') ? [{ Icon: Pen, label: 'Edit', onClick: () => openEdit(row) }] : [];
          if (can('delete')) {
            list.push({ Icon: Trash2, label: 'Delete', danger: true, onClick: () => setDeleteTarget(row) });
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
        <div className="admin-modal-overlay fixed inset-0 z-50 bg-black/90 backdrop-blur-md" onClick={() => setModalOpen(false)}>
          <div className="admin-modal rounded-3xl border border-[#D4AF37]/50 bg-[#0B0905]" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="admin-modal-header">
              <h2 className="text-balance text-[#E2B857]">{editingPost ? 'Edit article' : 'New article'}</h2>
              <button className="admin-modal-close rounded-full border border-[#D4AF37]/30" aria-label="Close dialog" onClick={() => setModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {formError && (
                <div className="admin-alert admin-alert-error" role="alert">
                  <TriangleAlert className="size-4" aria-hidden="true" /> {formError}
                </div>
              )}

              <div className="admin-field">
                <label htmlFor="blog-article-title">Article Title</label>
                <input id="blog-article-title"
                  type="text"
                  className={inputCls} value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="e.g. Metro Manila Commercial Real Estate Outlook 2026"
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-field">
                  <label htmlFor="blog-enterprise">Enterprise</label>
                  <select id="blog-enterprise"
                    className={inputCls}
                    value={form.enterprise_slug}
                    onChange={e => setForm({ ...form, enterprise_slug: e.target.value })}
                  >
                    {ENTERPRISES.map(ent => (
                      <option key={ent.slug} value={ent.slug}>{ent.name}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="blog-category">Category</label>
                  <select id="blog-category" className={inputCls} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {formCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-field">
                  <label htmlFor="blog-url-slug">URL Slug</label>
                  <input id="blog-url-slug"
                    type="text"
                    className={inputCls} value={form.slug}
                    onChange={e => setForm({ ...form, slug: e.target.value })}
                    placeholder="e.g. metro-manila-real-estate-2026"
                    required
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="blog-read-time-optional">Read Time (optional)</label>
                  <input id="blog-read-time-optional"
                    type="text"
                    className={inputCls} value={form.read_time}
                    onChange={e => setForm({ ...form, read_time: e.target.value })}
                    placeholder="e.g. 6 min read"
                  />
                </div>
              </div>

              <div className="admin-field">
                <label htmlFor="blog-cover-image-url">Cover Image URL</label>
                <input id="blog-cover-image-url"
                  type="text"
                  className={inputCls} value={form.cover_image_url}
                  onChange={e => setForm({ ...form, cover_image_url: e.target.value })}
                  placeholder="/uploads/blogs/... or https://..."
                />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                  <label className="admin-btn admin-btn-ghost admin-btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload className="size-4" aria-hidden="true" style={{ marginRight: 6 }} />
                    {uploadingCover ? `Uploading... ${uploadPct}%` : 'Upload image file'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleCoverFile} disabled={uploadingCover} />
                  </label>
                  {uploadingCover && <span style={{ color: 'var(--admin-text-3)', fontSize: '0.8rem' }}>{uploadPct}%</span>}
                </div>
                {form.cover_image_url ? (
                  <img
                    src={form.cover_image_url}
                    alt="Cover preview"
                    style={{ marginTop: 8, maxWidth: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--admin-line)' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : null}
              </div>

              <div className="admin-field">
                <label htmlFor="blog-summary-excerpt">Summary / Excerpt</label>
                <textarea id="blog-summary-excerpt"
                  rows={2}
                  className={inputCls} value={form.excerpt}
                  onChange={e => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Brief 1-2 sentence preview shown on cards..."
                />
              </div>

              <div className="admin-field">
                <label htmlFor="blog-full-content">Full Content</label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => applyWrap('**', '**', 'bold text')} disabled={!contentLoaded}><strong>B</strong></button>
                  <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => applyWrap('\n\n## ', '\n\n', 'Section heading')} disabled={!contentLoaded}>Heading</button>
                </div>
                <div className="admin-form-row">
                  <textarea id="blog-full-content"
                    ref={contentRef}
                    rows={8}
                    className={inputCls} value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                    placeholder={contentLoaded ? 'Write the full article body. Leave a blank line between paragraphs.' : 'Loading the article…'}
                    disabled={!contentLoaded}
                    required
                  />
                  <div style={{ border: '1px solid var(--admin-line)', borderRadius: 6, padding: 10, minHeight: 120, maxHeight: 260, overflowY: 'auto', background: 'var(--admin-surface-3)' }}>
                    <div style={{ color: 'var(--admin-text-3)', fontSize: '0.7rem', marginBottom: 6 }}>LIVE PREVIEW</div>
                    <div style={{ color: 'var(--admin-text-1)', fontSize: '0.85rem', overflowWrap: 'anywhere' }}>{renderArticlePreview(form.content)}</div>
                  </div>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-field">
                  <label htmlFor="blog-status">Status</label>
                  <select id="blog-status" className={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="draft">Draft (private)</option>
                    <option value="published">Published (live)</option>
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="blog-publish-date">Publish Date</label>
                  <input id="blog-publish-date"
                    type="datetime-local"
                    className={inputCls} value={form.published_at}
                    disabled={form.status !== 'published'}
                    onChange={e => setForm({ ...form, published_at: e.target.value })}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--admin-text-2)', fontSize: '0.85rem' }}>
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
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving || !contentLoaded}>
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
