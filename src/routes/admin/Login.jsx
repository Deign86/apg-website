import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';
import { CircleAlert } from 'lucide-react';

export default function Login() {
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (session) {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

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
            <p>Admin sign in</p>
          </div>
          <form onSubmit={handleSubmit} className="admin-form">
            {error && (
              <div className="admin-login-error" role="alert">
                <CircleAlert size={15} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}
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
          </form>
        </div>
      </div>
    </>
  );
}
