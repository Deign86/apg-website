import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useModalDialog } from '@/hooks/useModalDialog';
import { CAPS, FOCUS, roman } from './ui';

export interface GalleryState {
  title: string;
  photos: string[];
  index: number;
}

/** A horizontal swipe longer than this (px) pages through the photos. */
const SWIPE_PX = 40;
const CONTROL = `grid size-11 cursor-pointer place-items-center border border-[#C49A2A]/60 bg-black/70 text-[#F0D080] transition-colors duration-200 hover:bg-[#C49A2A] hover:text-[#0a0703] ${FOCUS}`;

/**
 * Full-screen photo viewer for a service gallery: square gold controls, the photo framed by a hairline, "Photo II of
 * III" in small gold caps. Esc, focus trap and the page scroll lock come from useModalDialog; arrow keys and swipes page
 * through. Only open it with at least one photo.
 */
export default function Lightbox({ state, onClose }: { state: GalleryState; onClose: () => void }) {
  const [index, setIndex] = useState(state.index);
  const count = state.photos.length;
  const dialogRef = useModalDialog<HTMLDivElement>(true, onClose);
  const touchX = useRef<number | null>(null);
  const show = (i: number) => setIndex((i + count) % count);

  useEffect(() => {
    if (count < 2) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % count);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + count) % count);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [count]);

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${state.title} photos`}
      tabIndex={-1}
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center gap-4 bg-black/95 px-4 py-16 outline-none animate-in fade-in-0 duration-300 motion-reduce:animate-none"
    >
      <button type="button" onClick={onClose} aria-label="Close gallery" data-autofocus className={`${CONTROL} absolute right-4 top-4 md:right-6 md:top-6`}>
        <X className="size-5" aria-hidden="true" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          touchX.current = null;
          if (start === null) return;
          const dx = e.changedTouches[0].clientX - start;
          if (Math.abs(dx) > SWIPE_PX) show(index + (dx < 0 ? 1 : -1));
        }}
        className="border border-[#C49A2A]/40 p-2"
      >
        <img
          key={state.photos[index]}
          src={state.photos[index]}
          alt={`${state.title}, photo ${index + 1}`}
          className="max-h-[min(76vh,calc(100dvh-10rem))] max-w-[min(90vw,1200px)] object-contain animate-in fade-in-0 duration-500 motion-reduce:animate-none"
        />
      </div>
      <p className={`${CAPS} text-[11px] tracking-[0.3em] text-[#C49A2A]`} aria-live="polite">
        {state.title} — Photo {roman(index + 1)} of {roman(count)}
      </p>

      {count > 1 && (
        <>
          <button type="button" onClick={(e) => { e.stopPropagation(); show(index - 1); }} aria-label="Previous photo" className={`${CONTROL} absolute left-3 top-1/2 -translate-y-1/2 md:left-8`}>
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); show(index + 1); }} aria-label="Next photo" className={`${CONTROL} absolute right-3 top-1/2 -translate-y-1/2 md:right-8`}>
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}
