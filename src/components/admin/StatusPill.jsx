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
  'admin': 'blue',
  'editor': 'grey',
  'superadmin': 'gold',
  'recruiter': 'green',
  'waiting_for_agent': 'red',
  'agent_active': 'green',
  'bot': 'blue',
  'closed': 'grey',
};

const toneCls = {
  gold: 'admin-pill-gold',
  green: 'admin-pill-green',
  red: 'admin-pill-red',
  blue: 'admin-pill-blue',
  grey: 'admin-pill-grey',
};

export default function StatusPill({ status, map }) {
  const merged = { ...colorMap, ...map };
  const color = merged[status] || 'grey';
  const label = String(status).replace(/_/g, ' ');
  return (
    <span className={`admin-pill ${toneCls[color]}`}>
      {label}
    </span>
  );
}
