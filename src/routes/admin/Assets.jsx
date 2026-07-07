import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabase';
import DataTable from '@/components/admin/DataTable';
import StatusPill from '@/components/admin/StatusPill';
import ImageUploader from '@/components/admin/ImageUploader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/Toast';

const ASSET_TYPES = ['image', 'brochure', 'floor_plan', 'document', 'video'];
const INGESTION_STATUSES = ['active', 'archived', 'error', 'pending_review'];
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'];

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '—';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + SIZE_UNITS[i];
}

export default function Assets() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [confirm, setConfirm] = useState(null); // { type: 'archive'|'delete', row }
  const [uploadTarget, setUploadTarget] = useState(null); // asset row being replaced

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('assets')
      .select('*, offering_relations:property_asset_relations(offering_id)')
      .order('created_at', { ascending: false });
    if (filterType) q = q.eq('asset_type', filterType);
    if (filterStatus) q = q.eq('ingestion_status', filterStatus);
    const { data, error } = await q;
    if (error) toast(error.message, 'error');
    else setRows(data || []);
    setLoading(false);
  }, [filterType, filterStatus, toast]);

  useEffect(() => { load(); }, [load]);

  const archive = async (r) => {
    const { error } = await supabase.from('assets').update({ ingestion_status: 'archived' }).eq('id', r.id);
    if (error) toast(error.message, 'error');
    else { toast(`Archived ${r.original_name}`, 'success'); load(); }
    setConfirm(null);
  };

  const hardDelete = async (r) => {
    // Remove from storage first
    if (r.storage_path && r.storage_bucket) {
      await supabase.storage.from(r.storage_bucket).remove([r.storage_path]);
    }
    const { error } = await supabase.from('assets').delete().eq('id', r.id);
    if (error) toast(error.message, 'error');
    else { toast(`Deleted ${r.original_name}`, 'success'); load(); }
    setConfirm(null);
  };

  const handleUploadComplete = async (file) => {
    if (!uploadTarget) return;
    const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '';
    const newAssetId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const storagePath = `${newAssetId}-original${ext}`;
    const mimeType = file.type || 'application/octet-stream';

    // Upload to apg-public
    const { error: uploadErr } = await supabase.storage
      .from('apg-public')
      .upload(storagePath, file, { contentType: mimeType, upsert: false });

    if (uploadErr) { toast(`Upload failed: ${uploadErr.message}`, 'error'); return; }

    // Insert new asset
    const { data: newAsset, error: assetErr } = await supabase
      .from('assets')
      .insert({
        id: newAssetId,
        asset_type: 'image',
        mime_type: mimeType,
        size_bytes: file.size,
        original_name: file.name,
        storage_path: storagePath,
        storage_bucket: 'apg-public',
        is_public: true,
        ingestion_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (assetErr) { toast(`DB error: ${assetErr.message}`, 'error'); return; }

    // Update property_asset_relations to point to new asset
    const { data: existingRels } = await supabase
      .from('property_asset_relations')
      .select('id, offering_id')
      .eq('asset_id', uploadTarget.id);

    if (existingRels && existingRels.length > 0) {
      const { error: relErr } = await supabase
        .from('property_asset_relations')
        .update({ asset_id: newAsset.id, updated_at: new Date().toISOString() })
        .in('id', existingRels.map(r => r.id));
      if (relErr) console.error('Relation update error (non-fatal):', relErr);
    }

    // Archive old asset
    await supabase.from('assets').update({ ingestion_status: 'archived' }).eq('id', uploadTarget.id);
    setUploadTarget(null);
    toast('Image replaced successfully', 'success');
    load();
  };

  const linkedOffering = (row) => {
    const rels = row.offering_relations || [];
    if (!rels.length) return '—';
    return rels.map(r => `#${r.offering_id}`).join(', ');
  };

  const columns = [
    { key: 'original_name', header: 'Filename', render: r => <span title={r.original_name}>{r.original_name || r.storage_path}</span> },
    { key: 'asset_type', header: 'Type', render: r => <StatusPill status={r.asset_type} /> },
    { key: 'mime_type', header: 'MIME', render: r => <code style={{ fontSize: 11 }}>{r.mime_type}</code> },
    { key: 'size_bytes', header: 'Size', render: r => <span style={{ whiteSpace: 'nowrap' }}>{formatBytes(r.size_bytes)}</span> },
    { key: 'storage_bucket', header: 'Bucket', render: r => <code>{r.storage_bucket}</code> },
    { key: 'linked_offering', header: 'Linked Offering', render: r => <span>{linkedOffering(r)}</span> },
    { key: 'ingestion_status', header: 'Status', render: r => <StatusPill status={r.ingestion_status} /> },
    { key: 'source_path', header: 'Source Path', render: r => <span title={r.source_path} style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' }}>{r.source_path || '—'}</span> },
    { key: 'created_at', header: 'Created', render: r => new Date(r.created_at).toLocaleString() },
    {
      key: 'actions',
      header: 'Actions',
      render: r => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {r.ingestion_status !== 'archived' && (
            <button className="admin-btn admin-btn-sm" onClick={() => setConfirm({ type: 'archive', row: r })}>
              Archive
            </button>
          )}
          {r.asset_type === 'image' && (
            <button className="admin-btn admin-btn-sm admin-btn-primary" onClick={() => setUploadTarget(r)}>
              Replace
            </button>
          )}
          <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => setConfirm({ type: 'delete', row: r })}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Asset Manager | APG Admin</title></Helmet>
      <div className="admin-page-header">
        <h1>Asset Manager</h1>
      </div>

      <div className="admin-filters" style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: 6, borderRadius: 4 }}>
          <option value="">All types</option>
          {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: 6, borderRadius: 4 }}>
          <option value="">All statuses</option>
          {INGESTION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="admin-btn" onClick={load}><i className="fa-solid fa-rotate-right" /> Refresh</button>
      </div>

      <DataTable columns={columns} data={rows} loading={loading} emptyMessage="No assets found." />

      {confirm && (
        <ConfirmDialog
          title={confirm.type === 'delete' ? 'Delete asset permanently?' : 'Archive asset?'}
          message={
            confirm.type === 'delete'
              ? `This will delete "${confirm.row.original_name}" from storage and the database. This action cannot be undone.`
              : `This will mark "${confirm.row.original_name}" as archived.`
          }
          confirmLabel={confirm.type === 'delete' ? 'Delete' : 'Archive'}
          danger={confirm.type === 'delete'}
          onConfirm={() => confirm.type === 'delete' ? hardDelete(confirm.row) : archive(confirm.row)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {uploadTarget && (
        <div className="admin-dialog-overlay" onClick={() => setUploadTarget(null)}>
          <div className="admin-dialog-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h3>Replace image for "{uploadTarget.original_name}"</h3>
            <p style={{ marginBottom: 12, color: '#666' }}>
              Uploading a new file will create a new asset and link it to the same property. The old image will be archived.
            </p>
            <ImageUploader onUpload={handleUploadComplete} accept="image/*" />
            <button className="admin-btn" style={{ marginTop: 12 }} onClick={() => setUploadTarget(null)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}
