import React from 'react';
import { motion, useInView, useReducedMotion, type Variants } from 'motion/react';
import { EASE, Reveal, rise, SectionHeading } from './reveal';
import { LiquidGlass } from 'quick-liquid/react';
import {
  ArrowRight,
  Building2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  HeartHandshake,
  Home,
  LandPlot,
  MapPin,
  Pause,
  PhilippinePeso,
  Play,
  Users,
  Warehouse,
} from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { useContent } from '@/hooks/useContent';
import { RichText } from '@/components/RichText';
import { ListingCard, ListingCardSkeleton, LiveCount } from './ListingCard';
import AlphaPremierLogo from './AlphaPremierLogo';
import {
  ARROW,
  BUTTON_GLASS,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  CTA_PANEL,
  SWIPE_ROW,
  FOCUS,
  GLASS_BADGE,
  GLASS_CIRCLE,
  GLASS_ICON,
  GLASS_PILL,
  GOLD_ACCENT,
  TEXT_LINK,
} from './ui';

// Admin-editable copy: content page 'realty' (src/data/realtyContent.json); defaults = the shipped copy.
type Space = { tabLabel: string; badge: string; description: string; image: string };
type TitleText = { title: string; text: string };

// Icons stay in code, assigned by position (the admin help text lists the same order).
const SERVICE_ICONS = [Building2, Warehouse, Home, LandPlot];
const WHY_ICONS = [Calendar, PhilippinePeso, MapPin, HeartHandshake, Users, Clock];

/** Featured spaces: time per slide (the progress bar runs this long, then advances the slide). */
const SLIDE_MS = 6000;

// One screen per section from md up: the scrolled header is 64px (px, so it holds when the Realty rem
// eases down on short screens), so a section is the rest of the screen. Phones keep their natural height. A gold hairline marks the top of each section.
const SECTION =
  'relative flex w-full scroll-mt-[64px] flex-col justify-center px-5 py-10 sm:px-8 sm:py-14 md:min-h-[calc(100svh-64px)] md:py-[clamp(2rem,5svh,4.5rem)] lg:px-12 before:pointer-events-none before:absolute before:inset-x-5 before:top-0 before:mx-auto before:h-px before:max-w-7xl before:bg-gradient-to-r before:from-transparent before:via-[#c5a85c]/25 before:to-transparent sm:before:inset-x-8 lg:before:inset-x-12';
const CONTAINER = 'mx-auto w-full max-w-7xl';
const BODY = 'text-[15px] leading-relaxed text-white/75 sm:text-base';

// Photos settle from a slight zoom as they reveal.
const settle: Variants = { hidden: { scale: 1.08 }, show: { scale: 1, transition: { duration: 1.6, ease: EASE } } };

const listingCount = (loading: boolean, count: number): string =>
  loading ? 'Loading listings…' : `${count} ${count === 1 ? 'listing' : 'listings'}`;

interface HomeSectionProps {
  onExploreExpertise: () => void;
  onInquireClick?: (propertyTitle?: string) => void;
  onViewProperties: () => void;
  onOpenListing: (ref: string) => void;
}

export default function HomeSection({ onExploreExpertise, onInquireClick, onViewProperties, onOpenListing }: HomeSectionProps) {
  const { listings, syncedAt, loading } = useListings();
  const { content } = useContent('realty');
  const reduce = useReducedMotion();
  // SAFETY: useContent keeps only stored values that match each registered field's type
  // (api/data/content-schema.json): text and image fields are strings, repeaters are arrays.
  const copy = content as {
    hero_line1: string; hero_line2: string; hero_background: string;
    about_heading: string; about_text: string; about_image: string;
    spaces: Space[]; home_services: TitleText[]; why_items: TitleText[];
  };
  const spaces = copy.spaces;
  const services = copy.home_services;
  const whyItems = copy.why_items;
  const inquire = () => (onInquireClick ? onInquireClick() : onExploreExpertise());

  const scrollPastHero = () => {
    document.getElementById('realty-hero')?.nextElementSibling?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className="relative w-full bg-transparent" id="home-section">
      {/* 1. HERO: the logo, headline and actions form one stack centred in the screen. Enters in
          sequence over ~1.3s. */}
      <section
        id="realty-hero"
        className="relative isolate flex h-[100svh] min-h-[36rem] w-full flex-col items-center justify-center gap-[clamp(1.75rem,5svh,3rem)] overflow-hidden px-5 pb-[clamp(5rem,12svh,7.5rem)] pt-[clamp(5.5rem,12svh,7.5rem)] text-center"
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${JSON.stringify(copy.hero_background)})` }}
          initial={reduce ? false : { scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.6, ease: EASE }}
        />
        {/* A soft gold halo behind the logo, a vignette, and a fade into the page under the text, so any
            admin photo keeps the logo and copy readable. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_38%,rgba(214,186,112,0.14),transparent_30%),radial-gradient(ellipse_at_50%_42%,transparent_45%,rgba(2,2,3,0.6)_100%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-[45%] bg-gradient-to-b from-transparent via-[#020203]/55 to-[#020203]" />

        <h1 className="sr-only">Alpha Premier Realty — Commercial Real Estate &amp; Brokerage in the Philippines</h1>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
        >
          <AlphaPremierLogo className="h-[clamp(8.5rem,28svh,14rem)] max-w-[90vw]" />
        </motion.div>

        <div className="flex w-full max-w-4xl flex-col items-center gap-6 sm:gap-7">
          <div className="flex flex-col items-center gap-2 [text-shadow:0_2px_18px_rgba(0,0,0,0.75)] sm:gap-3">
            <span className="block overflow-hidden pb-1">
              <motion.p
                initial={reduce ? false : { y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
                className="font-display text-balance text-[clamp(1.5rem,1rem+1.8vw,2.5rem)] leading-tight text-white"
              >
                <RichText text={copy.hero_line1} strongClassName={GOLD_ACCENT} />
              </motion.p>
            </span>
            <span className="block overflow-hidden">
              <motion.p
                initial={reduce ? false : { y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.9, delay: 0.65, ease: EASE }}
                className="text-[clamp(0.95rem,0.85rem+0.4vw,1.2rem)] font-light tracking-[0.06em] text-white/80"
              >
                {copy.hero_line2}
              </motion.p>
            </span>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease: EASE }}
            className="flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4"
          >
            <button type="button" onClick={onViewProperties} className={BUTTON_PRIMARY}>
              View properties
              <ArrowRight className={ARROW} aria-hidden="true" />
            </button>
            <LiquidGlass config={GLASS_PILL} liquidPress>
              <button type="button" onClick={inquire} className={BUTTON_GLASS}>
                Inquire now
              </button>
            </LiquidGlass>
          </motion.div>
        </div>

        {/* Quiet scroll cue (no looping animation): a small glass button that fades in after the hero. */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:block"
        >
          <LiquidGlass config={GLASS_CIRCLE} liquidPress>
            <button type="button" onClick={scrollPastHero} aria-label="Scroll to the next section" className={GLASS_ICON}>
              <ChevronDown className="size-4" aria-hidden="true" />
            </button>
          </LiquidGlass>
        </motion.div>
      </section>

      {/* 2. AVAILABLE NOW: live listings from the APR Drive (absent when the feed is empty). */}
      {(loading || listings.length > 0) && (
        <section aria-labelledby="realty-available-heading" aria-busy={loading} className={SECTION}>
          <Reveal className={CONTAINER}>
            {/* Count + "View all" sit beside the title (not under it) so three cards still fit a short screen. */}
            <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
              <SectionHeading id="realty-available-heading" eyebrow="Live listings" title="Available **Now**" align="left" />
              <motion.div variants={rise} className="flex shrink-0 flex-col items-end">
                <div className="mb-1 hidden sm:block">
                  <LiveCount text={listingCount(loading, listings.length)} syncedAt={loading ? null : syncedAt} />
                </div>
                <button type="button" onClick={onViewProperties} className={TEXT_LINK}>
                  View all
                  <ArrowRight className={ARROW} aria-hidden="true" />
                </button>
              </motion.div>
            </div>
            <motion.div variants={rise} className="-mt-2 mb-5 sm:hidden">
              <LiveCount text={listingCount(loading, listings.length)} syncedAt={loading ? null : syncedAt} />
            </motion.div>
            <div className={`${SWIPE_ROW} sm:grid-cols-2 lg:grid-cols-3 sm:max-lg:[&>*:nth-child(3)]:hidden`}>
              {loading
                ? [0, 1, 2].map((i) => (
                  <div key={i} className="w-[82%] shrink-0 snap-start sm:w-auto"><ListingCardSkeleton /></div>
                ))
                : listings.slice(0, 3).map((l) => (
                  <motion.div key={l.ref} variants={rise} className="w-[82%] shrink-0 snap-start sm:w-auto">
                    <ListingCard listing={l} onOpen={(item) => onOpenListing(item.ref)} />
                  </motion.div>
                ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* 3. ABOUT: one heading, one short paragraph, one photo in an offset gold frame. */}
      <section id="realty-about" aria-labelledby="realty-about-heading" className={SECTION}>
        <Reveal className={`${CONTAINER} grid items-center gap-8 lg:grid-cols-12 lg:gap-14`}>
          <motion.div variants={rise} className="relative mr-3 mb-3 sm:mr-4 sm:mb-4 lg:col-span-7">
            <span aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border border-[#c5a85c]/35 sm:translate-x-4 sm:translate-y-4" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
              <motion.img
                variants={settle}
                src={copy.about_image}
                alt="Alpha Premier Realty: city skyline at night"
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover md:max-h-[56svh]"
              />
            </div>
          </motion.div>
          <div className="flex flex-col gap-5 lg:col-span-5">
            <SectionHeading id="realty-about-heading" eyebrow="About us" title={copy.about_heading} align="left" />
            <motion.p variants={rise} className={`${BODY} line-clamp-6 max-w-prose`}>
              {copy.about_text}
            </motion.p>
            <motion.div variants={rise}>
              <button type="button" onClick={onExploreExpertise} className={TEXT_LINK}>
                Explore our services
                <ArrowRight className={ARROW} aria-hidden="true" />
              </button>
            </motion.div>
          </div>
        </Reveal>
      </section>

      {/* 4. FEATURED SPACES: titles on the left, the photo on the right; 6s per slide. */}
      {spaces.length > 0 && <FeaturedSpaces spaces={spaces} />}

      {/* 5. SERVICES: four cards, icon + title + one line. */}
      <section id="services-offered-section" aria-labelledby="realty-services-heading" className={SECTION}>
        <Reveal className={CONTAINER}>
          <SectionHeading id="realty-services-heading" eyebrow="Our capabilities" title="Services **Offered**" className="mb-8 sm:mb-12" />
          <div className={`${SWIPE_ROW} sm:grid-cols-2 lg:grid-cols-4`}>
            {services.map((service, idx) => {
              const Icon = SERVICE_ICONS[idx % SERVICE_ICONS.length];
              return (
                <motion.article key={idx} variants={rise} className="w-[78%] shrink-0 snap-start sm:w-auto">
                  <div className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01)_60%)] p-6 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-[#c5a85c]/45 hover:shadow-[0_24px_50px_-24px_rgba(197,168,92,0.35)] motion-reduce:hover:translate-y-0 sm:p-7">
                    <span aria-hidden="true" className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#c5a85c]/70 to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="flex items-start justify-between">
                      <span className="grid size-11 place-items-center rounded-full border border-[#c5a85c]/35 text-[#c5a85c] transition-colors duration-500 group-hover:bg-[#c5a85c] group-hover:text-[#0a0a0c]">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span aria-hidden="true" className="font-display text-2xl italic text-white/20 transition-colors duration-500 group-hover:text-[#c5a85c]/70">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold leading-snug text-white">{service.title}</h3>
                    <p className="line-clamp-3 text-[15px] leading-relaxed text-white/70">{service.text}</p>
                  </div>
                </motion.article>
              );
            })}
          </div>
          <motion.div variants={rise} className="mt-6 flex justify-center sm:mt-10">
            <button type="button" onClick={onExploreExpertise} className={TEXT_LINK}>
              View all services
              <ArrowRight className={ARROW} aria-hidden="true" />
            </button>
          </motion.div>
        </Reveal>
      </section>

      {/* 6. WHY CHOOSE US: six short benefits, then the closing call to inquire. */}
      <section id="why-choose-alpha-realty" aria-labelledby="realty-why-heading" className={SECTION}>
        <Reveal className={CONTAINER}>
          <SectionHeading id="realty-why-heading" eyebrow="Partnership advantages" title="Why Choose **Alpha Realty**" className="mb-6 sm:mb-12" />
          <ul className="grid grid-cols-2 gap-x-5 gap-y-5 sm:gap-x-8 sm:gap-y-6 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-9">
            {whyItems.map((item, idx) => {
              const Icon = WHY_ICONS[idx % WHY_ICONS.length];
              return (
                <motion.li key={idx} variants={rise} className="group relative border-t border-white/10 pt-4 sm:pt-5">
                  {/* A gold line draws across the top rule on hover. */}
                  <span aria-hidden="true" className="absolute -top-px left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[#c5a85c] to-transparent transition-transform duration-700 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
                  <h3 className="flex items-center gap-2.5 text-[15px] font-semibold leading-snug text-white sm:text-lg">
                    <Icon className="size-4 shrink-0 text-[#c5a85c] sm:size-5" aria-hidden="true" />
                    {item.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-white/65 sm:line-clamp-2 sm:text-[15px]">{item.text}</p>
                </motion.li>
              );
            })}
          </ul>

          <motion.div
            variants={rise}
            className={`${CTA_PANEL} mt-8 sm:mt-14`}
          >
            <div>
              <p className="font-display text-xl text-white sm:text-2xl">
                <RichText text="Find Your Next **Space**" strongClassName={GOLD_ACCENT} />
              </p>
              <p className="mt-1 text-sm text-white/65">Earn special bonuses with every lease signed.</p>
            </div>
            <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
              <button type="button" onClick={inquire} className={`${BUTTON_PRIMARY} px-4 sm:px-7`}>Inquire now</button>
              <button type="button" onClick={onViewProperties} className={`${BUTTON_SECONDARY} px-4 sm:px-7`}>Properties</button>
            </div>
          </motion.div>
        </Reveal>
      </section>
    </div>
  );
}

/**
 * Slideshow of the admin "spaces": a list of titles (the active one expands with its line of text and
 * a progress bar; chips on phones) beside a cross-fading photo with a slow zoom and glass controls.
 * Advances every SLIDE_MS while in view; pauses on hover, keyboard focus or the pause button; never
 * auto-advances with reduced motion.
 */
function FeaturedSpaces({ spaces }: { spaces: Space[] }) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [activeSpaceIndex, setActiveSpaceIndex] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [stopped, setStopped] = React.useState(false);

  // An admin may remove slides while one is showing.
  const count = spaces.length;
  const active = activeSpaceIndex % count;
  const autoplay = count > 1 && !reduce;
  const running = autoplay && inView && !stopped && !hovered && !focused;
  const next = () => setActiveSpaceIndex((i) => (i + 1) % count);
  const previous = () => setActiveSpaceIndex((i) => ((i % count) - 1 + count) % count);

  return (
    <section ref={ref} id="realty-spaces" aria-labelledby="realty-spaces-heading" className={SECTION}>
      <Reveal className={`${CONTAINER} grid items-center gap-6 sm:gap-8 md:grid-cols-12 md:grid-rows-[auto_1fr] md:gap-x-10 md:gap-y-8 lg:gap-x-14`}>
        <SectionHeading id="realty-spaces-heading" eyebrow="Featured spaces" title="Find Your **Space**" align="left" className="md:col-span-5" />

        <motion.div
          variants={rise}
          className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#06070a] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] md:col-span-7 md:col-start-6 md:row-span-2 md:row-start-1 md:h-full md:max-h-[min(60svh,34rem)]"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {spaces.map((space, idx) => (
            <img
              key={idx}
              src={space.image}
              alt={idx === active ? space.tabLabel : ''}
              aria-hidden={idx === active ? undefined : true}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 size-full object-cover [transition:opacity_900ms_ease,transform_6500ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:[transition:none] ${
                idx === active ? 'scale-100 opacity-100' : 'scale-[1.06] opacity-0'
              }`}
            />
          ))}
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 sm:inset-x-4 sm:bottom-4">
            <LiquidGlass config={GLASS_BADGE} className="min-w-0">
              <span className="block truncate px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f0dfae]">
                {spaces[active].badge}
              </span>
            </LiquidGlass>
            {count > 1 && (
              // Phones switch slides with the chips below, so only the pause button stays on the photo.
              <div className="flex shrink-0 gap-2">
                <LiquidGlass config={GLASS_CIRCLE} liquidPress className="hidden sm:block">
                  <button type="button" onClick={previous} aria-label="Previous space" className={GLASS_ICON}>
                    <ChevronLeft className="size-4" aria-hidden="true" />
                  </button>
                </LiquidGlass>
                {autoplay && (
                  <LiquidGlass config={GLASS_CIRCLE} liquidPress>
                    <button type="button" onClick={() => setStopped((s) => !s)} aria-label={stopped ? 'Play slideshow' : 'Pause slideshow'} className={GLASS_ICON}>
                      {stopped ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
                    </button>
                  </LiquidGlass>
                )}
                <LiquidGlass config={GLASS_CIRCLE} liquidPress className="hidden sm:block">
                  <button type="button" onClick={next} aria-label="Next space" className={GLASS_ICON}>
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                </LiquidGlass>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={rise}
          className="min-w-0 md:col-span-5 md:row-start-2 md:self-start"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { const to = e.relatedTarget; if (!(to instanceof Node && e.currentTarget.contains(to))) setFocused(false); }}
        >
          {/* Phones: a swipeable row of chips with the active text below. From sm: a numbered list whose
              active row expands with its text. The progress bar runs along the active chip/row. */}
          <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:block sm:overflow-visible sm:border-t sm:border-white/10 sm:px-0">
            {spaces.map((space, idx) => {
              const isActive = idx === active;
              return (
                <li key={idx} className="relative shrink-0 overflow-hidden rounded-full sm:overflow-visible sm:rounded-none sm:border-b sm:border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveSpaceIndex(idx)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`group flex w-full cursor-pointer items-baseline gap-4 whitespace-nowrap rounded-full border px-4 py-2 text-left text-sm font-semibold transition-colors duration-300 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-3.5 sm:text-lg ${
                      isActive ? 'border-[#c5a85c]/60 bg-[#c5a85c]/10 text-white' : 'border-white/15 text-white/55 hover:text-white/85'
                    } ${FOCUS}`}
                  >
                    <span className={`hidden w-6 shrink-0 font-display text-sm italic tabular-nums transition-colors duration-300 sm:inline ${isActive ? 'text-[#c5a85c]' : 'text-white/55'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    {space.tabLabel}
                  </button>
                  <div
                    aria-hidden={!isActive}
                    className={`hidden transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none sm:grid ${isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <p className="overflow-hidden pl-10 text-[15px] leading-relaxed text-white/70">
                      <span className="block pb-3.5">{space.description}</span>
                    </p>
                  </div>
                  {isActive && autoplay && (
                    <span
                      key={active}
                      aria-hidden="true"
                      onAnimationEnd={next}
                      style={{ animation: `realty-progress ${SLIDE_MS}ms linear forwards`, animationPlayState: running ? 'running' : 'paused' }}
                      className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-[#c5a85c] sm:-bottom-px sm:h-px"
                    />
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-[15px] leading-relaxed text-white/70 sm:hidden">{spaces[active].description}</p>
        </motion.div>
      </Reveal>
    </section>
  );
}
