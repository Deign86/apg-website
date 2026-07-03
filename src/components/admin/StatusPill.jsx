const colorMap = {
  'FOR_SALE': 'gold',
  'FOR_LEASE': 'blue',
  'Available': 'green',
  'Sold': 'red',
  'Closed': 'grey',
  'Draft': 'grey',
  'Published': 'green',
  'Featured': 'gold',
  'Active': 'green',
  'Inactive': 'red',
  'Archived': 'grey',
  'new': 'blue',
  'contacted': 'gold',
  'qualified': 'green',
  'won': 'gold',
  'lost': 'red',
  'draft': 'grey',
  'published': 'green',
  'owner': 'gold',
  'admin': 'blue',
  'editor': 'grey',
};

export default function StatusPill({ status, map }) {
  const merged = { ...colorMap, ...map };
  const color = merged[status] || 'grey';
  return <span className={`admin-pill admin-pill-${color}`}>{status}</span>;
}
