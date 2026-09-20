// RED style-contract: admin MUST align with site tokens. All 4 fail on current code.
// Run: node --test src/routes/admin/__tests__/site-alignment.test.jsx
// Will pass after restyle WITHOUT changing these assertions. No production edits.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const ADMIN_DIR = path.join(REPO_ROOT, 'src/routes/admin');
const COMPONENTS_ADMIN_DIR = path.join(REPO_ROOT, 'src/components/admin');

function readTree(dir, seen = new Set()) {
  const real = fs.realpathSync(dir);
  if (seen.has(real)) return '';
  seen.add(real);
  let out = '';
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__tests__') continue; // exclude this contract file: it names the tokens
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out += readTree(full, seen);
    else if (/\.(jsx|js|css)$/.test(entry.name)) out += '\n' + fs.readFileSync(full, 'utf8');
  }
  return out;
}

const adminSrc = readTree(ADMIN_DIR) + readTree(COMPONENTS_ADMIN_DIR);
const adminCss = fs.readFileSync(path.join(ADMIN_DIR, 'admin.css'), 'utf8');
const layoutSrc = fs.readFileSync(
  path.join(COMPONENTS_ADMIN_DIR, 'AdminLayout.jsx'),
  'utf8',
);
const loginSrc = fs.readFileSync(path.join(ADMIN_DIR, 'Login.jsx'), 'utf8');

describe('admin ↔ site style alignment (RED contract)', () => {
  it('ALIGN-SHELL: admin shell uses site shell token bg-[#0A0803]', () => {
    assert.ok(
      adminSrc.includes('bg-[#0A0803]') || adminCss.includes('#0A0803'),
      'RED: admin shell missing site token bg-[#0A0803] (AdminLayout/admin.css still use #000/#111)',
    );
    assert.ok(
      layoutSrc.includes('bg-[#0A0803]'),
      'RED: AdminLayout.jsx must render shell with bg-[#0A0803]',
    );
  });

  it('ALIGN-TOKENS: cards bg-[#120E05]/90 border-[#D4AF37]/30 rounded-2xl, buttons bg-[#D4AF37] rounded-full, gold #D4AF37', () => {
    for (const token of [
      'bg-[#120E05]/90',
      'border-[#D4AF37]/30',
      'rounded-2xl',
      'bg-[#D4AF37]',
      'rounded-full',
      '#D4AF37',
    ]) {
      assert.ok(
        adminSrc.includes(token),
        `RED: admin missing site token "${token}" (still on #c5a059/#12141c/#232738)`,
      );
    }
  });

  it('ALIGN-ICONS: zero fa-solid, lucide-react present', () => {
    assert.ok(
      !adminSrc.includes('fa-solid'),
      `RED: admin still uses fa-solid (${adminSrc.split('fa-solid').length - 1} occurrences; must be 0)`,
    );
    assert.ok(
      adminSrc.includes('lucide-react'),
      'RED: admin must import icons from lucide-react',
    );
    assert.ok(
      loginSrc.includes('lucide-react') && !loginSrc.includes('fa-solid'),
      'RED: Login.jsx must use lucide-react, not fa-solid',
    );
  });

  it('ALIGN-INPUTS: inputs bg-black/80 focus:border-[#D4AF37] rounded-xl', () => {
    for (const token of ['bg-black/80', 'focus:border-[#D4AF37]', 'rounded-xl']) {
      assert.ok(
        adminSrc.includes(token),
        `RED: admin inputs missing site token "${token}" (still var(--admin-surface-2)/#2a2a2a)`,
      );
    }
  });
});
