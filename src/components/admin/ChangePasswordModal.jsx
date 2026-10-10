import { useState } from 'react';
import { TriangleAlert, CheckCircle2, MailCheck } from 'lucide-react';
import { useModalDialog } from '../../hooks/useModalDialog';

const inputCls = 'rounded-xl border-neutral-800 bg-black/80 focus:border-[#D4AF37]';
const primaryBtn = 'admin-btn admin-btn-primary rounded-full bg-[#D4AF37] uppercase tracking-widest';
const noticeCls = 'admin-alert flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-emerald-200';

async function post(action, body) {
  const res = await fetch(`/api/admin/auth.php?action=${action}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success !== true) throw new Error(data.error || 'Something went wrong. Please try again.');
}

/**
 * Change the signed-in admin's password in two steps: confirm the current password,
 * which emails a one-time code to the company security inbox, then enter that code
 * with the new password (api/admin/auth.php?action=password-code / password).
 */
export default function ChangePasswordModal({ onClose }) {
  const dialogRef = useModalDialog(true, onClose);
  const [step, setStep] = useState('verify'); // verify -> code -> done
  const [form, setForm] = useState({ current: '', code: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setError('');
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const requestCode = (e) => {
    e.preventDefault();
    run(async () => {
      await post('password-code', { current_password: form.current });
      setForm((f) => ({ ...f, current: '' }));
      setStep('code');
    });
  };

  const changePassword = (e) => {
    e.preventDefault();
    if (form.next.length < 10) return setError('New password must be at least 10 characters.');
    if (form.next !== form.confirm) return setError('New passwords do not match.');
    run(async () => {
      await post('password', { code: form.code, new_password: form.next });
      setForm({ current: '', code: '', next: '', confirm: '' });
      setStep('done');
    });
  };

  const field = (key, label, props = {}) => (
    <div className="admin-field">
      <label htmlFor={`pw-${key}`}>{label}</label>
      <input
        id={`pw-${key}`}
        type="password"
        className={inputCls}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        required
        {...props}
      />
    </div>
  );

  const errorBox = error && (
    <div className="admin-alert admin-alert-error" role="alert">
      <TriangleAlert className="size-4" aria-hidden="true" /> {error}
    </div>
  );

  return (
    <div className="admin-modal-overlay fixed inset-0 z-50 bg-black/90 backdrop-blur-md" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        className="admin-modal rounded-3xl border border-[#D4AF37]/50 bg-[#0B0905]"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440 }}
      >
        <div className="admin-modal-header">
          <h2 id="change-password-title" className="text-balance text-[#E2B857]">Change password</h2>
          <button className="admin-modal-close rounded-full border border-[#D4AF37]/30" aria-label="Close dialog" onClick={onClose}>&times;</button>
        </div>

        {step === 'verify' && (
          <form onSubmit={requestCode} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {errorBox}
            <p className="text-sm text-neutral-300">Confirm your current password. A verification code will be emailed to the company security inbox.</p>
            {field('current', 'Current password', { autoComplete: 'current-password' })}
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className={primaryBtn} disabled={busy}>{busy ? 'Sending...' : 'Email me a code'}</button>
            </div>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={changePassword} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className={noticeCls} role="status">
              <MailCheck className="size-4" aria-hidden="true" /> Code sent. It expires in 10 minutes.
            </div>
            {errorBox}
            {field('code', '6-digit code', { type: 'text', inputMode: 'numeric', autoComplete: 'one-time-code', pattern: '\\d{6}', maxLength: 6 })}
            {field('next', 'New password (min. 10 characters)', { autoComplete: 'new-password', minLength: 10 })}
            {field('confirm', 'Confirm new password', { autoComplete: 'new-password' })}
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => { setError(''); setStep('verify'); }}>Resend code</button>
              <button type="submit" className={primaryBtn} disabled={busy}>{busy ? 'Saving...' : 'Change password'}</button>
            </div>
          </form>
        )}

        {step === 'done' && (
          <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className={noticeCls} role="status">
              <CheckCircle2 className="size-4" aria-hidden="true" /> Your password has been changed.
            </div>
            <div className="admin-modal-footer">
              <button type="button" className={primaryBtn} onClick={onClose}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
