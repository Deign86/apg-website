import React from 'react';
import { Building2, Camera, MapPin, Ruler } from 'lucide-react';
import { isNewListing, type Listing } from '@/hooks/useListings';

export const dealLabel = (deal: Listing['deal']): string =>
  deal === 'sale' ? 'For Sale' : deal === 'lease' ? 'For Lease' : 'Available';

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

export function ListingPhoto({ listing, index = 0, className = '' }: { listing: Listing; index?: number; className?: string }) {
  const src = listing.photos[index];
  if (!src) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 bg-[#12131b] text-[#c5a85c]/70 ${className}`}>
        <Building2 className="size-10" aria-hidden="true" />
        <span className="text-xs text-neutral-500">Photos on request</span>
      </div>
    );
  }
  return <img src={src} alt={`${listing.title}, photo ${index + 1}`} loading="lazy" decoding="async" className={`object-cover ${className}`} />;
}

export const ListingCardSkeleton: React.FC = () => (
  <div className="overflow-hidden rounded-2xl border border-[#c5a85c]/15 bg-[#0d0e14]/90" aria-hidden="true">
    <div className="aspect-[4/3] animate-pulse bg-white/5" />
    <div className="space-y-3 p-4">
      <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-white/10" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-white/5" />
      <div className="h-4 w-2/5 animate-pulse rounded bg-white/10" />
    </div>
  </div>
);

interface ListingCardProps {
  listing: Listing;
  onOpen: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onOpen }) => (
  <article className="group overflow-hidden rounded-2xl border border-[#c5a85c]/25 bg-[#0d0e14]/90 shadow-md transition-colors duration-200 hover:border-[#c5a85c]/70">
    <button
      type="button"
      onClick={() => onOpen(listing)}
      className="flex h-full w-full flex-col text-left cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#c5a85c] focus-visible:ring-inset"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <ListingPhoto listing={listing} className="size-full transition-transform duration-200 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-full bg-[#c5a85c] px-2.5 py-1 text-xs font-bold text-black">{dealLabel(listing.deal)}</span>
          {isNewListing(listing) && (
            <span className="rounded-full bg-black/80 px-2.5 py-1 text-xs font-bold text-[#dfc47b]">New</span>
          )}
        </div>
        {listing.photos.length > 1 && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/75 px-2 py-1 text-xs text-neutral-200 tabular-nums">
            <Camera className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Photos:</span> {listing.photos.length}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs font-semibold text-[#c5a85c]">{listing.type_label}</p>
        <h3 className="line-clamp-2 text-balance font-serif text-base font-semibold leading-snug text-white">{listing.title}</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-400">
          <span className="flex items-center gap-1"><MapPin className="size-3.5" aria-hidden="true" /> {listing.area}</span>
          {listing.size && (
            <span className="flex items-center gap-1 tabular-nums"><Ruler className="size-3.5" aria-hidden="true" /> {listing.size}</span>
          )}
        </div>
        <p className="mt-auto line-clamp-2 pt-2 text-sm font-semibold text-[#dfc47b] tabular-nums">{listing.price || 'Rate on request'}</p>
      </div>
    </button>
  </article>
);
