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
  gold: 'border-[#D4AF37]/30 bg-[#D4AF37]/15 text-[#E2B857]',
  green: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300',
  red: 'border-red-400/30 bg-red-400/15 text-red-300',
  blue: 'border-sky-400/30 bg-sky-400/15 text-sky-300',
  grey: 'border-neutral-700 bg-neutral-800/60 text-neutral-300',
};

export default function StatusPill({ status, map }) {
  const merged = { ...colorMap, ...map };
  const color = merged[status] || 'grey';
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-widest ${toneCls[color]}`}>
      {status}
    </span>
  );
}
