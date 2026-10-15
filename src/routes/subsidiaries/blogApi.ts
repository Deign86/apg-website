import { useEffect, useState } from "react";
import { fetchList } from "@/lib/listCache";

/** A published post as listed by /api/blogs.php?summary=1 (lists carry no `content`). */
export interface BlogRow {
  id: number | string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  published_at: string | null;
  cover_image_url: string | null;
  read_time: string | null;
  is_featured: number | string | null;
  content?: string | null;
}

/** A row as /api/blogs.php writes it: any field may be missing or null. */
type RawBlogRow = Partial<Record<keyof BlogRow, string | number | null>>;

const text = (value: string | number | null | undefined): string => (value == null ? "" : String(value));
const textOrNull = (value: string | number | null | undefined): string | null => (value == null ? null : String(value));

/** Normalise one row from the API; rows without a slug or title are dropped. */
function toBlogRow(row: RawBlogRow): BlogRow | null {
  const slug = text(row.slug);
  const title = text(row.title);
  if (slug === "" || title === "") return null;
  return {
    id: row.id ?? slug,
    slug,
    title,
    excerpt: textOrNull(row.excerpt),
    category: textOrNull(row.category),
    published_at: textOrNull(row.published_at),
    cover_image_url: textOrNull(row.cover_image_url),
    read_time: textOrNull(row.read_time),
    is_featured: row.is_featured ?? null,
    content: textOrNull(row.content),
  };
}

/** One request per key per session; a failed request is forgotten so the next call retries. */
function once<T>(cache: Map<string, Promise<T>>, key: string, load: () => Promise<T>): Promise<T> {
  let request = cache.get(key);
  if (!request) {
    request = load();
    cache.set(key, request);
    request.catch(() => cache.delete(key));
  }
  return request;
}

const bodies = new Map<string, Promise<string>>();
const loadedBodies = new Map<string, string>();

/**
 * An enterprise's published posts, without their bodies unless `withBodies` (full-text
 * search). Fetched once per session (src/lib/listCache), so going back to Blogs from another
 * section re-renders from memory instead of re-downloading. Rows that do carry a body (full-text
 * search, or a post with no excerpt) open without a second request.
 */
export function loadBlogList(enterprise: string, withBodies = false): Promise<BlogRow[]> {
  const query = `enterprise=${encodeURIComponent(enterprise)}${withBodies ? "" : "&summary=1"}`;
  return fetchList(`/api/blogs.php?${query}`).then((data) => {
    // SAFETY: same-origin endpoint with a fixed row shape; every field is re-normalised by toBlogRow.
    const rows = (data as RawBlogRow[]).map(toBlogRow).filter((row): row is BlogRow => row !== null);
    for (const row of rows) if (row.content) loadedBodies.set(row.slug, row.content);
    return rows;
  });
}

function loadBlogBody(slug: string): Promise<string> {
  return once(bodies, slug, async () => {
    const res = await fetch(`/api/blogs.php?slug=${encodeURIComponent(slug)}`);
    // SAFETY: same-origin endpoint; the one field used, `data.content`, is checked and re-normalised below.
    const json = (await res.json()) as { success?: boolean; data?: RawBlogRow | null };
    if (!res.ok || json.success !== true || json.data?.content == null) throw new Error(`Blog post ${slug}: HTTP ${res.status}`);
    const content = text(json.data.content);
    loadedBodies.set(slug, content);
    return content;
  });
}

/**
 * The body of the open post, fetched by slug when a reader opens it. null while loading;
 * `fallback` when the post is not in the database (built-in sample articles) or the request
 * fails, so a reader always ends up with text.
 */
export function useBlogBody(slug: string | null | undefined, fallback: string): string | null {
  const [loaded, setLoaded] = useState<{ slug: string; body: string } | null>(null);
  useEffect(() => {
    if (!slug || loadedBodies.has(slug)) return undefined;
    let live = true;
    loadBlogBody(slug).then(
      (body) => { if (live) setLoaded({ slug, body }); },
      () => { if (live) setLoaded({ slug, body: fallback }); },
    );
    return () => { live = false; };
  }, [slug, fallback]);
  if (!slug) return fallback;
  return loadedBodies.get(slug) ?? (loaded?.slug === slug ? loaded.body : null);
}
