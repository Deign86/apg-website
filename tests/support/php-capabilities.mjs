// Parses adminCapabilities() out of api/config.php, the server's RBAC source of truth, so tests
// derive expectations from the server instead of a hand-copied table.
import fs from 'node:fs';
import { ROOT } from './env.mjs';
import path from 'node:path';

export function phpCapabilities() {
  const php = fs.readFileSync(path.join(ROOT, 'api/config.php'), 'utf8');
  const body = php.match(/function adminCapabilities\(\)\s*\{\s*return \[([\s\S]*?)\n\s*\];/);
  if (!body) throw new Error('adminCapabilities() not found in api/config.php');
  const map = {};
  for (const m of body[1].matchAll(/'([a-z_]+)'\s*=>\s*\[([^\]]*)\]/g)) {
    map[m[1]] = [...m[2].matchAll(/'([a-z]+)'/g)].map((r) => r[1]);
  }
  return map;
}
