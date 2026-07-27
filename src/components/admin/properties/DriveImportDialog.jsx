import { useState } from 'react';
import { commitDriveImport, previewDriveImport } from '@/lib/adminApi';

export default function DriveImportDialog({ onClose, onCommitted, toast }) {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [cover, setCover] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const previewFolder = async (event) => {
    event.preventDefault(); setLoading(true); setError(null);
    try {
      const result = await previewDriveImport(input.trim());
      setPreview(result); setSelected(new Set(result.mediaManifest.filter((file) => file.selected).map((file) => file.fileId))); setCover(result.proposedCoverFileId || '');
    } catch (previewError) { setError(previewError.message); } finally { setLoading(false); }
  };

  const commit = async () => {
    if (!preview) return;
    if (preview.operation === 'requires_published_confirmation' && !window.confirm('This listing is published. Replace its metadata and gallery only after the complete selected import succeeds?')) return;
    setLoading(true); setError(null);
    try {
      const result = await commitDriveImport({ driveFolderId: preview.folder.id, mode: preview.operation === 'requires_published_confirmation' ? 'update_published_listing' : 'create_draft_or_update_draft', selectedFileIds: [...selected], coverFileId: cover || null, metadataOverrides: {} });
      toast(result.status === 'completed' ? 'Drive import committed as draft' : `Drive import ${result.status}`, result.status === 'completed' ? 'success' : 'error'); onCommitted(result); onClose();
    } catch (commitError) { setError(commitError.message); } finally { setLoading(false); }
  };

  const toggle = (id) => setSelected((previous) => { const next = new Set(previous); next.has(id) ? next.delete(id) : next.add(id); return next; });
  return <div className="admin-dialog-overlay" onClick={onClose}>
    <div className="admin-dialog-box drive-import-dialog" onClick={(event) => event.stopPropagation()}>
      <div className="admin-page-header"><h3>Import property folder</h3><button type="button" className="admin-btn admin-btn-ghost" onClick={onClose} aria-label="Close"><i className="fa-solid fa-xmark" /></button></div>
      <form className="admin-form" onSubmit={previewFolder}><div className="admin-field"><label>Google Drive folder URL or ID</label><input value={input} required placeholder="https://drive.google.com/drive/folders/..." onChange={(event) => setInput(event.target.value)} /></div><button className="admin-btn admin-btn-secondary" type="submit" disabled={loading}>{loading ? 'Reading Drive...' : 'Preview folder'}</button></form>
      {error && <p className="admin-error-text">{error}</p>}
      {preview && <div className="drive-import-preview"><p><strong>{preview.folder.name}</strong> · {preview.operation.replaceAll('_', ' ')}</p><div className="drive-import-meta"><span>Title: {preview.metadata.title || 'Missing'}</span><span>Status: {preview.metadata.status || 'Missing'}</span><span>Location: {preview.metadata.location || 'Missing'}</span><span>Transaction: {preview.metadata.transaction_type || 'Missing'}</span></div>{preview.validation.warnings?.length > 0 && <p className="admin-warning-text">Warnings: {preview.validation.warnings.join(', ')}</p>}{preview.validation.errors?.length > 0 && <p className="admin-error-text">Errors: {preview.validation.errors.join(', ')}</p>}<h4>Detected media</h4><div className="drive-import-files">{preview.mediaManifest.map((file) => <label key={file.fileId}><input type="checkbox" checked={selected.has(file.fileId)} onChange={() => toggle(file.fileId)} /> <span>{file.name}</span><small>{file.inferredType} · {file.sizeBytes ? `${Math.round(file.sizeBytes / 1024)} KB` : 'size unknown'}</small>{file.inferredType === 'image' && <button type="button" className={`admin-btn admin-btn-ghost admin-btn-sm ${cover === file.fileId ? 'active' : ''}`} onClick={() => setCover(file.fileId)} title="Set cover"><i className="fa-solid fa-star" /></button>}</label>)}</div><div className="admin-dialog-actions"><button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button><button type="button" className="admin-btn admin-btn-primary" onClick={commit} disabled={loading || !selected.size || preview.validation.errors?.length > 0}>{loading ? 'Importing...' : 'Commit as draft'}</button></div></div>}
    </div>
  </div>;
}
