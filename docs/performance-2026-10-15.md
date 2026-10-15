# Performance pass — 2026-10-15 (branch `perf/app-speed`)

Goal: faster startup, faster screen opening, faster content loading, smoother scrolling, and older
content (long lists, history) loading faster. Every change was benchmarked on its own, before and after.

## How it was measured

- **Harness:** Playwright driving the locally installed Chrome against a production `vite build`,
  served by a small Node server that gzips text and caches hashed assets like `.htaccess`. `/api` is
  proxied to `php -S` with MySQL 8.4.
- **Conditions:** slow 4G (150 ms RTT, 1.6 Mbps down) and 4x CPU throttling. Third-party hosts
  (Google Fonts, CDNs, analytics) are blocked so runs are repeatable, except in the Font Awesome step.
- **Metrics:**
  - *Cold load:* first and largest contentful paint (FCP/LCP), total blocking time (TBT), bytes by
    type, requests, and "ready" (network idle).
  - *SPA navigation:* time until the new screen shows, and time until it sits at the top.
  - *Scroll:* frame times during a synthesized 2400 px/s wheel scroll.
  - *API:* median latency and payload.
- **Production-scale data:** an `apg_perf` copy of the local DB with 6,009 inquiries, 3,013 chat
  sessions / 45,049 messages, 1,515 applicants with long cover letters and ATS text, and 441
  published blogs.
- **Per-fix A/B:** each commit was cherry-picked, built and benchmarked back to back against the
  previous build. API changes were measured live, with side A taken before the cherry-pick.
- **Final numbers:** an interleaved A/B (A, B, A, B, …) of the original build vs the final build,
  3 runs each, medians. Single SPA-navigation and scroll pairs swing ±40% between runs; trust the
  final interleaved numbers over individual step deltas.
- **Unmeasurable locally:** `php -S` on Windows is single-threaded, so the session-lock changes were
  verified functionally rather than timed.

## Where the real gaps were

1. **The chat widget pulled in `jspdf` on every page.** It added ~123 KB gzip (pako, fflate, fast-png)
   to the critical path of every apex and enterprise page, but is only used by "Download transcript".
2. **Everything loaded at once.**
   - The apex shell bundled all five views and the motion runtime.
   - Enterprise pages loaded shell first, then page, in serial waves.
   - The main CSS carried utilities from every enterprise app. Construction's CSS scanned the whole
     repo (202 KB).
   - Font Awesome (~117–141 KB of CSS and fonts) was loaded for 13 icons.
3. **Images were full-size originals.** Blog covers were 0.65–2.9 MB PNG/JPG; 88 Prime used 2–5 MB
   JPGs; logos were 500–1000 px shown at 40–90 px.
4. **The main thread never went idle.**
   - Dynamic Tree ran infinite framer-motion loops on 620 px blurred orbs (TBT ~7 s).
   - The apex background canvas built ~210 gradients per frame.
   - Home ran 12 JavaScript-driven animation loops.
   - Global `scroll-behavior: smooth` animated every route change through the whole page.
   - `* { box-sizing: inherit }` made every element's style uncacheable in Blink.
   - The whole long Home/Careers page was styled and laid out in the first frame.
5. **Lists sent everything.**
   - Public and admin blog lists shipped every article body.
   - The admin chat list returned every session ever, with 4 correlated subqueries each, polled every
     3.5–5 s by Live Chat and the sidebar.
   - Applicants sent every column of every row.
   - Inquiries were capped at 500, so older ones were unreachable.

## Results (original build → final build, interleaved A/B, median)

### Cold load

| Page | LCP | TBT | JS KB (gzip) | Images KB | Total KB | Ready |
|---|---|---|---|---|---|---|
| `/` | 5.6 → 4.5 s | 828 → 277 ms | 349 → 243 | 837 → 286 | 3199 → 2533 | 20.2 → 17.0 s |
| `/enterprises` | 6.0 → 5.4 s | ≈ | 349 → 243 | 2933 → 883 | 3439 → 1274 | 18.8 → 8.7 s |
| `/careers` | 4.3 → 4.1 s | 538 → 224 ms | 349 → 243 | 130 → 11 | 639 → 405 | ≈ |
| `/blogs` (441 posts) | content 4.4–5.1 → 3.3–4.0 s¹ | 4289 → 482 ms | 349 → 222 | ≈ | 720 → 633 | ≈ |
| Dynamic Tree | 6.9 → 5.8 s | 6989 → 1052 ms | 328 → 206 | 2345 → 819 | 2967 → 1308 | 16.6 → 8.6 s |
| SwiftClear | 6.1 → 1.9 s | 178 → 90 ms | 315 → 194 | 335 → 43 | 841 → 416 | 6.0 → 4.3 s |
| 88 Prime | 5.9 → 5.4 s | ≈ | 316 → 201 | 1784 → 1096 | 2257 → 1445 | 13.3 → 9.4 s |
| Construction | 5.0 → 4.2 s | ≈ | 324 → 203 | 960 → 869 | 1478 → 1237 | 9.3 → 8.3 s |
| Realty | ≈² | ≈ | 334 → 214 | 2414 → 1621 | 2911 → 1988 | 16.3 → 12.1 s |
| Luxe Prime | ≈ | ≈ | 319 → 199 | ≈ | 611 → 480 | 5.4 → 4.5 s |
| Admin sign-in | 2.4 → 2.1 s | 0 | 157 → 121 | ≈ | 317 → 272 | 3.0 → 2.6 s |

¹ The heading paints ~1 s sooner. Because the page is lighter, a featured cover photo now also loads
inside the window and becomes the (later) LCP element.
² Realty's LCP is the cookie-banner text in both builds (2.0 → 1.9 s).

### Opening screens (SPA navigation)

| Navigation | Change |
|---|---|
| `/` → `/blogs` | content shows 1445 → 567 ms; settled 10.4 → 2.7 s |
| `/` → `/inquire` | 2408 → 452 ms |
| `/` → `/careers` | 1153 → 1029 ms |
| Enterprise section switches (Realty, Luxe Prime, Dynamic Tree) | reach the top of the new screen 77–87% sooner (e.g. Realty → Careers 1114 → 188 ms) |
| `/` → Construction | shows 1681 → 1090 ms; at top 3428 → 1696 ms |

### Scrolling (share of frames slower than 25 ms)

| Page | Slow frames |
|---|---|
| `/` | 69.9 → 7.2% |
| `/careers` | 64.9 → 14.5% |
| `/enterprises` | 13 → 5.8% |
| Realty | 69.4 → 15.2% |
| Luxe Prime | 81.4 → 13.4% (long tasks 1312 → 59 ms) |
| Construction | 18.7 → 10.8% |
| Alta Venture | 15.1 → 10.6% |
| Dynamic Tree | 18.8 → 15.4% (p99 201 → 139 ms) |

### Older content and API

Measured on production-scale data: same database, original code vs final code, interleaved.

| Request (what the UI calls) | Latency | Payload raw → raw (gzip) |
|---|---|---|
| Public blog list | 52 → 17 ms | 3.2 MB → 182 KB (37 → 13.5 KB) |
| Admin chat queue poll (every 3.5 s) | 218 → 25 ms | 1.76 MB → 1 KB |
| Admin sidebar badge poll (every 5 s, every screen) | 254 → 34 ms | 1.76 MB → 0.1 KB |
| Admin applicants list | 86 → 23 ms | 4.3 MB → 19 KB |
| Admin inquiries list | 41 → 16 ms | 261 → 25 KB |
| Admin blog list | 48 → 23 ms | 3.3 MB → 214 KB |

Admin screens fetch 92–99% less. `/admin/applicants` is ready in 4.4 s instead of 15.7 s, and
`/admin/live-chat` paints its main content 24% sooner. Older inquiries, applicants and closed chats are
reachable a page at a time. Cursor paging walks all 6,009 inquiries and 1,515 applicants exactly once.

## Changes, in merge order, with their measured effect

| # | Change | Measured effect (A → B) |
|---|---|---|
| 1 | `jspdf` loaded on demand (Download transcript) | −123 KB gzip JS on every route; LCP −3% to −20% |
| 2 | Apex views split out of RedesignShell (reworked in #32) | as first shipped: TBT up, `/careers` LCP +0.8 s → reworked |
| 3 | Shell and page chunks load in one wave; cross-host links leave without loading the other site | Realty/Construction/88 Prime FCP −18% to −25%, LCP up to −41% |
| 4 | Saved chat restores without starting a new session per page load | server-side (no new empty sessions, no rate-limit use) |
| 5 | Main CSS scans only `src/` minus own-build enterprise apps | CSS −8.8 KB gzip (−29%); apex FCP −7% to −8% |
| 6 | Construction Tailwind build scoped to its files | 202 → 37 KB CSS; LCP −8% |
| 7 | Font Awesome and the dead cdnfonts sheet removed (lucide icons) | −117 to −141 KB third-party; Realty LCP −23%, Contact −16% |
| 8 | Apex hero poster preloaded | `/` LCP −19%, FCP +0.5 s on the HTTP/1.1 harness (see trade-offs) |
| 9 | No global smooth scroll; instant route resets; dead AOS removed | section switches reach the top 76–84% sooner; SwiftClear TBT −75% |
| 10 | Scrolled enterprise header without backdrop blur (#45 keeps its look) | slow scroll frames −43% to −67% |
| 11 | Apex logos resized, `/enterprises` photos lazy, hero video after load | images −66% (`/`), −70% (`/enterprises`); `/enterprises` ready −56% |
| 12 | Compositor-only decor loops, idle-aware canvas, cheaper scroll reveals | `/` slow scroll frames 72 → 6%; LCP −19% |
| 13 | PHP session only for the admin API; GET lock released early | no session/cookie on public calls (verified) |
| 14 | `blogs.php?summary=1` | list payload −95% raw / −65% gzip |
| 15 | Session list cache; summary blog list with Load more; body fetched on open | `/blogs` TBT 3.1 → 0.3 s, LCP −22% |
| 16 | Apex Navbar/Footer reset instantly | (nav noise) |
| 17 | Dynamic Tree loops and petals on the compositor (WAAPI) | TBT 8.2 → 2.5 s |
| 18 | Construction/Luxe/88 Prime perpetual paint removed | Construction slow scroll frames −63% |
| 19 | SwiftClear particles on the compositor | slow scroll frames −68% |
| 20 | Enterprise images resized/WebP/lazy | images −33% to −87%; ready −22% to −39% |
| 21 | Instant scroll resets inside enterprise apps | (nav noise) |
| 22 | Enterprise blog lists without bodies, cached | small |
| 23 | `fix:blog-cover-webp` data fix (runs on deploy) | `/blogs` images 2.8 MB → 0.25 MB (−91%); ready −63% |
| 24 | `careers.php` schema check only when a column is missing | latency −50% |
| 25 | Admin chat: open queue, closed history paged, counts-only mode, incremental thread polling, `(status, updated_at)` index | polls 700 ms → 25–35 ms; payload −98% to −100%; live chat ready −44% |
| 26 | Admin applicants/inquiries/blogs: lean lists, paging | fetch −62% to −94%; applicants ready −20% |
| 27 | Dashboard reads counts | fetch −70% |
| 28 | Session lock released before slow admin actions (SMTP, ATS re-screen) | functional |
| 29 | Admin manager screens lazy | admin FCP −18% to −21% (live-chat LCP +17% → #43) |
| 31–40 | Review fixes: retry cross-host leave, Viber mark, smooth in-page anchor, tap target, canvas ripples, one list cache, excerpt-less summary rows, migrate seed, admin keepalive, cursor paging, lint | correctness |
| 32 | Apex views prefetched on nav hover/focus and after load, one per idle period | `/` TBT −72%, JS to idle −38 KB; `/careers` LCP −68% |
| 41 | `box-sizing: border-box` instead of `inherit` | slow scroll frames −30% to −61% on most routes |
| 43 | Admin URL's screen loads with the shell | live-chat LCP −11% |
| 44 | `content-visibility: auto` on below-the-fold Home/Careers sections | `/` LCP 8.2 → 4.2 s, TBT −75%; slow scroll frames −89% / −90% |
| 45 | Scrolled enterprise header layered colour (visual-diff follow-up) | look restored, no blur cost |

## Trade-offs and notes

- **Hero preload (#8)** costs ~0.4–0.5 s of FCP on `/` in this HTTP/1.1 harness, which cannot
  prioritise requests, and gains ~1 s of LCP. Production LiteSpeed serves HTTP/2+, where a preloaded
  image yields to scripts. Measure with PageSpeed after deploy before deciding to keep it.
- **`content-visibility` (#44)** makes the page height an estimate (900 px per unrendered section)
  until the visitor scrolls near a section, so the scrollbar thumb can resize while scrolling. These
  sections must not contain fixed-position or overflowing content (rule in `global.css`).
- **Admin console** downloads ~29 KB more JS after sign-in, because it prefetches the other manager
  screens at idle so they open instantly.
- **`/blogs`** shows 12 posts first, then "Load more". A `?post=<slug>` deep link opens any post,
  including older ones.

## Deploy notes

- `api/cron/data-fixes.php` (already run by `tools/hostinger-update.sh`) applies two new one-off fixes:
  - `fix:blog-cover-webp`: points the 11 seeded covers at their WebP copies, only when the WebP exists
    and the cover was never changed.
  - `fix:chat-status-updated-index`: adds the chat index.
- No new dependencies. All gates pass:
  - typecheck: 0 errors
  - unit tests: 56/56
  - API suite: 153 pass, 0 fail, 3 skipped
  - browser suite: 156/156
  - oxlint: no new findings; 346 → 339
- The tests that still expected the pre-2026 Virtual Office plans (Bronze/Silver/Gold) now use the
  2026 names, and the Virtual Office visual baselines were re-recorded. They had been failing on
  `main` since the 2026-10-13 plan rename.

## Not done (measured or judged not worth it now)

- **Server-side listing thumbnails.** Drive photos are 1600 px everywhere. This needs GD on the
  server and the Drive key, so it can't be verified locally.
- **Sharing hashed JS/CSS across subdomains.** About 185 KB gzip would be saved per extra subdomain
  visited, at the cost of cross-origin loads; measure first.
- **Sending inquiry e-mail after the response.** This affects form submit time, not loading.
- **Trimming Google Fonts families.** Every family is still referenced somewhere.
