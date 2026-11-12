import { useState } from 'react';
import { motion } from 'motion/react';
import { LiquidGlass } from 'quick-liquid/react';
import { Clock, Compass, Images, ShieldCheck, Target } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { useServices } from '@/hooks/useServices';
import ClosingPanel from './ClosingPanel';
import { Eyebrow, Reveal, rise, SectionHeading, settle } from './headings';
import Lightbox, { type GalleryState } from './Lightbox';
import { sized, toLuxeService, type LuxeService, type ServiceRow } from './services';
import {
  BODY,
  BUTTON_GLASS,
  BUTTON_PRIMARY,
  CAPS,
  CONTAINER,
  DIAMOND,
  DISPLAY,
  FOCUS,
  GLASS_SQUARE,
  IVORY,
  OPENING,
  PHOTO_ZOOM,
  PRINT_FRAME,
  roman,
  SCREEN,
} from './ui';

// Two-storey living room with a staircase and chandelier (Unsplash photo-1776362355123), the page's opening picture.
const HERO_PHOTO = 'https://images.unsplash.com/photo-1776362355123-ca966d36e29c?auto=format&w=1400&q=75';
const JOURNEY_ICONS = [Compass, Target, ShieldCheck, Clock];
/** A service photo's height: a fixed band on phones and tablets, about two thirds of the screen from lg, so a row
    (photo beside its text) fits one screen. */
const PHOTO_H = 'h-60 sm:h-80 lg:h-[clamp(16rem,60svh,38rem)]';

const scrollToService = (n: number) =>
  document.getElementById(`luxe-service-${n}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });

interface ServicesPageProps {
  /** Opens the inquiry, with the service it is about when there is one. */
  onInquire: (service?: string) => void;
}

/** Luxe Prime services: an opening screen with an index, one screen per service, the client journey, the close. */
export default function ServicesPage({ onInquire }: ServicesPageProps) {
  const { content } = useContent('luxe-prime');
  const { services: rows, loading } = useServices('luxe-prime', []);
  // SAFETY: useServices is untyped JS over /api/services.php; toLuxeService re-reads every field it uses.
  const services = (rows as ServiceRow[]).map(toLuxeService).filter((s): s is LuxeService => s !== null);
  // SAFETY: the 'luxe-prime' registry types journey_steps as a repeater of { title, description }.
  const journey = content.journey_steps as { title: string; description: string }[];
  const [gallery, setGallery] = useState<GalleryState | null>(null);

  return (
    <div id="luxe-services">
      {gallery && <Lightbox state={gallery} onClose={() => setGallery(null)} />}

      {/* Opening screen: what is offered, an index of the services, and a framed photograph. Enters once. */}
      <header className={OPENING}>
        <Reveal className={`${CONTAINER} grid items-center gap-10 lg:grid-cols-12 lg:gap-14`}>
          <div className="flex flex-col gap-6 lg:col-span-6">
            <SectionHeading id="luxe-services-title" eyebrow="Master services" title="Signature Real Estate **Solutions**" align="left" page />
            <motion.p variants={rise} className={`${BODY} max-w-xl`}>
              Precision-crafted property management, subleasing and asset strategy for owners who demand distinction.
            </motion.p>
            {services.length > 0 && (
              <motion.nav variants={rise} aria-label="Services on this page">
                <ol className="border-t border-[#C49A2A]/25">
                  {services.map((service, i) => (
                    <li key={service.key} className="border-b border-[#C49A2A]/25">
                      <button
                        type="button"
                        onClick={() => scrollToService(i + 1)}
                        className={`group flex min-h-12 w-full cursor-pointer items-center gap-4 py-3 text-left transition-colors duration-200 ${FOCUS}`}
                      >
                        <span className={`${CAPS} w-8 shrink-0 text-[11px] tracking-[0.24em] text-[#C49A2A]`}>{roman(i + 1)}</span>
                        <span className="flex-1 text-base text-[#F5F0E8]/85 transition-colors duration-200 group-hover:text-[#F0D080]">{service.title}</span>
                        <span aria-hidden="true" className="h-px w-6 bg-[#C49A2A]/60 transition-transform duration-200 group-hover:translate-x-1" />
                      </button>
                    </li>
                  ))}
                </ol>
              </motion.nav>
            )}
          </div>
          <motion.div variants={rise} className={`${PRINT_FRAME} lg:col-span-6`}>
            <span aria-hidden="true" className={`${DIAMOND} absolute -left-[3px] -top-[3px] size-2`} />
            <span aria-hidden="true" className={`${DIAMOND} absolute -bottom-[3px] -right-[3px] size-2`} />
            <img
              src={HERO_PHOTO}
              alt="A two-storey living room with a sweeping staircase and a chandelier"
              width={1400}
              height={933}
              decoding="async"
              fetchpriority="high"
              className="h-56 w-full object-cover sm:h-80 lg:h-[clamp(16rem,58svh,36rem)]"
            />
          </motion.div>
        </Reveal>
      </header>

      <section aria-label="Services" aria-busy={loading}>
        {loading ? (
          <div aria-hidden="true" className={SCREEN}>
            <div className={`${CONTAINER} grid items-center gap-10 lg:grid-cols-12 lg:gap-14`}>
              <div className={`${PHOTO_H} animate-pulse border border-[#C49A2A]/20 bg-white/[0.03] lg:col-span-7 motion-reduce:animate-none`} />
              <div className="space-y-4 lg:col-span-5">
                <div className="h-3 w-32 animate-pulse bg-[#C49A2A]/20 motion-reduce:animate-none" />
                <div className="h-9 w-3/4 animate-pulse bg-white/10 motion-reduce:animate-none" />
                <div className="h-4 w-full animate-pulse bg-white/5 motion-reduce:animate-none" />
                <div className="h-4 w-5/6 animate-pulse bg-white/5 motion-reduce:animate-none" />
              </div>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className={`${SCREEN} text-center`}>
            <div className={`${CONTAINER} flex flex-col items-center gap-4`}>
              <p className={`${DISPLAY} ${IVORY} text-balance text-3xl`}>Our services are being updated.</p>
              <p className={`${BODY} text-pretty`}>Tell us what your property needs and our team will reply within one business day.</p>
              <button type="button" onClick={() => onInquire()} className={BUTTON_PRIMARY}>Send an inquiry</button>
            </div>
          </div>
        ) : (
          services.map((service, i) => (
            <ServiceRowView key={service.key} service={service} number={i + 1} flip={i % 2 === 1} onInquire={onInquire} onGallery={setGallery} />
          ))
        )}
      </section>

      {journey.length > 0 && (
        <section aria-labelledby="luxe-journey-heading" className={SCREEN}>
          <Reveal amount={0.15} className={CONTAINER}>
            <SectionHeading id="luxe-journey-heading" eyebrow="Our process" title="The Client **Journey**" />
            <motion.p variants={rise} className={`${BODY} mx-auto mb-8 mt-4 max-w-2xl text-pretty text-center`}>{String(content.journey_intro)}</motion.p>
            {/* A timeline: one hairline through every step's diamond (wide screens), numbered I, II, III… */}
            <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              <span aria-hidden="true" className="absolute inset-x-[12%] top-[1.4rem] hidden h-px bg-[#C49A2A]/40 lg:block" />
              {journey.map((step, idx) => {
                const Icon = JOURNEY_ICONS[idx % JOURNEY_ICONS.length];
                return (
                  <motion.li variants={rise} key={step.title} className="relative flex flex-col items-center gap-3 text-center">
                    <span aria-hidden="true" className="grid size-11 rotate-45 place-items-center border border-[#C49A2A]/60 bg-[#030302]">
                      <Icon className="size-[18px] -rotate-45 text-[#C49A2A]" />
                    </span>
                    <span className={`${CAPS} mt-2 text-[11px] tracking-[0.3em] text-[#C49A2A]`}>Step {roman(idx + 1)}</span>
                    <h3 className={`${DISPLAY} ${IVORY} text-balance text-2xl font-medium leading-tight`}>{step.title}</h3>
                    <p className="max-w-xs text-pretty text-[15px] leading-relaxed text-[#F5F0E8]/70">{step.description}</p>
                  </motion.li>
                );
              })}
            </ol>
            <ClosingPanel
              className="mt-10"
              title="Ready to Experience **Luxe Prime**?"
              text="Connect with our asset management specialists for a subleasing or property administration strategy tailored to your estate."
              primary={{ label: 'Schedule a consultation', onClick: () => onInquire() }}
            />
          </Reveal>
        </section>
      )}
    </div>
  );
}

interface ServiceRowViewProps {
  service: LuxeService;
  number: number;
  /** Photo on the right (every other service). */
  flip: boolean;
  onInquire: (service?: string) => void;
  onGallery: (gallery: GalleryState) => void;
}

/**
 * One service, one screen: the photo framed like a print (height-bounded, so the row fits the screen) beside a text
 * block centred on it: numeral, title, text, features, one action. Photo and text alternate sides.
 */
function ServiceRowView({ service, number, flip, onInquire, onGallery }: ServiceRowViewProps) {
  const [broken, setBroken] = useState(false);
  const headingId = `luxe-service-${number}-title`;
  return (
    <article id={`luxe-service-${number}`} aria-labelledby={headingId} className={SCREEN}>
      <Reveal amount={0.25} className={`${CONTAINER} grid items-center gap-10 lg:grid-cols-12 lg:gap-16`}>
        <motion.div variants={rise} className={`${PRINT_FRAME} group lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
          <span aria-hidden="true" className={`${DIAMOND} absolute -left-[3px] -top-[3px] size-2`} />
          <span aria-hidden="true" className={`${DIAMOND} absolute -bottom-[3px] -right-[3px] size-2`} />
          <div className={`relative ${PHOTO_H} overflow-hidden bg-[#0d0b07]`}>
            {service.image && !broken && (
              <motion.img variants={settle}
                src={sized(service.image, 1400)}
                alt={service.title}
                loading="lazy"
                decoding="async"
                onError={() => setBroken(true)}
                className={`size-full object-cover ${PHOTO_ZOOM}`}
              />
            )}
            {service.photos.length > 0 && (
              <div className="absolute bottom-3 right-3">
                <LiquidGlass config={GLASS_SQUARE} liquidPress>
                  <button
                    type="button"
                    onClick={() => onGallery({ title: service.title, photos: service.photos, index: 0 })}
                    className={`${BUTTON_GLASS} h-11 px-5`}
                  >
                    <Images className="size-4" aria-hidden="true" />
                    View {service.photos.length} photos
                  </button>
                </LiquidGlass>
              </div>
            )}
          </div>
        </motion.div>

        <div className={`flex flex-col items-start gap-5 lg:col-span-5 ${flip ? 'lg:order-1' : ''}`}>
          <Eyebrow centered={false}>Service {roman(number)}</Eyebrow>
          <motion.h2 variants={rise} id={headingId} className={`${DISPLAY} ${IVORY} text-balance text-[clamp(2rem,1.4rem+1.5vw,2.75rem)] font-medium leading-[1.08]`}>
            {service.title}
          </motion.h2>
          {service.text && <motion.p variants={rise} className={`${BODY} text-pretty`}>{service.text}</motion.p>}
          {service.features.length > 0 && (
            <motion.ul variants={rise} className="w-full border-t border-[#C49A2A]/20">
              {service.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 border-b border-[#C49A2A]/20 py-2.5 text-[15px] text-[#F5F0E8]/85">
                  <span aria-hidden="true" className={DIAMOND} />
                  {feature}
                </li>
              ))}
            </motion.ul>
          )}
          <motion.button variants={rise} type="button" onClick={() => onInquire(service.title)} className={`${BUTTON_PRIMARY} mt-1`}>
            Inquire about this service
          </motion.button>
        </div>
      </Reveal>
    </article>
  );
}
