import React, { startTransition, useEffect, useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  Building,
  Building2,
  ChevronRight,
  House,
  LandPlot,
  LayoutGrid,
  Search,
  Store,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import Seo from '@/components/Seo';
import { inHub, parentHub, useListings, type Listing, type ListingHub } from '@/hooks/useListings';
import { hubSeo, listingSeo } from '@/lib/listingSeo';
import { ListingCard, ListingCardSkeleton, LiveCount, publicUrl, realtyHref } from './ListingCard';
import { ListingView } from './ListingView';
import { ShareLinks } from './ShareLinks';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, EYEBROW, FOCUS, GOLD_ACCENT, SMALL_CAPS } from './ui';

const DEALS = [
  { value: '', label: 'All' },
  { value: 'lease', label: 'For Lease' },
  { value: 'sale', label: 'For Sale' },
] as const;

/** Popular searches listed before "Show all". */
const POPULAR_SEARCHES = 24;
/** Listings shown at first, and added by each "Show more". */
const PAGE = 24;

const PAGE_X = 'mx-auto max-w-7xl px-5 sm:px-8 lg:px-12';
const CHIP = `inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm transition-colors ${FOCUS}`;
const CHIP_IDLE = 'border-white/10 text-white/65 hover:border-[#c5a85c]/50 hover:text-white';
/** The selected filter's highlight glides to the newly selected button (one shared layoutId per group). */
const SLIDE = { type: 'spring', stiffness: 420, damping: 36, mass: 0.8 } as const;
/** Icon per listing type (the feed's `type` keys); other types get Building2. */
const TYPE_ICONS = new Map<string, LucideIcon>([
  ['office', Building2],
  ['commercial', Store],
  ['warehouse', Warehouse],
  ['condo', Building],
  ['lot', LandPlot],
  ['house-lot', House],
]);
/** Listings fade up as they appear; each "Show more" batch staggers by this much per card. */
const STAGGER_MS = 35;
/** "More like this" in an open listing. */
const SIMILAR = 3;

/** Cards rendered with the first paint of the list (four rows on a wide screen); the rest follow right after. */
const FIRST_CARDS = 12;

function matches(l: Listing, q: string): boolean {
  if (!q) return true;
  const text = [l.ref, l.title, l.area, l.type_label, l.size, l.price, ...l.terms].join(' ').toLowerCase();
  return q.toLowerCase().split(/\s+/).every((word) => text.includes(word));
}

/** A browse page's h1 with what follows "for" in gold italic: "Warehouses for *Lease in Cavite*". */
function HubTitle({ h1 }: { h1: string }) {
  const at = h1.indexOf(' for ');
  if (at < 0) return <>{h1}</>;
  return <>{h1.slice(0, at)} for <span className={GOLD_ACCENT}>{h1.slice(at + 5)}</span></>;
}

/** A titled row of links to browse pages (real links: a plain click stays in the app); nothing when empty. */
function HubLinks({ title, hubs, label = (hub) => hub.h1, id, children }: {
  title: string;
  hubs: ListingHub[];
  label?: (hub: ListingHub) => string;
  id?: string;
  children?: React.ReactNode;
}) {
  const titleId = useId();
  if (hubs.length === 0) return null;
  return (
    <div>
      <h2 id={titleId} className={SMALL_CAPS}>{title}</h2>
      <ul id={id} aria-labelledby={titleId} className="mt-3 flex flex-wrap gap-2">
        {hubs.map((hub) => (
          <li key={hub.path} className="max-w-full">
            <Link to={realtyHref(hub.path)} className={`${CHIP} ${CHIP_IDLE} h-auto min-h-10 max-w-full whitespace-normal py-2 text-pretty`}>
              {label(hub)} <span className="text-white/55 tabular-nums">{hub.count}</span>
            </Link>
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}

interface PropertiesSectionProps {
  /** The APR-XXXXXX ref after /properties/ ('' otherwise): the listing whose dialog is open. */
  listingRef: string;
  /** Browse page whose listings to show (/properties/warehouse-for-lease[/cavite]); '' for all of them. */
  hubPath: string;
  /** Opens a listing at its own URL, keeping the filter query. */
  onOpenListing: (ref: string) => void;
  /** Returns from a listing's URL to the list (replacing its history entry). */
  onCloseListing: () => void;
  /** Opens Realty's inquiry popup for a general "find me a property" request (a listing's own form is in ListingView). */
  onInquire: () => void;
}

/**
 * Realty's live listings page (realty.alphapremiergroup.com/properties), fed by the Drive sync, and its browse
 * pages (/properties/warehouse-for-lease[/cavite]): the same page narrowed to one hub's listings.
 * Each listing has its own URL (/properties/APR-XXXXXX) that shows this page with its dialog open.
 * The list shows PAGE listings, then "Show more"; any change of filter or page starts it over.
 */
export default function PropertiesSection({ listingRef, hubPath, onOpenListing, onCloseListing, onInquire }: PropertiesSectionProps) {
  const [params, setParams] = useSearchParams();
  const { listings, hubs, syncedAt, loading, error } = useListings();
  const [allSearches, setAllSearches] = useState(false);
  const slide = useReducedMotion() ? { duration: 0 } : SLIDE;
  // The first screenful of cards paints first; the rest of a long list renders right after, as a low-priority
  // update, so a slow phone does not wait for every card (each one costs a few ms) before showing any.
  const [allCards, setAllCards] = useState(false);
  useEffect(() => {
    if (loading) return;
    const frame = requestAnimationFrame(() => startTransition(() => setAllCards(true)));
    return () => cancelAnimationFrame(frame);
  }, [loading]);

  const hub = (hubPath && hubs.find((h) => h.path === hubPath)) || null;
  // A browse path the feed has no hub for (all leased or sold, or mistyped) shows every listing instead.
  const unknownHub = Boolean(hubPath) && !loading && !error && !hub;
  // A browse page fixes the type and deal: only the search box narrows it.
  const browsing = Boolean(hubPath) && !unknownHub;
  const parent = hub && hub.area_slug !== '' ? parentHub(hub, hubs) : undefined;

  const q = params.get('q') ?? '';
  const type = browsing ? '' : params.get('type') ?? '';
  const deal = browsing ? '' : params.get('deal') ?? '';

  // How many listings are shown, for the current filters: a new filter or browse page starts over at PAGE.
  const listKey = `${hubPath}|${q}|${type}|${deal}`;
  const [shown, setShown] = useState({ key: listKey, count: PAGE });
  const shownCount = shown.key === listKey ? shown.count : PAGE;

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

  const pool = useMemo(() => (hub ? listings.filter((l) => inHub(l, hub)) : listings), [listings, hub]);
  const visible = useMemo(
    () => pool.filter((l) => (!type || l.type === type) && (!deal || l.deal === deal) && matches(l, q.trim())),
    [pool, type, deal, q],
  );
  const showing = Math.min(shownCount, visible.length);
  const selected = listings.find((l) => l.ref === listingRef) ?? null;
  // A listing URL whose ref is not in the feed (leased, sold, hidden or mistyped) shows the list instead.
  const unavailable = Boolean(listingRef) && !loading && !error && !selected;
  const filtered = Boolean(q || type || deal);

  // Browse links: a type + deal hub lists its areas; an area hub its type + deal hub and the area's other hubs.
  const related = !hub
    ? []
    : hub.area_slug === ''
      ? hubs.filter((h) => h.indexable && h.area_slug !== '' && h.type === hub.type && h.deal === hub.deal)
      : [...(parent ? [parent] : []), ...hubs.filter((h) => h.indexable && h.area_slug === hub.area_slug && (h.type !== hub.type || h.deal !== hub.deal))];
  const popular = hubs.filter((h) => h.indexable && h.area_slug !== ''); // largest first
  // The open listing links to its area's hub when that is indexable, else to its type + deal hub.
  const more = selected
    ? hubs.find((h) => h.indexable && h.area_slug !== '' && inHub(selected, h)) ?? hubs.find((h) => h.area_slug === '' && inHub(selected, h))
    : undefined;
  // "More like this": the same type and deal, same area first, in feed order.
  const similar = selected
    ? listings
      .filter((l) => l.ref !== selected.ref && l.type === selected.type && l.deal === selected.deal)
      .sort((a, b) => Number(b.area_slug === selected.area_slug) - Number(a.area_slug === selected.area_slug))
      .slice(0, SIMILAR)
    : [];

  return (
    <div id="realty-properties">
      {/* Head tags wait for the feed. react-helmet-async registers a Helmet while it renders, so a first render
          React throws away (an interrupted retry of the lazy route) keeps its tags for good: rendered while
          loading, the list's canonical and og:url would stay on a noindex browse or listing page. */}
      {loading ? null : selected ? (
        <Seo enterprise="realty" {...listingSeo(selected)} />
      ) : hub ? (
        <Seo enterprise="realty" {...hubSeo(hub, hubs)} />
      ) : (
        <Seo
          enterprise="realty"
          path="/properties"
          title="Available Properties for Lease & Sale | Alpha Premier Realty"
          description="Office spaces, commercial spaces, warehouses and lots for lease or sale across Metro Manila and nearby provinces, updated live from Alpha Premier Realty."
          noindex={unavailable || unknownHub}
        />
      )}

      <section className={`${PAGE_X} pb-8 pt-28 sm:pt-32`}>
        {hub ? (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              {[{ path: '/properties', h1: 'Available Properties' }, ...(parent ? [parent] : [])].map((step) => (
                <li key={step.path} className="flex items-center gap-2">
                  <Link to={realtyHref(step.path)} className={`rounded font-semibold text-[#c5a85c] transition-colors hover:text-[#dfc47b] ${FOCUS}`}>
                    {step.h1}
                  </Link>
                  <ChevronRight className="size-3.5 shrink-0 text-white/30" aria-hidden="true" />
                </li>
              ))}
              <li aria-current="page" className="text-white/70">{hub.h1}</li>
            </ol>
          </nav>
        ) : (
          <p className={EYEBROW}>
            <span aria-hidden="true" className="h-px w-8 bg-[#c5a85c]" />
            Live listings
          </p>
        )}
        <h1 className="mt-4 text-balance font-display text-[clamp(2.1rem,1.4rem+2.4vw,3.4rem)] leading-[1.08] text-white">
          {hub ? <HubTitle h1={hub.h1} /> : <>Available <span className={GOLD_ACCENT}>Properties</span></>}
        </h1>
        {hub && <p className="mt-3 max-w-3xl text-pretty text-[15px] leading-relaxed text-white/70">{hub.description}</p>}
        {hub && <ShareLinks url={publicUrl(hub.path)} className="mt-4" />}
        <p className="mt-4" role="status">
          <LiveCount
            text={loading ? 'Loading listings…' : `${visible.length === pool.length ? pool.length : `${visible.length} of ${pool.length}`} ${pool.length === 1 ? 'listing' : 'listings'}`}
            syncedAt={loading ? null : syncedAt}
          />
        </p>
        {(unavailable || unknownHub) && (
          <p className="mt-5 text-pretty rounded-2xl border border-[#c5a85c]/35 bg-[#c5a85c]/[0.08] px-5 py-3.5 text-sm text-white/85" role="status">
            {unavailable
              ? `This property (Ref ${listingRef}) is no longer available. Here are our current listings.`
              : "We don't have listings for this search right now. Here are all available properties."}
          </p>
        )}

        <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <label htmlFor="properties-search" className="sr-only">Search properties</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#c5a85c]/80" aria-hidden="true" />
            <input
              id="properties-search"
              type="search"
              value={q}
              onChange={(e) => setParam('q', e.target.value, true)}
              placeholder="Search city, size or ref"
              className="h-12 w-full rounded-full border border-white/10 bg-white/[0.03] pl-11 pr-5 text-sm text-white placeholder-white/55 outline-none transition-colors focus:border-[#c5a85c]/70 focus:bg-white/[0.05]"
            />
          </div>
          {!browsing && (
            <div className="flex h-12 rounded-full border border-white/10 bg-white/[0.03] p-1" role="group" aria-label="Lease or sale">
              {DEALS.map((d) => {
                const on = deal === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setParam('deal', d.value)}
                    aria-pressed={on}
                    className={`relative flex-1 cursor-pointer whitespace-nowrap rounded-full px-5 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-300 lg:flex-none ${FOCUS} ${on ? 'text-[#0a0a0c]' : 'text-white/65 hover:text-white'}`}
                  >
                    {on && (
                      <motion.span
                        layoutId="realty-deal-highlight"
                        transition={slide}
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#e6cd86,#c5a85c)] shadow-[0_6px_18px_-8px_rgba(197,168,92,0.75)]"
                      />
                    )}
                    <span className="relative">{d.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* One swipeable row below lg (the cut-off button at the edge shows there is more), wrapping from lg up.
            Icon + label + count; the highlight glides between buttons. */}
        {!browsing && types.length > 1 && (
          <motion.div
            layoutScroll
            role="group"
            aria-label="Property type"
            className="-mx-5 mt-3 flex gap-1 overflow-x-auto px-5 py-1 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {[['', { label: 'All types', count: listings.length }] as const, ...types].map(([key, t]) => {
              const on = type === key;
              const Icon = key ? TYPE_ICONS.get(key) ?? Building2 : LayoutGrid;
              return (
                <button
                  key={key || 'all'}
                  type="button"
                  onClick={() => setParam('type', key)}
                  aria-pressed={on}
                  className={`relative inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[13px] transition-colors duration-300 ${FOCUS} ${on ? 'text-[#f3e3b3]' : 'text-white/60 hover:bg-white/[0.04] hover:text-white'}`}
                >
                  {on && (
                    <motion.span
                      layoutId="realty-type-highlight"
                      transition={slide}
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full border border-[#c5a85c]/70 bg-[#c5a85c]/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_-12px_rgba(197,168,92,0.55)]"
                    />
                  )}
                  <Icon className={`relative size-4 transition-colors duration-300 ${on ? 'text-[#e6cd86]' : 'text-[#c5a85c]/70'}`} aria-hidden="true" />
                  <span className="relative">{t.label}</span>
                  <span className={`relative text-xs tabular-nums transition-colors duration-300 ${on ? 'text-[#c5a85c]' : 'text-white/55'}`}>{t.count}</span>
                </button>
              );
            })}
          </motion.div>
        )}

        {hub && related.length > 0 && (
          <nav aria-label="Related searches" className="mt-6">
            <HubLinks
              title={hub.area_slug === '' ? 'Browse by area' : 'Related searches'}
              hubs={related}
              label={hub.area_slug === '' ? (h) => h.area : undefined}
            />
          </nav>
        )}
      </section>

      <section className={`${PAGE_X} pb-20`} aria-label="Listings" aria-busy={loading}>
        {/* Keeps the heading order (page title, then this, then each card's title) for screen readers. */}
        <h2 className="sr-only">Listings</h2>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : visible.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
              {visible.slice(0, allCards ? showing : Math.min(showing, FIRST_CARDS)).map((l, i) => (
                <div
                  key={l.ref}
                  className="animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-backwards duration-500 motion-reduce:animate-none"
                  style={{ animationDelay: `${(i % PAGE) * STAGGER_MS}ms` }}
                >
                  <ListingCard listing={l} eager={i === 0} onOpen={(item) => onOpenListing(item.ref)} />
                </div>
              ))}
            </div>
            {visible.length > PAGE && (
              <div className="mt-12 flex flex-col items-center gap-4">
                <p className="text-sm text-white/55 tabular-nums">Showing {showing} of {visible.length}</p>
                <div aria-hidden="true" className="h-px w-48 overflow-hidden bg-white/10">
                  <div className="h-full bg-[#c5a85c] transition-[width] duration-500" style={{ width: `${(showing / visible.length) * 100}%` }} />
                </div>
                {showing < visible.length && (
                  <button type="button" onClick={() => setShown({ key: listKey, count: shownCount + PAGE })} className={BUTTON_SECONDARY}>
                    Show {Math.min(PAGE, visible.length - showing)} more
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-[#c5a85c]/20 bg-[radial-gradient(circle_at_50%_0%,rgba(197,168,92,0.12),transparent_60%)] px-6 py-16 text-center">
            <span className="grid size-16 place-items-center rounded-full border border-[#c5a85c]/40 text-[#c5a85c]">
              <Building2 className="size-7" aria-hidden="true" />
            </span>
            <p className="max-w-md text-pretty text-[15px] leading-relaxed text-white/75">
              {error
                ? "We couldn't load the listings right now. Tell us what you need and our realty team will send you matching properties."
                : filtered
                  ? 'No available property matches your search. New listings are added often.'
                  : 'Our listings are being updated. Tell us what you need and our realty team will send you matching properties.'}
            </p>
            {filtered && !error ? (
              <button type="button" onClick={() => setParams({})} className={BUTTON_PRIMARY}>Clear filters</button>
            ) : (
              <button type="button" onClick={() => onInquire()} className={BUTTON_PRIMARY}>Request a property</button>
            )}
          </div>
        )}
      </section>

      {!browsing && !filtered && hubs.length > 0 && (
        <nav aria-label="Browse properties" className={`${PAGE_X} pb-24`}>
          <div className="relative space-y-8 pt-10 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#c5a85c]/30 before:to-transparent">
            <HubLinks title="Browse by type" hubs={hubs.filter((h) => h.area_slug === '')} />
            <HubLinks title="Popular searches" hubs={allSearches ? popular : popular.slice(0, POPULAR_SEARCHES)} id="popular-searches">
              {popular.length > POPULAR_SEARCHES && (
                <button
                  type="button"
                  onClick={() => setAllSearches((open) => !open)}
                  aria-expanded={allSearches}
                  aria-controls="popular-searches"
                  className={`mt-4 cursor-pointer rounded text-sm font-semibold text-[#c5a85c] transition-colors hover:text-[#dfc47b] ${FOCUS}`}
                >
                  {allSearches ? 'Show fewer' : `Show all ${popular.length}`}
                </button>
              )}
            </HubLinks>
          </div>
        </nav>
      )}

      {/* Keyed by ref: opening a similar listing starts a fresh view (first photo, scrolled to the top). */}
      {selected && (
        <ListingView
          key={selected.ref}
          listing={selected}
          more={more}
          similar={similar}
          onClose={onCloseListing}
          onOpen={onOpenListing}
        />
      )}
    </div>
  );
}
