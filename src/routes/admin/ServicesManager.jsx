import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/admin/Toast';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import PageHeader from '@/components/admin/PageHeader';
import EnterpriseSelect from '@/components/admin/EnterpriseSelect';
import { ENTERPRISE_TABS, ENTERPRISES } from '@/data/enterprises';
import { Plus, PackageOpen, Pen, Trash2, Upload, ArrowUp, ArrowDown, X } from 'lucide-react';

const inputCls = 'rounded-xl border-neutral-800 bg-black/80 focus:border-[#D4AF37]';

// Mirrors the service_items.kind enum (api/admin/services.php SERVICE_KINDS).
const KINDS = [
  { id: 'service', label: 'Service card', help: 'A service the company offers (title, description, feature bullets, optional price).' },
  { id: 'product', label: 'Catalog product', help: 'Catalog item, e.g. 88 Prime: Tag = category line, Summary = badge, Description = specs.' },
  { id: 'package', label: 'Priced package', help: 'Priced plan, e.g. Virtual Office: shown with its price on the plan pages and in the chat assistant.' },
];
const KIND_LABEL = Object.fromEntries(KINDS.map(k => [k.id, k.label]));

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const EMPTY_FORM = {
  category: 'virtual-office',
  kind: 'service',
  title: '',
  summary: '',
  tag: '',
  description: '',
  price: '',
  image_url: '',
  featuresText: '',
  photos: [],
  sort_order: 0,
  is_published: 1,
};

/** Uploads one image to /api/admin/services.php and resolves its public URL. */
async function uploadServiceImage(file) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error(`${file.name}: allowed formats are JPG, PNG, WebP`);
  if (file.size > MAX_IMAGE_BYTES) throw new Error(`${file.name}: image too large (max 5MB)`);
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch('/api/admin/services.php?action=upload_image', { method: 'POST', credentials: 'include', body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success || typeof data.url !== 'string') throw new Error(data.error || `Upload failed (HTTP ${res.status})`);
  return data.url;
}

// Service categories are the canonical enterprise slugs, so this list comes from
// the single source of truth rather than being re-declared here.
const ENTERPRISE_NAMES = Object.fromEntries(ENTERPRISE_TABS.map(e => [e.slug, e.name]));

export default function ServicesManager() {
  const [selectedCat, setSelectedCat] = useState('all');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const toast = useToast();
  const { can } = useAuth();

  const fetchServices = async () => {
    try {
      setLoading(true);
      const url = selectedCat !== 'all' ? `/api/admin/services.php?category=${selectedCat}` : '/api/admin/services.php';
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setServices(data.data);
      } else {
        setServices([]);
      }
    } catch {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedCat]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    const category = selectedCat !== 'all' ? selectedCat : 'corporate';
    setForm({
      ...EMPTY_FORM,
      category,
      kind: category === 'virtual-office' ? 'package' : 'service',
      sort_order: services.length + 1,
    });
    setPhotoUrl('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      category: item.category,
      kind: item.kind || 'service',
      title: item.title,
      summary: item.summary || '',
      tag: item.tag || '',
      description: item.description || '',
      price: item.price || '',
      image_url: item.image_url || '',
      featuresText: Array.isArray(item.features) ? item.features.join('\n') : '',
      photos: Array.isArray(item.photos) ? item.photos : [],
      sort_order: item.sort_order || 0,
      is_published: item.is_published ? 1 : 0,
    });
    setPhotoUrl('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingItem ? 'PUT' : 'POST';
      // The textareas hold one entry per line; the API expects JSON arrays.
      const toList = (text) => String(text || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      const { featuresText, ...rest } = form;
      const body = {
        ...rest,
        features: toList(featuresText),
      };
      const payload = editingItem ? { ...body, id: editingItem.id } : body;
      const res = await fetch('/api/admin/services.php', {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingItem ? 'Service updated' : 'Service created');
        setModalOpen(false);
        fetchServices();
      } else {
        toast.error(data.error || 'Failed to save service');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleCoverFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading('cover');
    try {
      const url = await uploadServiceImage(file);
      setForm(prev => ({ ...prev, image_url: url }));
      toast.success('Cover image uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading('');
    }
  };

  const handlePhotoFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    setUploading('photos');
    let added = 0;
    for (const file of files) {
      try {
        const url = await uploadServiceImage(file);
        setForm(prev => ({ ...prev, photos: [...prev.photos, url] }));
        added++;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed');
      }
    }
    if (added > 0) toast.success(`${added} photo${added === 1 ? '' : 's'} uploaded`);
    setUploading('');
  };

  const addPhotoUrl = () => {
    const url = photoUrl.trim();
    if (!url) return;
    setForm(prev => ({ ...prev, photos: [...prev.photos, url] }));
    setPhotoUrl('');
  };

  const movePhoto = (index, delta) => {
    setForm(prev => {
      const photos = [...prev.photos];
      const target = index + delta;
      if (target < 0 || target >= photos.length) return prev;
      [photos[index], photos[target]] = [photos[target], photos[index]];
      return { ...prev, photos };
    });
  };

  const removePhoto = (index) => {
    setForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleRequestDelete = (item) => {
    setDeleteTarget(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/services.php?id=${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Service deleted');
        setDeleteTarget(null);
        fetchServices();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      const newStatus = item.is_published ? 0 : 1;
      const res = await fetch('/api/admin/services.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...item, is_published: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(newStatus ? 'Published' : 'Unpublished');
        fetchServices();
      } else {
        toast.error(data.error || 'Toggle failed');
      }
    } catch {
      toast.error('Toggle failed');
    }
  };

  return (
    <div className="admin-page">
      <Helmet><title>Services & Packages | Admin</title></Helmet>

      <PageHeader
        eyebrow="Website"
        title="Services & Packages"
        description="Service cards, catalog products, and priced packages (such as Virtual Office plans) for every company. Changes show on the website and in the chat assistant right away."
        actions={can('services') && (
          <button className="admin-btn admin-btn-primary" onClick={handleOpenAdd}>
            <Plus className="size-4" aria-hidden="true" /> Add service or package
          </button>
        )}
      />

      <div className="admin-toolbar">
        <EnterpriseSelect value={selectedCat} onChange={setSelectedCat} allLabel="All companies" />
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="listings-loading" role="status"><div className="admin-spinner" aria-hidden="true" /><span className="sr-only">Loading services…</span></div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title="No services here yet"
            subtitle="Add a service card, catalog product, or priced package for this company."
            action={can('services') && (
              <button className="admin-btn admin-btn-primary" onClick={handleOpenAdd}>
                <Plus className="size-4" aria-hidden="true" /> Add service or package
              </button>
            )}
          />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Service Title</th>
                <th style={{ width: '15%' }}>Category</th>
                <th style={{ width: '12%' }}>Kind</th>
                <th style={{ width: '15%' }}>Price</th>
                <th>Description</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id}>
                  <td className="admin-cell-title text-balance">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      {s.image_url ? (
                        <img src={s.image_url} alt="" width={32} height={32} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : null}
                      {s.title}
                    </span>
                  </td>
                  <td className="admin-cell-muted">{ENTERPRISE_NAMES[s.category] || s.category}</td>
                  <td><span className="admin-badge">{KIND_LABEL[s.kind] || s.kind}</span></td>
                  <td className="admin-cell-title tabular-nums" style={{ whiteSpace: 'nowrap' }}>{s.price || '—'}</td>
                  <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--admin-text-2)' }}>
                    {s.description}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(s)}
                      disabled={!can('services')}
                      className={`admin-pill admin-pill-btn ${s.is_published ? 'admin-pill-green' : 'admin-pill-grey'}`}
                      title={can('services') ? (s.is_published ? 'Unpublish' : 'Publish') : undefined}
                      aria-label={can('services') ? `${s.is_published ? 'Published' : 'Draft'}, ${s.is_published ? 'unpublish' : 'publish'} ${s.title}` : undefined}
                    >
                      {s.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {can('services') && (
                      <button className="admin-icon-btn" title="Edit" aria-label={`Edit ${s.title}`} onClick={() => handleOpenEdit(s)}>
                        <Pen className="size-4" aria-hidden="true" />
                      </button>
                    )}
                    {can('delete') && (
                      <button className="admin-icon-btn admin-icon-btn-danger" title="Delete" aria-label={`Delete ${s.title}`} onClick={() => handleRequestDelete(s)}>
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
        title="Delete Service / Package"
        message={`Are you sure you want to delete "${deleteTarget?.title || 'this package'}"? This action will permanently remove it from the database and website.`}
        confirmLabel="Delete Package"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 550 }}>
            <div className="admin-modal-header">
              <h2>{editingItem ? 'Edit service or package' : 'Add service or package'}</h2>
              <button className="admin-modal-close" aria-label="Close dialog" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="admin-field">
                <label htmlFor="services-category">Category</label>
                <select id="services-category" className={inputCls} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {ENTERPRISES.map(ent => (
                    <option key={ent.slug} value={ent.slug}>{ent.name}</option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="services-kind">Kind</label>
                <select id="services-kind" className={inputCls} value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })}>
                  {KINDS.map(k => (
                    <option key={k.id} value={k.id}>{k.label}</option>
                  ))}
                </select>
                <small style={{ color: 'var(--admin-text-3)' }}>{KINDS.find(k => k.id === form.kind)?.help}</small>
              </div>
              <div className="admin-field">
                <label htmlFor="services-service-title">Service Title</label>
                <input id="services-service-title"
                  type="text"
                  className={inputCls}
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Alpha Premier"
                  required
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-field">
                  <label htmlFor="services-summary-card-teaser-optional">Summary / Card Teaser (Optional)</label>
                  <input id="services-summary-card-teaser-optional"
                    type="text"
                    className={inputCls}
                    value={form.summary}
                    onChange={e => setForm({ ...form, summary: e.target.value })}
                    placeholder="Short teaser shown on the card"
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="services-tag-optional">Tag (Optional)</label>
                  <input id="services-tag-optional"
                    type="text"
                    className={inputCls}
                    value={form.tag}
                    onChange={e => setForm({ ...form, tag: e.target.value })}
                    placeholder="e.g. FINANCE"
                  />
                </div>
              </div>
              <div className="admin-field">
                <label htmlFor="services-price-display">Price Display</label>
                <input id="services-price-display"
                  type="text"
                  className={inputCls}
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. ₱5,500 / mo or Contact for Price"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="services-cover-image-optional">Cover Image (Optional)</label>
                <input id="services-cover-image-optional"
                  type="text"
                  className={inputCls}
                  value={form.image_url}
                  onChange={e => setForm({ ...form, image_url: e.target.value })}
                  placeholder="/uploads/services/... or https://..."
                />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                  <label className="admin-btn admin-btn-ghost admin-btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload className="size-4" aria-hidden="true" style={{ marginRight: 6 }} />
                    {uploading === 'cover' ? 'Uploading...' : 'Upload cover image'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleCoverFile} disabled={uploading !== ''} />
                  </label>
                  <small style={{ color: 'var(--admin-text-3)' }}>JPG, PNG or WebP, up to 5MB.</small>
                </div>
                {form.image_url ? (
                  <img
                    src={form.image_url}
                    alt="Cover preview"
                    style={{ marginTop: 8, maxWidth: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--admin-line)' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : null}
              </div>
              <div className="admin-field">
                <label htmlFor="services-description-amp-inclusions">Description &amp; Inclusions</label>
                <textarea id="services-description-amp-inclusions"
                  rows={4}
                  className={inputCls}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Details of package inclusions, features, or service scope..."
                  required
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-field">
                  <label htmlFor="services-feature-bullets-one-per-line">Feature Bullets (one per line)</label>
                  <textarea id="services-feature-bullets-one-per-line"
                    rows={5}
                    className={inputCls}
                    value={form.featuresText}
                    onChange={e => setForm({ ...form, featuresText: e.target.value })}
                    placeholder={'Verified Tenant Vetting\nYield Optimization'}
                  />
                </div>
              </div>
              <div className="admin-field">
                <label>Photo Gallery (Optional)</label>
                {form.photos.length > 0 ? (
                  <ul className="services-photo-list">
                    {form.photos.map((url, i) => (
                      <li key={`${url}-${i}`} className="services-photo-item">
                        <img src={url} alt={`Photo ${i + 1}`} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
                        <span className="services-photo-url" title={url}>{url}</span>
                        <span className="services-photo-actions">
                          <button type="button" className="admin-icon-btn" aria-label={`Move photo ${i + 1} up`} disabled={i === 0} onClick={() => movePhoto(i, -1)}>
                            <ArrowUp className="size-4" aria-hidden="true" />
                          </button>
                          <button type="button" className="admin-icon-btn" aria-label={`Move photo ${i + 1} down`} disabled={i === form.photos.length - 1} onClick={() => movePhoto(i, 1)}>
                            <ArrowDown className="size-4" aria-hidden="true" />
                          </button>
                          <button type="button" className="admin-icon-btn admin-icon-btn-danger" aria-label={`Remove photo ${i + 1}`} onClick={() => removePhoto(i)}>
                            <X className="size-4" aria-hidden="true" />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <small style={{ color: 'var(--admin-text-3)' }}>No gallery photos yet.</small>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                  <label className="admin-btn admin-btn-ghost admin-btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload className="size-4" aria-hidden="true" style={{ marginRight: 6 }} />
                    {uploading === 'photos' ? 'Uploading...' : 'Upload photos'}
                    <input type="file" multiple accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handlePhotoFiles} disabled={uploading !== ''} />
                  </label>
                  <input
                    type="text"
                    className={inputCls}
                    style={{ flex: '1 1 180px', minWidth: 0 }}
                    value={photoUrl}
                    onChange={e => setPhotoUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPhotoUrl(); } }}
                    placeholder="or paste an image URL"
                    aria-label="Gallery image URL"
                  />
                  <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={addPhotoUrl} disabled={!photoUrl.trim()}>Add URL</button>
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-field">
                  <label htmlFor="services-sort-order">Sort Order</label>
                  <input id="services-sort-order"
                  type="number"
                    className={inputCls}
                    value={form.sort_order}
                    onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="services-publish-status">Publish Status</label>
                  <select id="services-publish-status" className={inputCls} value={form.is_published} onChange={e => setForm({ ...form, is_published: parseInt(e.target.value) })}>
                    <option value={1}>Published (Visible on site)</option>
                    <option value={0}>Draft (Hidden)</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving || uploading !== ''}>
                  {saving ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
