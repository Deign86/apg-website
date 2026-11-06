# SPEC — "Every business needs a home" (Alpha Premier Realty reel)

GOAL:    A business owner watching once knows realty.alphapremiergroup.com finds warehouses, offices,
         shops and homes, and that one inquiry gets an advisor back within a business day.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps, no voiceover (music + effects + type, Apple-style).
TIME:    54.2 s x 30 = 1626 frames. Bed "Daybreak" (edit) at 117.45 BPM: beat = 0.510856 s
         (15.33 frames), beat 0 at 0.0696 s; b(n) = 0.0696 + n x 0.510856. Every scene starts on a beat.

LOOK:    Ground #020203 (Realty's deepest black, from the site) — seamless, never a gradient void.
         Ink #FFFFFF; secondary ink #A1A1A8; fine print #7D7D84.
         Accent gold #C5A85C (site token), highlight #DFC47B. Gold only on: the rolling hook word,
         the inventory numbers' unit line, the mark. Never on body copy.
         Display: Plus Jakarta Sans 800 (the brand's own face on both the apex and Realty sites),
         tracking -0.03em at >= 96 px, -0.02em below; body Plus Jakarta Sans 500/600.
         Sizes: hero words 128-220 px; lines 84-110 px; sub-lines 36-44 px; fine print 28 px.
         Medium: the real site (captured at 2x from the production build) and the site's own
         photographs, shown as plates with 28 px radius and a 1 px rgba(255,255,255,.08) edge.
         Light: one specular sweep (a 22-degree band, 34% of mark width, white at 55% peak, screen blend)
         across the gold mark, twice in the film (site reveal, end card). No glow, no particles.
OBJECTS: the Realty mark (real PNG, never redrawn); the site hero, spaces showcase card, inquiry
         dialog and "Inquiry sent" toast (real captures); a macOS-style cursor at 7cqw (134 px),
         white body, 1.4 px black stroke.
MOTION:  Arrivals expo.out / power4.out; camera power2.inOut 0.6-1.5 s; exits power3.in / power4.in.
         Seams: cut-the-curve +/-230 px power4.in 0.34 s / power4.out 0.34 s, entry ignites at 0.35 opacity;
         zoom-through 1 -> 1.2 / 0.75 -> 1 with 18 px full-frame blur; inverse arrival 1.25 -> 1.
         Titles: per-word blur 6 -> 0 px in 0.13 s, words 0.067 s apart; or grey -> ink per word 0.08 s apart.
         Landed titles are dead still. Typing 0.038 s/char. Click: cursor 1 -> 0.84 (0.1 s) -> 1 (0.22 s).
         Stillness before climax: 0.33 s black before the reveal, 0.4 s after Submit.
SHOTS (master time):
  hook     0.000-5.178  frame 0 = warehouse plate + "Every business needs a warehouse." Word rolls up on
                        b3 (1.60) "office." and b5 (2.62) "home."; plate wipes up with the word, then
                        collapses at "home."; line blurs out from 4.41; black 4.85-5.18. Bed low-passed.
  site     5.178-12.330 realty hero arrives tight on the mark (inverse zoom 2.3 -> 1.9), bed opens.
                        Sweep at +1.53. Camera pulls back to the full hero (+3.07, 1.5 s). Cursor enters,
                        clicks the scroll chevron (+6.13 = 11.31) and the page scrolls up out (seam UP).
  spaces   12.330-24.591 the site's real spaces card (left, 983 px tall) rotates every 6 beats, as the site
                        does: Warehouse / Office Spaces / Commercial Space / Condominium. Right column:
                        "Warehouses — Pampanga · Cavite · Laguna", "195 office spaces", "214 commercial spaces",
                        "Homes, too." Fine print: approximate inventory, October 2026. Waterfall cuts LEFT.
  inquire  24.591-36.851 hero again (seam LEFT). Cursor clicks INQUIRE NOW (26.12); the button morphs into the
                        real dialog. Push into the notes field (2.4x), click, type "Looking for a 1,200 sqm
                        warehouse in Cavite, ready by March." Pull back, click SUBMIT (32.76), 0.4 s still,
                        the real toast arrives (33.28), camera pushes into it (2x). Its gold check grows into
                        a full-frame gold disc (seam: object becomes the world).
  payoff   36.851-45.025 iris from gold onto the handshake (full-bleed), 3 s untouched with a slow push.
                        Dip cut to black; "WHERE CONNECTIONS GROW INTO SUCCESS" (66 px, grey -> white per word)
                        lands exactly where the apex site's headline sits at 2.2x — match cut — the camera
                        pulls back to the full alphapremiergroup.com home.
  group    45.025-49.112 the enterprises page (seam LEFT), Realty listed as 01 Real Estate & Brokerage;
                        camera travels to the ALPHA PREMIER REALTY heading and zooms through it.
  endcard  49.112-54.200 the mark arrives from the zoom (0.75 -> 1), sweep at +1.02, the URL
                        realty.alphapremiergroup.com at +1.53, "An Alpha Premier Group company ·
                        alphapremiergroup.com" at +2.30; holds 2.8 s on the bed's final chord.
BANNED:  dark void with small things in its middle (heroes fill >= 40% of an axis); glow, bloom,
         particles, lens flares; purple/blue gradients, glass cards; everything centred (only the claim
         and the end card centre); fade + slide-up as the default entrance; titles moving after they
         land; three cards in a row; a title over a dimmed screenshot; the logo docked in a corner;
         invented listings or prices (the live feed was unreachable from this machine, so no listing
         cards appear); SF Pro (licensed for Apple UI only); the placeholder copy "Save up to 42%".
QA:      2.62 "home." legible, plate gone; 5.8 mark sharp, sweep not yet; 7.6 sweep mid-mark;
         9.9 full hero; 11.31 click on chevron; 12.4 spaces entering mid-flight; 16.5 "195" landed;
         27.9 notes field >= 26 px text; 30.5 typed line complete; 32.76 click on Submit;
         34.6 toast readable; 37.5 handshake; 42.0 title = apex headline rect; 44.5 full apex home;
         47.0 Realty heading; 51.5 end card complete.
