export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel, loading }) {
  if (!open) return null;
  return (
    <div className="admin-dialog-overlay fixed inset-0 z-50 bg-black/90 backdrop-blur-md" onClick={onCancel}>
      <div
        className="admin-dialog-box rounded-3xl border border-[#D4AF37]/50 bg-[#0B0905]"
        role="alertdialog"
        aria-modal="true"
        aria-label={title || 'Confirm'}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-balance text-[#E2B857]">{title || 'Confirm'}</h3>
        <p className="text-pretty text-neutral-300">{message || 'Are you sure?'}</p>
        <div className="admin-dialog-actions">
          <button className="admin-btn admin-btn-secondary rounded-full uppercase tracking-widest" onClick={onCancel} autoFocus>Cancel</button>
          <button className="admin-btn admin-btn-danger rounded-full uppercase tracking-widest" onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
