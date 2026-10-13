// Extra application fields an opening can ask for (Careers Manager checkboxes). api/applicants.php
// enforces the same rules: a 2x2 photo (JPG/PNG, square, >= 600x600 px, <= 5 MB) when the opening
// has require_photo, and up to 5 optional http(s) portfolio links when it has ask_portfolio.
import { urlError } from './formValidation';

export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_MIN_PX = 600; // 2 in at 300 dpi
export const PORTFOLIO_MAX_LINKS = 5;

/** The job fields that switch the extras on; API rows carry them as 0/1. */
export interface ExtrasJob {
  require_photo?: number | string | boolean | null;
  ask_portfolio?: number | string | boolean | null;
}

const flag = (value: ExtrasJob[keyof ExtrasJob]) => value === true || Number(value) === 1;
export const jobRequiresPhoto = (job?: ExtrasJob | null) => flag(job?.require_photo);
export const jobAsksPortfolio = (job?: ExtrasJob | null) => flag(job?.ask_portfolio);

/** Square within 3% and at least PHOTO_MIN_PX on the short side, or a message saying what's wrong. */
export function photoDimensionError(width: number, height: number): string | null {
  if (!width || !height || Math.abs(width / height - 1) > 0.03) {
    return `Your photo must be a square 2x2 ID photo; this one is ${width}x${height} pixels.`;
  }
  if (Math.min(width, height) < PHOTO_MIN_PX) {
    return `Your 2x2 photo must be at least ${PHOTO_MIN_PX}x${PHOTO_MIN_PX} pixels; this one is ${width}x${height}.`;
  }
  return null;
}

/** Type/size checks, then the 2x2 dimension check on the decoded image. */
export async function photoFileError(file: File): Promise<string | null> {
  if (!/\.(jpe?g|png)$/i.test(file.name) || !/^image\/(jpeg|png)$/.test(file.type)) return 'Your photo must be a JPG or PNG image.';
  if (file.size === 0) return 'The photo file is empty. Please choose another file.';
  if (file.size > PHOTO_MAX_BYTES) return 'Photo is too large. Please upload one under 5MB.';
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return photoDimensionError(img.naturalWidth, img.naturalHeight);
  } catch {
    return 'This photo could not be read. Please choose another JPG or PNG file.';
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Splits the links textarea (one per line or comma-separated) into unique non-empty entries. */
export function parsePortfolioLinks(text: string): string[] {
  return [...new Set(text.split(/[\s,]+/).map((link) => link.trim()).filter(Boolean))];
}

export function portfolioLinksError(text: string): string | null {
  const links = parsePortfolioLinks(text);
  if (links.length > PORTFOLIO_MAX_LINKS) return `Please share at most ${PORTFOLIO_MAX_LINKS} portfolio links.`;
  for (const link of links) {
    const problem = urlError(link, true);
    if (problem) return `Portfolio link "${link}": ${problem}`;
  }
  return null;
}
