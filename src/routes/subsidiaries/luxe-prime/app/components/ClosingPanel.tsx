import { motion } from 'motion/react';
import { RichText } from '@/components/RichText';
import { rise } from './headings';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, DISPLAY, DOUBLE_FRAME, GOLD_ACCENT, IVORY } from './ui';

interface ClosingPanelProps {
  /** Rich text: **words** in gold italic. */
  title: string;
  text: string;
  primary: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
  className?: string;
}

/** The closing call to act at the end of a page: a double-framed panel, one row from lg. It rises in with its section's Reveal. */
export default function ClosingPanel({ title, text, primary, secondary, className = '' }: ClosingPanelProps) {
  return (
    <motion.div variants={rise}
      className={`${DOUBLE_FRAME} flex flex-col items-center gap-4 px-6 py-6 text-center sm:px-10 lg:flex-row lg:justify-between lg:gap-8 lg:text-left ${className}`}
    >
      <div>
        <p className={`${DISPLAY} ${IVORY} text-2xl font-medium sm:text-3xl`}>
          <RichText text={title} strongClassName={GOLD_ACCENT} />
        </p>
        <p className="mt-1 max-w-2xl text-sm text-[#F5F0E8]/65">{text}</p>
      </div>
      <div className="grid w-full shrink-0 grid-cols-1 gap-4 sm:flex sm:w-auto sm:gap-5">
        <button type="button" onClick={primary.onClick} className={BUTTON_PRIMARY}>
          {primary.label}
        </button>
        {secondary && (
          <button type="button" onClick={secondary.onClick} className={BUTTON_SECONDARY}>
            {secondary.label}
          </button>
        )}
      </div>
    </motion.div>
  );
}
