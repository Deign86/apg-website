import { useCallback, useEffect, useState } from 'react';
import { Upload } from 'tus-js-client';
import { supabase } from '@/lib/supabase';
import { completeAssetUpload, createAssetUploadIntent, orderOfferingAssets, removeOfferingAssetRelation } from '@/lib/adminApi';
import { getPublicUrl } from '@/hooks/usePropertyGallery';

const TUS_THRESHOLD = 6 * 1024 * 1024;

function uploadResumable(file, intent, session, onProgress) {
  return new Promise((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/upload/resumable`,
      retryDelays: [0, 1000, 3000, 5000],
      headers: { authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
      metadata: { bucketName: intent.bucket, objectName: intent.path, contentType: file.type, cacheControl: '31536000' },
      uploadSize: file.size,
      onError: reject,
      onProgress: (bytes, total) => onProgress(Math.round((bytes / total) * 100)),
      onSuccess: resolve,
    });
    upload.start();
  });
}

export default function PropertyGalleryManager({ offeringId, canEdit = true }) {
  const [rows, setRows] = useState([]);
  const [urls, setUrls] = useState({});
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({});
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!offeringId) return setRows([]);
    const { data, error: loadError } = await supabase.from('property_asset_relations').select('*, asset:assets(*)').eq('offering_id', offeringId).order('display_order', { ascending: true });
    if (loadError) setError(loadError.message); else {
      setRows(data || []);
      const resolved = {};
      for (const row of data || []) {
        if (!row.asset?.storage_path) continue;
        if (row.asset.storage_bucket === 'apg-private') {
          const signed = await supabase.storage.from('apg-private').createSignedUrl(row.asset.storage_path, 300);
          if (!signed.error) resolved[row.id] = signed.data.signedUrl;
        } else resolved[row.id] = getPublicUrl(row.asset);
      }
      setUrls(resolved);
    }
  }, [offeringId]);

  useEffect(() => { load(); }, [load]);

  const uploadFiles = async (files) => {
    setBusy(true); setError(null);
    const session = (await supabase.auth.getSession())?.data?.session;
    if (!session) { setError('Sign in is required to upload assets'); setBusy(false); return; }
    for (const file of files) {
      try {
        setProgress((previous) => ({ ...previous, [file.name]: 0 }));
        const intent = await createAssetUploadIntent(offeringId, file);
        if (intent.resumable || file.size > TUS_THRESHOLD) await uploadResumable(file, intent, session, (value) => setProgress((previous) => ({ ...previous, [file.name]: value })));
        else {
          const result = await supabase.storage.from(intent.bucket).uploadToSignedUrl(intent.path, intent.token, file, { contentType: file.type, cacheControl: '31536000' });
          if (result.error) throw result.error;
          setProgress((previous) => ({ ...previous, [file.name]: 100 }));
        }
        await completeAssetUpload(offeringId, { assetId: intent.assetId, path: intent.path, fileName: file.name, mimeType: file.type, sizeBytes: file.size });
      } catch (uploadError) {
        setError(`${file.name}: ${uploadError.message}`);
      }
    }
    await load(); setBusy(false);
  };

  const setCover = async (relationId) => {
    const items = rows.map((row) => ({ assetId: row.asset_id, isCover: row.id === relationId }));
    await orderOfferingAssets(offeringId, items); await load();
  };

  const move = async (index, delta) => {
    const next = [...rows]; const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    await orderOfferingAssets(offeringId, next.map((row, order) => ({ assetId: row.asset_id, isCover: Boolean(row.is_cover), displayOrder: order })));
    await load();
  };

  const remove = async (row) => {
    if (!window.confirm(`Remove ${row.asset?.original_name || 'this asset'} from the gallery?`)) return;
    await removeOfferingAssetRelation(offeringId, row.id); await load();
  };

  return <section className="property-gallery-manager">
    <div className="admin-section-header"><h4>Gallery and documents</h4>
      {canEdit && <label className="admin-btn admin-btn-secondary admin-btn-sm"><i className="fa-solid fa-upload" /> Upload<input type="file" hidden multiple accept="image/jpeg,image/png,image/webp,application/pdf" disabled={busy} onChange={(event) => { const files = [...event.target.files]; event.target.value = ''; if (files.length) uploadFiles(files); }} /></label>}
    </div>
    {error && <p className="admin-error-text">{error}</p>}
    {busy && <p className="admin-muted">Uploading: {Object.entries(progress).map(([name, value]) => `${name} ${value}%`).join(', ')}</p>}
    {!rows.length && <p className="admin-muted">No assets attached yet.</p>}
    <div className="property-gallery-grid">
      {rows.map((row, index) => {
        const image = row.asset?.mime_type?.startsWith('image/');
        return <article className="property-gallery-item" key={row.id}>
          {image ? <img src={urls[row.id] || ''} alt={row.asset?.original_name || ''} /> : <div className="property-gallery-pdf"><i className="fa-solid fa-file-pdf" /><span>{row.asset?.original_name}</span></div>}
          <div className="property-gallery-actions">
            {canEdit && <><button type="button" title="Move up" aria-label="Move up" onClick={() => move(index, -1)}><i className="fa-solid fa-arrow-up" /></button><button type="button" title="Move down" aria-label="Move down" onClick={() => move(index, 1)}><i className="fa-solid fa-arrow-down" /></button>{image && <button type="button" className={row.is_cover ? 'active' : ''} title="Set cover" onClick={() => setCover(row.id)}><i className="fa-solid fa-star" /></button>}<button type="button" title="Remove relation" aria-label="Remove relation" onClick={() => remove(row)}><i className="fa-solid fa-link-slash" /></button></>}
          </div>
        </article>;
      })}
    </div>
  </section>;
}
