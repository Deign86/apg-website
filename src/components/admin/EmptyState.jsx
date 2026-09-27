import { Database } from 'lucide-react';

export default function EmptyState({ icon: Icon = Database, title, subtitle, action }) {
  return (
    <div className="admin-empty-state">
      <span className="admin-empty-state-icon">
        <Icon size={18} aria-hidden="true" />
      </span>
      {title && <h3>{title}</h3>}
      {subtitle && <p>{subtitle}</p>}
      {action}
    </div>
  );
}
