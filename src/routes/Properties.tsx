import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Ruler, Search, ShieldCheck, X, RefreshCw, Building2 } from 'lucide-react';
import Seo from '../components/Seo';
import { useListings, type Listing } from '../hooks/useListings';
import { useModalDialog } from '../hooks/useModalDialog';
import { InquireModal } from '../components/redesign/InquireModal';
import { ListingCard, ListingCardSkeleton, ListingPhoto, dealLabel, syncedAgo } from '../components/redesign/ListingCard';

const DEALS = [
  { value: '', label: 'All' },
  { value: 'lease', label: 'For Lease' },
  { value: 'sale', label: 'For Sale' },
] as const;

function matches(l: Listing, q: string): boolean {
  if (!q) return true;
  const text = [l.ref, l.title, l.area, l.type_label, l.size, l.price, ...l.terms].join(' ').toLowerCase();
  return q.toLowerCase().split(/\s+/).every((word) => text.includes(word));
}

function ListingDialog({ listing, onClose, onInquire }: { listing: Listing; onClose: () => void; onInquire: () => void }) {
  const [index, setIndex] = useState(0);
  const dialogRef = useModalDialog<HTMLDivElement>(true, onClose);
  const count = listing.photos.length;
  const step = (delta: number) => setIndex((i) => (i + delta + count) % count);

  // Arrow keys page through photos while the dialog is open.
  useEffect(() => {
    if (count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % count);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + count) % count);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [count]);

  // Portalled to <body>: page content sits in a z-10 stacking context below the fixed navbar.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 sm:items-center sm:p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-dialog-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative grid grid-cols-1 max-h-[92dvh] w-full max-w-5xl overflow-y-auto rounded-t-2xl border border-[#D4AF37]/40 bg-[#0d0a06] pb-[env(safe-area-inset-bottom)] outline-none shadow-xl sm:rounded-2xl lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-full bg-black/75 p-2 text-white hover:bg-black cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D4AF37] outline-none"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <div className="min-w-0 bg-black">
          <div className="relative aspect-[4/3]">
            <ListingPhoto listing={listing} index={index} className="size-full" />
            {count > 1 && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/65 p-2 text-white hover:bg-black cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D4AF37] outline-none">
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/65 p-2 text-white hover:bg-black cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D4AF37] outline-none">
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
                <span className="absolute bottom-2 right-2 rounded-full bg-black/75 px-2 py-0.5 text-xs text-neutral-200 tabular-nums" aria-live="polite">
                  Photo {index + 1} of {count}
                </span>
              </>
            )}
          </div>
          {count > 1 && (
            <div className="flex gap-2 overflow-x-auto p-2">
              {listing.photos.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === index}
                  className={`h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${i === index ? 'border-[#D4AF37]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={src} alt="" loading="lazy" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 pr-10">
            <span className="rounded-full bg-[#D4AF37] px-2.5 py-1 text-xs font-bold text-black">{dealLabel(listing.deal)}</span>
            <span className="font-mono text-xs text-neutral-500">Ref {listing.ref}</span>
          </div>
          <h2 id="listing-dialog-title" className="text-balance text-xl font-bold leading-snug text-white">{listing.title}</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-neutral-500">Type</dt>
              <dd className="text-neutral-100">{listing.type_label}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Area</dt>
              <dd className="flex items-center gap-1 text-neutral-100"><MapPin className="size-3.5 text-[#D4AF37]" aria-hidden="true" />{listing.area}</dd>
            </div>
            {listing.size && (
              <div>
                <dt className="text-xs text-neutral-500">Size</dt>
                <dd className="flex items-center gap-1 text-neutral-100 tabular-nums"><Ruler className="size-3.5 text-[#D4AF37]" aria-hidden="true" />{listing.size}</dd>
              </div>
            )}
          </dl>
          <p className="text-pretty text-lg font-semibold text-[#FFE082] tabular-nums">{listing.price || 'Rate on request'}</p>
          {listing.terms.length > 0 && (
            <ul className="space-y-1.5 border-t border-[#D4AF37]/20 pt-4 text-sm text-neutral-300 tabular-nums">
              {listing.terms.map((term) => (
                <li key={term} className="flex gap-2 text-pretty"><span className="text-[#D4AF37]" aria-hidden="true">•</span>{term}</li>
              ))}
            </ul>
          )}
          <p className="flex gap-2 text-pretty text-xs text-neutral-400">
            <ShieldCheck className="size-4 shrink-0 text-[#D4AF37]" aria-hidden="true" />
            Exact location and viewing schedule are shared by our team after you inquire. Rates and availability are subject to confirmation.
          </p>
          <button
            type="button"
            onClick={onInquire}
            className="mt-auto w-full rounded-xl bg-[#D4AF37] py-3 text-sm font-bold text-black hover:bg-[#FFDF73] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Inquire about this property
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function Properties() {
  const [params, setParams] = useSearchParams();
  const { listings, syncedAt, loading, error } = useListings();
  const [inquiring, setInquiring] = useState<{ ref: string; title: string } | null>(null);

  const q = params.get('q') ?? '';
  const type = params.get('type') ?? '';
  const deal = params.get('deal') ?? '';
  const openRef = params.get('ref') ?? '';

  const setParam = (key: string, value: string, replace = false) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace });
  };

  const types = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const l of listings) {
      const entry = counts.get(l.type) ?? { label: l.type_label, count: 0 };
      entry.count += 1;
      counts.set(l.type, entry);
    }
    return [...counts.entries()].sort((a, b) => b[1].count - a[1].count);
  }, [listings]);

  const visible = useMemo(
    () => listings.filter((l) => (!type || l.type === type) && (!deal || l.deal === deal) && matches(l, q.trim())),
    [listings, type, deal, q],
  );
  const selected = listings.find((l) => l.ref === openRef) ?? null;
  const filtered = Boolean(q || type || deal);

  return (
    <>
      <Seo
        path="/properties"
        title="Available Properties for Lease & Sale | Alpha Premier Realty"
        description="Browse office spaces, commercial spaces, warehouses and lots currently available for lease or sale across Metro Manila and nearby provinces. Updated live from Alpha Premier Realty's listings."
      />

      <section className="mx-auto max-w-7xl px-4 pb-6 pt-10 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-[#D4AF37]">Alpha Premier Realty</p>
        <h1 className="mt-1 text-balance text-3xl font-black text-white sm:text-4xl">Available Properties</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-400 tabular-nums" role="status">
          {loading ? 'Loading listings…' : `${visible.length === listings.length ? listings.length : `${visible.length} of ${listings.length}`} ${listings.length === 1 ? 'property' : 'properties'} available`}
          {syncedAt && (
            <span className="flex items-center gap-1 text-neutral-500">
              <RefreshCw className="size-3.5" aria-hidden="true" /> Updated {syncedAgo(syncedAt)}
            </span>
          )}
        </p>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <label htmlFor="properties-search" className="sr-only">Search properties</label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
            <input
              id="properties-search"
              type="search"
              value={q}
              onChange={(e) => setParam('q', e.target.value, true)}
              placeholder="Search city, size or ref"
              className="w-full rounded-xl border border-neutral-800 bg-black/70 py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div className="flex rounded-xl border border-neutral-800 bg-black/70 p-1" role="group" aria-label="Lease or sale">
            {DEALS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setParam('deal', d.value)}
                aria-pressed={deal === d.value}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] lg:flex-none ${deal === d.value ? 'bg-[#D4AF37] text-black' : 'text-neutral-300 hover:text-white'}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {types.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Property type">
            {[['', { label: 'All types', count: listings.length }] as const, ...types].map(([key, t]) => (
              <button
                key={key || 'all'}
                type="button"
                onClick={() => setParam('type', key)}
                aria-pressed={type === key}
                className={`rounded-full border px-3.5 py-1.5 text-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${type === key ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#FFE082]' : 'border-neutral-800 text-neutral-400 hover:text-white'}`}
              >
                {t.label} <span className="text-neutral-500 tabular-nums">{t.count}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8" aria-label="Listings" aria-busy={loading}>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : visible.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((l) => (
              <ListingCard key={l.ref} listing={l} onOpen={(item) => setParam('ref', item.ref)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#D4AF37]/20 bg-[#120E05]/80 px-6 py-16 text-center">
            <Building2 className="size-10 text-[#D4AF37]" aria-hidden="true" />
            <p className="max-w-md text-pretty text-sm text-neutral-300">
              {error
                ? "We couldn't load the listings right now. Tell us what you need and our realty team will send you matching properties."
                : filtered
                  ? 'No available property matches your search. New listings are added often.'
                  : 'Our listings are being updated. Tell us what you need and our realty team will send you matching properties.'}
            </p>
            {filtered && !error ? (
              <button type="button" onClick={() => setParams({})} className="rounded-full bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-black cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white">
                Clear filters
              </button>
            ) : (
              <button type="button" onClick={() => setInquiring({ ref: '', title: '' })} className="rounded-full bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-black cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white">
                Request a property
              </button>
            )}
          </div>
        )}
      </section>

      {selected && (
        <ListingDialog
          listing={selected}
          onClose={() => setParam('ref', '', true)}
          onInquire={() => {
            setInquiring({ ref: selected.ref, title: selected.title });
            setParam('ref', '', true);
          }}
        />
      )}

      <InquireModal
        isOpen={inquiring !== null}
        onClose={() => setInquiring(null)}
        defaultEnterprise="Alpha Premier Realty"
        listing={inquiring?.ref ? inquiring : undefined}
      />
    </>
  );
}
