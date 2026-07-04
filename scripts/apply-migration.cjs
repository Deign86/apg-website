// scripts/apply-migration.cjs — Execute a SQL migration file against Supabase
// Usage: node scripts/apply-migration.cjs <migration-file>

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const https = require('https');

const filePath = process.argv[2];
if (!filePath) { console.error('Usage: node scripts/apply-migration.cjs <migration.sql>'); process.exit(1); }

const sql = fs.readFileSync(filePath, 'utf8').trim();
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) { console.error('SUPABASE_ACCESS_TOKEN not set in .env.local'); process.exit(1); }

console.log('Migration:', filePath);
console.log('SQL length:', sql.length, 'chars');

// Split on semicolons followed by newline, keeping comments attached to their statements
const statements = [];
let current = '';
for (const line of sql.split('\n')) {
  const trimmed = line.trim();
  // If line is a comment, add it to current statement
  if (trimmed.startsWith('--')) {
    current += line + '\n';
    continue;
  }
  current += line + '\n';
  // If line ends with semicolon, it's the end of a statement
  if (trimmed.endsWith(';')) {
    statements.push(current.trim());
    current = '';
  }
}
if (current.trim()) statements.push(current.trim());

console.log('Statements:', statements.length);

async function runQuery(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: '/v1/projects/ldtavdybcgwjgticrymz/database/query',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  let success = 0;
  let failed = [];

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.split('\n').pop().trim().substring(0, 80);
    console.log(`[${i+1}/${statements.length}] ${preview}`);

    const result = await runQuery(stmt);
    if (result.status === 201 || result.status === 200) {
      console.log('  OK');
      if (result.body && result.body !== '[]') {
        try { const rows = JSON.parse(result.body); console.log('    ->', JSON.stringify(rows, null, 2).substring(0, 500)); }
        catch { console.log('    ->', result.body.substring(0, 300)); }
      }
      success++;
    } else {
      console.log('  FAIL (' + result.status + '):', result.body.substring(0, 300));
      failed.push(i + 1);
    }
  }

  console.log(`\nDone: ${success} succeeded, ${failed.length} failed`);
  if (failed.length > 0) {
    console.log('Failed statements:', failed.join(', '));
    process.exit(1);
  }
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });

