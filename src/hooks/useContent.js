import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { defaultsFor, fieldsFor, valueMatchesField } from '../data/contentSchema';

// One request per page slug per session, shared by every component that reads the page.
// entries: slug -> { status: 'loading' | 'done', data: object, error: string | null }
const entries = new Map();
const listeners = new Map();

function emit(slug) {
  (listeners.get(slug) || []).forEach((listener) => listener());
}

function load(slug) {
  if (entries.has(slug)) return;
  entries.set(slug, { status: 'loading', data: {}, error: null });
  fetch(`/api/content.php?page=${encodeURIComponent(slug)}`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((result) => {
      const data = result && result.success && result.data && typeof result.data === 'object' && !Array.isArray(result.data)
        ? result.data
        : {};
      entries.set(slug, { status: 'done', data, error: null });
    })
    .catch((err) => {
      entries.set(slug, { status: 'done', data: {}, error: err instanceof Error ? err.message : 'Request failed' });
    })
    .finally(() => emit(slug));
}

/** Drops the cached copy of a page (the admin editor calls this after saving). */
export function invalidateContent(slug) {
  entries.delete(slug);
  if ((listeners.get(slug) || new Set()).size > 0) load(slug);
  emit(slug);
}

/** Stored values that fit their registered field; unregistered keys pass through unchanged. */
function sanitize(slug, data) {
  const fields = new Map(fieldsFor(slug).map((field) => [field.key, field]));
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    const field = fields.get(key);
    if (!field || valueMatchesField(field, value)) out[key] = value;
  }
  return out;
}

/**
 * Page content: registry defaults (rendered immediately, no flash) overlaid with the values an
 * admin saved. `fallbackData` is only for keys a page has not registered yet.
 * Registered keys always hold the registry type (stored values of the wrong shape are dropped),
 * so `content.key as string` / `as Item[]` matches the field type in api/data/content-schema.json.
 * @param {string} pageSlug
 * @param {Record<string, unknown>} [fallbackData]
 * @returns {{ content: Record<string, unknown>, loading: boolean, error: string | null }}
 */
export function useContent(pageSlug, fallbackData) {
  const subscribe = useCallback((listener) => {
    if (!listeners.has(pageSlug)) listeners.set(pageSlug, new Set());
    listeners.get(pageSlug).add(listener);
    return () => listeners.get(pageSlug).delete(listener);
  }, [pageSlug]);
  const entry = useSyncExternalStore(subscribe, () => entries.get(pageSlug));

  useEffect(() => {
    load(pageSlug);
  }, [pageSlug, entry]);

  const content = { ...fallbackData, ...defaultsFor(pageSlug), ...sanitize(pageSlug, entry ? entry.data : {}) };
  return { content, loading: !entry || entry.status === 'loading', error: entry ? entry.error : null };
}
