import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/admin/Toast';

const CATEGORIES = [
  { id: 'all', label: 'All Services' },
  { id: 'virtual-office', label: 'Virtual Office' },
  { id: 'realty', label: 'Alpha Realty' },
  { id: 'construction', label: 'Alpha Construction' },
  { id: 'swiftclear', label: 'Swift Clear' },
  { id: 'altaventure', label: 'Alta Venture' },
  { id: '88prime', label: '88 Prime' },
];

export default function ServicesManager() {
  const [selectedCat, setSelectedCat] = useState('all');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category: 'virtual-office',
    title: '',
    description: '',
    price: '',
    image_url: '',
    sort_order: 0,
    is_published: 1,
  });
  const toast = useToast();

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
    setForm({
      category: selectedCat !== 'all' ? selectedCat : 'virtual-office',
      title: '',
      description: '',
      price: '',
      image_url: '',
      sort_order: services.length + 1,
      is_published: 1,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      category: item.category,
      title: item.title,
      description: item.description || '',
      price: item.price || '',
      image_url: item.image_url || '',
      sort_order: item.sort_order || 0,
      is_published: item.is_published ? 1 : 0,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const payload = editingItem ? { ...form, id: editingItem.id } : form;
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service package?')) return;
    try {
      const res = await fetch(`/api/admin/services.php?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Service deleted');
        fetchServices();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
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
      }
    } catch {
      toast.error('Toggle failed');
    }
  };

  return (
    <div className="admin-page">
      <Helmet><title>Services & Packages | Admin</title></Helmet>

      <div className="admin-header">
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Services & Packages</h1>
          <p style={{ color: '#888', margin: '4px 0 0', fontSize: '0.85rem' }}>Manage Virtual Office packages and subsidiary service cards</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleOpenAdd}>
          <i className="fa-solid fa-plus" /> Add Service / Package
        </button>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, borderBottom: '1px solid #232738', paddingBottom: 16 }}>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            style={{
              background: selectedCat === c.id ? '#c5a059' : '#141620',
              color: selectedCat === c.id ? '#000' : '#aaa',
              border: '1px solid',
              borderColor: selectedCat === c.id ? '#c5a059' : '#232738',
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Services Grid / Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
            <div className="admin-spinner" style={{ margin: '0 auto 12px' }} />
            <p>Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
            <i className="fa-solid fa-boxes-stacked" style={{ fontSize: 36, color: '#444', marginBottom: 12 }} />
            <p>No services registered in this category yet.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Service Title</th>
                <th style={{ width: '15%' }}>Category</th>
                <th style={{ width: '15%' }}>Price</th>
                <th>Description</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{s.title}</td>
                  <td><span className="admin-badge" style={{ color: '#c5a059' }}>{s.category}</span></td>
                  <td><strong style={{ color: '#10b981' }}>{s.price || '—'}</strong></td>
                  <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#aaa' }}>
                    {s.description}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleTogglePublish(s)}
                      style={{
                        background: s.is_published ? '#064e3b' : '#374151',
                        color: s.is_published ? '#34d399' : '#9ca3af',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {s.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="admin-icon-btn" title="Edit" onClick={() => handleOpenEdit(s)}>
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button className="admin-icon-btn admin-icon-btn-danger" title="Delete" onClick={() => handleDelete(s.id)}>
                      <i className="fa-solid fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 550 }}>
            <div className="admin-modal-header">
              <h2>{editingItem ? 'Edit Service / Package' : 'Add Service / Package'}</h2>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="admin-field">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="virtual-office">Virtual Office</option>
                  <option value="realty">Alpha Realty</option>
                  <option value="construction">Alpha Construction</option>
                  <option value="swiftclear">Swift Clear</option>
                  <option value="altaventure">Alta Venture</option>
                  <option value="88prime">88 Prime</option>
                </select>
              </div>
              <div className="admin-field">
                <label>Service Title</label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  placeholder="e.g. Gold Executive Workspace Suite" 
                  required 
                />
              </div>
              <div className="admin-field">
                <label>Price Display</label>
                <input 
                  type="text" 
                  value={form.price} 
                  onChange={e => setForm({ ...form, price: e.target.value })} 
                  placeholder="e.g. ₱5,500 / mo or Contact for Price" 
                />
              </div>
              <div className="admin-field">
                <label>Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={form.image_url} 
                  onChange={e => setForm({ ...form, image_url: e.target.value })} 
                  placeholder="/assets/images/placeholder.svg or https://..." 
                />
              </div>
              <div className="admin-field">
                <label>Description & Inclusions</label>
                <textarea 
                  rows={4} 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  placeholder="Details of package inclusions, features, or service scope..." 
                  required 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="admin-field">
                  <label>Sort Order</label>
                  <input 
                    type="number" 
                    value={form.sort_order} 
                    onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} 
                  />
                </div>
                <div className="admin-field">
                  <label>Publish Status</label>
                  <select value={form.is_published} onChange={e => setForm({ ...form, is_published: parseInt(e.target.value) })}>
                    <option value={1}>Published (Visible on site)</option>
                    <option value={0}>Draft (Hidden)</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
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
