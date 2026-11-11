import React, { useEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { Link } from 'react-router-dom';
import { useInView, useReducedMotion } from 'motion/react';
import { LiquidGlass } from 'quick-liquid/react';
import { ArrowLeft, ArrowRight, Building2, Calendar, Check, ChevronLeft, ChevronRight, Hash, MapPin, Pause, Play, Ruler, Send, ShieldCheck, X } from 'lucide-react';
import { groupTerms, listingDateLabel, priceParts, type Listing, type ListingHub } from '@/hooks/useListings';
import { useModalDialog } from '@/hooks/useModalDialog';
import { listingSeo } from '@/lib/listingSeo';
import { InquiryForm } from './InquiryForm';
import { ListingCard, ListingPhoto, ListingTags, priceCaption, publicUrl, realtyHref } from './ListingCard';
import { ShareLinks } from './ShareLinks';
import { ARROW, BUTTON_PRIMARY, BUTTON_SECONDARY, CAPTION, EYEBROW, FOCUS, FOCUS_INSET, GLASS_BADGE, GLASS_CIRCLE, GLASS_ICON, GOLD_ACCENT, SMALL_CAPS, TEXT_LINK } from './ui';

const CONTAINER = 'mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12';
/** A horizontal swipe longer than this (px) on the photo pages through the photos. */
const SWIPE_PX = 40;
/** Photo autoplay: the wait before it starts (and after any manual change), then the time per photo. */
const IDLE_MS = 10_000;
const STEP_MS = 5_000;
/** A price amount longer than this (characters) is shown smaller in the price card. */
const LONG_AMOUNT = 24;
/** Key-fact columns in a wide right column, by number of facts (a listing can lack a type or size). */
const FACT_COLUMNS = ['', '', '@md:grid-cols-2', '@md:grid-cols-3', '@md:grid-cols-4'];
const PRICE_CARD =
  'rounded-3xl border border-[#c5a85c]/30 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(197,168,92,0.16),transparent_60%),linear-gradient(180deg,#121214,#0b0b0d)] shadow-[0_30px_80px_-40px_rgba(197,168,92,0.35)]';
const BACK_BUTTON = `group -ml-3 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.05] hover:text-[#f0dfae] ${FOCUS}`;
const BACK_ARROW = 'size-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:group-hover:translate-x-0';

/**
 * The listing's photos: the whole photo (phone strip included) over a blurred copy of itself, glass previous /
 * next, counter and pause, swipe on touch, arrow keys, and a thumbnail strip that keeps the current photo in view.
 * From lg the photo is sized to fit the screen with its thumbnails (the column beside it holds the details).
 *
 * Autoplay: after IDLE_MS without the visitor touching the photos it moves on every STEP_MS (a progress line runs
 * along the current thumbnail), once round, stopping back on the first photo. Hover, keyboard focus, the pause
 * button, `paused` (the inquiry form is open) or the photos being off screen hold it; any manual change restarts
 * the idle wait. Never with reduced motion.
 */
function Gallery({ listing, paused }: GalleryProps) {
  const [index, setIndex] = useState(0);
  /** How long the current photo stays: IDLE_MS after opening or a manual change, then STEP_MS. */
  const [wait, setWait] = useState(IDLE_MS);
  /** Bumped by every manual change, so the progress line starts over. */
  const [run, setRun] = useState(0);
  /** Paused with the button, or finished its round. */
  const [stopped, setStopped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { amount: 0.5 });
  const strip = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const count = listing.photos.length;
  const autoplay = count > 1 && !reduce;
  const running = autoplay && inView && !stopped && !paused && !hovered && !focused;

  const show = (i: number) => {
    setIndex(((i % count) + count) % count);
    setWait(IDLE_MS);
    setRun((r) => r + 1);
  };
  const advance = () => {
    const next = (index + 1) % count;
    setIndex(next);
    setWait(STEP_MS);
    if (next === 0) setStopped(true); // every photo has been shown
  };
  const togglePlay = () => {
    if (stopped) setWait(STEP_MS);
    setStopped((s) => !s);
  };

  useEffect(() => {
    if (count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      // In a text field (the inquiry form) the arrow keys move the cursor, not the photos.
      if (e.target instanceof Element && e.target.closest('input, textarea, select')) return;
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      setIndex((i) => (i + (e.key === 'ArrowRight' ? 1 : -1) + count) % count);
      setWait(IDLE_MS);
      setRun((r) => r + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [count]);

  // Centre the current thumbnail in the strip (scrolling only the strip, never the page).
  useEffect(() => {
    const row = strip.current;
    const thumb = row?.children[index];
    if (!row || !(thumb instanceof HTMLElement)) return;
    row.scrollTo({ left: thumb.offsetLeft - (row.clientWidth - thumb.clientWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
  }, [index, reduce]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      {/* lg: top gap (3rem, 2rem on short screens) + thumbnails (5.5rem) + bottom gap = 10rem (9rem) of the screen;
          the photo gets the rest. */}
      <div
        ref={box}
        className="relative -mx-5 aspect-[4/3] max-h-[70vh] overflow-hidden bg-black sm:mx-0 sm:aspect-[16/10] sm:rounded-3xl sm:border sm:border-white/10 lg:aspect-[4/3] lg:max-h-[calc(100svh-10rem)] short:max-h-[calc(100svh-9rem)]"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          touchX.current = null;
          if (start === null || count < 2) return;
          const dx = e.changedTouches[0].clientX - start;
          if (Math.abs(dx) > SWIPE_PX) show(index + (dx < 0 ? 1 : -1));
        }}
      >
        {count > 0 ? (
          // Keyed by photo, so each one fades in.
          <div key={index} className="absolute inset-0 animate-in fade-in-0 duration-500 motion-reduce:animate-none">
            <img src={listing.cards[index] ?? listing.photos[index]} alt="" aria-hidden="true" className="absolute inset-0 size-full scale-110 object-cover opacity-40 blur-2xl" />
            <img
              src={listing.photos[index]}
              alt={`${listing.title}, photo ${index + 1}`}
              fetchpriority="high"
              decoding="async"
              style={{ backgroundImage: `url("${listing.cards[index] ?? listing.photos[index]}")`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}
              className="relative size-full object-contain"
            />
          </div>
        ) : (
          <ListingPhoto listing={listing} className="size-full" />
        )}
        {count > 1 && (
          <>
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <LiquidGlass config={GLASS_CIRCLE} liquidPress>
                <button type="button" onClick={() => show(index - 1)} aria-label="Previous photo" className={GLASS_ICON}>
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
              </LiquidGlass>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <LiquidGlass config={GLASS_CIRCLE} liquidPress>
                <button type="button" onClick={() => show(index + 1)} aria-label="Next photo" className={GLASS_ICON}>
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              </LiquidGlass>
            </div>
            {/* Top left: the bottom of a Drive photo is its phone-number strip, the top right its logo. */}
            <div className="absolute left-3 top-3 flex items-center gap-2">
              <LiquidGlass config={GLASS_BADGE}>
                <span className="block px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-white tabular-nums" aria-hidden="true">
                  {index + 1} / {count}
                </span>
              </LiquidGlass>
              {autoplay && (
                <LiquidGlass config={GLASS_BADGE} liquidPress>
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={stopped ? 'Play photos' : 'Pause photos'}
                    className={`grid size-[30px] cursor-pointer place-items-center rounded-full text-white/85 transition-colors hover:text-[#f0dfae] ${FOCUS_INSET}`}
                  >
                    {stopped ? <Play className="size-3" aria-hidden="true" /> : <Pause className="size-3" aria-hidden="true" />}
                  </button>
                </LiquidGlass>
              )}
            </div>
            {/* Announced when the visitor changes the photo, not on every autoplay step. */}
            <span className="sr-only" aria-live={running ? 'off' : 'polite'}>
              Photo {index + 1} of {count}
            </span>
          </>
        )}
      </div>
      {count > 1 && (
        <div ref={strip} className="mt-3 flex gap-2 overflow-x-auto pb-2 [scrollbar-color:rgba(197,168,92,0.35)_transparent] [scrollbar-width:thin]">
          {listing.photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => show(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={`relative h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-[opacity,border-color] duration-300 ${FOCUS} ${i === index ? 'border-[#c5a85c]' : 'border-transparent opacity-50 hover:opacity-100'}`}
            >
              <img src={listing.cards[i] ?? src} alt="" loading="lazy" className="size-full object-cover object-top" />
              {i === index && autoplay && !stopped && (
                <span
                  key={run}
                  aria-hidden="true"
                  onAnimationEnd={advance}
                  style={{ animation: `realty-progress ${wait}ms linear forwards`, animationPlayState: running ? 'running' : 'paused' }}
                  className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-[#e6cd86]"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface GalleryProps {
  listing: Listing;
  /** Holds the autoplay (the inquiry form is open beside the photos). */
  paused: boolean;
}

interface ListingViewProps {
  listing: Listing;
  /** Browse page with more listings like this one. */
  more: ListingHub | undefined;
  /** Up to three other listings of the same type and deal, same area first. */
  similar: Listing[];
  onClose: () => void;
  /** Opens another listing (from "More like this"). */
  onOpen: (ref: string) => void;
}

/**
 * A listing at its own URL (/properties/APR-XXXXXX), full screen like a page of its own: it scrolls normally and
 * covers the list, which stays mounted underneath, so closing (the floating X, Esc or the browser's back button)
 * returns to the same place in the list. Portalled to <body> above the site header; useModalDialog traps focus,
 * locks the page scroll and returns focus.
 *
 * From lg it is a split screen: the photos on the left stay in view, and the right column holds everything a
 * client decides on (title, price and Inquire now, type / area / size / ref, the terms), which fits the first
 * screen for nearly every listing. "Inquire now" turns that column into the inquiry form, so the photos stay
 * beside it; Esc or "Back to details" returns. Phones stack photos, then details, with the price and Inquire
 * pinned to the bottom; their inquiry form replaces the photos and details.
 */
export function ListingView({ listing, more, similar, onClose, onOpen }: ListingViewProps) {
  const [inquiring, setInquiring] = useState(false);
  /** The sent inquiry's ticket ('' if the reply had none); null until it is sent. */
  const [ticket, setTicket] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const panelHeading = useRef<HTMLHeadingElement>(null);
  // Between the details, the form and "sent": render the new panel, then back to the top with focus on its heading.
  const switchTo = (update: () => void, heading: React.RefObject<HTMLHeadingElement | null>) => {
    flushSync(update);
    const target = heading.current;
    target?.closest('#realty-listing-dialog')?.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    target?.focus({ preventScroll: true });
  };
  const openInquiry = () => switchTo(() => setInquiring(true), panelHeading);
  const onSent = (sent: string) => switchTo(() => setTicket(sent), panelHeading);
  const showDetails = () =>
    switchTo(() => {
      setInquiring(false);
      setTicket(null);
    }, titleRef);
  // Esc steps back from the inquiry form to the details before it closes the listing.
  const ref = useModalDialog<HTMLDivElement>(true, inquiring ? showDetails : onClose);
  const { label, amount, note } = priceParts(listing.price);
  const caption = priceCaption(label, listing.deal);
  const groups = groupTerms(listing.terms);
  const dated = listingDateLabel(listing);
  const facts = [
    { name: 'Type', value: listing.type_label, Icon: Building2 },
    { name: 'Area', value: listing.area, Icon: MapPin },
    { name: 'Size', value: listing.size, Icon: Ruler },
    { name: 'Ref', value: listing.ref, Icon: Hash },
  ].filter((f) => f.value !== '');

  const details = (
    <div className="@container space-y-5 short:space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <ListingTags listing={listing} />
        </div>
        {/* Focus starts here when the view opens (useModalDialog): read first, no focus ring until Tab. */}
        <h2
          ref={titleRef}
          id="listing-dialog-title"
          tabIndex={-1}
          data-autofocus
          className="mt-3 text-balance font-display text-[clamp(1.6rem,1.1rem+1.1vw,2.125rem)] leading-[1.12] text-white outline-none short:text-[1.75rem]"
        >
          {listing.title}
        </h2>
        {dated && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-white/60">
            <Calendar className="size-3.5 shrink-0 text-[#c5a85c]" aria-hidden="true" />
            {dated.label} <time dateTime={dated.iso}>{dated.date}</time>
          </p>
        )}
      </div>

      <div className={`${PRICE_CARD} p-5 short:p-4`}>
        <p className={CAPTION}>{caption}</p>
        {/* Some Drive "prices" are a whole sentence: those get a smaller size. */}
        <p className={`mt-1 text-balance font-display leading-tight tabular-nums ${amount.length > LONG_AMOUNT ? 'text-xl' : 'text-[clamp(1.6rem,1.35rem+0.6vw,1.875rem)]'} ${amount ? 'text-[#e6cd86]' : 'text-white/75'}`}>
          {amount || 'On request'}
        </p>
        {note && <p className="mt-1 text-pretty text-sm text-white/60">{note}</p>}
        {/* Phones have Inquire in the bar pinned to the bottom. */}
        <div className="mt-4 hidden lg:block short:mt-3">
          <button type="button" onClick={openInquiry} className={`${BUTTON_PRIMARY} w-full`}>
            <Send className="size-4" aria-hidden="true" />
            Inquire now
          </button>
        </div>
        <p className="mt-3 flex gap-2 text-pretty text-xs leading-relaxed text-white/50">
          <ShieldCheck className="size-4 shrink-0 text-[#c5a85c]" aria-hidden="true" />
          <span>
            <strong className="font-semibold text-white/70">Disclaimer:</strong> Notice of availability is upon owner&apos;s confirmation. Exact
            location and viewing schedule are shared by our team after you inquire. Rates and availability are subject to confirmation.
          </span>
        </p>
      </div>

      {/* One row when the column is wide enough (lg up), else two. */}
      <dl className={`grid grid-cols-2 gap-2 ${FACT_COLUMNS[facts.length]}`}>
        {facts.map(({ name, value, Icon }) => (
          <div key={name} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
            <dt className={`${CAPTION} flex items-center gap-1.5`}>
              <Icon className="size-3.5 shrink-0 text-[#c5a85c]" aria-hidden="true" />
              {name}
            </dt>
            <dd className={`mt-1 break-words text-sm leading-snug text-white tabular-nums ${name === 'Ref' ? 'font-mono text-[13px]' : ''}`}>{value}</dd>
          </div>
        ))}
      </dl>

      {groups.length > 0 && (
        <section aria-labelledby="listing-details-heading">
          <h3 id="listing-details-heading" className={SMALL_CAPS}>
            Details
          </h3>
          <div className="mt-3 space-y-4">
            {groups.map((group, g) => (
              <div key={`${group.heading}-${g}`}>
                {group.heading && <h4 className="mb-1.5 text-sm font-semibold text-white">{group.heading}</h4>}
                <ul className="space-y-1.5 text-sm leading-relaxed text-white/75 tabular-nums">
                  {group.items.map((item, i) => (
                    <li key={`${item}-${i}`} className="flex gap-3 text-pretty">
                      <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-[#c5a85c]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-3 border-t border-white/[0.06] pt-5">
        <ShareLinks url={publicUrl(listingSeo(listing).path)} />
        {more && (
          <Link
            to={realtyHref(more.path)}
            className={`group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-[#e6cd86] transition-colors hover:border-[#c5a85c]/50 hover:bg-[#c5a85c]/[0.06] ${FOCUS}`}
          >
            <span className="text-pretty">More {more.h1}</span>
            <ArrowRight className={`${ARROW} shrink-0`} aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );

  const inquiry =
    ticket === null ? (
      <section aria-labelledby="listing-inquiry-heading" className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
        <button type="button" onClick={showDetails} className={BACK_BUTTON}>
          <ArrowLeft className={BACK_ARROW} aria-hidden="true" />
          Back to details
        </button>
        <h3
          ref={panelHeading}
          id="listing-inquiry-heading"
          tabIndex={-1}
          className="mt-2 font-display text-[clamp(1.5rem,1.2rem+1vw,2rem)] leading-tight text-white outline-none short:mt-0 short:text-2xl"
        >
          Inquire About This <span className={GOLD_ACCENT}>Property</span>
        </h3>
        {/* The listing this inquiry is about, in a soft gold frame so it is never in doubt. */}
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#c5a85c]/35 bg-[linear-gradient(100deg,rgba(197,168,92,0.12),rgba(197,168,92,0.02)_70%)] p-2.5 pr-4 shadow-[0_12px_32px_-20px_rgba(197,168,92,0.5)]">
          {listing.photos.length > 0 && (
            <img src={listing.cards[0] ?? listing.photos[0]} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover object-top ring-1 ring-[#c5a85c]/50" />
          )}
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">{listing.title}</p>
            <p className="mt-0.5 text-xs text-white/55">
              <span className="font-mono">{listing.ref}</span> · <span className="text-[#e6cd86]">{amount || `${caption} on request`}</span>
            </p>
          </div>
        </div>
        <div className="mt-5">
          <InquiryForm subject={{ title: listing.title, ref: listing.ref }} onSent={onSent} />
        </div>
      </section>
    ) : (
      <section aria-labelledby="listing-inquiry-heading" className={`${PRICE_CARD} p-6 animate-in fade-in-0 zoom-in-95 duration-300 motion-reduce:animate-none sm:p-8`}>
        <span className="grid size-12 place-items-center rounded-full bg-[#c5a85c]/15 text-[#e6cd86]">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <h3 ref={panelHeading} id="listing-inquiry-heading" tabIndex={-1} className="mt-5 font-display text-2xl text-white outline-none">
          Inquiry <span className={GOLD_ACCENT}>Sent</span>
        </h3>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-white/70">
          Thank you. An advisor will contact you about this property within one business day, and a confirmation is on its way to your email.
        </p>
        {ticket && (
          <p className="mt-3 text-xs text-white/50">
            Reference <span className="font-mono text-white/75">{ticket}</span>
          </p>
        )}
        <button type="button" onClick={showDetails} className={`${BUTTON_SECONDARY} mt-6`}>
          Back to details
        </button>
      </section>
    );

  return createPortal(
    <div
      ref={ref}
      id="realty-listing-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-dialog-title"
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#060608] outline-none animate-in fade-in-0 duration-300 motion-reduce:animate-none"
    >
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_at_50%_0%,rgba(197,168,92,0.12),transparent_70%)]" />

      {/* The one way out on screen (Esc and the browser's back button also close): no bar, it floats top right
          and stays in reach while the page scrolls. */}
      <div className="pointer-events-none sticky top-0 z-30 h-0">
        <div className={`${CONTAINER} flex justify-end pt-5 lg:pt-7 short:pt-4`}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`pointer-events-auto grid size-11 cursor-pointer place-items-center rounded-full border border-white/15 bg-[#0b0b0d]/60 text-white/85 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.8)] backdrop-blur-md transition-colors hover:border-[#c5a85c]/60 hover:text-[#f0dfae] ${FOCUS}`}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={`${CONTAINER} relative pb-12 pt-8 animate-in slide-in-from-bottom-4 duration-500 motion-reduce:animate-none lg:pb-16 lg:pt-12 short:pt-8`}>
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(21rem,1fr)] xl:gap-x-14">
          <div className={`min-w-0 ${inquiring ? 'max-lg:hidden' : ''}`}>
            <div className="lg:sticky lg:top-12 short:top-8">
              <Gallery listing={listing} paused={inquiring} />
            </div>
          </div>
          <div className="min-w-0">{inquiring ? inquiry : details}</div>
        </div>

        {similar.length > 0 && (
          <section aria-labelledby="listing-similar-heading" className={`mt-16 border-t border-white/[0.06] pt-12 ${inquiring ? 'max-lg:hidden' : ''}`}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className={EYEBROW}>
                  <span aria-hidden="true" className="h-px w-8 bg-[#c5a85c]" />
                  Similar listings
                </p>
                <h3 id="listing-similar-heading" className="mt-3 font-display text-[clamp(1.6rem,1.2rem+1.4vw,2.25rem)] leading-tight text-white">
                  More Like <span className={GOLD_ACCENT}>This</span>
                </h3>
              </div>
              {more && (
                <Link to={realtyHref(more.path)} className={TEXT_LINK}>
                  View all
                  <ArrowRight className={ARROW} aria-hidden="true" />
                </Link>
              )}
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((l) => (
                <ListingCard key={l.ref} listing={l} onOpen={(item) => onOpen(item.ref)} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Phones: price and Inquire pinned to the bottom of the screen (the form has its own Send). */}
      {!inquiring && (
        <div className="sticky bottom-0 z-20 border-t border-white/[0.08] bg-[#060608]/90 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-3xl items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className={CAPTION}>{caption}</p>
              <p className={`truncate font-display text-lg tabular-nums ${amount ? 'text-[#e6cd86]' : 'text-white/75'}`}>{amount || 'On request'}</p>
            </div>
            <button type="button" onClick={openInquiry} className={`${BUTTON_PRIMARY} shrink-0 px-6`}>
              <Send className="size-4" aria-hidden="true" />
              Inquire
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
