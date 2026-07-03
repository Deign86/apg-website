export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel, loading }) {
  if (!open) return null;
  return (
    <div className="admin-dialog-overlay" onClick={onCancel}>
      <div className="admin-dialog-box" onClick={e => e.stopPropagation()}>
        <h3>{title || 'Confirm'}</h3>
        <p>{message || 'Are you sure?'}</p>
        <div className="admin-dialog-actions">
          <button className="admin-btn admin-btn-secondary" onClick={onCancel} autoFocus>Cancel</button>
          <button className="admin-btn admin-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
