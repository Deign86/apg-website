import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/admin/Toast';

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
  const toast = useToast();

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content block?')) return;
    try {
      const res = await fetch(`/api/admin/content.php?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Block deleted');
        fetchBlocks();
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Error deleting block');
    }
  };

  return (
    <div className="admin-page">
      <Helmet><title>Content Editor | Admin</title></Helmet>

      <div className="admin-header">
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Content Editor</h1>
          <p style={{ color: '#888', margin: '4px 0 0', fontSize: '0.85rem' }}>Edit static headlines, blurbs, and custom text blocks per page</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleOpenAdd}>
          <i className="fa-solid fa-plus" /> Add Content Block
        </button>
      </div>

      {/* Page Selector Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, borderBottom: '1px solid #232738', paddingBottom: 16 }}>
        {PAGES.map(p => (
          <button
            key={p.slug}
            onClick={() => setSelectedPage(p.slug)}
            style={{
              background: selectedPage === p.slug ? '#c5a059' : '#141620',
              color: selectedPage === p.slug ? '#000' : '#aaa',
              border: '1px solid',
              borderColor: selectedPage === p.slug ? '#c5a059' : '#232738',
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {p.name}
          </button>
        ))}
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
            <i className="fa-solid fa-file-circle-xmark" style={{ fontSize: 36, color: '#444', marginBottom: 12 }} />
            <p>No custom content blocks defined for <strong>{selectedPage}</strong> yet.</p>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>The site is currently rendering with hardcoded default copy. Click "Add Content Block" to override.</p>
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
                  <td><code style={{ color: '#c5a059', background: '#1c1f2e', padding: '2px 6px', borderRadius: 4 }}>{b.section_key}</code></td>
                  <td><span className="admin-badge">{b.type}</span></td>
                  <td style={{ maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#ddd' }}>
                    {b.value}
                  </td>
                  <td>{b.sort_order}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="admin-icon-btn" title="Edit" onClick={() => handleOpenEdit(b)}>
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button className="admin-icon-btn admin-icon-btn-danger" title="Delete" onClick={() => handleDelete(b.id)}>
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
              <h2>{editingBlock ? 'Edit Content Block' : 'Add Content Block'}</h2>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="admin-field">
                <label>Page Slug</label>
                <select value={form.page_slug} onChange={e => setForm({ ...form, page_slug: e.target.value })}>
                  {PAGES.map(p => <option key={p.slug} value={p.slug}>{p.name} ({p.slug})</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label>Section Key (unique identifier on page)</label>
                <input 
                  type="text" 
                  value={form.section_key} 
                  onChange={e => setForm({ ...form, section_key: e.target.value })} 
                  placeholder="e.g. hero_heading, about_tagline" 
                  required 
                />
              </div>
              <div className="admin-field">
                <label>Content Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="text">Plain Text</option>
                  <option value="richtext">Rich Text / Multiline</option>
                  <option value="card">Card Data / JSON</option>
                  <option value="image">Image URL</option>
                </select>
              </div>
              <div className="admin-field">
                <label>Content Value</label>
                <textarea 
                  rows={5} 
                  value={form.value} 
                  onChange={e => setForm({ ...form, value: e.target.value })} 
                  placeholder="Enter content value or text..." 
                  required 
                />
              </div>
              <div className="admin-field">
                <label>Sort Order</label>
                <input 
                  type="number" 
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
