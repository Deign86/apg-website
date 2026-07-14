// scripts/seed-job-openings.mjs
// Seeds the job_openings table with the 3 fallback careers openings.
// Run: node scripts/seed-job-openings.mjs
// Requires SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL in .env.local

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const jobs = [
  { title: 'Real Estate Consultant', location: 'Makati City', type: 'Full-time', tag: 'Commission Based', status: 'active' },
  { title: 'Property Manager', location: 'BGC, Taguig', type: 'Full-time', tag: '2+ Years Exp', status: 'active' },
  { title: 'Marketing Associate', location: 'Quezon City', type: 'Part-time', tag: 'Digital Marketing', status: 'active' },
];

async function seed() {
  const { count, error: countErr } = await supabase
    .from('job_openings')
    .select('*', { count: 'exact', head: true });

  if (countErr) {
    console.error('Error checking job_openings:', countErr.message);
    process.exit(1);
  }

  if (count > 0) {
    console.log(`job_openings already has ${count} rows — skipping seed.`);
    process.exit(0);
  }

  const { error } = await supabase.from('job_openings').insert(jobs);
  if (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }

  console.log(`Seeded ${jobs.length} job openings.`);

  // Also seed careers hero settings if they don't exist
  const heroSettings = [
    { key: 'careers_hero_title', value: 'Join Our Elite Team' },
    { key: 'careers_hero_subtitle', value: 'Shape the future of premier real estate with Alpha Premier Group. We are looking for high-caliber individuals to lead the industry.' },
  ];

  // Check which hero settings are missing
  const { data: existing } = await supabase
    .from('site_settings')
    .select('key')
    .in('key', heroSettings.map(s => s.key));

  const existingKeys = new Set((existing || []).map(s => s.key));
  const missing = heroSettings.filter(s => !existingKeys.has(s.key));

  if (missing.length) {
    const { error: hsErr } = await supabase.from('site_settings').insert(missing);
    if (hsErr) {
      console.error('Warning: could not seed hero settings:', hsErr.message);
    } else {
      console.log(`Seeded ${missing.length} careers hero setting(s).`);
    }
  } else {
    console.log('Careers hero settings already exist — skipping.');
  }

  process.exit(0);
}

seed();
