import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { LiquidGlass } from 'quick-liquid/react';
import { ChevronDown, Handshake, Lightbulb, TrendingUp } from 'lucide-react';
import { RichText } from '@/components/RichText';
import { useContent } from '@/hooks/useContent';
import { useServices } from '@/hooks/useServices';
import ClosingPanel from './ClosingPanel';
import { Reveal, rise, SectionHeading, settle } from './headings';
import { toLuxeService, type LuxeService, type ServiceRow } from './services';
import {
  BODY,
  BUTTON_GLASS,
  BUTTON_PRIMARY,
  CAPS,
  CONTAINER,
  DIAMOND,
  DISPLAY,
  DOUBLE_FRAME,
  FOCUS,
  GLASS_ICON,
  GLASS_SQUARE,
  GLASS_TAG,
  GOLD_ACCENT,
  IVORY,
  LINK_RULE,
  roman,
  SCREEN,
  SWIPE_ROW,
  TEXT_LINK,
} from './ui';

const LOGO = '/assets/luxe-prime/7._LOGO_LUXE_PRIME-png.webp';
// Curved towers seen from below (Unsplash photo-1527576539890), graded for this site: the white sky turned black
// with a soft gold glow where the logo sits, the building in black and gold. 1600x2000, so phones get the full height.
const HERO_PHOTO = '/images/luxe-prime-hero.webp';
const ABOUT_PHOTO = 'https://images.unsplash.com/photo-1780257562941-d9a6923befa1?auto=format&w=1200&q=75';
const ADVANTAGE_ICONS = [Handshake, TrendingUp, Lightbulb];
/** The hero's one entrance on load. */
const EASE = [0.22, 1, 0.36, 1] as const;

/** Admin titles typed in capitals ("ELEVATED") read as title case ("Elevated"). */
const calm = (s: string): string => (s === s.toUpperCase() ? s.toLowerCase().replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase()) : s);

interface HomePageProps {
  onNavigate: (page: 'services' | 'inquire') => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const reduce = useReducedMotion();
  /** The philosophy text past its first paragraph is behind "Read more". */
  const [more, setMore] = useState(false);
  const { content } = useContent('luxe-prime');
  const { services: rows, loading } = useServices('luxe-prime', []);
  // SAFETY: useServices is untyped JS over /api/services.php; toLuxeService re-reads every field it uses.
  const services = (rows as ServiceRow[]).map(toLuxeService).filter((s): s is LuxeService => s !== null);
  // SAFETY: the 'luxe-prime' registry types advantages as a repeater of { title, body }.
  const advantages = content.advantages as { title: string; body: string }[];
  const paragraphs = String(content.philosophy_text).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  // The last paragraph is the closing statement ("We don't just manage real estate…"), set apart as a quote.
  const statement = paragraphs.length > 1 ? paragraphs[paragraphs.length - 1] : '';
  const body = statement ? paragraphs.slice(0, -1) : paragraphs;
  const philosophyTitle = calm(String(content.philosophy_title));

  const scrollPastHero = () => document.getElementById('philosophy')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });

  return (
    <div className="relative w-full" id="luxe-home">
      {/* 1. HERO: logo, the tagline and two actions, one stack centred in the screen both ways (equal space above and below). */}
      <section
        id="luxe-hero"
        className="relative isolate flex h-[100svh] min-h-[36rem] w-full flex-col items-center justify-center gap-[clamp(1.5rem,4svh,2.5rem)] overflow-hidden px-5 py-[clamp(5rem,12svh,7.5rem)] text-center"
      >
        <motion.div
          aria-hidden="true"
          // 32% down keeps the dark sky (the photo's middle) behind the logo on wide screens.
          className="absolute inset-0 -z-20 bg-cover bg-[center_32%]"
          style={{ backgroundImage: `url(${JSON.stringify(HERO_PHOTO)})` }}
          initial={reduce ? false : { opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.4, ease: EASE }}
        />
        {/* The photo is already dark: a light dim, a soft gold halo behind the logo, and a fade into the page under the text. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/25" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_40%,rgba(196,154,42,0.16),transparent_32%),radial-gradient(ellipse_at_50%_42%,transparent_45%,rgba(2,2,3,0.7)_100%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-[45%] bg-gradient-to-b from-transparent via-[#030302]/60 to-[#030302]" />

        <h1 className="sr-only">Luxe Prime Realty — Luxury Estates, Residences &amp; Property Management</h1>
        <motion.img
          src={LOGO}
          alt="Luxe Prime Realty"
          width={1020}
          height={1020}
          decoding="async"
          // The logo art sits on black: screen blending drops the black square over the photo.
          className="h-[clamp(10rem,38svh,19rem)] w-auto max-w-[85vw] mix-blend-screen"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.2, ease: EASE }}
        />

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.7, ease: EASE }}
          className="flex flex-col items-center gap-4"
        >
          <p className={`${DISPLAY} ${IVORY} text-balance text-[clamp(1.7rem,1.1rem+2vw,2.8rem)] leading-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.75)]`}>
            <span className={GOLD_ACCENT}>{String(content.hero_tagline_a)}</span> {String(content.hero_tagline_b)}
          </p>
          <span aria-hidden="true" className="flex items-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#C49A2A]" />
            <span className={DIAMOND} />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#C49A2A]" />
          </span>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.1, ease: EASE }}
          className="flex w-full max-w-sm flex-col gap-4 sm:w-auto sm:max-w-none sm:flex-row sm:gap-5"
        >
          <button type="button" onClick={() => onNavigate('inquire')} className={BUTTON_PRIMARY}>
            Inquire Now
          </button>
          <LiquidGlass config={GLASS_SQUARE} liquidPress>
            <button type="button" onClick={() => onNavigate('services')} className={BUTTON_GLASS}>
              Our Services
            </button>
          </LiquidGlass>
        </motion.div>

        {/* Quiet scroll cue (no looping animation). */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 sm:block"
        >
          <LiquidGlass config={GLASS_SQUARE} liquidPress>
            <button type="button" onClick={scrollPastHero} aria-label="Scroll to the next section" className={GLASS_ICON}>
              <ChevronDown className="size-4" aria-hidden="true" />
            </button>
          </LiquidGlass>
        </motion.div>
      </section>

      {/* 2. PHILOSOPHY: the photo framed like a print (gold hairline mat, diamonds on two corners) beside the story. */}
      <section id="philosophy" aria-labelledby="luxe-philosophy-heading" className={SCREEN}>
        <Reveal className={`${CONTAINER} grid items-center gap-10 lg:grid-cols-12 lg:gap-14`}>
          <motion.div variants={rise} className="relative border border-[#C49A2A]/40 p-2 sm:p-3 lg:col-span-6">
            <span aria-hidden="true" className={`${DIAMOND} absolute -left-[3px] -top-[3px] size-2`} />
            <span aria-hidden="true" className={`${DIAMOND} absolute -bottom-[3px] -right-[3px] size-2`} />
            <div className="overflow-hidden border border-[#C49A2A]/20">
              <motion.img variants={settle}
                src={ABOUT_PHOTO}
                alt="A luxury living room with dark marble walls and warm gold lighting"
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover md:max-h-[56svh]"
              />
            </div>
          </motion.div>
          <div className="flex flex-col gap-5 lg:col-span-6">
            <SectionHeading
              id="luxe-philosophy-heading"
              eyebrow={String(content.philosophy_eyebrow)}
              title={philosophyTitle.includes('**') ? philosophyTitle : `**${philosophyTitle}**`}
              align="left"
            />
            <motion.p variants={rise} className={`${DISPLAY} text-xl italic text-[#F5F0E8]/85 sm:text-2xl`}>
              {String(content.philosophy_subtitle)}
            </motion.p>
            <motion.div variants={rise} className={`${BODY} max-w-prose space-y-3`}>
              {(more ? body : body.slice(0, 1)).map((p, i) => (
                <p key={i} id={i === 1 ? 'luxe-philosophy-more' : undefined} className="text-pretty">
                  <RichText text={p} strongClassName="font-semibold text-[#F0D080]" />
                </p>
              ))}
              {body.length > 1 && (
                <button
                  type="button"
                  aria-expanded={more}
                  aria-controls="luxe-philosophy-more"
                  onClick={() => setMore((m) => !m)}
                  className={`cursor-pointer text-[15px] font-medium text-[#C49A2A] underline decoration-[#C49A2A]/40 underline-offset-4 transition-colors duration-200 hover:text-[#F0D080] ${FOCUS}`}
                >
                  {more ? 'Show less' : 'Read more'}
                </button>
              )}
            </motion.div>
            {statement && (
              <motion.blockquote variants={rise} className={`${DISPLAY} max-w-prose border-l border-[#C49A2A]/70 pl-4 text-lg italic leading-snug text-[#F5F0E8]/85 sm:text-xl`}>
                <RichText text={statement} strongClassName="text-[#E3C06A]" />
              </motion.blockquote>
            )}
            <motion.div variants={rise}>
              <button type="button" onClick={() => onNavigate('services')} className={TEXT_LINK}>
                Explore our services
                <span aria-hidden="true" className={LINK_RULE} />
              </button>
            </motion.div>
          </div>
        </Reveal>
      </section>

      {/* 3. SIGNATURE SERVICES: four framed photo cards with Roman numerals (a swipe row on phones). */}
      {(loading || services.length > 0) && (
        <section aria-labelledby="luxe-services-heading" aria-busy={loading} className={SCREEN}>
          {/* Restarts once the services are in, so cards that arrive after the reveal still rise in. */}
          <Reveal key={loading ? 'loading' : 'ready'} className={CONTAINER}>
            <SectionHeading id="luxe-services-heading" eyebrow="What we do" title="Signature **Services**" className="mb-8 sm:mb-10" />
            <div className={`${SWIPE_ROW} sm:grid-cols-2 lg:grid-cols-4`}>
              {loading
                ? [0, 1, 2, 3].map((i) => (
                    <div key={i} aria-hidden="true" className="w-[78%] shrink-0 snap-start border border-[#C49A2A]/20 p-2 sm:w-auto">
                      <div className="aspect-[3/2] animate-pulse bg-white/[0.04] lg:aspect-[16/9] motion-reduce:animate-none" />
                      <div className="space-y-3 px-3 pb-3 pt-4">
                        <div className="h-4 w-3/4 animate-pulse bg-white/10 motion-reduce:animate-none" />
                        <div className="h-3 w-full animate-pulse bg-white/5 motion-reduce:animate-none" />
                      </div>
                    </div>
                  ))
                : services.slice(0, 4).map((service, idx) => (
                    <motion.article variants={rise} key={service.key} className="w-[78%] shrink-0 snap-start sm:w-auto">
                      <ServiceCardView service={service} number={idx + 1} onOpen={() => onNavigate('services')} />
                    </motion.article>
                  ))}
            </div>
            <motion.div variants={rise} className="mt-4 flex justify-center sm:mt-6">
              <button type="button" onClick={() => onNavigate('services')} className={TEXT_LINK}>
                View all services
                <span aria-hidden="true" className={LINK_RULE} />
              </button>
            </motion.div>
          </Reveal>
        </section>
      )}

      {/* 4. WHAT SETS US APART: three centred, double-framed cards, then the closing call to inquire. */}
      <section aria-labelledby="luxe-apart-heading" className={SCREEN}>
        <Reveal className={CONTAINER}>
          <SectionHeading id="luxe-apart-heading" eyebrow="Why Luxe Prime" title="What Sets Us **Apart**" />
          <motion.p variants={rise} className={`${BODY} mx-auto mb-6 mt-3 max-w-2xl text-center sm:mb-8`}>
            <RichText text={String(content.advantages_intro)} strongClassName="font-semibold text-[#F5F0E8]" />
          </motion.p>
          <ul className={`${SWIPE_ROW} sm:grid-cols-3`}>
            {advantages.map((item, idx) => {
              const Icon = ADVANTAGE_ICONS[idx % ADVANTAGE_ICONS.length];
              return (
                <motion.li variants={rise} key={item.title} className="w-[82%] shrink-0 snap-start sm:w-auto">
                  <div className={`${DOUBLE_FRAME} group flex h-full flex-col items-start gap-3 px-6 pb-6 pt-7 text-left transition-[border-color,outline-color] duration-200 hover:border-[#C49A2A]/70 hover:outline-[#C49A2A]/30 sm:px-7`}>
                    <span aria-hidden="true" className={`${CAPS} absolute right-5 top-4 text-xs tracking-[0.12em] text-[#C49A2A]/80`}>{roman(idx + 1)}</span>
                    {/* The icon sits in a diamond: a square turned 45°, the icon turned back. */}
                    <span aria-hidden="true" className="my-1 grid size-11 rotate-45 place-items-center border border-[#C49A2A]/55 transition-colors duration-200 group-hover:bg-[#C49A2A]">
                      <Icon className="size-[18px] -rotate-45 text-[#C49A2A] transition-colors duration-200 group-hover:text-[#0a0703]" />
                    </span>
                    <h3 className={`${DISPLAY} ${IVORY} text-2xl leading-tight`}>{item.title}</h3>
                    <p className="line-clamp-3 text-pretty text-[15px] leading-relaxed text-[#F5F0E8]/70">{item.body}</p>
                  </div>
                </motion.li>
              );
            })}
          </ul>

          <ClosingPanel
            className="mt-6 sm:mt-8"
            title="Ready to Experience **Luxe Prime**?"
            text="Talk to our asset management specialists about a strategy for your property."
            primary={{ label: 'Inquire Now', onClick: () => onNavigate('inquire') }}
            secondary={{ label: 'Services', onClick: () => onNavigate('services') }}
          />
        </Reveal>
      </section>
    </div>
  );
}

/** A service photo card framed like a print; the whole card opens the Services page (one button, stretched over it). */
function ServiceCardView({ service, number, onOpen }: { service: LuxeService; number: number; onOpen: () => void }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="group relative flex h-full flex-col border border-[#C49A2A]/25 bg-[#080705]/85 p-2 transition-[translate,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#C49A2A]/70 motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[3/2] overflow-hidden bg-[#0d0b07] lg:aspect-[16/9]">
        {service.image && !broken && (
          <img
            src={service.image}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
            className="size-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/75 to-transparent" />
        <div aria-hidden="true" className="absolute bottom-2.5 left-2.5">
          <LiquidGlass config={GLASS_TAG}>
            <span className={`${CAPS} block border border-[#C49A2A]/50 px-2.5 py-1 text-xs tracking-[0.12em] text-[#F0D080]`}>{roman(number)}</span>
          </LiquidGlass>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-4">
        <h3 className={`${DISPLAY} ${IVORY} text-xl leading-snug`}>{service.title}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-[#F5F0E8]/65">{service.text}</p>
        {/* Stretched over the whole card, so the card is the click target and this row can stay short. */}
        <button
          type="button"
          onClick={onOpen}
          className={`mt-auto inline-flex cursor-pointer items-center gap-3 self-start pt-1 text-sm font-medium text-[#C49A2A] transition-colors group-hover:text-[#F0D080] after:absolute after:inset-0 after:content-[''] ${FOCUS}`}
        >
          Learn more
          <span className="sr-only">: {service.title}</span>
          <span aria-hidden="true" className={LINK_RULE} />
        </button>
      </div>
    </div>
  );
}
