import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';
import { CircleAlert, MailCheck, CheckCircle2 } from 'lucide-react';

const noticeStyle = { display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: '#a7f3d0' };
const linkBtn = { background: 'none', border: 0, padding: 0, color: '#D4AF37', fontSize: 13, cursor: 'pointer', alignSelf: 'center' };

async function postAuth(action, body) {
  const res = await fetch(`/api/admin/auth.php?action=${action}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success !== true) throw new Error(data.error || 'Something went wrong. Please try again.');
}

export default function Login() {
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  // login -> request (email) -> reset (code + new password) -> done -> login
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reset, setReset] = useState({ code: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (session) {
    navigate('/admin', { replace: true });
    return null;
  }

  const run = async (fn) => {
    setError('');
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const go = (next) => {
    setError('');
    setMode(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    run(async () => {
      await signIn(email, password);
      navigate('/admin');
    });
  };

  const requestCode = (e) => {
    e.preventDefault();
    run(async () => {
      await postAuth('reset-code', { email });
      setReset({ code: '', next: '', confirm: '' });
      setMode('reset');
    });
  };

  const resetPassword = (e) => {
    e.preventDefault();
    if (reset.next.length < 10) return setError('New password must be at least 10 characters.');
    if (reset.next !== reset.confirm) return setError('New passwords do not match.');
    run(async () => {
      await postAuth('reset', { code: reset.code, new_password: reset.next });
      setReset({ code: '', next: '', confirm: '' });
      setPassword('');
      setMode('done');
    });
  };

  const resetField = (key, label, props) => (
    <div className="admin-field">
      <label htmlFor={`reset-${key}`}>{label}</label>
      <input
        id={`reset-${key}`}
        type="password"
        value={reset[key]}
        onChange={e => setReset({ ...reset, [key]: e.target.value })}
        required
        {...props}
      />
    </div>
  );

  const emailField = (
    <div className="admin-field">
      <label htmlFor="admin-email">Email</label>
      <input
        id="admin-email"
        name="email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="admin@alphapremier.com"
        required
      />
    </div>
  );

  return (
    <>
      <Helmet><title>Admin Login | Alpha Premier</title></Helmet>
      <div className="admin-login">
        <div className="admin-login-card">
          <div className="admin-login-brand">
            <img
              src="/assets/images/logo2025.png"
              alt="Alpha Premier Group logo"
            />
            <h2>ALPHA PREMIER</h2>
            <p>{mode === 'login' || mode === 'done' ? 'Admin sign in' : 'Reset password'}</p>
          </div>
          <form
            onSubmit={mode === 'request' ? requestCode : mode === 'reset' ? resetPassword : handleSubmit}
            className="admin-form"
          >
            {error && (
              <div className="admin-login-error" role="alert">
                <CircleAlert size={15} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            {(mode === 'login' || mode === 'done') && (
              <>
                {mode === 'done' && (
                  <div role="status" style={noticeStyle}>
                    <CheckCircle2 size={15} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>Password updated. Sign in with your new password.</span>
                  </div>
                )}
                {emailField}
                <div className="admin-field">
                  <label htmlFor="admin-password">Password</label>
                  <input
                    id="admin-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button className="admin-btn admin-btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', marginTop: 4 }}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
                <button type="button" style={linkBtn} onClick={() => go('request')}>Forgot password?</button>
              </>
            )}

            {mode === 'request' && (
              <>
                <p style={{ fontSize: 13, color: '#a3a3a3', margin: 0 }}>
                  Enter your admin email. A 6-digit code will be sent to the company security inbox.
                </p>
                {emailField}
                <button className="admin-btn admin-btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', marginTop: 4 }}>
                  {loading ? 'Sending...' : 'Send code'}
                </button>
                <button type="button" style={linkBtn} onClick={() => go('login')}>Back to sign in</button>
              </>
            )}

            {mode === 'reset' && (
              <>
                <div role="status" style={noticeStyle}>
                  <MailCheck size={15} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>If {email} is an admin account, a code was sent to the company security inbox. It expires in 10 minutes.</span>
                </div>
                {resetField('code', '6-digit code', { type: 'text', inputMode: 'numeric', autoComplete: 'one-time-code', pattern: '\\d{6}', maxLength: 6 })}
                {resetField('next', 'New password (min. 10 characters)', { autoComplete: 'new-password', minLength: 10 })}
                {resetField('confirm', 'Confirm new password', { autoComplete: 'new-password' })}
                <button className="admin-btn admin-btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', marginTop: 4 }}>
                  {loading ? 'Saving...' : 'Reset password'}
                </button>
                <button type="button" style={linkBtn} onClick={() => go('request')}>Send a new code</button>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
