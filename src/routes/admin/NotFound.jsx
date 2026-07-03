import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function AdminNotFound() {
  return (
    <>
      <Helmet><title>404 | Alpha Premier Admin</title></Helmet>
      <div className="admin-error-page">
        <i className="fa-solid fa-compass" style={{ fontSize: 56, color: '#c5a059' }} />
        <h1>Page Not Found</h1>
        <p>The admin page you're looking for doesn't exist or has been moved.</p>
        <Link to="/admin" className="admin-btn admin-btn-primary">Back to Dashboard</Link>
      </div>
    </>
  );
}
