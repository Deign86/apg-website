import { useEffect, useState } from 'react';

/** One available property, synced from the APR Google Drive by api/cron/drive-sync.php. */
export interface Listing {
  ref: string;
  title: string;
  type: string;
  type_label: string;
  deal: '' | 'lease' | 'sale';
  area: string;
  /** The area as hub paths spell it ("san-fernando-pampanga"); '' when there is none. */
  area_slug: string;
  size: string;
  price: string;
  terms: string[];
  photos: string[];
  added: string;
  updated: string;
  /** Pinned by staff in admin "Property Listings"; the feed already lists featured ones first. */
  featured: boolean;
}

/**
 * A browse page computed by the server (listingHubs() in api/lib/Listings.php): every listing of one type and
 * deal (/properties/warehouse-for-lease), or of one type and deal in one area (/properties/warehouse-for-lease/cavite).
 */
export interface ListingHub {
  path: string;
  type: string;
  deal: 'lease' | 'sale';
  /** '' on a type + deal hub. */
  area: string;
  area_slug: string;
  count: number;
  /** False below 3 listings: the page still works but is noindex. */
  indexable: boolean;
  h1: string;
  title: string;
  description: string;
}

/** /api/listings.php response as written by api/cron/drive-sync.php; any field may be missing. */
interface ListingsResponse {
  synced_at?: string | null;
  data?: Partial<Listing>[];
  hubs?: Partial<ListingHub>[];
}

/** A listing's reference number, e.g. APR-0A1B2C. */
export const LISTING_REF = /^APR-[0-9A-F]{6}$/;
/** A hub's path, /properties/{type}-for-{deal}[/{area}]: lowercase, so never a listing ref. */
export const HUB_PATH = /^\/properties\/[a-z0-9-]+(?:\/([a-z0-9-]+))?$/;

const text = (v: string | undefined): string => String(v ?? '');
const textList = (v: string[] | undefined): string[] => (Array.isArray(v) ? v.map(String) : []);

/** Normalise one feed row; rows without a valid ref are dropped. */
function toListing(r: Partial<Listing>): Listing | null {
  const ref = text(r.ref);
  if (!LISTING_REF.test(ref)) return null;
  const areaSlug = text(r.area_slug);
  return {
    ref,
    title: text(r.title),
    type: text(r.type),
    type_label: text(r.type_label),
    deal: r.deal === 'lease' || r.deal === 'sale' ? r.deal : '',
    area: text(r.area),
    area_slug: /^[a-z0-9-]+$/.test(areaSlug) ? areaSlug : '',
    size: text(r.size),
    price: text(r.price),
    terms: textList(r.terms),
    // Same-origin photo paths only.
    photos: textList(r.photos).filter((p) => p.startsWith('/uploads/drive/')),
    added: text(r.added),
    updated: text(r.updated),
    featured: r.featured === true,
  };
}

/** Normalise one hub; hubs without a valid path, type, deal or heading are dropped. The area slug is the path's. */
function toHub(r: Partial<ListingHub>): ListingHub | null {
  const path = text(r.path);
  const match = HUB_PATH.exec(path);
  const count = Number(r.count);
  if (!match || !r.type || (r.deal !== 'lease' && r.deal !== 'sale') || !r.h1 || !r.title) return null;
  return {
    path,
    type: text(r.type),
    deal: r.deal,
    area: text(r.area),
    area_slug: match[1] ?? '',
    count: Number.isInteger(count) && count > 0 ? count : 0,
    indexable: r.indexable === true,
    h1: text(r.h1),
    title: text(r.title),
    description: text(r.description),
  };
}

/** True when a listing is on a hub's page: same type and deal and, for an area hub, the same area. */
export const inHub = (l: Listing, hub: ListingHub): boolean =>
  l.type === hub.type && l.deal === hub.deal && (hub.area_slug === '' || l.area_slug === hub.area_slug);

/** The type + deal hub an area hub narrows (/properties/warehouse-for-lease for .../cavite), if the feed has it. */
export const parentHub = (hub: ListingHub, hubs: ListingHub[]): ListingHub | undefined =>
  hubs.find((h) => h.area_slug === '' && h.type === hub.type && h.deal === hub.deal);

/** True when a listing was added to the Drive in the last 14 days. */
export const isNewListing = (l: Listing): boolean =>
  l.added !== '' && Date.now() - Date.parse(l.added) < 14 * 24 * 60 * 60 * 1000;

/**
 * All available listings (featured first, then staff order, then newest), the browse pages (type + deal hubs
 * first, then area hubs by size) and when the Drive was last synced.
 */
export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [hubs, setHubs] = useState<ListingHub[]>([]);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/listings.php', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // SAFETY: same-origin endpoint with a fixed shape; every field is re-normalised by toListing / toHub below.
        return res.json() as Promise<ListingsResponse>;
      })
      .then((json) => {
        const rows = Array.isArray(json.data) ? json.data : [];
        setListings(rows.map(toListing).filter((l): l is Listing => l !== null));
        setHubs((Array.isArray(json.hubs) ? json.hubs : []).map(toHub).filter((h): h is ListingHub => h !== null));
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

  return { listings, hubs, syncedAt, loading, error };
}
