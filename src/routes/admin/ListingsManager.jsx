import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

const PROPERTY_TYPES = [
  { id: 'all', label: 'All Property Types' },
  { id: 'condominium', label: 'Condominium' },
  { id: 'commercial', label: 'Commercial Space' },
  { id: 'office', label: 'Office Space' },
  { id: 'warehouse', label: 'Warehouse / Logistics' },
  { id: 'house', label: 'House & Lot' },
  { id: 'virtual_office', label: 'Virtual Office' },
];

const STATUS_OPTIONS = [
  { id: 'all', label: 'All Statuses' },
  { id: 'FOR SALE', label: 'For Sale' },
  { id: 'FOR LEASE', label: 'For Lease' },
  { id: 'PRE-SELLING', label: 'Pre-Selling' },
  { id: 'AVAILABLE', label: 'Available' },
];

export default function ListingsManager() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal & Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, listing: null });

  const [form, setForm] = useState({
    title: '',
    slug: '',
    property_type: 'condominium',
    price: '',
    price_display: '',
    address: '',
    city: 'Pasig City',
    location: 'Ortigas Center, Pasig City',
    floor_area: '',
    lot_area: '',
    bedrooms: '',
    bathrooms: '',
    status: 'FOR SALE',
    featured: 0,
    is_published: 1,
    description: '',
    sort_order: 0,
    images: [],
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');

  const toast = useToast();

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/listings.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setListings(data.data);
      } else {
        setListings([]);
      }
    } catch {
      toast.error('Failed to load property listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchType = selectedType === 'all' || item.property_type === selectedType;
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchSearch =
        !searchTerm.trim() ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.city?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchStatus && matchSearch;
    });
  }, [listings, selectedType, selectedStatus, searchTerm]);

  const handleOpenAdd = () => {
    setEditingListing(null);
    setNewImageUrl('');
    setNewImageCaption('');
    setForm({
      title: '',
      slug: '',
      property_type: 'condominium',
      price: '',
      price_display: '',
      address: '',
      city: 'Pasig City',
      location: 'Ortigas Center, Pasig City',
      floor_area: '',
      lot_area: '',
      bedrooms: '',
      bathrooms: '',
      status: 'FOR SALE',
      featured: 0,
      is_published: 1,
      description: '',
      sort_order: listings.length + 1,
      images: [],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = async (listing) => {
    setEditingListing(listing);
    setNewImageUrl('');
    setNewImageCaption('');

    // Fetch full listing images
    try {
      const res = await fetch(`/api/admin/listings.php?id=${listing.id}`, { credentials: 'include' });
      const data = await res.json();
      const fullItem = data.success ? data.data : listing;

      setForm({
        title: fullItem.title || '',
        slug: fullItem.slug || '',
        property_type: fullItem.property_type || 'condominium',
        price: fullItem.price ?? '',
        price_display: fullItem.price_display || '',
        address: fullItem.address || '',
        city: fullItem.city || 'Pasig City',
        location: fullItem.location || 'Ortigas Center, Pasig City',
        floor_area: fullItem.floor_area ?? '',
        lot_area: fullItem.lot_area ?? '',
        bedrooms: fullItem.bedrooms ?? '',
        bathrooms: fullItem.bathrooms ?? '',
        status: fullItem.status || 'FOR SALE',
        featured: fullItem.featured ? 1 : 0,
        is_published: fullItem.is_published ? 1 : 0,
        description: fullItem.description || '',
        sort_order: fullItem.sort_order || 0,
        images: Array.isArray(fullItem.images) ? fullItem.images : [],
      });
    } catch {
      setForm({
        title: listing.title || '',
        slug: listing.slug || '',
        property_type: listing.property_type || 'condominium',
        price: listing.price ?? '',
        price_display: listing.price_display || '',
        address: listing.address || '',
        city: listing.city || 'Pasig City',
        location: listing.location || 'Ortigas Center, Pasig City',
        floor_area: listing.floor_area ?? '',
        lot_area: listing.lot_area ?? '',
        bedrooms: listing.bedrooms ?? '',
        bathrooms: listing.bathrooms ?? '',
        status: listing.status || 'FOR SALE',
        featured: listing.featured ? 1 : 0,
        is_published: listing.is_published ? 1 : 0,
        description: listing.description || '',
        sort_order: listing.sort_order || 0,
        images: [],
      });
    }

    setModalOpen(true);
  };

  const handleTitleChange = (val) => {
    const slugVal = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug === '' || prev.slug === prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') ? slugVal : prev.slug,
    }));
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setForm((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          image_url: newImageUrl.trim(),
          caption: newImageCaption.trim(),
          is_primary: prev.images.length === 0 ? 1 : 0,
          sort_order: prev.images.length + 1,
        },
      ],
    }));
    setNewImageUrl('');
    setNewImageCaption('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    if (editingListing?.id) {
      formData.append('listing_id', String(editingListing.id));
    }

    try {
      setUploadingImage(true);
      const res = await fetch('/api/admin/listings.php?action=upload_image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.image_url) {
        setForm((prev) => ({
          ...prev,
          images: [
            ...prev.images,
            {
              image_url: data.image_url,
              caption: file.name,
              is_primary: prev.images.length === 0 ? 1 : 0,
              sort_order: prev.images.length + 1,
            },
          ],
        }));
        toast.success('Image uploaded successfully');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch {
      toast.error('Network error while uploading image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (idx) => {
    setForm((prev) => {
      const updated = prev.images.filter((_, i) => i !== idx);
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = 1;
      }
      return { ...prev, images: updated };
    });
  };

  const handleSetPrimaryImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        is_primary: i === idx ? 1 : 0,
      })),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    try {
      const method = editingListing ? 'PUT' : 'POST';
      const payload = editingListing ? { ...form, id: editingListing.id } : form;

      const res = await fetch('/api/admin/listings.php', {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingListing ? 'Listing updated successfully' : 'Listing created successfully');
        setModalOpen(false);
        fetchListings();
      } else {
        toast.error(data.error || 'Failed to save listing');
      }
    } catch {
      toast.error('Network error while saving listing');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.listing) return;
    try {
      const res = await fetch(`/api/admin/listings.php?id=${deleteConfirm.listing.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Listing deleted');
        setDeleteConfirm({ open: false, listing: null });
        fetchListings();
      } else {
        toast.error(data.error || 'Failed to delete listing');
      }
    } catch {
      toast.error('Network error during deletion');
    }
  };

  return (
    <div className="admin-page">
      <Helmet>
        <title>Property Listings Manager | Alpha Premier Admin</title>
      </Helmet>

      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Property Listings Manager</h1>
          <p>Create, edit, and publish commercial, office, warehouse, and luxury residential listings.</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleOpenAdd}>
          <i className="fa-solid fa-plus" /> Add New Listing
        </button>
      </div>

      {/* Filter Bar */}
      <div className="admin-filter-bar" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ flex: '1 1 200px', minWidth: 200 }}>
          <input
            type="text"
            className="admin-input"
            placeholder="Search by title, location, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="admin-select"
          style={{ width: 'auto', minWidth: 160 }}
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {PROPERTY_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          className="admin-select"
          style={{ width: 'auto', minWidth: 140 }}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Listings Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
          <i className="fa-solid fa-spinner fa-spin fa-2x" />
          <p style={{ marginTop: 12 }}>Loading listings...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: 50, color: '#888' }}>
          <i className="fa-solid fa-building fa-3x" style={{ opacity: 0.3, marginBottom: 16, color: 'var(--admin-gold)' }} />
          <h3>No Property Listings Found</h3>
          <p>Create your first property listing or adjust search filters.</p>
          <button className="admin-btn admin-btn-primary" style={{ marginTop: 16 }} onClick={handleOpenAdd}>
            <i className="fa-solid fa-plus" /> Add Listing
          </button>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 64 }}>Photo</th>
                <th>Title &amp; Type</th>
                <th>Price</th>
                <th>Location</th>
                <th>Specs</th>
                <th>Status</th>
                <th style={{ width: 100, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img
                      src={item.primary_image || '/assets/images/placeholder.svg'}
                      alt={item.title}
                      style={{
                        width: 52,
                        height: 40,
                        objectFit: 'cover',
                        borderRadius: 4,
                        border: '1px solid #333',
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/images/placeholder.svg';
                      }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>
                      {item.title}
                      {item.featured === 1 && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: '0.65rem',
                            background: '#c5a059',
                            color: '#000',
                            padding: '2px 6px',
                            borderRadius: 3,
                            fontWeight: 800,
                          }}
                        >
                          FEATURED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'capitalize' }}>
                      {item.property_type} • /{item.slug}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--admin-gold)' }}>
                      {item.price_display || (item.price ? `₱ ${Number(item.price).toLocaleString()}` : 'Contact')}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{item.location || item.city}</div>
                    {item.address && <div style={{ fontSize: '0.75rem', color: '#777' }}>{item.address}</div>}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                      {item.floor_area ? `${item.floor_area} sqm` : '—'}
                      {item.bedrooms ? ` • ${item.bedrooms} BR` : ''}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: 12,
                        fontWeight: 700,
                        background:
                          item.status === 'FOR SALE'
                            ? 'rgba(46, 204, 113, 0.15)'
                            : item.status === 'FOR LEASE'
                            ? 'rgba(52, 152, 219, 0.15)'
                            : 'rgba(243, 156, 18, 0.15)',
                        color:
                          item.status === 'FOR SALE'
                            ? '#2ecc71'
                            : item.status === 'FOR LEASE'
                            ? '#3498db'
                            : '#f39c12',
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button
                        className="admin-btn admin-btn-sm"
                        title="Edit Listing"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button
                        className="admin-btn admin-btn-sm admin-btn-danger"
                        title="Delete Listing"
                        onClick={() => setDeleteConfirm({ open: true, listing: item })}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Listing Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="admin-modal"
            style={{ maxWidth: 840, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h2>{editingListing ? 'Edit Property Listing' : 'Add New Property Listing'}</h2>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Title & Slug */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="admin-label">Listing Title *</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Tektite East Tower Grade-A Commercial Office"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="admin-label">URL Slug</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>

                <div>
                  <label className="admin-label">Property Type</label>
                  <select
                    className="admin-select"
                    value={form.property_type}
                    onChange={(e) => setForm({ ...form, property_type: e.target.value })}
                  >
                    <option value="condominium">Condominium</option>
                    <option value="commercial">Commercial Space</option>
                    <option value="office">Office Space</option>
                    <option value="warehouse">Warehouse / Logistics</option>
                    <option value="house">House &amp; Lot</option>
                    <option value="virtual_office">Virtual Office</option>
                  </select>
                </div>

                {/* Price & Status */}
                <div>
                  <label className="admin-label">Price (Numeric PHP)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="admin-input"
                    placeholder="e.g. 185000000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>

                <div>
                  <label className="admin-label">Price Display String</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. ₱ 185,000,000 or ₱ 420,000 / mo"
                    value={form.price_display}
                    onChange={(e) => setForm({ ...form, price_display: e.target.value })}
                  />
                </div>

                <div>
                  <label className="admin-label">Status</label>
                  <select
                    className="admin-select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="FOR SALE">FOR SALE</option>
                    <option value="FOR LEASE">FOR LEASE</option>
                    <option value="PRE-SELLING">PRE-SELLING</option>
                    <option value="AVAILABLE">AVAILABLE</option>
                  </select>
                </div>

                <div>
                  <label className="admin-label">City</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Pasig City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="admin-label">Full Location Headline</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Ortigas Center, Pasig City"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="admin-label">Street Address</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Philippine Stock Exchange Centre, Exchange Road"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>

                {/* Specs */}
                <div>
                  <label className="admin-label">Floor Area (sqm)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="admin-input"
                    placeholder="e.g. 450"
                    value={form.floor_area}
                    onChange={(e) => setForm({ ...form, floor_area: e.target.value })}
                  />
                </div>

                <div>
                  <label className="admin-label">Lot Area (sqm)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="admin-input"
                    placeholder="e.g. 450"
                    value={form.lot_area}
                    onChange={(e) => setForm({ ...form, lot_area: e.target.value })}
                  />
                </div>

                <div>
                  <label className="admin-label">Bedrooms</label>
                  <input
                    type="number"
                    className="admin-input"
                    placeholder="e.g. 4"
                    value={form.bedrooms}
                    onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                  />
                </div>

                <div>
                  <label className="admin-label">Bathrooms</label>
                  <input
                    type="number"
                    className="admin-input"
                    placeholder="e.g. 5"
                    value={form.bathrooms}
                    onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="admin-label">Property Description</label>
                  <textarea
                    rows={4}
                    className="admin-input"
                    placeholder="Detailed property specifications, amenities, and building features..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                {/* Flags */}
                <div style={{ display: 'flex', gap: 20, gridColumn: '1 / -1', padding: '8px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.featured === 1}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked ? 1 : 0 })}
                    />
                    <span>Featured Property (Pinned to Top)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.is_published === 1}
                      onChange={(e) => setForm({ ...form, is_published: e.target.checked ? 1 : 0 })}
                    />
                    <span>Published to Website</span>
                  </label>
                </div>

                {/* Image Gallery Manager */}
                <div
                  style={{
                    gridColumn: '1 / -1',
                    background: '#161616',
                    padding: 16,
                    borderRadius: 8,
                    border: '1px solid #2a2a2a',
                  }}
                >
                  <label className="admin-label" style={{ color: 'var(--admin-gold)', fontSize: '0.95rem' }}>
                    <i className="fa-solid fa-images" style={{ marginRight: 6 }} /> Attached Images &amp; Gallery
                  </label>

                  {/* Upload Image File */}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                    <label className="admin-btn admin-btn-sm" style={{ cursor: 'pointer' }}>
                      <i className="fa-solid fa-upload" style={{ marginRight: 6 }} />
                      {uploadingImage ? 'Uploading...' : 'Upload Image File'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#888' }}>Uploads directly to /public/uploads/listings/</span>
                  </div>

                  {/* Add Image URL */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <input
                      type="text"
                      className="admin-input"
                      style={{ flex: 2 }}
                      placeholder="Or enter Image URL (/assets/images/...)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                    <input
                      type="text"
                      className="admin-input"
                      style={{ flex: 1 }}
                      placeholder="Caption (optional)"
                      value={newImageCaption}
                      onChange={(e) => setNewImageCaption(e.target.value)}
                    />
                    <button type="button" className="admin-btn admin-btn-sm" onClick={handleAddImageUrl}>
                      Add URL
                    </button>
                  </div>

                  {/* Image Thumbnails List */}
                  {form.images.length === 0 ? (
                    <p style={{ color: '#666', fontSize: '0.8rem', margin: 0 }}>No photos attached yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      {form.images.map((img, idx) => {
                        const url = typeof img === 'string' ? img : img.image_url;
                        const isPrimary = typeof img === 'object' && img.is_primary === 1;

                        return (
                          <div
                            key={idx}
                            style={{
                              position: 'relative',
                              width: 110,
                              height: 80,
                              borderRadius: 6,
                              overflow: 'hidden',
                              border: isPrimary ? '2px solid var(--admin-gold)' : '1px solid #333',
                            }}
                          >
                            <img
                              src={url}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.currentTarget.src = '/assets/images/placeholder.svg';
                              }}
                            />
                            {isPrimary && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: 3,
                                  left: 3,
                                  background: 'var(--admin-gold)',
                                  color: '#000',
                                  fontSize: '0.55rem',
                                  padding: '1px 4px',
                                  borderRadius: 2,
                                  fontWeight: 800,
                                }}
                              >
                                PRIMARY
                              </span>
                            )}
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'rgba(0,0,0,0.7)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: 2,
                              }}
                            >
                              {!isPrimary && (
                                <button
                                  type="button"
                                  title="Set as Primary"
                                  onClick={() => handleSetPrimaryImage(idx)}
                                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.65rem', cursor: 'pointer' }}
                                >
                                  ★
                                </button>
                              )}
                              <button
                                type="button"
                                title="Remove Image"
                                onClick={() => handleRemoveImage(idx)}
                                style={{ background: 'transparent', border: 'none', color: '#ff5555', fontSize: '0.65rem', cursor: 'pointer', marginLeft: 'auto' }}
                              >
                                &times;
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingListing ? 'Update Listing' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Property Listing"
        message={`Are you sure you want to permanently delete "${deleteConfirm.listing?.title}"? All attached photo references will also be removed.`}
        confirmText="Delete Listing"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, listing: null })}
      />
    </div>
  );
}
