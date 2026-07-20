// scripts/seed-archived-context.mjs
// Seeds the archived_context table with approved summaries extracted from .old_site/
// Run: node scripts/seed-archived-context.mjs
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

const archivedData = [
  {
    section: 'about', title: 'Company Overview', priority: 10,
    summary: 'Alpha Premier Group of Companies OPC is a Philippine conglomerate that brings together companies through strategic partnerships across industries including real estate, cleaning services, construction, and talent management. The group focuses on innovation, excellence, and strategic partnerships to create lasting value.',
  },
  {
    section: 'about', title: 'Mission', priority: 9,
    summary: 'To create lasting value through strategic partnerships and innovation, fostering a collaborative approach across diverse industries.',
  },
  {
    section: 'about', title: 'Vision', priority: 9,
    summary: 'To be a leading global conglomerate, renowned for uniting industries, inspiring innovation, and shaping the future through sustainable and transformative business solutions.',
  },
  {
    section: 'about', title: 'Core Values', priority: 9,
    summary: 'Innovation, collaboration, integrity, transparency, accountability, sustainability, adaptability, diversity, and inclusion.',
  },
  {
    section: 'services', title: 'Service Lines', priority: 8,
    summary: 'Alpha Premier Group operates two main service divisions: (1) Swift Clear Cleaning Services; (2) Alpha Premier Realty and Construction — real estate, property leasing, and construction services.',
  },
  {
    section: 'realty', title: 'Alpha Premier Realty Overview', priority: 8,
    summary: 'Alpha Premier Realty and Construction Services provides residential, commercial, and industrial property solutions including condominiums, office spaces, warehouse spaces, and virtual offices.',
  },
  {
    section: 'realty', title: 'Why Choose Alpha Premier Realty', priority: 7,
    summary: 'Client-focused approach with flexible lease terms, cost-effective solutions, prime locations for accessibility, and outstanding customer service for startups, businesses, and individuals.',
  },
  {
    section: 'realty', title: 'Realty Property Types', priority: 7,
    summary: 'Alpha Premier Realty offers: condominiums, office spaces, warehouse spaces, and virtual offices at Ortigas.',
  },
  {
    section: 'realty', title: 'Virtual Office', priority: 7,
    summary: 'Alpha Premier Virtual Office at Ortigas provides premium business addresses and flexible workspace solutions for startups, remote businesses, and companies needing a professional presence.',
  },
  {
    section: 'construction', title: 'Alpha Premier Construction Overview', priority: 8,
    summary: 'Alpha Premier Construction offers high-quality PVC board panel products and WPC Fluted Panels for residential and commercial flooring and walling. Tagline: "Your Vision, Our Precision."',
  },
  {
    section: 'construction', title: 'Construction Products', priority: 7,
    summary: 'PVC board panels and WPC Fluted Panels for flooring and walling — easy maintenance, cost-effective, variety of colors and patterns, quick installation. Also supplies HVAC brands: Midea, Koppel, Daikin, Tosot, Mitsubishi, Samsung, Carrier, Gree, LG.',
  },
  {
    section: 'swift_clear', title: 'Swift Clear Overview', priority: 8,
    summary: 'Swift Clear Cleaning and Disinfecting Services specializes in disinfection, deep cleaning, floor care, and decluttering. Staff are NCII-trained professionals with full PPE. Tagline: "It matters. It\'s about safety, protection & saving lives."',
  },
  {
    section: 'swift_clear', title: 'Swift Clear Services', priority: 7,
    summary: 'Services: disinfection, air fumigation, cold fogging, deep cleaning, steam cleaning, UV sanitizing, floor scrubbing/polishing/waxing, decluttering, carpet cleaning. Uses organic disinfectants killing 99.99% of germs.',
  },
  {
    section: 'swift_clear', title: 'Swift Clear Contact', priority: 6,
    summary: 'Swift Clear contact: Phone 8-650 2540 / 0935 334 8853, Email siftcleardes@gmail.com, Facebook: Swift Clear Cleaning & Disinfecting Services.',
  },
  {
    section: 'contact', title: 'Office Location (Archived)', priority: 8,
    summary: 'Alpha Premier Group was listed at Unit 3104C, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City. (Confirm current address with the team.)',
  },
  {
    section: 'contact', title: 'Legacy Contact Numbers', priority: 7,
    summary: 'Archived contacts: 0915 888 9482, 02 8 650 2540, +63 927 555 5803. Email: thealphapremiergroup@gmail.com. (Current contact details may differ.)',
  },
  {
    section: 'subsidiaries', title: 'Dynamic Tree', priority: 6,
    summary: 'Dynamic Tree is an Alpha Premier Group subsidiary offering modeling and talent management services.',
  },
  {
    section: 'contact', title: 'Social Media (Archived)', priority: 6,
    summary: 'Facebook: facebook.com/alphapremierRealty (Alpha Premier Realty By: M.A Santos Group); Instagram: alphapremier_rec; TikTok: alphapremierr; Linktree: linktr.ee/alphapremierr.',
  },
];



async function seed() {
  const { count, error: countErr } = await supabase
    .from('archived_context')
    .select('*', { count: 'exact', head: true });

  if (countErr) {
    console.error('Error checking archived_context:', countErr.message);
    process.exit(1);
  }

  if (count > 0) {
    console.log(`archived_context already has ${count} rows — skipping seed.`);
    process.exit(0);
  }

  const { error } = await supabase.from('archived_context').insert(archivedData);
  if (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }

  console.log(`Seeded ${archivedData.length} archived context entries.`);
  process.exit(0);
}

seed();
