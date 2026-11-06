# Alpha Premier Realty reel — "Every business needs a home"

A 54-second, Apple-style promo for the new **realty.alphapremiergroup.com**, inside the new alphapremiergroup.com.
It is built in HyperFrames: HTML and GSAP, rendered frame by frame to MP4. There is no voiceover; the music, sound effects and on-screen type carry it.

| File | What it is |
| --- | --- |
| `STORYLINES.md` | The three storylines considered (A was built) |
| `SPEC.md` | Every look and motion decision as a number, the shot list with timecodes, the banned defaults |
| `ledger.json` | The seam vector ledger (motion-doctrine Seam Gate) |
| `REVIEW.md` | What was checked and measured, known limits, what to change next |
| `CREDITS.md` | Music (CC BY: attribution required), sound effects (CC0), sources of every figure |
| `index.html` | Root: scene hosts on the music's beat grid, the music bed (low-passed until the site appears), sound effects |
| `compositions/` | One scene per file: hook, site, spaces, inquire, payoff, group, endcard |
| `assets/img/` | Real site captures at 2x (production build) and the Realty mark |
| `assets/photos/` | The site's own photographs |

## Preview, check, render

```bash
cd promo-realty
npx hyperframes@0.9.19 preview          # Studio preview with the timeline
npx hyperframes@0.9.19 check            # lint + runtime + layout + motion + contrast
npx hyperframes@0.9.19 render . -o renders/alpha-premier-realty-reel.mp4 --quality delivery
```

`renders/` is git-ignored (and `*.mp4` is ignored repo-wide), so share the rendered file directly or attach it to a release.

## Changing it

- **Words:** the hook words, the typed inquiry and the end-card lines are plain text in their scene files. The inventory figures are in `compositions/spaces.html`. Update them when `api/data/knowledge.md` changes.
- **Timing:** the music is 117.45 BPM, so one beat is 0.510856 s. Every scene starts on a beat (see `SPEC.md`). If you retime a scene, also move its host's `data-start`/`data-duration` and the sound effects in `index.html`.
- **Screens:** `assets/img/*` were captured from `npm run build` with Playwright at 1920 x 1080, DPR 2. Recapture after a site redesign, keeping the same viewport, because the cursor targets and the camera moves use measured page coordinates.
