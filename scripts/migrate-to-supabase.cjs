// scripts/migrate-to-supabase.cjs — Apply Supabase schema migration
// Usage: node scripts/migrate-to-supabase.cjs
// Falls back to: supabase db push if this script fails

require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
const path = require('path');

async function main() {
  console.log('🚀 Alpha Premier Group — Schema Migration\n');
  console.log('Attempting supabase db push...\n');

  try {
    execSync('npx supabase db push', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env },
    });
    console.log('\n✅ Migration applied successfully.');
  } catch (err) {
    console.error('\n❌ supabase db push failed.');
    console.error('   Make sure the Supabase CLI is installed and you are logged in.');
    console.error('   Run: supabase login');
    console.error('   Run: supabase link --project-ref <your-ref>');
    console.error('   Then re-run: pnpm migrate-to-supabase');
    console.error('\n   Alternatively, open the Supabase SQL Editor and paste supabase/schema.sql.');
    process.exit(1);
  }
}

main();
