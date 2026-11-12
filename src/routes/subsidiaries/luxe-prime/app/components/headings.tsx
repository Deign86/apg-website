import React from 'react';
import { motion, type Variants } from 'motion/react';
import { RichText } from '@/components/RichText';
import { EASE, Reveal, rise } from '@/routes/subsidiaries/alpha-realty/app/components/reveal';
import { DIAMOND, DISPLAY, EYEBROW, GOLD_ACCENT, IVORY } from './ui';

// Scroll motion, the same as the Alpha Premier Realty site's: a Reveal group (once in view) staggers its motion
// children rising in; headings slide up from behind a mask while the eyebrow hairlines draw in; photos settle from a
// slight zoom. Transform and opacity only; with reduced motion everything renders in place.
export { EASE, Reveal, rise };
const unmask: Variants = { hidden: { y: '110%' }, show: { y: '0%', transition: { duration: 0.9, ease: EASE } } };
const draw: Variants = { hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.9, ease: EASE } } };
/** A photo inside an overflow-hidden frame settles from a slight zoom as it reveals. */
export const settle: Variants = { hidden: { scale: 1.08 }, show: { scale: 1, transition: { duration: 1.6, ease: EASE } } };

/** "—◆ EYEBROW ◆—" (centred) or "◆ EYEBROW —" (left) in small gold caps; its hairlines draw in. A child of a Reveal. */
export function Eyebrow({ children, centered = true }: { children: React.ReactNode; centered?: boolean }) {
  return (
    <motion.p variants={rise} className={EYEBROW}>
      {centered && <motion.span aria-hidden="true" variants={draw} className="h-px w-8 origin-right bg-[#C49A2A]/70" />}
      <span aria-hidden="true" className={DIAMOND} />
      {children}
      {centered && <span aria-hidden="true" className={DIAMOND} />}
      <motion.span aria-hidden="true" variants={draw} className="h-px w-8 origin-left bg-[#C49A2A]/70" />
    </motion.p>
  );
}

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  /** Admin rich text: **words** show in gold italic. */
  title: string;
  align?: 'center' | 'left';
  /** A page title (h1, larger) instead of a section title (h2). */
  page?: boolean;
  className?: string;
}

/** Eyebrow over a Playfair Display title that slides up from behind a mask. A child of a Reveal. */
export function SectionHeading({ id, eyebrow, title, align = 'center', page = false, className = '' }: SectionHeadingProps) {
  const centered = align === 'center';
  const Heading = page ? motion.h1 : motion.h2;
  // The Realty site's title sizes.
  const size = page ? 'text-[clamp(2.1rem,1.4rem+2.4vw,3.4rem)] leading-[1.08]' : 'text-[clamp(1.85rem,1.15rem+2vw,2.875rem)] leading-[1.12]';
  return (
    <div className={`flex flex-col gap-3 ${centered ? 'items-center text-center' : 'items-start text-left'} ${className}`}>
      <Eyebrow centered={centered}>{eyebrow}</Eyebrow>
      <span className="block overflow-hidden pb-1">
        <Heading id={id} variants={unmask} className={`${DISPLAY} ${IVORY} text-balance font-medium ${size}`}>
          <RichText text={title} strongClassName={GOLD_ACCENT} />
        </Heading>
      </span>
    </div>
  );
}
