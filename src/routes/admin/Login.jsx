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
      <div
        className="admin-loading-screen bg-[#0A0803] text-neutral-100"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        <div className="w-[90%] max-w-[400px] rounded-2xl border border-[#D4AF37]/30 bg-[#120E05]/90 p-8">
          <div className="mb-8 text-center">
            <img
              src="/assets/images/logo2025.png"
              alt="Alpha Premier Group logo"
              className="mx-auto mb-4 h-16 w-auto"
            />
            <h2 className="mb-1 text-balance text-[#E2B857]" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
              ALPHA PREMIER
            </h2>
            <p className="m-0 text-sm text-neutral-400">Admin Panel</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500 bg-[#3a1a1a] p-2.5 text-sm text-red-200" role="alert">
                <CircleAlert size={16} aria-hidden="true" className="shrink-0" />
                {error}
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
                className="rounded-xl border-neutral-800 bg-black/80 focus:border-[#D4AF37]"
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
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                required
                className="rounded-xl border-neutral-800 bg-black/80 focus:border-[#D4AF37]"
              />
            </div>
            <button
              className="admin-btn admin-btn-primary rounded-full bg-[#D4AF37] uppercase tracking-widest hover:bg-[#FFF3D1]"
              type="submit"
              disabled={loading}
              style={{ justifyContent: 'center', padding: 12 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
