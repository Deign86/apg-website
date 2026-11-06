# REVIEW — "Every business needs a home" (Alpha Premier Realty reel)

## Creative calls
- **Storyline A** (built). The hook sentence "Every business needs a…" rolls through warehouse, office and home, then the reveal happens inside the real site. B (numbers on the beat) and C (one continuous take down the page) are in `STORYLINES.md`.
- **Apple grammar, taken from research rather than copied.**
  - What it uses: seamless black ground, one short line on screen at a time, tight-tracked heavy sans, a pause before each reveal, a specular light sweep across the gold mark, match cuts between scales, and an end card of mark + name + address.
  - No Apple footage, type or music was used or rebuilt. YouTube is unreachable from this machine and the films are not ours. The reverse-any-video skill's own rule is "reverse videos the person has the right to use", so its measuring tools were used on this film instead (see Measured).
- **Brand, not SF Pro.**
  - Plus Jakarta Sans is the face both APG sites use. SF Pro is licensed for Apple UI only.
  - The colours are Realty's own black (#020203) and gold (#C5A85C).
- **No voiceover.** The words are on screen, as in Apple's product films. Music: the Daybreak edit already licensed for the APG launch film (CC BY).
- **Nothing invented.**
  - Every screen is the real site captured from the production build.
  - The inventory figures come from `api/data/knowledge.md` and are marked approximate (October 2026).
  - The typed inquiry is illustrative input. The success toast is the site's real success state.

## What is not in it, and why
- **Live listings (the "Available now" strip, listing cards, `/properties/APR-…` pages).**
  - The listing feed and photos live on the production server, and this machine's network policy blocks alphapremiergroup.com; WebFetch is blocked too.
  - Showing invented listings would misrepresent the product, so the proof uses the spaces showcase, the inventory figures and the inquiry flow instead.
  - Once alphapremiergroup.com is allowed in the environment's network settings, a listing beat can be captured from the live site.

## Measured
- `hyperframes check`: 0 errors. One warning is kept on purpose: `line_unread` on the typed note (2.9 s against a 3.07 s floor). The overlay hands off to the real filled form, which keeps the same sentence on screen until 33.3 s, so it is read for about 5 s.
- Seam Gate (`motion-doctrine/scripts/seam-gate.mjs verify --ledger ledger.json`):
  - spaces→inquire and group→endcard pass every check (vector, direction, zero overlap, Z-sign scan, speed match).
  - site→spaces and payoff→group pass vector, direction and zero overlap. Both report `exit-visible: op 0.00` at cut − 0.1 s.
  - Its own `probe` shows the gate's preview had not seeked the outgoing scene there: it reads the site scene's arrival state (scale velocity −19.5 at 12.2 s) and the hook's elements at full opacity.
  - The renderer's snapshots at 12.13 / 12.23 / 12.30 s and 44.82 / 44.92 / 44.99 s show both exits visible and moving up / left into the cut. Treated as a gate measurement artifact, not a film fault.
  - The deliberate dip to black at 5.18 s and the gold-disc morph at 37.36 s are not velocity seams and are not gated (see `ledger.json` note).
- Snapshots were checked at every SPEC QA moment (sheets under `.hyperframes/artifacts/snapshots/`). Fixed after the first pass:
  - the hook line overlapping the photo;
  - the cursor parking on Submit while typing;
  - the toast readable for under 2 s (inquire scene lengthened one beat);
  - a white page band and a black edge in the group camera;
  - the end card sitting high;
  - the light sweep not rendering (the CSS mask image did not load in the renderer, so the mark's alpha is now inlined as a data URI).
- Render and audio measurements are added below after the delivery render.

## Not checked
- **The sound is measured, not heard.** Nobody has listened to the mix.
- **No phone-width pass on the fine print.** "Approximate inventory…" is 28 px, the readability floor at 1080p.

## Weakest shot and next changes
- **Weakest:** the group beat (45.0–49.1 s). It is a camera move over a still page capture: true to the site, but the least "performing" moment.
- **Next, with more time:**
  - capture the enterprises page scrolling live as video;
  - add a real listing beat once the live feed is reachable;
  - try the music through the HeyGen catalog (needs `npx hyperframes auth login`) for a sparser, more Apple-like bed.
