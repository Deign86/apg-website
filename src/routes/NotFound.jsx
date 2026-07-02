import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet><title>404 - Page Not Found</title></Helmet>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 5%',
      }}>
        <h1 style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--accent)', fontSize: '5rem', margin: 0 }}>404</h1>
        <h2 style={{ fontFamily: "'Orbitron', sans-serif", color: '#fff', margin: '10px 0 20px' }}>Oops! Looks like you're lost.</h2>
        <p style={{ color: '#999', marginBottom: '30px', maxWidth: '500px' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" style={{
          background: 'var(--accent)', color: '#000', padding: '14px 40px',
          borderRadius: '8px', textDecoration: 'none', fontWeight: 700,
          fontFamily: "'Orbitron', sans-serif", letterSpacing: '1px',
        }}>GO HOME</Link>
      </div>
    </>
  );
}
