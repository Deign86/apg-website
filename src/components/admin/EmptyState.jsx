export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="admin-empty-state">
      <i className={`fa-solid ${icon || 'fa-database'}`} />
      {title && <h3>{title}</h3>}
      {subtitle && <p>{subtitle}</p>}
      {action}
    </div>
  );
}
