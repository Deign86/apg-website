// Compact single-choice filter (status, view). options: [{ value, label, count? }]
export default function SegmentedControl({ label, options, value, onChange }) {
  return (
    <div className="admin-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="admin-seg-btn"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
          {o.count != null && <span className="admin-seg-count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
