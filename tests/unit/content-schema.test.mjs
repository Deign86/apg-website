import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ARRAY_TYPES, CONTENT_SCHEMA, defaultsFor, fieldsFor, valueMatchesField } from '../../src/data/contentSchema.js';

const FIELD_TYPES = ['text', 'textarea', 'richtext', 'image', 'url', 'email', 'phone', 'toggle', 'list', 'choices', 'repeater'];
const ITEM_TYPES = ['text', 'textarea', 'richtext', 'image', 'url', 'email', 'select'];
const optionValue = (o) => (typeof o === 'object' && o !== null ? o.value : o);

describe('content registry (src/data/contentSchema.js + api/data/content-schema.json)', () => {
  it('defaultsFor returns every field default, cached, and {} for unknown pages', () => {
    const home = defaultsFor('home');
    assert.deepEqual(Object.keys(home).sort(), fieldsFor('home').map((f) => f.key).sort());
    assert.equal(defaultsFor('home'), home, 'same object on every call');
    assert.deepEqual(defaultsFor('no-such-page'), {});
    assert.deepEqual(fieldsFor('no-such-page'), []);
  });

  it('valueMatchesField coerces by type: arrays, booleans, strings', () => {
    const f = (type) => ({ key: 'k', type });
    for (const type of ARRAY_TYPES) {
      assert.equal(valueMatchesField(f(type), []), true, type);
      assert.equal(valueMatchesField(f(type), 'x'), false, type);
      assert.equal(valueMatchesField(f(type), {}), false, type);
    }
    assert.equal(valueMatchesField(f('toggle'), false), true);
    assert.equal(valueMatchesField(f('toggle'), 'false'), false);
    assert.equal(valueMatchesField(f('toggle'), 0), false);
    for (const type of ['text', 'textarea', 'richtext', 'image', 'url', 'email', 'phone']) {
      assert.equal(valueMatchesField(f(type), ''), true, type);
      assert.equal(valueMatchesField(f(type), 1), false, type);
      assert.equal(valueMatchesField(f(type), null), false, type);
      assert.equal(valueMatchesField(f(type), ['x']), false, type);
    }
  });

  it('every page has unique, typed field keys whose defaults match their own type', () => {
    for (const [slug, page] of Object.entries(CONTENT_SCHEMA)) {
      assert.ok(Array.isArray(page.sections) && page.sections.length > 0, `${slug} has sections`);
      const keys = fieldsFor(slug).map((f) => f.key);
      assert.equal(new Set(keys).size, keys.length, `${slug} has duplicate keys`);
      for (const field of fieldsFor(slug)) {
        const where = `${slug}.${field.key}`;
        assert.ok(FIELD_TYPES.includes(field.type), `${where} type ${field.type}`);
        assert.ok(valueMatchesField(field, field.default), `${where} default ${JSON.stringify(field.default)}`);
        if (field.type === 'choices') {
          const allowed = (field.options ?? []).map(optionValue);
          for (const v of field.default) assert.ok(allowed.includes(v), `${where} default option ${v}`);
        }
        if (field.type === 'repeater') {
          assert.ok(Array.isArray(field.itemFields) && field.itemFields.length > 0, `${where} itemFields`);
          for (const item of field.itemFields) assert.ok(ITEM_TYPES.includes(item.type ?? 'text'), `${where}.${item.key}`);
        }
      }
    }
  });

  it('page slugs are valid for api/content.php; only underscore pages are private', () => {
    for (const [slug, page] of Object.entries(CONTENT_SCHEMA)) {
      if (slug.startsWith('_')) {
        assert.equal(page.private, true, `${slug} must be flagged private`);
        assert.equal(page.path, undefined, `${slug} must not have a public path`);
      } else {
        assert.match(slug, /^[a-z0-9][a-z0-9-]{0,99}$/, slug);
        assert.notEqual(page.private, true, slug);
      }
    }
    assert.ok(CONTENT_SCHEMA._private, 'the _private page exists');
  });

  it('site settings carry the announcement banner fields', () => {
    const site = defaultsFor('site');
    assert.equal(site.announcement_enabled, false);
    assert.deepEqual(site.announcement_sites, []);
    assert.equal(typeof site.announcement_text, 'string');
  });
});
