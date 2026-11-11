// Content registry: every admin-editable page, its sections and typed fields, with defaults equal
// to the copy the site rendered before it was editable. Single source shared with the PHP API
// (api/lib/ContentRegistry.php validates saves against the same JSON file).
//
// CONTENT_SCHEMA[pageSlug] = { label, group, path?, description?, private?, sections: [{ title, description?, fields: [Field] }] }
// Field = { key, label, type, help?, default, itemFields? (repeater), options? (choices/select), itemLabel? (repeater) }
// Types: text | textarea | richtext | image | url | email | phone | toggle | list | choices | repeater
//   (repeater itemFields use text | textarea | richtext | image | url | email | select)
// Adding a page/field: edit api/data/content-schema.json, then read it with useContent(slug).
import schema from '../../api/data/content-schema.json';
// The Realty page as the redesigned Realty site renders it (shorter copy, the new hero photo, merged and dropped
// fields), kept on the frontend so the redesign ships without a server change. Every key and field type in it is
// also in the server's copy, which still validates admin saves (tests/unit/content-schema.test.mjs checks this).
// Once the backend copies this page into api/data/content-schema.json, delete realtyContent.json and this override.
import realtyPage from './realtyContent.json';

export const CONTENT_SCHEMA = { ...schema, realty: realtyPage };

/** Field types whose value is an array / boolean (stored as JSON). */
export const ARRAY_TYPES = ['list', 'choices', 'repeater'];

/** Flat list of a page's fields (empty for unknown pages). */
export function fieldsFor(slug) {
  const page = CONTENT_SCHEMA[slug];
  return page ? page.sections.flatMap((section) => section.fields) : [];
}

const defaultsCache = new Map();

/** { key: default } for a page; the same object is returned on every call (do not mutate). */
export function defaultsFor(slug) {
  if (!defaultsCache.has(slug)) {
    defaultsCache.set(slug, Object.fromEntries(fieldsFor(slug).map((field) => [field.key, field.default])));
  }
  return defaultsCache.get(slug);
}

/** True when a stored value has the shape its registered field expects. */
export function valueMatchesField(field, value) {
  if (ARRAY_TYPES.includes(field.type)) return Array.isArray(value);
  if (field.type === 'toggle') return typeof value === 'boolean';
  return typeof value === 'string';
}
