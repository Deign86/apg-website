import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function AdminNotFound() {
  return (
    <>
      <Helmet><title>404 | Alpha Premier Admin</title></Helmet>
      <div className="admin-error-page">
        <Compass className="size-14 text-[#E2B857]" aria-hidden="true" />
        <h1 className="text-balance">Page Not Found</h1>
        <p className="text-pretty">The admin page you're looking for doesn't exist or has been moved.</p>
        <Link to="/admin" className="admin-btn admin-btn-primary rounded-full bg-[#D4AF37] uppercase tracking-widest">Back to Dashboard</Link>
      </div>
    </>
  );
}
