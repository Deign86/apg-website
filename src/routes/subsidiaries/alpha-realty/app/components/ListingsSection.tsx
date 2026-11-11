import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { LiquidGlass } from 'quick-liquid/react';
import { ArrowRight, ImageOff } from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { useContent } from '@/hooks/useContent';
import { RichText } from '@/components/RichText';
import { realtyHref } from './ListingCard';
import { Reveal, rise, SectionHeading } from './reveal';
import { ARROW, BUTTON_PRIMARY, BUTTON_SECONDARY, CTA_PANEL, GLASS_BADGE, GOLD_ACCENT, TEXT_LINK } from './ui';

const PAGE_X = 'mx-auto max-w-7xl px-5 sm:px-8 lg:px-12';

/** A service row as /api/services.php sends it (admin-authored; every field is re-read in toService). */
interface ServiceRow {
  id?: string | number;
  title?: string;
  description?: string;
  /** Shown as the small label on the photo ("Custom Brokerage Terms"). */
  price?: string;
  image_url?: string;
  features?: string[];
}

interface Service {
  key: string;
  title: string;
  description: string;
  tag: string;
  image: string;
  features: string[];
  listings: ListingsLink | undefined;
}

interface ListingsLink {
  label: string;
  /** Properties page filtered to one listing type. */
  href: string;
}

/**
 * A service's matching listings, found from words in its title (services carry no listing type). The first
 * match wins; a service that matches none gets no link.
 */
const LISTINGS_BY_TITLE: { words: RegExp; label: string; type: string }[] = [
  { words: /office|tower/i, label: 'See office spaces', type: 'office' },
  { words: /warehous|industrial|logistic/i, label: 'See warehouses', type: 'warehouse' },
  { words: /\bland\b|\blots?\b/i, label: 'See lots', type: 'lot' },
  { words: /residential|condo|penthouse|house/i, label: 'See condos and houses', type: 'condo' },
  { words: /commercial|retail/i, label: 'See commercial spaces', type: 'commercial' },
];

const text = (v: string | number | undefined): string => (v == null ? '' : String(v).trim());

function toService(row: ServiceRow, index: number): Service | null {
  const title = text(row.title);
  if (!title) return null;
  const match = LISTINGS_BY_TITLE.find((m) => m.words.test(title));
  return {
    key: text(row.id) || `${index}-${title}`,
    title,
    description: text(row.description),
    tag: text(row.price),
    image: text(row.image_url),
    features: Array.isArray(row.features) ? row.features.map((f) => text(f)).filter(Boolean) : [],
    listings: match && { label: match.label, href: realtyHref(`/properties?type=${match.type}`) },
  };
}

interface ServiceCardProps {
  service: Service;
  number: number;
  onInquire: (title: string) => void;
}

function ServiceCard({ service, number, onInquire }: ServiceCardProps) {
  const [broken, setBroken] = React.useState(false);
  const photo = service.image && !broken;
  return (
    <motion.article
      variants={rise}
      aria-labelledby={`service-${number}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01)_60%)] transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-[#c5a85c]/45 hover:shadow-[0_24px_50px_-24px_rgba(197,168,92,0.35)] motion-reduce:hover:translate-y-0"
    >
      <span aria-hidden="true" className="absolute inset-x-8 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#c5a85c]/80 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative aspect-[16/9] overflow-hidden bg-[#0d0d10] sm:aspect-[3/1]">
        {photo ? (
          <img
            src={service.image}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          // Same placeholder as a listing without photos.
          <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_50%_40%,rgba(197,168,92,0.14),transparent_65%)]">
            <span className="flex flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
              <ImageOff className="size-6 text-[#c5a85c]/60" aria-hidden="true" />
              Photo coming soon
            </span>
          </div>
        )}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
        {service.tag && (
          <div className="absolute left-4 top-4">
            <LiquidGlass config={GLASS_BADGE}>
              <span className="block px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f0dfae]">{service.tag}</span>
            </LiquidGlass>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7 short:p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 id={`service-${number}`} className="text-xl font-semibold leading-snug text-white">
            {service.title}
          </h2>
          <span aria-hidden="true" className="font-display text-2xl italic leading-none text-white/20 transition-colors duration-500 group-hover:text-[#c5a85c]/70">
            {String(number).padStart(2, '0')}
          </span>
        </div>
        {service.description && <p className="mt-2 text-pretty text-[15px] leading-relaxed text-white/70">{service.description}</p>}
        {service.features.length > 0 && (
          <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm text-white/75 sm:grid-cols-2">
            {service.features.map((feature) => (
              <li key={feature} className="flex gap-2.5 text-pretty">
                <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-[#c5a85c]" />
                {feature}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex flex-col gap-1 pt-5 sm:items-start">
          <button type="button" onClick={() => onInquire(service.title)} className={`${BUTTON_SECONDARY} w-full px-6 sm:w-auto`}>
            Inquire about this service
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
          {service.listings && (
            <Link to={service.listings.href} className={`${TEXT_LINK} self-center sm:self-start`}>
              {service.listings.label}
              <ArrowRight className={ARROW} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function ServiceCardSkeleton() {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
      <div className="aspect-[16/9] animate-pulse bg-white/[0.04] motion-reduce:animate-none sm:aspect-[3/1]" />
      <div className="space-y-3 p-7">
        <div className="h-5 w-2/3 rounded-full bg-white/[0.06]" />
        <div className="h-3 w-full rounded-full bg-white/[0.04]" />
        <div className="h-3 w-5/6 rounded-full bg-white/[0.04]" />
      </div>
    </div>
  );
}

interface ListingsSectionProps {
  /** Opens the inquiry popup: about one service, or a general inquiry with no title. */
  onInquireClick: (serviceTitle?: string) => void;
}

/**
 * Realty's Services page: the admin-authored services (/api/services.php) as cards with their photo, label,
 * features, an inquiry about that service and a link to the matching listings, then a closing call to action.
 * Heading copy is admin-editable (content page 'realty', src/data/realtyContent.json).
 */
export default function ListingsSection({ onInquireClick }: ListingsSectionProps) {
  const { services: rows, loading } = useServices('realty');
  const { content } = useContent('realty');
  // SAFETY: useServices is untyped JS over /api/services.php; toService re-reads every field it uses.
  const services = (rows as ServiceRow[]).map(toService).filter((s): s is Service => s !== null);

  return (
    <div id="realty-services" className={`${PAGE_X} pb-16 pt-28 sm:pb-24 sm:pt-32`}>
      <Reveal className="max-w-3xl">
        <SectionHeading id="realty-services-title" page align="left" eyebrow={String(content.services_badge ?? '')} title={String(content.services_heading ?? '')} />
        <motion.p variants={rise} className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-white/70 sm:text-base">
          {String(content.services_intro ?? '')}
        </motion.p>
      </Reveal>

      {loading && services.length === 0 ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:mt-12 lg:gap-8">
          {[0, 1, 2, 3].map((i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      ) : services.length > 0 ? (
        <Reveal amount={0.05} className="mt-10 grid gap-6 md:grid-cols-2 lg:mt-12 lg:gap-8">
          {services.map((service, i) => (
            <ServiceCard key={service.key} service={service} number={i + 1} onInquire={onInquireClick} />
          ))}
        </Reveal>
      ) : (
        <p className="mt-10 max-w-xl text-pretty rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-5 text-[15px] leading-relaxed text-white/70">
          Our service list is being updated. Tell us what you need and an advisor will get back to you within one business day.
        </p>
      )}

      <Reveal className="mt-12 sm:mt-16">
        <motion.div variants={rise} className={CTA_PANEL}>
          <div>
            <p className="font-display text-xl text-white sm:text-2xl">
              <RichText text="Not Sure Where to **Start**?" strongClassName={GOLD_ACCENT} />
            </p>
            <p className="mt-1 text-sm text-white/65">Our licensed brokers will point you to the right space or service.</p>
          </div>
          <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
            <button type="button" onClick={() => onInquireClick()} className={`${BUTTON_PRIMARY} px-4 sm:px-7`}>
              Speak with a broker
            </button>
            <Link to={realtyHref('/properties')} className={`${BUTTON_SECONDARY} px-4 sm:px-7`}>
              Properties
            </Link>
          </div>
        </motion.div>
      </Reveal>
    </div>
  );
}
