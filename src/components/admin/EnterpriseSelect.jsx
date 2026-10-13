import { ENTERPRISE_TABS } from '@/data/enterprises';

// Enterprise scope filter. Ten company names don't fit a tab row, so it's a
// select; countFor(slug) adds the row count to each option.
export default function EnterpriseSelect({ value, onChange, countFor, allLabel = 'All enterprises' }) {
  return (
    <select
      className={`admin-select${value !== 'all' ? ' is-filtered' : ''}`}
      aria-label="Filter by enterprise"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {ENTERPRISE_TABS.map((ent) => (
        <option key={ent.slug} value={ent.slug}>
          {ent.slug === 'all' ? allLabel : ent.name}
          {countFor ? ` (${countFor(ent.slug)})` : ''}
        </option>
      ))}
    </select>
  );
}
