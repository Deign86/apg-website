import { useModalDialog } from '@/hooks/useModalDialog';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel, cancelLabel, loading }) {
  // Escape cancels (not while the action runs), Tab stays inside, focus starts on the safe button.
  const ref = useModalDialog(!!open, () => { if (!loading) onCancel(); });
  if (!open) return null;
  return (
    <div className="admin-dialog-overlay" onClick={loading ? undefined : onCancel}>
      <div
        ref={ref}
        className="admin-dialog-box"
        role="alertdialog"
        aria-modal="true"
        aria-label={title || 'Confirm'}
        onClick={e => e.stopPropagation()}
      >
        <h3>{title || 'Confirm'}</h3>
        <p>{message || 'Are you sure?'}</p>
        <div className="admin-dialog-actions">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onCancel} disabled={loading}>{cancelLabel || 'Cancel'}</button>
          <button type="button" className="admin-btn admin-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
