import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CAPABILITIES, roleCan } from '../../src/data/permissions.js';
import { phpCapabilities } from '../support/php-capabilities.mjs';

const ROLES = ['superadmin', 'admin', 'recruiter', 'editor'];
const read = (rel) => fs.readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');

describe('admin permissions parity (src/data/permissions.js <-> api/config.php)', () => {
  it('the client capability map equals adminCapabilities() in api/config.php', () => {
    assert.deepEqual(CAPABILITIES, phpCapabilities());
  });

  it('roleCan answers from the map and is false for unknown roles / capabilities', () => {
    for (const [cap, roles] of Object.entries(CAPABILITIES)) {
      for (const role of ROLES) assert.equal(roleCan(role, cap), roles.includes(role), `${role} ${cap}`);
    }
    assert.equal(roleCan('superadmin', 'nope'), false);
    assert.equal(roleCan('owner', 'blogs'), false);
    assert.equal(roleCan(undefined, 'blogs'), false);
    assert.equal(roleCan('superadmin', 'toString'), false);
  });

  it('every capability the admin UI gates on exists in the map', () => {
    const ui = read('src/routes/admin/AdminShell.jsx') + read('src/components/admin/Sidebar.jsx');
    const used = new Set([...ui.matchAll(/capability(?:=|: )["']([a-z_]+)["']/g)].map((m) => m[1]));
    assert.ok(used.size >= 9);
    for (const cap of used) assert.ok(cap in CAPABILITIES, cap);
  });

  it('every capability the API enforces exists in the map', () => {
    const dir = new URL('../../api/admin/', import.meta.url);
    for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.php'))) {
      const src = fs.readFileSync(new URL(name, dir), 'utf8');
      for (const m of src.matchAll(/requireAdminCapability\('([a-z_]+)'\)/g)) assert.ok(m[1] in CAPABILITIES, `${name}: ${m[1]}`);
    }
  });
});
