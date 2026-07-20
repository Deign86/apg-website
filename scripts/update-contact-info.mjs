// scripts/update-contact-info.mjs — one-off: write official contact details
// into the live Supabase (site_settings + a high-priority chatbot_kb row).
// Non-destructive: site_settings rows are updated by key (inserted if absent);
// the KB row is INSERTED at priority 5 so it outranks any stale seeded
// 'contact' row (getKeywordReply iterates KB by priority DESC). Re-runnable.
import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const PHONE = '0915 888 9482 / 02 8 650 2540';
const EMAIL = 'contact@alphapremier.com';
const ADDRESS = 'Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City';
const FB = 'https://www.facebook.com/alphapremierRealty';
const KB_TRIGGER = 'contact,email,phone,address,located,facebook,fb';
const KB_ANSWER = `You can reach Alpha Premier at ${PHONE}, or email ${EMAIL}. Our office is at ${ADDRESS}. Facebook: ${FB}`;

async function setSetting(k, v) {
  const { data: existing } = await supabase.from('site_settings').select('key').eq('key', k).limit(1);
  if (existing && existing.length) {
    const { error } = await supabase.from('site_settings').update({ value: v }).eq('key', k);
    console.log(error ? `  X ${k}: ${error.message}` : `  + ${k} = ${v}`);
  } else {
    const { error } = await supabase.from('site_settings').insert({ key: k, value: v });
    console.log(error ? `  X ${k}: ${error.message}` : `  + ${k} = ${v} (inserted)`);
  }
}

async function main() {
  console.log('Updating site_settings...');
  await setSetting('company_phone', PHONE);
  await setSetting('company_email', EMAIL);
  await setSetting('company_address', ADDRESS);
  await setSetting('social_facebook', FB);

  console.log('\nEnsuring high-priority contact KB row...');
  const { data: kbExisting } = await supabase
    .from('chatbot_kb')
    .select('id')
    .eq('trigger', KB_TRIGGER)
    .limit(1);
  if (kbExisting && kbExisting.length) {
    const { error } = await supabase
      .from('chatbot_kb')
      .update({ answer: KB_ANSWER, priority: 5, active: true })
      .eq('trigger', KB_TRIGGER);
    console.log(error ? `  X KB: ${error.message}` : '  + KB row already present (updated)');
  } else {
    const { error } = await supabase.from('chatbot_kb').insert({
      trigger: KB_TRIGGER,
      answer: KB_ANSWER,
      priority: 5,
      active: true,
    });
    console.log(error ? `  X KB: ${error.message}` : '  + KB row inserted (priority 5)');
  }

  console.log('\nVerifying...');
  const { data: s } = await supabase
    .from('site_settings')
    .select('key,value')
    .in('key', ['company_phone', 'company_email', 'company_address', 'social_facebook']);
  console.log('  settings:', JSON.stringify(s, null, 2));
  const { data: kb } = await supabase
    .from('chatbot_kb')
    .select('trigger,priority,active')
    .eq('active', true)
    .order('priority', { ascending: false })
    .limit(6);
  console.log('  top KB rows:', JSON.stringify(kb, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
