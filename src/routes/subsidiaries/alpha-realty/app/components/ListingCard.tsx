import React from 'react';
import { Building2, Camera, MapPin, Ruler, Star } from 'lucide-react';
import { isNewListing, priceParts, type Listing } from '@/hooks/useListings';
import { basePathFor, enterpriseOrigin, hostEnterprise } from '@/lib/enterpriseHost';
import { CAPTION, FOCUS_INSET } from './ui';

const REALTY_BASE = hostEnterprise() === 'realty' ? '' : basePathFor('realty');

/** In-app href of a Realty page (/properties/...): as is on the Realty subdomain, under the Realty base path on other hosts. */
export const realtyHref = (path: string): string => `${REALTY_BASE}${path}`;

/** Public URL of a Realty page path, for sharing (the same on every host). */
export const publicUrl = (path: string): string => `${enterpriseOrigin('realty')}${path}`;

export const dealLabel = (deal: Listing['deal']): string =>
  deal === 'sale' ? 'For Sale' : deal === 'lease' ? 'For Lease' : 'Available';

/** The small caption over a price: its own label ("Monthly Rent"), else what the amount is. */
export const priceCaption = (label: string, deal: Listing['deal']): string => label || (deal === 'sale' ? 'Price' : 'Rate');

/** "5 min ago" style text for the last Drive sync. */
export function syncedAgo(iso: string | null): string {
  if (!iso) return '';
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

interface LiveCountProps {
  /** The count ("48 listings", "8 of 48 listings") or a loading note. */
  text: string;
  syncedAt: string | null;
}

/** A quiet pill with the listing count and the last Drive sync, after a soft gold "live" dot. */
export function LiveCount({ text, syncedAt }: LiveCountProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-white/65 tabular-nums">
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-[#c5a85c] shadow-[0_0_6px_rgba(197,168,92,0.8)]" />
      {text}
      {syncedAt && (
        <>
          <span aria-hidden="true" className="text-white/20">·</span>
          <span className="text-white/55">updated {syncedAgo(syncedAt)}</span>
        </>
      )}
    </span>
  );
}

/** Tags over a listing photo: lease or sale, then Featured and New. */
const TAG = 'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]';
const TAG_DARK = `${TAG} border border-[#c5a85c]/45 bg-black/70 text-[#e6cd86]`;

export function ListingTags({ listing }: { listing: Listing }) {
  return (
    <>
      <span className={`${TAG} bg-[linear-gradient(135deg,#e6cd86,#c5a85c)] text-[#0a0a0c]`}>{dealLabel(listing.deal)}</span>
      {listing.featured && (
        <span className={`${TAG_DARK} flex items-center gap-1`}>
          <Star className="size-3 fill-current" aria-hidden="true" /> Featured
        </span>
      )}
      {isNewListing(listing) && <span className={TAG_DARK}>New</span>}
    </>
  );
}

/**
 * A listing photo, or a "Photos on request" panel when it has none. `card` uses the smaller card copy when the
 * feed has one. Drive photos carry the office phone numbers in a strip along the bottom, so cards crop from the top.
 */
export function ListingPhoto({ listing, index = 0, card = false, className = '' }: {
  listing: Listing;
  index?: number;
  card?: boolean;
  className?: string;
}) {
  const src = (card ? listing.cards[index] : undefined) ?? listing.photos[index];
  if (!src) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_40%,rgba(197,168,92,0.14),transparent_60%),linear-gradient(180deg,#141416,#0b0b0d)] ${className}`}>
        <span className="grid size-14 place-items-center rounded-full border border-[#c5a85c]/40 text-[#c5a85c]">
          <Building2 className="size-6" aria-hidden="true" />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">Photos on request</span>
      </div>
    );
  }
  return <img src={src} alt={`${listing.title}, photo ${index + 1}`} loading="lazy" decoding="async" className={`object-cover ${className}`} />;
}

export const ListingCardSkeleton: React.FC = () => (
  <div className="h-full overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#111113,#0a0a0c)]" aria-hidden="true">
    <div className="aspect-[4/3] animate-pulse short:aspect-[16/10] bg-white/[0.04] motion-reduce:animate-none" />
    <div className="space-y-3 px-5 py-4">
      <div className="h-4 w-4/5 animate-pulse rounded bg-white/10 motion-reduce:animate-none" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-white/5 motion-reduce:animate-none" />
      <div className="border-t border-white/[0.08] pt-3">
        <div className="h-2.5 w-16 animate-pulse rounded bg-white/5 motion-reduce:animate-none" />
        <div className="mt-2 h-5 w-2/5 animate-pulse rounded bg-[#c5a85c]/15 motion-reduce:animate-none" />
      </div>
    </div>
  </div>
);

interface ListingCardProps {
  listing: Listing;
  /** Plain left click; modified and middle clicks follow the link (new tab/window). */
  onOpen: (listing: Listing) => void;
}

/** A listing card: photo with tags, title, area and size, then the price (its note on a reserved line, so prices align). */
export const ListingCard: React.FC<ListingCardProps> = ({ listing, onOpen }) => {
  const { label, amount, note } = priceParts(listing.price);
  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#111113_0%,#0a0a0c_100%)] shadow-[0_24px_60px_-34px_rgba(0,0,0,0.95)] transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-[#c5a85c]/45 hover:shadow-[0_30px_70px_-32px_rgba(197,168,92,0.3)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#c5a85c]/60 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
      <a
        href={realtyHref(`/properties/${listing.ref}`)}
        onClick={(e) => {
          if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          onOpen(listing);
        }}
        className={`flex h-full w-full cursor-pointer flex-col rounded-2xl text-left ${FOCUS_INSET}`}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0d0d10] short:aspect-[16/10]">
          <ListingPhoto
            listing={listing}
            card
            className="size-full object-top transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <ListingTags listing={listing} />
          </div>
          {listing.photos.length > 1 && (
            <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[11px] text-white/85 tabular-nums">
              <Camera className="size-3.5" aria-hidden="true" />
              <span className="sr-only">Photos:</span> {listing.photos.length}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 px-5 py-4">
          <h3 className="line-clamp-2 text-pretty text-[15px] font-semibold leading-snug text-white">{listing.title}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-white/55">
            <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-[#c5a85c]/80" aria-hidden="true" /> {listing.area}</span>
            {listing.size && (
              <span className="flex items-center gap-1.5 tabular-nums"><Ruler className="size-3.5 text-[#c5a85c]/80" aria-hidden="true" /> {listing.size}</span>
            )}
          </div>
          <div className="mt-auto border-t border-white/[0.08] pt-3">
            <p className={CAPTION}>{priceCaption(label, listing.deal)}</p>
            <p className={`mt-1 line-clamp-2 font-display text-xl leading-snug tabular-nums ${amount ? 'text-[#e6cd86]' : 'text-white/70'}`}>
              {amount || 'On request'}
            </p>
            <p className="mt-0.5 h-4 truncate text-xs text-white/50">{note}</p>
          </div>
        </div>
      </a>
    </article>
  );
};
