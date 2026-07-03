import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';

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
      <div className="admin-loading-screen">
        <div style={{ maxWidth: 400, width: '90%' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Orbitron, sans-serif', color: '#c5a059', letterSpacing: 2, margin: '0 0 4px' }}>
              ALPHA PREMIER
            </h2>
            <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>Admin Panel</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div style={{ padding: 10, borderRadius: 6, background: '#3a1a1a', border: '1px solid #e74c3c', color: '#f5a5a5', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />
                {error}
              </div>
            )}
            <div className="admin-field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@alphapremier.com" required />
            </div>
            <div className="admin-field">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;" required />
            </div>
            <button className="admin-btn admin-btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', padding: 12 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
