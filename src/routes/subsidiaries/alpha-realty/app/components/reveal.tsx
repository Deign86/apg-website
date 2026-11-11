import React from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { RichText } from '@/components/RichText';
import { EYEBROW, GOLD_ACCENT } from './ui';

// Shared Realty scroll motion (home and services pages): a Reveal group staggers its motion children (heading
// first, then cards) once it is in view; headings slide up from behind a mask while the eyebrow hairline draws in.
export const EASE = [0.22, 1, 0.36, 1] as const;
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
export const rise: Variants = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } };
const unmask: Variants = { hidden: { y: '110%' }, show: { y: '0%', transition: { duration: 0.9, ease: EASE } } };
const draw: Variants = { hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.9, ease: EASE } } };

interface RevealProps {
  className?: string;
  children: React.ReactNode;
  /** Share of the group that must be in view before it reveals. */
  amount?: number;
}

/** Reveals its motion children when scrolled into view; with reduced motion they render in place. */
export function Reveal({ className, children, amount = 0.2 }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} variants={group} initial={reduce ? 'show' : 'hidden'} whileInView="show" viewport={{ once: true, amount }}>
      {children}
    </motion.div>
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

/** Eyebrow + Playfair Display title: the one display face on the page. A child of a Reveal. */
export function SectionHeading({ id, eyebrow, title, align = 'center', page = false, className = '' }: SectionHeadingProps) {
  const centered = align === 'center';
  const Heading = page ? motion.h1 : motion.h2;
  const size = page ? 'text-[clamp(2.1rem,1.4rem+2.4vw,3.4rem)] leading-[1.08]' : 'text-[clamp(1.85rem,1.15rem+2vw,2.875rem)] leading-[1.12]';
  return (
    <div className={`flex flex-col gap-3 ${centered ? 'items-center text-center' : 'items-start text-left'} ${className}`}>
      <motion.p variants={rise} className={EYEBROW}>
        <motion.span aria-hidden="true" variants={draw} className="h-px w-8 origin-right bg-[#c5a85c]" />
        {eyebrow}
        {centered && <motion.span aria-hidden="true" variants={draw} className="h-px w-8 origin-left bg-[#c5a85c]" />}
      </motion.p>
      <span className="block overflow-hidden pb-1">
        <Heading id={id} variants={unmask} className={`font-display text-balance text-white ${size}`}>
          <RichText text={title} strongClassName={GOLD_ACCENT} />
        </Heading>
      </span>
    </div>
  );
}
