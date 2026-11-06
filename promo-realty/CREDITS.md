# Credits — Alpha Premier Realty reel ("Every business needs a home")

## Music
- "Daybreak" by Tanner Helland — https://github.com/tannerhelland/free-music — Creative Commons Attribution 4.0 (CC BY 4.0).
  The same beat-aligned edit as the APG launch film (`promo-video/`), transcoded to AAC 256k. **Attribution is
  required wherever the video is published**, e.g. in the description: "Music: 'Daybreak' by Tanner Helland
  (tannerhelland.com), CC BY 4.0."

## Sound effects (CC0 / public domain)
- uisfx by Romain Simon — https://github.com/romainsimon/uisfx (CC0 1.0): cinematic/swipe, cinematic/forward,
  cinematic/expand, cinematic/achievement, glass/swipe, glass/open.
- Kenney Interface Sounds — https://kenney.nl (CC0 1.0), via https://github.com/Calinou/kenney-interface-sounds:
  click_001, tick_001, select_001, confirmation_001.

## Visuals
- Every screen is the real website: captured with Playwright from this repository's production build (`npm run build`,
  served locally) at 2x, 1920 x 1080. The inquiry form is filled with illustrative sample input (name "Ana Reyes",
  the site's own placeholder number, an example.com address); the "Inquiry sent" toast is the site's real success state
  (the inquiry endpoint was answered locally, nothing was sent).
- Photographs, the Alpha Premier Realty mark and the APG pages: © Alpha Premier Group of Companies OPC (from `public/`).
- Inventory figures (195 office spaces, 214 commercial spaces for lease; warehouse areas Pampanga, Cavite, Laguna)
  come from `api/data/knowledge.md` (October 2026 Drive compilation and the Realty Facebook page), shown as approximate.
- Fonts: Plus Jakarta Sans (SIL OFL 1.1), Google Fonts — the face both sites use.

## Tooling
- HyperFrames (HTML to MP4), GSAP 3.15, Playwright, FFmpeg. HyperFrames skills (hyperframes, hyperframes-cli,
  media-use, motion-doctrine, cut-the-curve, seam-craft, oversized-cursor, captions-overlay, reverse-any-video)
  loaded from the team's Notion skill library.
