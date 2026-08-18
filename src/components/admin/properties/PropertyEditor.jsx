import { useEffect, useState } from 'react';
import { createOffering, updateOffering } from '@/lib/adminApi';
import PropertyGalleryManager from './PropertyGalleryManager';

const EMPTY = { title: '', location: '', property_type: '', status: 'Available', transaction_type_id: '', price: '', price_unit: 'PHP', floor_area: '', lot_area: '', bedrooms: '', bathrooms: '', parking_slots: '', description: '', email: '', phone: '', featured: false };
const PROPERTY_TYPES = ['warehouse', 'commercial_spaces', 'office_spaces', 'condominium', 'house', 'virtual_office', 'lot'];
const AVAILABILITY = ['Available', 'FOR_SALE', 'FOR_LEASE', 'Sold', 'Closed'];

function asForm(row) {
  if (!row) return EMPTY;
  return { ...EMPTY, ...row, price: row.price ?? '', floor_area: row.floor_area ?? '', lot_area: row.lot_area ?? '', bedrooms: row.bedrooms ?? row.beds ?? '', bathrooms: row.bathrooms ?? row.baths ?? '', parking_slots: row.parking_slots ?? row.garage ?? '', transaction_type_id: row.transaction_type_id || '' };
}

export default function PropertyEditor({ row, transactionTypes, onClose, onSaved, toast }) {
  const [form, setForm] = useState(() => asForm(row));
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(asForm(row)), [row]);
  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  const save = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const payload = { ...form };
      for (const field of ['price', 'floor_area', 'lot_area', 'bedrooms', 'bathrooms', 'parking_slots']) payload[field] = payload[field] === '' ? null : Number(payload[field]);
      const result = row ? await updateOffering(row.id, payload) : await createOffering(payload);
      toast(`Property ${row ? 'updated' : 'created'}`, 'success'); onSaved(result); onClose();
    } catch (error) { toast(error.message, 'error'); } finally { setSaving(false); }
  };
  return <div className="admin-dialog-overlay" onClick={onClose}>
    <div className="admin-dialog-box property-editor-dialog" onClick={(event) => event.stopPropagation()}>
      <div className="admin-page-header"><h3>{row ? 'Edit property' : 'Create draft listing'}</h3><button type="button" className="admin-btn admin-btn-ghost" onClick={onClose} aria-label="Close"><i className="fa-solid fa-xmark" /></button></div>
      <form className="admin-form" onSubmit={save}>
        <div className="admin-form-row"><div className="admin-field"><label>Title *</label><input value={form.title} required onChange={(event) => update('title', event.target.value)} /></div><div className="admin-field"><label>Property type</label><select value={form.property_type || ''} onChange={(event) => update('property_type', event.target.value)}><option value="">Select</option>{PROPERTY_TYPES.map((type) => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}</select></div></div>
        <div className="admin-form-row"><div className="admin-field"><label>Availability</label><select value={form.status || ''} onChange={(event) => update('status', event.target.value)}>{AVAILABILITY.map((status) => <option key={status}>{status}</option>)}</select></div><div className="admin-field"><label>Transaction</label><select value={form.transaction_type_id || ''} onChange={(event) => update('transaction_type_id', event.target.value)}><option value="">Select</option>{transactionTypes.map((type) => <option key={type.id} value={type.id}>{type.label || type.name}</option>)}</select></div></div>
        <div className="admin-form-row"><div className="admin-field"><label>Price</label><input type="number" min="0" value={form.price} onChange={(event) => update('price', event.target.value)} /></div><div className="admin-field"><label>Currency</label><input value={form.price_unit || 'PHP'} onChange={(event) => update('price_unit', event.target.value)} /></div></div>
        <div className="admin-form-row"><div className="admin-field"><label>Location / address</label><input value={form.location || ''} onChange={(event) => update('location', event.target.value)} /></div><div className="admin-field"><label>Floor area</label><input value={form.floor_area} onChange={(event) => update('floor_area', event.target.value)} /></div></div>
        <div className="admin-form-row"><div className="admin-field"><label>Lot area</label><input value={form.lot_area} onChange={(event) => update('lot_area', event.target.value)} /></div><div className="admin-field"><label>Bedrooms / bathrooms / parking</label><div className="admin-inline-inputs"><input aria-label="Bedrooms" type="number" min="0" value={form.bedrooms} onChange={(event) => update('bedrooms', event.target.value)} /><input aria-label="Bathrooms" type="number" min="0" value={form.bathrooms} onChange={(event) => update('bathrooms', event.target.value)} /><input aria-label="Parking slots" type="number" min="0" value={form.parking_slots} onChange={(event) => update('parking_slots', event.target.value)} /></div></div></div>
        <div className="admin-field"><label>Description</label><textarea rows="5" value={form.description || ''} onChange={(event) => update('description', event.target.value)} /></div>
        <div className="admin-form-row"><div className="admin-field"><label>Email</label><input type="email" value={form.email || ''} onChange={(event) => update('email', event.target.value)} /></div><div className="admin-field"><label>Phone</label><input value={form.phone || ''} onChange={(event) => update('phone', event.target.value)} /></div></div>
        <label className="admin-checkbox"><input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => update('featured', event.target.checked)} /> Featured</label>
        {row && <PropertyGalleryManager offeringId={row.id} />}
        <div className="admin-dialog-actions"><button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save draft'}</button></div>
      </form>
    </div>
  </div>;
}
