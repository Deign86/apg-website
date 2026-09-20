import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/admin/Toast';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { Plus, Upload, FileX2, Pen, Trash2 } from 'lucide-react';

const inputCls = 'rounded-xl border-neutral-800 bg-black/80 focus:border-[#D4AF37]';

const PAGES = [
  { slug: 'home', name: 'Home Page' },
  { slug: 'virtual-office', name: 'Virtual Office' },
  { slug: 'realty', name: 'Alpha Realty' },
  { slug: 'construction', name: 'Alpha Construction' },
  { slug: 'swiftclear', name: 'Swift Clear' },
  { slug: 'altaventure', name: 'Alta Venture' },
  { slug: '88prime', name: '88 Prime' },
  { slug: 'dynamic-tree', name: 'Dynamic Tree' },
  { slug: 'luxe-prime', name: 'Luxe Prime' },
];

export default function ContentEditor() {
  const [selectedPage, setSelectedPage] = useState('home');
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBlock, setEditingBlock] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ page_slug: 'home', section_key: '', type: 'text', value: '', sort_order: 0 });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const valueRef = useRef(null);
  const toast = useToast();
  const { can } = useAuth();

  function sanitizeHtml(html) {
    let out = String(html || '');
    out = out.replace(/<script[\s\S]*?<\/script\s*>/gi, '');
    out = out.replace(/<style[\s\S]*?<\/style\s*>/gi, '');
    out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    out = out.replace(/(href|src)\s*=\s*("|\')\s*javascript:[^"']*("|\')/gi, '$1="#"');
    return out;
  }

  const applyWrap = (before, after, placeholder) => {
    const ta = valueRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.slice(s, e) || placeholder;
    setForm(prev => ({ ...prev, value: value.slice(0, s) + before + sel + after + value.slice(e) }));
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + before.length, s + before.length + sel.length); });
  };

  const applyLink = () => {
    const ta = valueRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.slice(s, e) || 'link text';
    setForm(prev => ({ ...prev, value: `${value.slice(0, s)}<a href="https://">${sel}</a>${value.slice(e)}` }));
  };

  const handleImageFile = (e) => {
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
    setUploading(true);
    setUploadPct(0);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/content.php?action=upload_image', true);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setUploadPct(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data?.success && (data.url || data.image_url)) {
          setForm(prev => ({ ...prev, value: data.url || data.image_url }));
          toast.success('Image uploaded');
        } else {
          toast.error(data?.error || `Upload failed (HTTP ${xhr.status})`);
        }
      } catch {
        toast.error('Upload failed: bad server response');
      }
      setUploading(false);
      e.target.value = '';
    };
    xhr.onerror = () => {
      toast.error('Network error while uploading image');
      setUploading(false);
      e.target.value = '';
    };
    xhr.send(fd);
  };

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/content.php?page=${selectedPage}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBlocks(data.data);
      } else {
        setBlocks([]);
      }
    } catch {
      toast.error('Failed to load content blocks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, [selectedPage]);

  const handleOpenAdd = () => {
    setEditingBlock(null);
    setForm({ page_slug: selectedPage, section_key: '', type: 'text', value: '', sort_order: blocks.length + 1 });
    setModalOpen(true);
  };

  const handleOpenEdit = (block) => {
    setEditingBlock(block);
    setForm({ page_slug: block.page_slug, section_key: block.section_key, type: block.type, value: block.value, sort_order: block.sort_order });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingBlock ? 'Content block updated' : 'Content block added');
        setModalOpen(false);
        fetchBlocks();
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch {
      toast.error('Network error saving block');
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleRequestDelete = (block) => {
    setDeleteTarget(block);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/content.php?id=${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Block deleted');
        setDeleteTarget(null);
        fetchBlocks();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Error deleting block');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-page">
      <Helmet><title>Content Editor | Admin</title></Helmet>

      <div className="admin-header">
        <div>
          <h1 className="text-balance text-2xl font-bold text-white">Content Editor</h1>
          <p className="mt-1 text-pretty text-sm text-neutral-400">Edit static headlines, blurbs, and custom text blocks per page</p>
        </div>
        {can('content') && (
          <button className="admin-btn admin-btn-primary rounded-full bg-[#D4AF37] uppercase tracking-widest" onClick={handleOpenAdd}>
            <Plus className="size-4" aria-hidden="true" /> Add Content Block
          </button>
        )}
      </div>

      {/* Page Selector Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-full border border-[#D4AF37]/30 bg-[#161109]/90 p-1.5">
        {PAGES.map(p => {
          const isActive = selectedPage === p.slug;
          return (
            <button
              key={p.slug}
              onClick={() => setSelectedPage(p.slug)}
              className={`rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-widest transition-colors duration-200 ${isActive ? 'bg-[#D4AF37] text-black' : 'text-neutral-400 hover:text-[#E2B857]'}`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Blocks List */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
            <div className="admin-spinner" style={{ margin: '0 auto 12px' }} />
            <p>Loading blocks for {selectedPage}...</p>
          </div>
        ) : blocks.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
            <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/15 text-[#E2B857]">
              <FileX2 className="size-5" aria-hidden="true" />
            </span>
            <p className="text-pretty">No custom content blocks defined for <strong className="tabular-nums">{selectedPage}</strong> yet.</p>
            <p className="text-pretty" style={{ fontSize: '0.8rem', color: '#666' }}>The site is currently rendering with hardcoded default copy. Click "Add Content Block" to override.</p>
            {can('content') && (
              <button className="admin-btn admin-btn-primary rounded-full bg-[#D4AF37] uppercase tracking-widest" style={{ marginTop: 12 }} onClick={handleOpenAdd}>
                <Plus className="size-4" aria-hidden="true" /> Add Content Block
              </button>
            )}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Section Key</th>
                <th style={{ width: '12%' }}>Type</th>
                <th>Content Value</th>
                <th style={{ width: '10%' }}>Sort</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map(b => (
                <tr key={b.id}>
                  <td><code className="rounded-xl border border-[#D4AF37]/30 bg-black/80 px-1.5 py-0.5 text-[#E2B857]">{b.section_key}</code></td>
                  <td><span className="admin-badge tabular-nums">{b.type}</span></td>
                  <td style={{ maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#ddd' }}>
                    {b.value}
                  </td>
                  <td className="tabular-nums">{b.sort_order}</td>
                  <td style={{ textAlign: 'right' }}>
                    {can('content') && (
                      <button className="admin-icon-btn" title="Edit" aria-label={`Edit ${b.section_key}`} onClick={() => handleOpenEdit(b)}>
                        <Pen className="size-4" aria-hidden="true" />
                      </button>
                    )}
                    {can('delete') && (
                      <button className="admin-icon-btn admin-icon-btn-danger" title="Delete" aria-label={`Delete ${b.section_key}`} onClick={() => handleRequestDelete(b)}>
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
        title="Delete Content Block"
        message={`Are you sure you want to delete the content block "${deleteTarget?.section_key || 'this block'}"? This action will permanently remove it from the page configuration.`}
        confirmLabel="Delete Block"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 550 }}>
            <div className="admin-modal-header">
              <h2>{editingBlock ? 'Edit Content Block' : 'Add Content Block'}</h2>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="admin-field">
                <label>Page Slug</label>
                <select className={inputCls} value={form.page_slug} onChange={e => setForm({ ...form, page_slug: e.target.value })}>
                  {PAGES.map(p => <option key={p.slug} value={p.slug}>{p.name} ({p.slug})</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label>Section Key (unique identifier on page)</label>
                <input
                  type="text"
                  className={inputCls}
                  value={form.section_key}
                  onChange={e => setForm({ ...form, section_key: e.target.value })}
                  placeholder="e.g. hero_heading, about_tagline"
                  required
                />
              </div>
              <div className="admin-field">
                <label>Content Type</label>
                <select className={inputCls} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="text">Plain Text</option>
                  <option value="richtext">Rich Text / Multiline</option>
                  <option value="card">Card Data / JSON</option>
                  <option value="image">Image URL</option>
                </select>
              </div>
              <div className="admin-field">
                <label>Content Value</label>
                {form.type === 'image' ? (
                  <>
                    <input
                      type="text"
                      className={inputCls}
                      value={form.value}
                      onChange={e => setForm({ ...form, value: e.target.value })}
                      placeholder="/uploads/content/... or https://..."
                    />
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                      <label className="admin-btn admin-btn-ghost admin-btn-sm" style={{ cursor: 'pointer' }}>
                        <Upload className="mr-1.5 inline size-3.5" aria-hidden="true" />
                        {uploading ? `Uploading... ${uploadPct}%` : 'Upload image file'}
                        <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleImageFile} disabled={uploading} />
                      </label>
                      {uploading && <span style={{ color: '#888', fontSize: '0.8rem' }}>{uploadPct}%</span>}
                    </div>
                    {form.value ? (
                      <img
                        src={form.value}
                        alt="Preview"
                        className="rounded-xl border border-[#D4AF37]/30" style={{ marginTop: 8, maxWidth: '100%', maxHeight: 160, objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : null}
                  </>
                ) : form.type === 'richtext' ? (
                  <>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                      <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => applyWrap('<strong>', '</strong>', 'bold text')}><strong>B</strong></button>
                      <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => applyWrap('<em>', '</em>', 'italic text')}><em>I</em></button>
                      <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => applyWrap('<ul>\n  <li>', '</li>\n</ul>', 'list item')}>• List</button>
                      <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => applyWrap('<ol>\n  <li>', '</li>\n</ol>', 'list item')}>1. List</button>
                      <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={applyLink}>Link</button>
                    </div>
                    <textarea
                      ref={valueRef}
                      rows={5}
                      className={inputCls}
                      value={form.value}
                      onChange={e => setForm({ ...form, value: e.target.value })}
                      placeholder="Enter rich text (HTML allowed)..."
                      required
                    />
                    <div className="rounded-xl border-neutral-800 bg-black/80" style={{ borderWidth: 1, padding: 10, marginTop: 8, minHeight: 60, maxHeight: 200, overflowY: 'auto' }}>
                      <div style={{ color: '#666', fontSize: '0.7rem', marginBottom: 6 }}>LIVE PREVIEW</div>
                      <div style={{ color: '#ddd', fontSize: '0.85rem' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(form.value) }} />
                    </div>
                  </>
                ) : (
                  <textarea
                    ref={valueRef}
                    rows={5}
                    className={inputCls}
                    value={form.value}
                    onChange={e => setForm({ ...form, value: e.target.value })}
                    placeholder="Enter content value or text..."
                    required
                  />
                )}
              </div>
              <div className="admin-field">
                <label>Sort Order</label>
                <input
                  type="number"
                  className={inputCls}
                  value={form.sort_order}
                  onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
