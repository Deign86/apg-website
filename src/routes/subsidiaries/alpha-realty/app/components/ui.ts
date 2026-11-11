import type { LiquidGlassConfig } from 'quick-liquid';

// Shared Realty look (home and properties pages): gold accents, pill buttons and liquid glass controls.

/** **Words** in display headings: gold Playfair italic. */
export const GOLD_ACCENT = 'font-normal italic text-[#d4b568]';
export const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-[#c5a85c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06070a]';
// Glass clips its content, so a ring around a glass control has to sit inside it.
export const FOCUS_INSET = 'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e6cd86]';
/** Small gold caps above a title, after a short gold line. */
export const EYEBROW = 'flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c5a85c] sm:text-xs';
/** Small gold caps heading a group (browse links, a listing's terms). */
export const SMALL_CAPS = 'text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c5a85c]';
/** Tiny muted caps over a value (a price, a listing fact). */
export const CAPTION = 'text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55';
export const BUTTON =
  'inline-flex h-12 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full px-7 text-xs font-bold uppercase tracking-[0.2em] transition-[background-color,border-color,color,box-shadow,transform,translate] duration-300';
// Gold gradient pill; a light sheen sweeps across it on hover.
export const BUTTON_PRIMARY = `${BUTTON} group relative overflow-hidden bg-[linear-gradient(135deg,#e6cd86_0%,#c5a85c_45%,#a5863f_100%)] text-[#0a0a0c] shadow-[0_10px_30px_-12px_rgba(197,168,92,0.6)] before:pointer-events-none before:absolute before:inset-y-0 before:-left-1/3 before:w-1/4 before:-skew-x-12 before:bg-white/35 before:blur-sm before:transition-transform before:duration-700 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-12px_rgba(197,168,92,0.75)] hover:before:translate-x-[560%] motion-reduce:before:hidden motion-reduce:hover:translate-y-0 ${FOCUS}`;
export const BUTTON_SECONDARY = `${BUTTON} border border-[#c5a85c]/60 text-[#e6cd86] hover:-translate-y-0.5 hover:border-[#c5a85c] hover:bg-[#c5a85c]/10 hover:text-white motion-reduce:hover:translate-y-0 ${FOCUS}`;
/** A button inside a LiquidGlass pill: the glass draws the surface and the press. */
export const BUTTON_GLASS = `${BUTTON} w-full text-white hover:text-[#f3e3b3] ${FOCUS_INSET}`;
export const GLASS_ICON = `grid size-10 cursor-pointer place-items-center rounded-full text-white/85 transition-colors hover:text-[#f0dfae] ${FOCUS_INSET}`;
export const TEXT_LINK = `group inline-flex min-h-11 cursor-pointer items-center gap-2 rounded text-sm font-semibold text-[#c5a85c] transition-colors hover:text-[#dfc47b] ${FOCUS}`;
/** Closing call-to-action panel (home "Find your next space", services): gold glow from the top left, gold rim. */
export const CTA_PANEL =
  'relative flex flex-col items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#c5a85c]/30 bg-[radial-gradient(120%_160%_at_0%_0%,rgba(197,168,92,0.2),transparent_55%),linear-gradient(180deg,#0e0d0b,#08080a)] px-5 py-5 text-center sm:flex-row sm:gap-5 sm:px-8 sm:py-6 sm:text-left';
/** Form fields (inquiry, careers forms): a rounded dark field with a gold focus ring; add `h-auto py-3` on a textarea. */
export const FIELD_INPUT =
  'h-11 w-full rounded-xl border border-white/15 bg-white/[0.03] px-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/50 hover:border-white/30 focus:border-[#c5a85c] focus:bg-white/[0.05] focus:ring-2 focus:ring-[#c5a85c]/25 aria-[invalid=true]:border-red-400/70';
export const FIELD_LABEL = 'mb-1.5 block text-xs font-semibold text-white/70';
export const FIELD_ERROR = 'mt-1.5 text-xs text-red-300';
/** Popups (inquiry, job details, feedback): dimmed backdrop, a rounded dark panel (add a max-w-*) and its close button. */
export const MODAL_OVERLAY =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md animate-in fade-in-0 duration-200 motion-reduce:animate-none sm:p-6';
export const MODAL_PANEL =
  'relative flex max-h-[92dvh] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0d] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] outline-none animate-in fade-in-0 zoom-in-95 duration-300 motion-reduce:animate-none';
export const MODAL_CLOSE = `absolute right-3 top-3 z-10 grid size-10 cursor-pointer place-items-center rounded-full border border-white/15 bg-[#0b0b0d]/85 text-white/75 transition-colors hover:border-[#c5a85c]/60 hover:text-[#f0dfae] ${FOCUS}`;
/** Horizontal swipe row on phones (the next card peeks in from the edge), a grid from sm up. */
export const SWIPE_ROW =
  '-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:scroll-px-0 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0';
export const ARROW = 'size-4 transition-transform group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0';

// Liquid glass (quick-liquid) for controls that sit on a photo: smoky dark glass with a gold rim,
// so it refracts the picture and keeps white or gold text readable. Radius = half the control height.
// Only over photos: on a plain dark background the glass has nothing to show.
const GLASS: Partial<LiquidGlassConfig> = {
  material: 'thin',
  appearance: 'dark',
  tint: '12, 11, 9',
  tintOpacity: 0.3,
  blur: 8,
  bezelWidth: 16,
  refractionStrength: 14,
  // Light on purpose (measured): SVG refraction and the colour split made scrolling over photos stutter, so the
  // glass refracts with CSS only, at low quality, with no chromatic aberration.
  refractionMode: 'css',
  chromaticAberration: 0,
  quality: 'low',
};
export const GLASS_PILL: Partial<LiquidGlassConfig> = { ...GLASS, borderRadius: 24 };
export const GLASS_CIRCLE: Partial<LiquidGlassConfig> = { ...GLASS, borderRadius: 20 };
export const GLASS_BADGE: Partial<LiquidGlassConfig> = { ...GLASS, borderRadius: 15, tintOpacity: 0.45 };
