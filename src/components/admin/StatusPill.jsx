const colorMap = {
  'FOR_SALE': 'gold',
  'FOR_LEASE': 'grey',
  'Available': 'green',
  'Sold': 'red',
  'Closed': 'grey',
  'Draft': 'grey',
  'Published': 'green',
  'Featured': 'gold',
  'Active': 'green',
  'Inactive': 'red',
  'Archived': 'grey',
  'new': 'gold',
  'contacted': 'gold',
  'qualified': 'green',
  'won': 'gold',
  'lost': 'red',
  'draft': 'grey',
  'published': 'green',
  'admin': 'grey',
  'editor': 'grey',
  'superadmin': 'gold',
  'recruiter': 'green',
  'waiting_for_agent': 'red',
  'agent_active': 'green',
  'bot': 'grey',
  'closed': 'grey',
};

const toneCls = {
  gold: 'admin-pill-gold',
  green: 'admin-pill-green',
  red: 'admin-pill-red',
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
