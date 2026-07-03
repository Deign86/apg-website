import StatusPill from './StatusPill';

export default function StatCard({ icon, label, value, delta }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">
        <i className={`fa-solid ${icon}`} />
      </div>
      <div>
        <div className="admin-card-header">{label}</div>
        <div className="admin-card-value">{value ?? '—'}</div>
        {delta !== undefined && delta !== null && (
          <div className={`admin-card-delta ${delta >= 0 ? 'up' : 'down'}`}>
            <i className={`fa-solid ${delta >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}`} />
            {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}
