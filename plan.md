# Plan — Match Alpha Premier Group React SPA to the Legacy HTML Website

> **Executor:** DeepSeek V4 Flash
> **Repo:** `C:\Users\Deign\Downloads\Original APG Website` (branch `master`)
> **Goal:** Make the current Vite + React SPA match the legacy HTML website (the old site, currently live at https://alphapremiergroup.com) in content, structure, visuals, and behavior — while KEEPING the new tech stack.
> **Golden rule:** Do NOT revert to static HTML/PHP. All work happens inside the React SPA (`src/`). The legacy HTML/PHP files are REFERENCES ONLY — never delete or serve them from the SPA.

---

## 0. Mission & Guardrails

1. Preserve the new stack: Vite 5 + React 18 + React Router 6 + react-helmet-async + AOS + Supabase (data) + Resend (contact email) + pnpm.
2. The React SPA must reproduce the legacy site **page-for-page, section-for-section, word-for-word**.
3. Legacy files are references — keep `careers.html`, `blogs.html`, `property.html`, `virtual_office.html`, `property.php`, `virtual_office.php`, and `.old_site/` untouched as source-of-truth.
4. Match the dark + gold (`#c5a059`) aesthetic, fonts (Poppins / Orbitron / Good Times), Font Awesome 6, and AOS animations.
5. Every change must keep `pnpm build` green and the browser console error-free.
6. Commit per phase with `feat:` / `fix:` (e.g. `feat: home page parity with legacy site`).

## 1. Tech Stack (preserve, do not change)

- Build: Vite (`vite.config.js`, alias `@` -> `./src`), dev server `:3000`, proxy `/api/contact` -> `:3001`, `/api` + `/includes` -> `:8080`.
- Runtime: React 18, `react-router-dom@6` (BrowserRouter), `react-helmet-async` (per-page `<title>`).
- Data: Supabase (`@supabase/supabase-js`) — table `offerings`.
- Email: Resend via `server/contact.js` (Node, `:3001`, `POST /api/contact`).
- Animations: AOS 2.3 (`AOS.init({ duration: 800, once: true })` per route).
- Scripts: `pnpm dev`, `pnpm dev:contact`, `pnpm dev:all`, `pnpm build`, `pnpm preview`.

## 2. Reference Source Map (what to match for each page)

| Route | Reference source | Notes |
|---|---|---|
| `/` Home | **LIVE** https://alphapremiergroup.com (home) | No repo HTML copy exists; repo-root `index.html` is the Vite shell. `.old_site/index.html` is an OLDER design — NOT the target. |
| `/careers` | repo `careers.html` (byte-identical to live) | |
| `/blogs` | repo `blogs.html` (byte-identical to live) | |
| `/properties` | repo `property.html` | Not deployed on live (404); use the repo file. |
| `/virtual-office` | repo `virtual_office.html` | Not deployed on live (404); use the repo file. |
| `/subsidiaries/realty` | `.old_site/realty.html` | |
| `/subsidiaries/swiftclear` | `.old_site/swiftclear.html` | |
| `/subsidiaries/construction` | `.old_site/construction.html` | |
| `/subsidiaries/dynamic-tree` | `.old_site/dynamictree.html` | |
| `/subsidiaries/luxe-prime` | none — build on-brand from the Home enterprise card | |
| `/subsidiaries/alta-venture` | none — build on-brand | |
| `/subsidiaries/88prime` | none — build on-brand | |
| `/contact` | legacy `contactform.html` behavior (Inquire) | Keep route; remove from main nav to match live. |
| Header / Footer / Chatbot | every legacy page header/footer + live chatbot | Nav = Home / Properties / Virtual Office / Careers / Blogs (NO Contact). |

## 3. Design Tokens & Asset Map

**Tokens** (already in `src/styles/global.css` — keep):
`--primary:#c5a059; --accent:#c5a059; --accent-2:#e2c285; --light:#fff; --dark:#000; --bg-dark:#0a0a0a; --card-bg:#0a0a0a;`
Legacy gold variants `#E3B66C` / `#d5a965` appear only in `.old_site` and the email template — the live/reference pages use `#c5a059`. Stay on `#c5a059`.

**Fonts** (load in `index.html` — already present): Poppins (Google, body), Orbitron (Google, headings/CTAs), Good Times (`cdnfonts` + local `public/fonts/GoodTimes-Regular.otf` via `@font-face` in `global.css`), Font Awesome 6 (cdnjs).

**Assets in `public/`:** `viber1.png` (logo), `golden.png` (footer bg), `wallbody.jpg`, `wow123.png` (Properties/VO hero bg), `favicon.png`, `fonts/GoodTimes-Regular.otf`.
- Header logo reference height = **45px** (legacy `property.html`/`careers.html`/`blogs.html`).
- Properties & Virtual Office hero background = `assets/images/wow123.png`.
- **Home hero:** legacy is a real **video**; current `Home.jsx` sets `<source src="/assets/images/wallbody.jpg" type="video/mp4">` which is BROKEN (jpg as mp4). See Phase 2.
- Enterprise / property images live in `.old_site/` and `assets/images/main/subsidiaries/`; copy the ones you need into `public/assets/images/` and reference via absolute `/assets/images/...` paths.

## 4. CRITICAL Pre-flight Blocker — missing Supabase client

`src/hooks/useFirestore.js` imports `@/lib/supabase`, but **`src/lib/supabase.js` does not exist**. `createClient` appears nowhere in the codebase. `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are defined in `.env.local` but never read. Result: `Properties.jsx` and `VirtualOffice.jsx` cannot build/run; the committed `dist/` is stale.
`src/lib/firebase.js` exists but is DEAD (nothing imports it after the Supabase switch).

---

## Phase 0 — Environment & Build Health

**Reference:** n/a (infra).  **Current state:** Supabase client missing; Firebase leftovers; stale `dist/`.

**Required:**
1. Create `src/lib/supabase.js`:
   ```js
   import { createClient } from '@supabase/supabase-js';
   const url = import.meta.env.VITE_SUPABASE_URL;
   const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
   if (!url || !key) console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
   export const supabase = createClient(url, key);
   ```
2. Confirm `.env.local` has both vars (it does). Never commit `.env.local` (gitignored). For production builds, provide the same vars via CI env or a `.env.production` (gitignored).
3. Verify the Supabase `offerings` table has columns used by `useFirestore.js`: `id, title, location, price, price_unit, property_type, status, images[], floor_area, lot_area, description, created_at`. If empty, seed via `pnpm migrate-to-supabase` / `scripts/seed.cjs` using `website/u501100418_apg_database.sql` as source. Expected `property_type` values (must match the filter buttons in `property.html`): `warehouse, commercial_spaces, office_spaces, condominium, house, virtual_office`.
4. Delete stale `dist/`.
5. `pnpm install`, then `pnpm build` — must pass with zero errors.

**Acceptance:** `pnpm build` succeeds; `pnpm dev` loads `/properties` and `/virtual-office` with real data (or a clean empty-state), no console errors.

## Phase 1 — Shared Chrome (Header / Footer / Chatbot / Global)

**Reference:** headers/footers in `careers.html`, `blogs.html`, `property.html`, `virtual_office.html` + live chatbot.
**Current state:** Header has a Contact nav link (legacy has none); logo height 75px (legacy 45px); Footer social links are `href="#"`; Chatbot title/greeting differ from live.

**Required:**
1. `src/components/Header.jsx` navLinks -> exactly: Home(`/`), Properties(`/properties`), Virtual Office(`/virtual-office`), Careers(`/careers`), Blogs(`/blogs`). **Remove Contact.** Keep the `/contact` route in `App.jsx` (reachable via Inquire buttons).
2. `Header.css`: `.logo img.header-logo { height: 45px; }` to match legacy.
3. `src/components/Footer.jsx`: keep left (logo + Inquire Now button -> `/contact`) + right ("Alpha Premier" + Home/Properties/Careers/Blogs) + bottom bar (`© 2025 Alpha Premier Group. All rights reserved.` + social icons). Replace `href="#"` with the **real** social URLs — read them from the live site footer (Facebook / Instagram / TikTok). If unavailable, keep `#` and leave a TODO.
4. `src/components/Chatbot.jsx`: header title -> "Alpha Assistant"; on open show an initial bot greeting exactly: `Hello! I'm Alpha virtual assistant. How can I help you today?` Keep keyword replies; make sure enterprise keywords match the 7 enterprises.
5. Global: keep `global.css` tokens, golden scrollbar, `body.loaded` fade; ensure AOS css is linked (already in `index.html`).

**Acceptance:** All pages show the same fixed header (5 items, 45px logo) and footer; chatbot greets correctly; no Contact in nav.

## Phase 2 — Home Page (largest gap)

**Reference:** LIVE https://alphapremiergroup.com (home). Re-fetch it before coding to confirm current state.
**Current state:** `src/routes/Home.jsx` shows only a logo + Inquire button in the hero, a short generic About, an 8-item "Our Companies" grid (wrong items, FA icons), and Core Values. Missing: hero headline+quote, full ABOUT US, "Unique Homes" section, Mission & Vision, and the Inquire CTA.

**Required — rebuild `Home.jsx` + `Home.css` to reproduce, top to bottom:**

1. **Hero** (keep the fixed video bg + overlay from `Home.css`):
   - Headline (Orbitron/gold): `Where Connections Grow Into Success` (Appendix A).
   - Sub-quote (italic, light): the two-sentence quote (Appendix A).
   - **Remove** the giant logo image from the hero — the legacy hero is text, not a logo. The legacy hero does NOT show an Inquire button; move "Inquire Now!" to the dedicated CTA section (step 7).
   - **Fix the hero video:** legacy plays a real video. Replace the broken `<source src="/assets/images/wallbody.jpg" type="video/mp4">`. Either (a) add a valid `public/assets/videos/hero.mp4` and reference it, or (b) if no mp4 can be sourced, fall back to a background image — copy `.old_site/landingpage-bg.png` into `public/assets/images/` and use it as the hero background with the existing dark overlay. Prefer (a); otherwise (b). Document the choice in the commit.

2. **Our Enterprises** (section title `Our Enterprises`): exactly **7** cards in this order: Alpha Premier Realty, Swift Clear, Dynamic Tree, Luxe Prime, AltaVenture, Alpha Premier Construction, 88 Prime. Each links to its route (Realty->`/subsidiaries/realty`, Swift Clear->`/subsidiaries/swiftclear`, Dynamic Tree->`/subsidiaries/dynamic-tree`, Luxe Prime->`/subsidiaries/luxe-prime`, AltaVenture->`/subsidiaries/alta-venture`, Alpha Premier Construction->`/subsidiaries/construction`, 88 Prime->`/subsidiaries/88prime`). Use each company's logo image (from `assets/images/main/subsidiaries/*` / `.old_site` logos) instead of generic FA icons. **Remove** the current "Virtual Office" and "Alta Venture"(spaced) cards — Virtual Office has its own top-nav route and is NOT an enterprise card.

3. **ABOUT US** (heading `ABOUT US`): the full legacy paragraph verbatim (Appendix A). Single readable column, gold heading.

4. **Unique Homes, Outstanding Destinations** (heading `Unique Homes, Outstanding Destinations`): the welcome quote (Appendix A), then **4** cards: Condominium, Commercial Space, Office Space, Warehouse. Use legacy images (`.old_site/realty-condominium.png`, `realty-officespaces.png`, `realty-warehouse.png`, etc.) copied into `public/assets/images/`. Cards link to `/properties`.

5. **Mission & Vision** (heading `Mission & Vision`):
   - `Mission` subheading + intro line, then the **5** bullet points verbatim (Appendix A).
   - `Vision` subheading + the vision paragraph verbatim (Appendix A).

6. **Core Values** (heading `Core Values`): keep the 5 value cards (Excellence / Partnership / Innovation / Integrity / Legacy) with the FULL descriptions (already correct in `Home.jsx`). The legacy also shows SHORT tagline versions in a second row/marquee — add that secondary display with the short versions (Appendix A) to match the live duplicate. Reuse `.value-card` styling.

7. **Inquire Now! CTA** (full-width band): button `Inquire Now!` -> `/contact`.

8. Footer + Chatbot come from `Layout` (Phase 1).

**Acceptance:** Home matches the live site section-by-section and word-for-word; hero video/bg works; 7 enterprises; full About; 4 property cards; Mission & Vision; Core Values (full + short); Inquire CTA. Responsive at 768px.

---

## Appendix A — Exact Home Copy (use verbatim)

- **Hero headline:** `Where Connections Grow Into Success`
- **Hero quote:** `We don't just close deals. We bring visions to life. We don't just offer services. We design solutions that transform opportunities into realities.`
- **Enterprises (7, in order):** Alpha Premier Realty · Swift Clear · Dynamic Tree · Luxe Prime · AltaVenture · Alpha Premier Construction · 88 Prime
- **ABOUT US heading:** `ABOUT US`
- **ABOUT US paragraph:** Alpha Premier Group of Companies is a diversified Philippine-based business group serving as the parent organization of several companies operating across real estate, business support, construction, and professional services. With a commitment to innovation, professionalism, and service excellence, the group provides integrated solutions that support businesses, investors, and entrepreneurs in achieving sustainable growth. Leading the organization is Mr. Mark Anthony Abito-Santos, President and Chief Executive Officer, whose vision and leadership continue to drive the expansion of the group across multiple industries. Under his guidance, Alpha Premier Group has developed a strong network of partnerships and business opportunities throughout the Philippines. At the forefront of the organization is Alpha Premier Realty, the flagship company of the group and one of the leading brokerage firms in the Philippines. The company specializes in residential, commercial, and industrial real estate, offering brokerage and advisory services for commercial spaces, warehouses, office buildings, and residential properties. Through its extensive market knowledge and strong industry network, Alpha Premier Realty connects property owners, developers, and investors with strategic real estate opportunities across the country. Expanding beyond real estate, Alpha Premier Group of Companies also operates a range of complementary businesses designed to support the operational and growth needs of modern enterprises. These include Alpha Premier Virtual Office – Ortigas Business Center, strategically located at the Philippine Stock Exchange Centre, Tektite East Tower, Ortigas Center, Pasig City, providing premium virtual office services, prestigious business addresses, and flexible workspace solutions for startups, entrepreneurs, and expanding companies. The group's portfolio also includes companies providing business solutions and corporate support services, professional cleaning and facility services, modeling and talent management, as well as construction services and construction materials supply. By bringing together these specialized services under one organization, Alpha Premier Group is able to deliver comprehensive solutions tailored to the needs of its diverse clientele. Guided by a strong vision for growth and excellence, Alpha Premier Group of Companies continues to expand its network and strengthen its presence across key industries. Through its companies and partnerships, the group remains committed to building long-term relationships with businesses, developers, investors, and communities throughout the Philippines.
- **Unique Homes heading:** `Unique Homes, Outstanding Destinations`
- **Unique Homes quote:** `Welcome to ALPHA PREMIER GROUP, your trusted partner in premier locations. We deliver industry-leading property management and strategic investment solutions, defined by integrity, performance, and long-term value.`
- **Unique Homes cards (4):** Condominium · Commercial Space · Office Space · Warehouse
- **Mission & Vision heading:** `Mission & Vision`
- **Mission intro:** `Alpha Premier Group of Companies is committed to building a diversified and forward thinking organization that delivers excellence across its portfolio of companies. We aim to:`
- **Mission bullets (5):**
  1. Strengthen Alpha Premier Realty as one of the leading brokerage firms in the Philippines, specializing in residential, commercial, and industrial real estate, including commercial spaces, warehouses, and office developments.
  2. Provide businesses and entrepreneurs with strategic support through Alpha Premier Realty Virtual Office – Ortigas Business Center, offering prestigious business addresses and flexible workspace solutions in prime business districts.
  3. Expand and develop complementary industries including business solutions, professional cleaning and facility services, modeling and talent management, and construction services and materials supply.
  4. Foster long-term partnerships with developers, corporations, investors, and entrepreneurs through professionalism, integrity, and operational excellence.
  5. Continuously innovate and grow our group of companies while creating opportunities that contribute to the development of businesses, communities, and the national economy.
- **Vision:** `To become a leading and globally recognized Philippine business group, setting the standard in real estate brokerage, business services, and diversified industries by delivering innovative solutions, creating sustainable value, and contributing to the economic growth of the Philippines.`
- **Core Values (FULL descriptions):**
  - Excellence — We set the highest standards, leading by example and ensuring there are no shortcuts—only meticulous execution and uncompromising quality.
  - Partnership — We believe in mutual growth, working closely with our clients and teams to achieve shared success and long-term value.
  - Innovation — We embrace change, continuously evolving and leading in every industry by anticipating needs and creating impactful solutions.
  - Integrity — We build trust through transparency and deliver on our promises, always acting with honesty and responsibility.
  - Legacy — We build enduring businesses that make a meaningful impact, inspiring future generations through innovation, purpose, and dedication.
- **Core Values (SHORT, for the secondary marquee/row):**
  - Excellence — We set the highest standards, leading by example and ensuring there are no shortcuts.
  - Partnership — We believe in mutual growth, working closely with our clients.
  - Innovation — We embrace change, continuously evolving.
  - Integrity — We build trust through transparency.
  - Legacy — We build enduring businesses.
- **Inquire CTA:** `Inquire Now!`

## Phase 3 — Careers

**Reference:** repo `careers.html` (byte-identical to live). Re-read it in full before coding.
**Current state:** `src/routes/Careers.jsx` hero says "Join Our Team" / "Build your career..."; lists 3 wrong jobs (Real Estate Agent/Pasig, Marketing Specialist/Pasig, CSR/Remote); no "Why Work With Us" section.

**Required — rebuild `Careers.jsx` + `Careers.css`:**
1. Page `<title>`: `Careers | Alpha Premier` (already set).
2. Hero: h1 `Join Our Elite Team`; sub `Shape the future of premier real estate with Alpha Premier Group. We are looking for high-caliber individuals to lead the industry.`
3. Job list (3 cards, exact fields — Appendix B):
   - Real Estate Consultant — Makati City — Full-time — Commission Based — `Apply Now`
   - Property Manager — BGC, Taguig — Full-time — 2+ Years Exp — `Apply Now`
   - Marketing Associate — Quezon City — Part-time — Digital Marketing — `Apply Now`
   Each `Apply Now` -> `/contact` (or a mailto/application flow matching legacy). Card layout = legacy careers card.
4. **Why Work With Us?** section (heading `WHY WORK WITH US?`): 3 cards (Appendix B): Premium Growth, Elite Networking, Innovation First — each with its description and an icon.
5. Inquire Now! CTA band -> `/contact`.

**Acceptance:** Careers matches `careers.html`/live word-for-word; 3 exact jobs; Why Work With Us present; responsive.

---

## Appendix B — Exact Careers Copy (use verbatim)

- **Hero h1:** `Join Our Elite Team`
- **Hero sub:** `Shape the future of premier real estate with Alpha Premier Group. We are looking for high-caliber individuals to lead the industry.`
- **Jobs (3):**
  1. Title: `Real Estate Consultant` | Location: `Makati City` | Type: `Full-time` | Tag: `Commission Based` | Button: `Apply Now`
  2. Title: `Property Manager` | Location: `BGC, Taguig` | Type: `Full-time` | Tag: `2+ Years Exp` | Button: `Apply Now`
  3. Title: `Marketing Associate` | Location: `Quezon City` | Type: `Part-time` | Tag: `Digital Marketing` | Button: `Apply Now`
- **Why Work With Us heading:** `WHY WORK WITH US?`
- **Why Work With Us cards (3):**
  - `Premium Growth` — Access to high-value listings and elite training in the real estate industry tailored for future leaders.
  - `Elite Networking` — Build lifelong connections with top-tier investors, property developers, and high-net-worth clients.
  - `Innovation First` — Utilize state-of-the-art digital marketing tools and CRM systems to stay ahead of the competition.
- **Inquire CTA:** `Inquire Now!`

---

## Phase 4 — Blogs

**Reference:** repo `blogs.html` (byte-identical to live). Re-read it in full before coding.
**Current state:** `src/routes/Blogs.jsx` hero says "Blogs & Updates" / "Latest news from Alpha Premier Group" and shows ONE placeholder card ("Coming Soon / Stay Tuned for Updates").

**Required — rebuild `Blogs.jsx` + `Blogs.css`:**
1. Page `<title>`: `Blogs | Alpha Premier` (already set).
2. Hero: small eyebrow `Insights & Updates`; h1 `LATEST NEWS FROM ALPHA PREMIER GROUP`.
3. Blog list (3 posts, exact — Appendix C): each card = category label, date, title, excerpt, `READ MORE` link. Use the legacy blog images (`.old_site/blogs-featured-img.png`, `blogs-recent-img.png`) copied into `public/assets/images/`.
4. `READ MORE` should route to a blog detail route. If no detail route exists yet, add `/blogs/:slug` with a simple article view, or link to the legacy detail pages mapped into the SPA. At minimum, the 3 cards must be present with READ MORE affordance (can be a TODO for full article bodies if the legacy article HTML is sparse).
5. Inquire Now! CTA band -> `/contact`.

**Acceptance:** Blogs matches `blogs.html`/live: hero text exact, 3 posts with exact category/date/title/excerpt, READ MORE present; responsive.

---

## Appendix C — Exact Blogs Copy (use verbatim)

- **Hero eyebrow:** `Insights & Updates`
- **Hero h1:** `LATEST NEWS FROM ALPHA PREMIER GROUP`
- **Posts (3):**
  1. Category: `Real Estate` | Date: `OCTOBER 24, 2023` | Title: `The Future of Commercial Real Estate in 2024` | Excerpt: `Discover the emerging trends that are shaping the commercial property market, from sustainable office designs to smart warehouses.` | Link: `READ MORE`
  2. Category: `Investment` | Date: `OCTOBER 15, 2023` | Title: `Why Logistics Warehouses are the Best Investment` | Excerpt: `With the boom of e-commerce, industrial spaces are becoming the most sought-after assets for serious real estate investors.` | Link: `READ MORE`
  3. Category: `Lifestyle` | Date: `SEPTEMBER 30, 2023` | Title: `Maximizing Productivity in Your Virtual Office` | Excerpt: `Learn how to leverage virtual office services to boost your business image and output without the traditional overhead costs.` | Link: `READ MORE`
- **Inquire CTA:** `Inquire Now!`

## Phase 5 — Properties

**Reference:** repo `property.html` (read in full before coding). Not deployed on live (404) — the repo file is the source of truth.
**Current state:** `src/routes/Properties.jsx` already mirrors the legacy structure (hero + search, sticky filters, card grid, detail modal, lightbox). It reads from Supabase `offerings` via `useProperties()` (fixed in Phase 0). Filter list differs from legacy and the design must be aligned.

**Required:**
1. Page `<title>`: `Properties | Alpha Premier` (already set).
2. Hero h1: `The Alpha Premier Collections` (legacy exact). Keep the search input placeholder `Search name or location...`. Hero background = `assets/images/wow123.png` with the dark gradient overlay (legacy `property-hero`).
3. Filter buttons — match legacy labels AND underlying `property_type` values exactly: `All` (all), `Warehouse` (warehouse), `Commercial` (commercial_spaces), `Office` (office_spaces), `Condo` (condominium), `House` (house), `Virtual` (virtual_office). Update `Properties.jsx` `propertyTypes` to these pairs (label + value) and filter on the value.
4. Card design = legacy `.property-card` (image box with status badge, price, title, location, floor/lot specs, `VIEW DETAILS` button). Keep the modal + lightbox. `INQUIRE NOW` in modal -> `/contact`.
5. Keep Supabase as the data source. Ensure empty/loading/error states match legacy `#no-results` styling.
6. The legacy file loads Firebase compat SDK — IGNORE that; the SPA uses Supabase. Do not reintroduce Firebase.

**Acceptance:** `/properties` looks like `property.html` (hero title, filter row, card grid, modal); filters use the exact legacy type values; real Supabase data renders; responsive at 768px (legacy media query: single column, modal stacked).

---

## Phase 6 — Virtual Office

**Reference:** repo `virtual_office.html` (read in full before coding). Not deployed on live (404) — repo file is the source of truth.
**Current state:** `src/routes/VirtualOffice.jsx` reads Supabase `offerings` filtered to virtual-office types via `useVirtualOffices()` (fixed in Phase 0). Hero text and card layout need to match legacy.

**Required:**
1. Page `<title>`: `Virtual Offices | Alpha Premier` (already set).
2. Hero: match legacy `virtual_office.html` hero (h1 + optional search) with background `assets/images/wow123.png` + dark gradient. If legacy includes a search, replicate it; otherwise keep the heading + supporting line.
3. Card grid = legacy VO card (image + status badge + price + title + location + specs + short description + `INQUIRE NOW` -> `/contact`). Truncate description at ~200 chars as today, but match legacy visual style.
4. Keep Supabase data source + virtual-office type filter (`virtual_office` / `VIRTUAL OFFICE`). Align the `or()` filter to the canonical `property_type = 'virtual_office'` value used in Phase 5.
5. Empty/loading/error states styled like legacy.

**Acceptance:** `/virtual-office` looks like `virtual_office.html`; real Supabase VO data renders; `INQUIRE NOW` routes to `/contact`; responsive.

## Phase 7 — Subsidiary Pages

**References:** `.old_site/realty.html`, `swiftclear.html`, `construction.html`, `dynamictree.html` for the four that exist. Luxe Prime / AltaVenture / 88 Prime have no legacy page — build on-brand from the Home enterprise card and the company descriptions implied across the site.
**Current state:** `src/routes/subsidiaries/*.jsx` exist (Realty, RealtyOffers, Construction, SwiftClear, DynamicTree, LuxePrime, AltaVenture, Prime88) but are stubs that diverge from legacy. Read each legacy file in full.

**Required (per page):**
1. **Realty** (`/subsidiaries/realty`) — reproduce `.old_site/realty.html`: hero/banner (logo + tagline), services/offerings section, about, images (`realty-banner-img.png`, `realty-handshake.png`, `realt-bgimage.png`, etc. copied to `public/assets/images/`). Link "offers" to `/subsidiaries/realty-offers` or the legacy offers layout. `RealtyOffers` should mirror the legacy realty offers section.
2. **Swift Clear** (`/subsidiaries/swiftclear`) — reproduce `.old_site/swiftclear.html`: hero, services grid (deep cleaning, misting, fogging, UV, etc. using `.old_site/sc-*.jpg/png`), mission/vision, about image. Use the Swift Clear logo (`swiftclear-logo.png`).
3. **Construction** (`/subsidiaries/construction`) — reproduce `.old_site/construction.html`: hero, services image (`construction-services-img.png`), body bg (`construction-bodybg.png`).
4. **Dynamic Tree** (`/subsidiaries/dynamic-tree`) — reproduce `.old_site/dynamictree.html`: logo (`dynamictreelogo.jpg` / `sstcompany-dynamictree.png`), short about (modeling & talent management).
5. **Luxe Prime** (`/subsidiaries/luxe-prime`) — no legacy file. Build a single on-brand page: hero with the Luxe Prime card image, a short blurb consistent with "luxury lifestyle / premium experiences", services list, Inquire CTA. Match the global dark+gold aesthetic.
6. **AltaVenture** (`/subsidiaries/alta-venture`) — no legacy file. Build on-brand page for "business solutions and corporate support services" (per Home ABOUT US), hero + services + CTA.
7. **88 Prime** (`/subsidiaries/88prime`) — no legacy file. Build on-brand page for "specialized professional services", hero + services + CTA.
8. Every subsidiary page: page `<title>` = `<Name> | Alpha Premier`, AOS on scroll, Inquire CTA -> `/contact`, consistent Header/Footer/Chatbot from Layout.

**Acceptance:** The 4 legacy-backed subsidiaries match their `.old_site` counterparts in layout/content/images; the 3 new ones are coherent, on-brand, and error-free; all responsive.

---

## Phase 8 — Contact / Inquire / Route Hygiene

**Reference:** legacy `contactform.html` behavior + the live site (no Contact in nav; "Inquire Now!" CTAs open the contact experience).
**Current state:** `src/routes/Contact.jsx` is a full page (info + form -> `/api/contact` -> Resend). It works but is in the nav (removed in Phase 1). `About.jsx` exists as a route not present in the live nav.

**Required:**
1. Keep `/contact` route and the Resend flow (`server/contact.js`). Verify success/error states and the ticket number display.
2. Remove `/contact` from the main nav (done in Phase 1) but keep all "Inquire Now!" buttons across Home/Careers/Blogs/Properties/VO/subsidiaries routing to `/contact`.
3. `/about` route: the live site has no About page in the nav — About content lives on Home (Phase 2 §3). Either (a) remove the `/about` route and `About.jsx`, or (b) keep it as a hidden deep-link that renders the same ABOUT US content. Prefer (a) to match live exactly; if keeping, exclude from nav and add a redirect note.
4. Ensure `NotFound.jsx` is styled on-brand (gold/dark) for unknown routes.
5. `index.html` `<title>` = `Alpha Premier | Group of Companies` (already set); add a meta description matching the live site if present.

**Acceptance:** Inquire CTAs all reach `/contact`; nav has no Contact/About; contact form submits and shows the ticket; 404 is on-brand.

---

## Phase 9 — Cleanup

1. Remove dead Firebase artifacts now that Supabase is the data layer and the cutover is done: `src/lib/firebase.js`, `.firebaserc`, `firebase.json`, `firestore.indexes.json`, `firestore.rules`, `storage.rules`. (`.env.local` already comments Firebase as "kept for rollback - remove after cutover".) Confirm no SPA import references Firebase before deleting.
2. **Security:** `.env` (committed) contains a live `RESEND_API_KEY`. Move secrets OUT of `.env` into `.env.local` (gitignored) or CI env; leave `.env` as a template with placeholder values. Do the same for any other committed secrets.
3. Do NOT delete the reference HTML/PHP files (`careers.html`, `blogs.html`, `property.html`, `virtual_office.html`, `property.php`, `virtual_office.php`) or `.old_site/` — they are the source of truth for this plan.
4. Remove any leftover migration/convert scripts that are no longer needed only if they are clearly obsolete; otherwise leave them.
5. Regenerate `dist/` only via `pnpm build` (Phase 10).

**Acceptance:** No Firebase imports remain; no secrets committed; references preserved.

---

## Phase 10 — Final Verification

1. `pnpm install` then a clean `pnpm build` — zero errors, zero warnings about missing modules.
2. `pnpm dev:all` (Vite `:3000` + contact `:3001`) and walk every route: `/`, `/properties`, `/virtual-office`, `/careers`, `/blogs`, `/contact`, all `/subsidiaries/*`, and a bad path for 404.
3. Per-page parity check against references (Appendix D).
4. Open browser DevTools on each route — no red console errors, no 404 assets, no missing fonts.
5. Responsive check at 768px (and ~375px) for every page.
6. Submit the contact form once (with a test email) and confirm the Resend ticket returns.
7. Commit the final state: `feat: full parity with legacy HTML site`.

---

## Appendix D — Acceptance Checklist

- [ ] `src/lib/supabase.js` exists; `pnpm build` is green.
- [ ] Header nav = Home / Properties / Virtual Office / Careers / Blogs; logo 45px; no Contact.
- [ ] Footer = logo + Inquire Now + Alpha Premier (Home/Properties/Careers/Blogs) + © 2025 + real social icons.
- [ ] Chatbot titled "Alpha Assistant" with the exact greeting.
- [ ] Home: hero headline + quote (video/bg fixed); 7 enterprises; full ABOUT US; Unique Homes (4 cards); Mission & Vision (5 bullets + vision); Core Values (full + short); Inquire CTA.
- [ ] Careers: hero exact; 3 exact jobs; Why Work With Us (3 cards); Inquire CTA.
- [ ] Blogs: hero exact; 3 exact posts (category/date/title/excerpt/READ MORE); Inquire CTA.
- [ ] Properties: hero "The Alpha Premier Collections"; 7 filters with exact type values; card grid + modal; Supabase data.
- [ ] Virtual Office: matches `virtual_office.html`; Supabase VO data; Inquire -> /contact.
- [ ] Subsidiaries: Realty/SwiftClear/Construction/DynamicTree match `.old_site`; LuxePrime/AltaVenture/88Prime on-brand.
- [ ] `/contact` reachable via Inquire CTAs; form submits; ticket shown.
- [ ] No Firebase imports; no committed secrets; reference HTML/PHP + `.old_site/` preserved.
- [ ] No console errors / 404 assets on any route; responsive at 768px and 375px.
