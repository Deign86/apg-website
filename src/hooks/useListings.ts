import { useEffect, useState } from 'react';

/** One available property, synced from the APR Google Drive by api/cron/drive-sync.php. */
export interface Listing {
  ref: string;
  title: string;
  type: string;
  type_label: string;
  deal: '' | 'lease' | 'sale';
  area: string;
  size: string;
  price: string;
  terms: string[];
  photos: string[];
  added: string;
  updated: string;
}

/** /api/listings.php response as written by api/cron/drive-sync.php; any field may be missing. */
interface ListingsResponse {
  synced_at?: string | null;
  data?: Partial<Listing>[];
}

const text = (v: string | undefined): string => String(v ?? '');
const textList = (v: string[] | undefined): string[] => (Array.isArray(v) ? v.map(String) : []);

/** Normalise one feed row; rows without a valid ref are dropped. */
function toListing(r: Partial<Listing>): Listing | null {
  const ref = text(r.ref);
  if (!/^APR-[0-9A-F]{6}$/.test(ref)) return null;
  return {
    ref,
    title: text(r.title),
    type: text(r.type),
    type_label: text(r.type_label),
    deal: r.deal === 'lease' || r.deal === 'sale' ? r.deal : '',
    area: text(r.area),
    size: text(r.size),
    price: text(r.price),
    terms: textList(r.terms),
    // Same-origin photo paths only.
    photos: textList(r.photos).filter((p) => p.startsWith('/uploads/drive/')),
    added: text(r.added),
    updated: text(r.updated),
  };
}

/** True when a listing was added to the Drive in the last 14 days. */
export const isNewListing = (l: Listing): boolean =>
  l.added !== '' && Date.now() - Date.parse(l.added) < 14 * 24 * 60 * 60 * 1000;

/** All available listings (newest first) plus when the Drive was last synced. */
export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/listings.php', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // SAFETY: same-origin endpoint with a fixed shape; every field is re-normalised by toListing below.
        return res.json() as Promise<ListingsResponse>;
      })
      .then((json) => {
        const rows = Array.isArray(json.data) ? json.data : [];
        setListings(rows.map(toListing).filter((l): l is Listing => l !== null));
        setSyncedAt(json.synced_at ? String(json.synced_at) : null);
        setError(null);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setError(err.message || 'Failed to load listings');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return { listings, syncedAt, loading, error };
}
