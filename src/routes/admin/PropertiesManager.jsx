import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabase';
import DataTable from '@/components/admin/DataTable';
import StatusPill from '@/components/admin/StatusPill';
import ImageUploader from '@/components/admin/ImageUploader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/Toast';

const propertyTypes = ['warehouse','commercial_spaces','office_spaces','condominium','house','virtual_office','Lot'];
const statuses = ['FOR_SALE','FOR_LEASE','Available','Sold','Closed'];

const emptyForm = () => ({ title:'', location:'', property_type:'', status:'', price:'', price_unit:'₱', floor_area:'', lot_area:'', beds:'', baths:'', garage:'', description:'', email:'', phone:'', images:[], featured:false, is_published:true });

export default function PropertiesManager() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('offerings').select('*').order('created_at', { ascending: false });
    if (filterType) q = q.eq('property_type', filterType);
    const { data, error } = await q;
    if (error) toast(error.message, 'error'); else setRows(data || []);
    setLoading(false);
  }, [filterType, toast]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const { search_vector: _sv, ...rest } = form;
    const pay = {
      ...rest,
      price: parseFloat(form.price) || 0,
      floor_area: parseInt(form.floor_area) || 0,
      lot_area: parseInt(form.lot_area) || 0,
      beds: parseInt(form.beds) || null,
      baths: parseInt(form.baths) || null,
      garage: parseInt(form.garage) || null,
    };
    setSaving(true);
    const { error } = editing ? await supabase.from('offerings').update(pay).eq('id', editing.id) : await supabase.from('offerings').insert(pay);
    setSaving(false);
    if (error) { toast(error.message, 'error'); return; }
    toast(`Property ${editing ? 'updated' : 'created'}`, 'success');
    setShowForm(false); setEditing(null); setForm(emptyForm()); load();
  };

  const edit = (r) => {
    setEditing(r);
    const clean = { ...r };
    for (const k of Object.keys(clean)) {
      if (clean[k] === null || clean[k] === undefined) delete clean[k];
    }
    setForm({
      ...emptyForm(),
      ...clean,
      price: r.price != null ? String(r.price) : '',
      floor_area: r.floor_area != null ? String(r.floor_area) : '',
      lot_area: r.lot_area != null ? String(r.lot_area) : '',
    });
    setShowForm(true);
  };
const duplicate = (r) => { setEditing(null); setForm({ ...emptyForm(), ...r, title: `${r.title} (Copy)` }); setShowForm(true); };
  const softDelete = async (r) => { await supabase.from('offerings').update({ deleted_at: new Date().toISOString() }).eq('id', r.id); toast('Archived','success'); load(); };
  const restore = async (r) => { await supabase.from('offerings').update({ deleted_at: null }).eq('id', r.id); toast('Restored','success'); load(); };

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'property_type', header: 'Type', render: r => <StatusPill status={r.property_type} /> },
    { key: 'location', header: 'Location' },
    { key: 'price', header: 'Price', render: r => r.price ? `${r.price_unit || '₱'}${Number(r.price).toLocaleString()}` : '—' },
    { key: 'status', header: 'Status', render: r => <StatusPill status={r.status} /> },
    { key: 'featured', header: '★', render: r => <span style={{cursor:'pointer', color: r.featured ? '#c5a059' : '#444'}} onClick={() => { supabase.from('offerings').update({featured:!r.featured}).eq('id',r.id); load(); }}><i className={`fa-solid ${r.featured ? 'fa-star' : 'fa-star'}`} /></span> },
  ];
  return (
    <>
      <Helmet><title>Properties | Alpha Premier Admin</title></Helmet>
      <div className="admin-page-header">
        <h1>Properties</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => { setEditing(null); setForm(emptyForm()); setShowForm(true); }}>
          <i className="fa-solid fa-plus" /> Add Property
        </button>
      </div>

      {showForm && (
        <div className="admin-dialog-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-dialog-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 640, textAlign: 'left' }}>
            <h3>{editing ? 'Edit Property' : 'New Property'}</h3>
            <div className="admin-form">
              <div className="admin-field"><label>Title *</label><input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} required /></div>
              <div className="admin-form-row">
                <div className="admin-field"><label>Type</label><select value={form.property_type} onChange={e => setForm(p=>({...p,property_type:e.target.value}))}>
                  <option value="">Select</option>
                  {propertyTypes.map(t => <option key={t} value={t}>{t.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                </select></div>
                <div className="admin-field"><label>Status</label><select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))}>
                  <option value="">Select</option>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select></div>
              </div>
              <div className="admin-form-row">
                <div className="admin-field"><label>Price</label><input type="number" value={form.price} onChange={e => setForm(p=>({...p,price:e.target.value}))} /></div>
                <div className="admin-field"><label>Price Unit</label><input value={form.price_unit} onChange={e => setForm(p=>({...p,price_unit:e.target.value}))} /></div>
              </div>
              <div className="admin-form-row">
                <div className="admin-field"><label>Floor Area</label><input type="number" value={form.floor_area} onChange={e => setForm(p=>({...p,floor_area:e.target.value}))} /></div>
                <div className="admin-field"><label>Lot Area</label><input type="number" value={form.lot_area} onChange={e => setForm(p=>({...p,lot_area:e.target.value}))} /></div>
              </div>
              <div className="admin-form-row">
                <div className="admin-field"><label>Location</label><input value={form.location} onChange={e => setForm(p=>({...p,location:e.target.value}))} /></div>
                <div className="admin-field"><label>Beds / Baths / Garage</label><input placeholder="e.g. 3 / 2 / 1" value={[form.beds,form.baths,form.garage].filter(Boolean).join(' / ')} onChange={e => { const parts = e.target.value.split('/').map(s=>s.trim()); setForm(p=>({...p, beds:parts[0]||'', baths:parts[1]||'', garage:parts[2]||''})); }} /></div>
              </div>
              <div className="admin-field"><label>Email</label><input value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} /></div>
              <div className="admin-field"><label>Phone</label><input value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} /></div>
              <div className="admin-field"><label>Description</label><textarea rows={3} value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} /></div>
              <div className="admin-field"><label>Images</label><ImageUploader bucket="listing-images" value={form.images} onChange={v => setForm(p=>({...p,images:v}))} max={10} /></div>
              <div className="admin-form-row">
                <label style={{display:'flex',alignItems:'center',gap:8,fontSize:'0.85rem',color:'#aaa'}}><input type="checkbox" checked={form.featured} onChange={e => setForm(p=>({...p,featured:e.target.checked}))} /> Featured</label>
                <label style={{display:'flex',alignItems:'center',gap:8,fontSize:'0.85rem',color:'#aaa'}}><input type="checkbox" checked={form.is_published} onChange={e => setForm(p=>({...p,is_published:e.target.checked}))} /> Published</label>
              </div>
            </div>
            <div className="admin-dialog-actions" style={{marginTop:20}}>
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={save} disabled={!form.title || saving}>{saving ? 'Saving...' : (editing ? 'Update' : 'Create')}</button>
            </div>
          </div>
        </div>
      )}

      <DataTable columns={columns} rows={rows} search={search} onSearch={setSearch} loading={loading}
        emptyIcon="fa-building" emptyTitle="No properties yet" emptySubtitle="Click Add Property to create your first listing"
        filterComponent={<select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {propertyTypes.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
        </select>}
        actions={r => [
          { icon:'fa-pen', label:'Edit', onClick:() => edit(r) },
          { icon:'fa-copy', label:'Duplicate', onClick:() => duplicate(r) },
          ...(r.deleted_at
            ? [{ icon:'fa-rotate-left', label:'Restore', onClick:() => restore(r) }]
            : [{ icon:'fa-trash', label:'Archive', onClick:() => setConfirm({ action:() => softDelete(r), title:'Archive', message:`Archive "${r.title}"?` }) }]),
        ]}
      />
      <ConfirmDialog open={!!confirm} title={confirm?.title} message={confirm?.message} confirmLabel="Archive"
        onConfirm={() => { confirm?.action(); setConfirm(null); }}
        onCancel={() => setConfirm(null)} />
    </>
  );
}

