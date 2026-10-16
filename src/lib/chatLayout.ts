// Layout fix-up for chat replies (used by src/components/ChatText.tsx): the assistant sometimes runs
// several property listings together in one sentence, which reads as a wall of text in a bubble.

const BULLET = /^\s*[-*•]\s+/;
const NUMBERED = /^\s*\d{1,3}[.)]\s+/;
const LISTING_REF = /[[(]APR-[0-9A-F]{6}[\])]/gi;
// Joiners left at the end of one listing before the next: "; ", ", and ", " or ".
const TRAILING_JOINER = /(?:\s*[;,])?(?:\s+(?:and|or))?\s*$/i;
// The last listing ends at its first sentence; what follows ("Prices are subject to ...") is its own paragraph.
const SENTENCE_END = /[.!?](?=\s+[A-Z])/;

/**
 * A line naming two or more listings ("Here are some: [APR-1A2B3C] Office, 100 sqm; [APR-4D5E6F] ...")
 * becomes its intro line, one "- " line per listing, and (after a blank line) any closing sentence.
 * Any other line, including one that is already a list item, comes back unchanged.
 */
export function splitListingRun(line: string): string[] {
  if (BULLET.test(line) || NUMBERED.test(line)) return [line];
  const starts = Array.from(line.matchAll(LISTING_REF), (m) => m.index ?? 0);
  if (starts.length < 2) return [line];

  const out: string[] = [];
  const intro = line.slice(0, starts[0]).trim();
  if (intro) out.push(intro);
  let closing = '';
  starts.forEach((start, i) => {
    let item = line.slice(start, starts[i + 1] ?? line.length);
    if (i === starts.length - 1) {
      const end = SENTENCE_END.exec(item);
      if (end) {
        closing = item.slice(end.index + 1).trim();
        item = item.slice(0, end.index + 1);
      }
    }
    item = item.replace(TRAILING_JOINER, '').trim();
    if (item) out.push(`- ${item}`);
  });
  if (closing) out.push('', closing);
  return out;
}
