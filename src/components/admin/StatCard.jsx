import { TrendingDown, TrendingUp } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, delta }) {
  const positive = delta >= 0;
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">
        {Icon ? <Icon size={18} aria-hidden="true" /> : null}
      </div>
      <div>
        <div className="admin-card-header">{label}</div>
        <div className="admin-card-value">{value ?? '-'}</div>
        {delta !== undefined && delta !== null && (
          <div className={`admin-card-delta tabular-nums ${positive ? 'up' : 'down'}`}>
            {positive
              ? <TrendingUp size={12} aria-hidden="true" />
              : <TrendingDown size={12} aria-hidden="true" />}
            {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}
