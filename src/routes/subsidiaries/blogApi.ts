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

const isBlogRow = (row: unknown): row is BlogRow =>
  typeof row === "object" && row !== null
  && typeof (row as BlogRow).slug === "string" && typeof (row as BlogRow).title === "string";

async function getData(url: string): Promise<unknown> {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json?.success) throw new Error(`${url}: ${res.status}`);
  return json.data;
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
    const rows = data.filter(isBlogRow);
    for (const row of rows) if (typeof row.content === "string" && row.content !== "") loadedBodies.set(row.slug, row.content);
    return rows;
  });
}

function loadBlogBody(slug: string): Promise<string> {
  return once(bodies, slug, () =>
    getData(`/api/blogs.php?slug=${encodeURIComponent(slug)}`).then((data) => {
      const content = (data as BlogRow | null)?.content;
      if (typeof content !== "string") throw new Error("Unexpected blog post");
      loadedBodies.set(slug, content);
      return content;
    }));
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
