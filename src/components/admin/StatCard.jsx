import { TrendingDown, TrendingUp } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, delta }) {
  const positive = delta >= 0;
  return (
    <div className="admin-stat-card rounded-2xl border border-[#D4AF37]/30 bg-[#120E05]/90">
      <div className="admin-stat-icon rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/15 text-[#E2B857]">
        {Icon ? <Icon className="size-5" aria-hidden="true" /> : null}
      </div>
      <div>
        <div className="admin-card-header text-balance">{label}</div>
        <div className="admin-card-value tabular-nums">{value ?? '—'}</div>
        {delta !== undefined && delta !== null && (
          <div className={`admin-card-delta tabular-nums ${positive ? 'up' : 'down'}`}>
            {positive
              ? <TrendingUp className="size-3" aria-hidden="true" />
              : <TrendingDown className="size-3" aria-hidden="true" />}
            {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}
