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
  /** 800px copy of each photo, same order (cards, gallery thumbnails); the photo itself where there is none. Photos are 1200px. */
  cards: string[];
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
/** Same-origin Drive photo paths only. */
const isDrivePhoto = (p: string): boolean => p.startsWith('/uploads/drive/');
const textList = (v: string[] | undefined): string[] => (Array.isArray(v) ? v.map(String) : []);

// Listing text is typed by staff in Google Docs and often pasted from social posts, so the feed carries
// emoji, invisible characters and styled letters, and the sync sometimes keeps a doc's title line.
/** Emoji, keycaps, variation selectors, the byte-order mark and zero-width characters. */
const NOISE = /[\p{Extended_Pictographic}️⃣﻿​-‍⁠]/gu;
/** Styled letters ("𝑩𝒂𝒓𝒆 𝑼𝒏𝒊𝒕"), which read as plain letters once normalised. */
const STYLED = /[\u{1D400}-\u{1D7FF}]/gu;
/** A doc's title line ("OFFICE SPACE FOR RENT in Pasig"), when it has no number in it. */
const isTitleLine = (s: string): boolean => /\bfor (?:rent|lease|sale)\b/i.test(s) && !/\d/.test(s);

const tidy = (s: string): string =>
  s.replace(STYLED, (c) => c.normalize('NFKC')).replace(NOISE, '').replace(/\s+/g, ' ').trim();

/** Closes a parenthesis the Drive doc cut off: "… (Stylish 2Br Unit" → "… (Stylish 2Br Unit)". */
function tidyTitle(raw: string): string {
  const title = tidy(raw);
  return (title.match(/\(/g) ?? []).length > (title.match(/\)/g) ?? []).length ? `${title})` : title;
}

/** Terms without empty lines and without the doc's title line, which the sync keeps as the first line or two. */
const tidyTerms = (raw: string[]): string[] => raw.map(tidy).filter((t, i) => t !== '' && !(i < 2 && isTitleLine(t)));

/**
 * The price line, cleaned. A doc title line kept as the price means no price ("Rate on request"); a bare label
 * ("Monthly Rent:") takes its amount from the first term with a number in it, which then leaves the terms.
 */
interface PriceAndTerms {
  price: string;
  terms: string[];
}

function tidyPrice(raw: string, terms: string[]): PriceAndTerms {
  const price = tidy(raw);
  if (isTitleLine(price)) return { price: '', terms };
  if (/^[^:]{1,40}:$/.test(price)) {
    const i = terms.findIndex((t) => /\d/.test(t));
    return i < 0 ? { price: '', terms } : { price: `${price} ${terms[i]}`, terms: terms.filter((_, j) => j !== i) };
  }
  return { price, terms };
}

/** Normalise one feed row; rows without a valid ref are dropped. */
function toListing(r: Partial<Listing>): Listing | null {
  const ref = text(r.ref);
  if (!LISTING_REF.test(ref)) return null;
  const areaSlug = text(r.area_slug);
  const priced = tidyPrice(text(r.price), tidyTerms(textList(r.terms)));
  const price = priced.price;
  // Drive docs often repeat a line, or repeat the price line among the terms.
  const terms = priced.terms.filter((t, i, all) => t !== price && all.indexOf(t) === i);
  const cards = textList(r.cards);
  const photos = textList(r.photos).map((photo, i) => [photo, cards[i]] as const).filter(([photo]) => isDrivePhoto(photo));
  return {
    ref,
    title: tidyTitle(text(r.title)),
    type: text(r.type),
    type_label: text(r.type_label),
    deal: r.deal === 'lease' || r.deal === 'sale' ? r.deal : '',
    area: text(r.area),
    area_slug: /^[a-z0-9-]+$/.test(areaSlug) ? areaSlug : '',
    size: text(r.size),
    price,
    terms,
    photos: photos.map(([photo]) => photo),
    cards: photos.map(([photo, card]) => (card !== undefined && isDrivePhoto(card) ? card : photo)),
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

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_WINDOW_MS = 14 * DAY_MS;

/** True when a listing's Drive folder, doc, photos or price override changed at least 24h after it was added. */
export function isUpdatedListing(l: Listing): boolean {
  if (!l.updated) return false;
  const updatedMs = Date.parse(l.updated);
  if (Number.isNaN(updatedMs)) return false;
  if (!l.added) return true;
  const addedMs = Date.parse(l.added);
  return !Number.isNaN(addedMs) && updatedMs - addedMs >= DAY_MS;
}

/** True when a listing was added to the Drive in the last 14 days. */
export const isNewListing = (l: Listing): boolean =>
  l.added !== '' && Date.now() - Date.parse(l.added) < RECENT_WINDOW_MS;

/** True when a listing was updated (after its first 24h) within the last 14 days. */
export const isRecentlyUpdatedListing = (l: Listing): boolean =>
  isUpdatedListing(l) && Date.now() - Date.parse(l.updated) < RECENT_WINDOW_MS;

export interface ListingDateInfo {
  label: 'Listed since' | 'Last updated';
  date: string;
  iso: string;
}

/**
 * Availability date label for a listing:
 * - "Listed since <Month Day, Year>" when untouched since initial creation (within 24h of `added`).
 * - "Last updated <Month Day, Year>" once its Drive doc, photos, folder or price override updates.
 */
export function listingDateLabel(l: Listing): ListingDateInfo | null {
  const updated = isUpdatedListing(l);
  const iso = updated ? l.updated : l.added || l.updated;
  if (!iso) return null;
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return null;
  return {
    label: updated ? 'Last updated' : 'Listed since',
    date: new Date(ms).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' }),
    iso,
  };
}

/** A price split for display; label and note are '' when the price has none. */
export interface PriceParts {
  label: string;
  amount: string;
  note: string;
}

/** "Monthly Rent: ₱45,000 (monthly dues included)" → label "Monthly Rent", amount "₱45,000", note "monthly dues included". */
export function priceParts(price: string): PriceParts {
  const labelled = /^([^:\d₱]{2,30}):\s*(.+)$/.exec(price);
  const rest = labelled ? labelled[2] : price;
  const noted = /^(.+?)\s*\(([^()]+)\)$/.exec(rest);
  return { label: labelled ? labelled[1].trim() : '', amount: noted ? noted[1] : rest, note: noted ? noted[2] : '' };
}

/** Terms under one "Heading:" line ('' for the lines before any heading). */
export interface TermGroup {
  heading: string;
  items: string[];
}

/** Terms grouped under the lines that end in ":" ("Lease Terms:"); a heading with nothing under it is dropped. */
export function groupTerms(terms: string[]): TermGroup[] {
  const groups: TermGroup[] = [];
  for (const term of terms) {
    if (term.endsWith(':')) groups.push({ heading: term.slice(0, -1).trim(), items: [] });
    else if (groups.length === 0) groups.push({ heading: '', items: [term] });
    else groups[groups.length - 1].items.push(term);
  }
  return groups.filter((g) => g.items.length > 0);
}

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
