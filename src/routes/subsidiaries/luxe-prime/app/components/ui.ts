// Luxe Prime look, "Art Deco couture", deliberately unlike the Realty site's soft rounded pills: sharp square
// corners, thin gold hairlines (often doubled), small gold diamonds, letter-spaced caps for labels and buttons,
// ivory reading text. Black and gold, Luxe's deeper gold. Type is the Taste Skill's pairing for a refined advisory
// business: Newsreader titles at regular weight, Hanken Grotesk for everything else; buttons, links and labels in
// sentence case at medium weight, only the small eyebrow and meta labels in capitals, lightly spaced.
// Class strings live here: Luxe's Tailwind build only scans this site's files.
import type { LiquidGlassConfig } from 'quick-liquid';
import { GLASS_BADGE, GLASS_PILL } from '@/routes/subsidiaries/alpha-realty/app/components/ui';

// Liquid glass, only for controls that sit on a photo (on plain black it has nothing to refract): the Realty site's
// light, smoky glass settings, with square corners to match the Art Deco shapes.
export const GLASS_SQUARE: Partial<LiquidGlassConfig> = { ...GLASS_PILL, borderRadius: 0 };
export const GLASS_TAG: Partial<LiquidGlassConfig> = { ...GLASS_BADGE, borderRadius: 0 };

/** Display face: page and section titles, the hero line, card titles. Regular weight, slightly tight tracking. */
export const DISPLAY = "font-['Newsreader'] font-normal tracking-[-0.015em]";
/** Small capitals: eyebrows, meta lines, numerals (never buttons or form labels). */
export const CAPS = "font-['Hanken_Grotesk'] font-medium uppercase";
/** **Words** in display headings: gold Newsreader italic. */
export const GOLD_ACCENT = 'italic text-[#E3C06A]';
export const IVORY = 'text-[#F5F0E8]';
/** Reading text on the dark background. */
export const BODY = 'text-base leading-relaxed text-[#F5F0E8]/75';
export const FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0D080] focus-visible:ring-offset-4 focus-visible:ring-offset-black';
export const EYEBROW = `flex items-center gap-3 ${CAPS} text-xs tracking-[0.16em] text-[#C49A2A]`;
/** A small gold diamond (the Art Deco ornament). */
export const DIAMOND = 'inline-block size-1.5 shrink-0 rotate-45 bg-[#C49A2A]';

const BUTTON = `inline-flex h-12 cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap px-7 font-['Hanken_Grotesk'] text-[15px] font-medium transition-[background-color,border-color,color,outline-color,outline-offset,translate] duration-200 active:translate-y-px motion-reduce:transition-none`;
/** Solid gold, with a second hairline floating outside it (a double rule) that closes in on hover. */
export const BUTTON_PRIMARY = `${BUTTON} bg-[#C49A2A] text-[#0a0703] outline outline-1 outline-offset-4 outline-[#C49A2A]/45 hover:bg-[#D8B048] hover:outline-offset-2 hover:outline-[#F0D080]/70 ${FOCUS}`;
/** A gold hairline that fills with gold on hover. Add a dark fill (bg-black/35) over photos. */
export const BUTTON_SECONDARY = `${BUTTON} border border-[#C49A2A]/70 text-[#F0D080] hover:border-[#C49A2A] hover:bg-[#C49A2A] hover:text-[#0a0703] ${FOCUS}`;
/** A button inside square LiquidGlass: a gold hairline over the glass; the glass draws the surface and the press. */
export const BUTTON_GLASS = `${BUTTON} w-full border border-[#C49A2A]/60 text-[#F0D080] hover:border-[#F0D080] hover:text-white ${FOCUS}`;
/** A gold text link followed by a hairline that extends on hover (LINK_RULE). */
export const TEXT_LINK = `group inline-flex min-h-11 cursor-pointer items-center gap-3 text-[15px] font-medium text-[#C49A2A] transition-colors hover:text-[#F0D080] ${FOCUS}`;
export const LINK_RULE =
  'h-px w-10 origin-left scale-x-[0.6] bg-current transition-transform duration-200 group-hover:scale-x-100 motion-reduce:transition-none';
/** A square hairline icon button inside square LiquidGlass (the hero's scroll cue). */
export const GLASS_ICON = `grid size-11 cursor-pointer place-items-center border border-[#C49A2A]/55 text-[#F0D080] transition-colors duration-200 hover:border-[#F0D080] hover:text-white ${FOCUS}`;
/** A text panel with a double hairline: the border, and a second rule 8 px inside it. */
export const DOUBLE_FRAME =
  'relative border border-[#C49A2A]/30 bg-[#080705]/85 outline outline-1 -outline-offset-8 outline-[#C49A2A]/12';
/** Form fields (the job application): square, dark, a gold hairline that brightens on focus. Add `h-auto py-3` on a textarea. */
export const FIELD_INPUT =
  'h-12 w-full border border-[#C49A2A]/30 bg-[#0b0906] px-4 text-sm text-[#F5F0E8] outline-none transition-colors placeholder:text-[#F5F0E8]/50 hover:border-[#C49A2A]/55 focus:border-[#C49A2A] focus:ring-1 focus:ring-[#C49A2A]/50 aria-[invalid=true]:border-red-400/70';
export const FIELD_LABEL = 'mb-2 block text-sm font-medium text-[#F5F0E8]/80';
export const FIELD_ERROR = 'mt-1.5 text-xs text-red-300';

export const CONTAINER = 'mx-auto w-full max-w-7xl';
// One section per screen below the 64 px header (it grows when its content needs more), its content centred in it.
// Between sections: a short gold hairline with a diamond on it.
export const SCREEN =
  "relative flex w-full scroll-mt-[64px] flex-col justify-center px-5 py-12 sm:px-8 sm:py-14 md:min-h-[calc(100svh-64px)] md:py-[clamp(2rem,5svh,4.5rem)] lg:px-12 before:pointer-events-none before:absolute before:left-1/2 before:top-0 before:h-px before:w-48 before:-translate-x-1/2 before:bg-gradient-to-r before:from-transparent before:via-[#C49A2A]/55 before:to-transparent after:pointer-events-none after:absolute after:left-1/2 after:top-0 after:size-2 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:border after:border-[#C49A2A]/70 after:bg-[#030302]";
/** A page's opening screen: it starts under the fixed 64 px header, so it is the full screen tall (the next
    section starts exactly at the fold) and its content sits below the header. */
export const OPENING =
  'relative flex w-full flex-col justify-center px-5 pb-12 pt-[calc(64px+2rem)] sm:px-8 md:min-h-[100svh] md:pb-[clamp(2rem,5svh,4.5rem)] lg:px-12';
/** The title band at the top of an inner page (Blogs, Careers, Inquire): clears the 64 px header. */
export const PAGE_HEAD = 'px-5 pb-8 pt-[calc(64px+clamp(2.5rem,7svh,4.5rem))] sm:px-8 sm:pb-10 lg:px-12';
/** A photo framed like a print: a gold hairline mat around it. Add the corner diamonds as children. */
export const PRINT_FRAME = 'relative border border-[#C49A2A]/40 p-2 sm:p-3';
/** A photo inside a hovered `group` frame zooms a touch (1.03) and settles back. */
export const PHOTO_ZOOM = 'transition-transform duration-200 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100';
/** Square gold diamond bullets for a list (features, requirements). */
export const DIAMOND_LIST = "[&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:left-0.5 [&>li]:before:top-[0.6em] [&>li]:before:size-1.5 [&>li]:before:rotate-45 [&>li]:before:bg-[#C49A2A] [&>li]:before:content-['']";
/** Horizontal swipe row on phones (the next card peeks in from the edge), a grid from sm up. */
export const SWIPE_ROW =
  '-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:scroll-px-0 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
/** 1 → "I"; numbers past ten stay digits. */
export const roman = (n: number): string => ROMAN[n - 1] ?? String(n);
