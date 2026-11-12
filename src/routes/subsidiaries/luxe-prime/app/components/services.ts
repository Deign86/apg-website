/** /api/services.php row, as far as the Luxe pages read it. */
export interface ServiceRow {
  id?: string | number;
  title?: string;
  description?: string;
  summary?: string;
  image_url?: string;
  features?: (string | number)[];
  photos?: (string | number)[];
}

export interface LuxeService {
  key: string;
  title: string;
  text: string;
  image: string;
  features: string[];
  /** Gallery photos; the cover image first when the gallery doesn't have it. */
  photos: string[];
}

const text = (v: string | number | undefined): string => (v == null ? '' : String(v).trim());
const textList = (v: (string | number)[] | undefined): string[] => (Array.isArray(v) ? v.map(text).filter(Boolean) : []);

/** One admin service row for display; rows without a title are dropped. */
export function toLuxeService(row: ServiceRow, index: number): LuxeService | null {
  const title = text(row.title);
  if (!title) return null;
  const image = text(row.image_url);
  const gallery = textList(row.photos);
  return {
    key: text(row.id) || `${index}-${title}`,
    title,
    text: text(row.description) || text(row.summary),
    image,
    features: textList(row.features),
    // The cover is often the gallery's first photo at another size (same address, other query string).
    photos: image && !gallery.some((p) => p.split('?')[0] === image.split('?')[0]) ? [image, ...gallery] : gallery,
  };
}

/** An Unsplash photo at a given width (thumbnails need far less than the 1200 px copy); other URLs as they are. */
export function sized(url: string, width: number): string {
  if (!url.startsWith('https://images.unsplash.com/')) return url;
  const u = new URL(url);
  u.searchParams.set('w', String(width));
  if (!u.searchParams.has('auto')) u.searchParams.set('auto', 'format');
  return u.toString();
}
