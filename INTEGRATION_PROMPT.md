# Prompt: Integrate a Figma Make Export into the APG Website

> Paste the block below into your AI coding assistant (Claude / Copilot / etc.) after you have:
> 1. Unzipped your Figma Make download inside the repo root (e.g. `luxe prime realty/`).
> 2. Told the assistant which enterprise the folder is for (e.g. "Dynamic Tree", "Luxe Prime").
> 3. Read the notes after the prompt block so you can fill in the few blanks before sending.

---

## PROMPT BLOCK (copy everything between the lines)

---

I have a Figma Make code export sitting in a folder inside the main APG website repo. I need you to integrate it as the new page for an existing enterprise subsidiary, **[ENTERPRISE NAME HERE]**, replacing the current placeholder page.

This is the main repo: Alpha Premier Group (APG) — Vite 5 + React 18 + React Router 6, plain CSS, no TypeScript, shadcn, MUI, or Tailwind.

### What the main repo looks like (do not change these files unless explicitly noted)

- `src/App.jsx` — top-level router. Each enterprise has a `<Route path="subsidiaries/<slug>" element={<EnterpriseName />} />` entry inside a shared `<Layout />`.
- `src/components/Layout.jsx` — wraps every public route with `<Header />`, `<main><Outlet /></main>`, `<Footer />`, `<Chatbot />`. Subsidiary pages render inside this layout — they must NOT ship their own header/footer.
- `src/routes/subsidiaries/<Enterprise>.jsx` — the placeholder page to replace (currently a tiny component using `react-helmet-async` + `AOS` + shared `Subsidiary.css`).
- `vite.config.js` — Vite config with `@` → `./src` alias, port 3000, API proxies.
- `package.json` — dependencies. Notable: `react-helmet-async`, `aos`, `recharts`. Tailwind/shadcn/MUI are NOT installed and should NOT be added.
- `src/styles/` — global stylesheets already loaded by the main app.
- `public/assets/` — shared images / logos served at `/assets/...`.

### What's in the Figma Make export (the folder I dropped in)

- `package.json` — Figma Make's own deps (Tailwind v4, 40+ Radix/shadcn UI components, MUI, Emotion, Framer Motion, etc.). DO NOT merge these into the main repo's `package.json`.
- `vite.config.ts` — Figma-specific config (Tailwind plugin, figma:asset/ resolver). DO NOT use this.
- `src/main.tsx` and `index.html` — standalone entry. DO NOT use these.
- `src/styles/` — Tailwind v4 entry (`tailwind.css`), theme tokens (`theme.css`), Google Fonts `@import`.
- `src/app/App.tsx` — ONE giant component (often 1,000+ lines) that contains the entire site: nav, hero, services, blogs, careers, inquire, footer, animations, custom cursor, particles, lightbox, etc. Uses internal `useState` for "page" switching (values like `"home" | "services" | "blogs" | "careers" | "inquire"`).
- `src/app/components/figma/ImageWithFallback.tsx` — small image helper.
- `src/app/components/ui/*` — ~48 shadcn/ui primitives (button, dialog, carousel, etc.). Radix-based, Tailwind-styled.
- `src/imports/` — uploaded images (logos, screenshots, pngs). These are REAL assets that must be preserved.
- `pnpm-workspace.yaml`, `postcss.config.mjs`, `ATTRIBUTIONS.md`, `guidelines/` — Figma infra. DO NOT use.

### Your job

Convert the Figma Make export into ONE React Router route inside the main APG app with the visual output rendered pixel-faithfully. Preserve every section, layout, color, image, and animation effect — but express them using the main repo's stack and conventions. Do NOT just copy the TypeScript/Tailwind files into the repo.

### Hard rules

1. Do NOT modify the main repo's `package.json` to add Tailwind, shadcn, MUI, Emotion, Radix, or Framer Motion. The integration must work with the existing dependencies only (`react`, `react-dom`, `react-router-dom`, `react-helmet-async`, `aos`, `recharts`). If a Figma feature genuinely cannot be reproduced without a new dep, STOP and ask me before adding anything.
2. Do NOT touch the main repo's `vite.config.js`, `src/components/Layout.jsx`, `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/Chatbot.jsx`, or `src/App.jsx` routing structure. The only exception: if `src/App.jsx` needs a new route entry for a NEW subsidiary that isn't listed there yet, add exactly one line in the same style as the others. For an existing subsidiary (Realty, Construction, SwiftClear, DynamicTree, LuxePrime, AltaVenture, Prime88) the route already exists — do not duplicate it.
3. Use plain CSS (one `.css` file per subsidiary), matching the convention of existing subsidiaries (see `src/routes/subsidiaries/Realty.jsx` and `src/routes/subsidiaries/Subsidiary.css`). No Tailwind utility classes, no `cn()`/`clsx`/`twMerge`, no CSS-in-JS.
4. Do NOT spill styles globally. Scope every selector under a top-level class unique to this subsidiary (e.g. `.luxe-prime-*`). The main repo's shared header/footer and other pages must not shift by a single pixel.
5. Replace the existing placeholder component at `src/routes/subsidiaries/<Enterprise>.jsx` with the integrated version. Keep the default export name and the existing file path. Delete the old placeholder content entirely.
6. Images in `src/imports/` must be copied to `public/assets/` (or `public/assets/<enterprise>/`) and referenced as `/assets/...` URLs — exactly like the main repo already does for existing logos. DO NOT use the Figma `figma:asset/` resolver. DO NOT import images as JS modules.
7. The page must render INSIDE the shared `<Layout />` (Outlet). Strip the Figma export's own `<Nav/>`, `<Footer/>`, `<CustomCursor/>`, `<ScrollProgress/>`, `<FloatingParticles/>`, `<style>` keyframes injected into document — only the BODY content stays. (See "What to keep vs drop" below.)
8. The page must use `<Helmet>` from `react-helmet-async` to set its `<title>` and meta description, matching the pattern in the old placeholder.
9. Use `AOS` (already in the main repo's deps) for scroll animations instead of the Figma-generated `motion`/`FadeIn`/`useFadeIn`/`use3DTilt`/`useParallax` hooks. Replace `data-aos="..."` attributes with equivalent AOS effects (`fade-up`, `fade-in`, `zoom-in`, etc.). It's OK if the motion differs slightly in feel, but duration and direction should match the original intent.
10. The internal "page" switching (home/services/blogs/careers/inquire) must be converted to React Router sub-routes OR in-page anchor sections, your call. Keep the URLs navigable. If you add sub-routes, nest them under the existing `/subsidiaries/<slug>` path.
11. Do NOT break any existing route. After integration, `npm run build` must succeed and `npm run dev` must load the home page, every other subsidiary, `/admin`, the contact form, and all API proxies unchanged.
12. Do NOT commit. Do NOT push. When done, summarize what you changed and leave it for my review. (Branch creation is allowed — see rule 13.)
13. **Branch hygiene (mandatory).** Before any code edits: the current git branch MUST match the pattern `feat/<enterprise-name>` (lowercase, hyphenated). Examples: `feat/luxe-prime`, `feat/dynamic-tree`, `feat/realty`. If you are not on a matching branch, STOP and do not edit anything — tell the user to run:
    ```
    git checkout main
    git pull origin main
    git checkout -b feat/<enterprise-name>
    ```
    where `<enterprise-name>` matches the enterprise slug from the route table (see "Notes for the human" below). Do NOT create the branch yourself. Do NOT edit files while on `main` or on the wrong branch. After the user has switched to the correct branch and confirmed, continue with the integration.

### What to keep vs drop from the Figma export

| From Figma export | Action |
|---|---|
| Visual body content (hero, sections, images, text, services, blogs, careers, inquiry form) | KEEP — reproduce faithfully in plain JSX + CSS. |
| Google Fonts `@import` / `<link>` | KEEP — move the `@import` to the top of the subsidiary's CSS file, OR add `<link>` tags via `<Helmet>`. Do NOT edit the main repo's `index.html`. |
| Theme color CSS variables (`--background`, `--primary`, `--accent`, gold #C49A2A, etc.) | KEEP — scope them under the subsidiary's top-level wrapper class (e.g. `.luxe-prime-scope { --background: #050505; ... }`) so they override only within this page. |
| Inline `<style>` keyframes (`scrollBob`, `goldFlow`, `diamondFloat`, `heroEnter`, `pageFadeIn`, `goldPulseBox`, `particleRise`, `rippleOut`, `goldShimmerSweep`, `borderGlow`, `.shimmer-gold`) | KEEP — move into the subsidiary CSS file, prefixed/namespaced so they don't collide with other pages. |
| `<Nav/>` (top branding + nav links) | DROP — the main repo's `<Header />` already renders. |
| `<Footer/>` | DROP — the main repo's `<Footer />` already renders. |
| `<CustomCursor/>` + the `* { cursor: none !important }` rule | DROP — invasive, breaks UX on the rest of the site. |
| `<ScrollProgress/>` | DROP — unless you can scope its styles cleanly; otherwise drop. |
| `<FloatingParticles/>` | DROP if it's purely decorative AND pollutes global styles; otherwise scope it tightly to one background layer. |
| shadcn/ui components (`src/app/components/ui/*`) | DROP across the board. Re-implement the handful that are actually used as plain JSX+CSS (usually just button, card, dialog/lightbox, carousel). Most of the 48 files are unused — ignore them. |
| `ImageWithFallback.tsx` | Either inline a tiny version with plain `<img onError>` in JSX, or drop and use plain `<img>`. |
| `react-router-dom`-style internal `navigate()` / `setPage` state | Replace with React Router `<Link>` and `useNavigate` — the main app already uses React Router 6. |
| Any `window.location.href = "mailto:..."` hack | KEEP verbatim in the inquiry form (or convert to a fetch call to the main repo's `/api/contact` if the main repo has one — check `src/routes/Contact.jsx` first for the existing pattern). |
| Photo lightbox / carousel | KEEP — reproduce as a simple modal with plain React state + CSS. Do NOT pull in `embla-carousel-react`. |

### How to do the conversion, step by step

1. **Read first** — open and read: `src/App.jsx`, `src/components/Layout.jsx`, one existing subsidiary that's NOT yet upgraded (e.g. `src/routes/subsidiaries/Realty.jsx` + `src/routes/subsidiaries/Subsidiary.css`), and one upgraded target if any exists. Never guess the conventions; read them.
2. **Unzip contents stay in place** — don't move/delete the Figma export folder yet; read from it as a source of truth for visuals and copy. I'll delete it after the integration passes my review.
3. **Plan the file layout.** Output should land at:
   - `src/routes/subsidiaries/<Enterprise>.jsx` — the page(s). Split into smaller components if the giant `App.tsx` makes sense to break up; otherwise one big file is fine.
   - `src/routes/subsidiaries/<enterprise>.css` — the scoped stylesheet (if you prefer to split, use `<enterprise>/` subfolder with multiple `.css` files imported from the main JS file).
   - `public/assets/<enterprise>/` — copy every image from `<export>/src/imports/` here. Match filenames. Update image `src` references to `/assets/<enterprise>/<filename>`.
4. **Copy images first.** List every file in `<export>/src/imports/` and copy each to `public/assets/<enterprise>/`. Don't rename; don't convert. Then strip the `import xxxLogo from "@/imports/..."` lines and replace `<img src={luxePrimeLogo} ...>` with `<img src="/assets/<enterprise>/7._LOGO_LUXE_PRIME-png.png" ...>`.
5. **Convert the big `App.tsx` body to JSX.** The `<Nav>` and `<Footer>` you delete. The page-switching `useState`-driven main section becomes either sub-routes or in-page anchors (your call — pick whatever is less code change). Rewrite every className that uses Tailwind utilities (e.g. `grid grid-cols-3 gap-4 text-xs md:text-base`) into equivalent scoped CSS classes (e.g. `.luxe-prime-grid-3`). Hard-coded Tailwind literals like `text-[#C49A2A]` and `font-['Cinzel']` become CSS rules referencing your scoped variables.
6. **Extract the inline `<style>` block.** Move the keyframes and `.shimmer-gold`-type rules into the subsidiary CSS file. Scope each animation name with the enterprise slug (e.g. `luxe-prime-page-fade-in`) to avoid clashing with anything in `src/styles/`. The `html { scroll-behavior: smooth }` and `* { cursor: none }` rules: DROP, they're globally invasive.
7. **Animations.** Swap Framer Motion `FadeIn` (and `motion.div`) for `AOS` `data-aos="fade-up"`/`data-aos="fade-in"` with matching durations. For tilt/parallax/custom cursor effects, drop them (or reimplement as a tiny scoped `useEffect` if cheap). The goal is visual fidelity of static + scroll states, not 1:1 library parity.
8. **shadcn components.** Only rebuild what's actually rendered (commonly: a button, a dialog/lightbox, maybe a carousel). Hand-write tiny JSX+CSS versions. Skip anything unused.
9. **The inquiry form.** Find the existing pattern in `src/routes/Contact.jsx` (the main repo) — use the same submission approach (fetch to `/api/contact` if that's how APG does it, OR the `mailto:` hack if APG has nothing). Do NOT introduce Resend client-side; the main repo already has a Node `server/contact.js`.
10. **Helmet.** Wrap the whole page return in `<Helmet><title>... | Alpha Premier</title><meta name="description" content="..."/></Helmet>`. Match the title pattern the old placeholder used (`<Enterprise> | Alpha Premier`).
11. **TypeScript → JavaScript.** Strip types everywhere (`: ReactNode`, `useState<Page>`, `interface`, `type`, etc.). Rename any `.tsx` files you pull into the project to `.jsx`. Do NOT add a `tsconfig.json` — the main repo is JS-only.
12. **Verify before claiming done.** Run `npm run build` from the repo root and confirm it succeeds. Run `npm run dev`, click into `/subsidiaries/<slug>`, and confirm the page renders visually like the Figma export. LSP-diagnostics clean on the new files. Report any pre-existing diagnostics you find elsewhere — do not silently "fix" them.
13. **Do not commit, do not push, do not open a PR.** Leave the working tree dirty for my review.
14. **Summarize.** When finished, summarize exactly: which files you created, which you modified, which images you copied, which (if any) existing routes you touched, and any Figma feature you could not reproduce without a new dependency (ask before adding).

### Edge cases / decisions to flag back to me

- If the Figma Make `package.json` has a dependency the main repo is missing that you believe is strictly required to reproduce the visual output, STOP and ask. Do NOT add it on your own.
- If you discover multiple enterprises bundled into one export (e.g. the export has pages for both `luxe-prime` and `alta-venture`), STOP and ask — each enterprise gets its own branch in our workflow.
- If `src/App.jsx` does NOT already have a route for the target enterprise, add exactly one `<Route>` line mirroring the existing pattern and STOP to confirm before doing anything else.
- If you find anything suggesting the Figma export references external API keys, secret URLs, or production-only hosts, DO NOT hard-code those — flag them to me.

Ready? Confirm which enterprise this integration is for, then start.

---

## END PROMPT BLOCK

---

## Notes for the human (not part of the prompt — read before you send)

### 1. Before pasting, fill in the blanks

Replace **`[ENTERPRISE NAME HERE]`** with the matching subsidiary from this list (must match a route already in `src/App.jsx`):

- Realty → `/subsidiaries/realty` — `src/routes/subsidiaries/Realty.jsx`
- Construction → `/subsidiaries/construction` — `src/routes/subsidiaries/Construction.jsx`
- SwiftClear → `/subsidiaries/swiftclear` — `src/routes/subsidiaries/SwiftClear.jsx`
- DynamicTree → `/subsidiaries/dynamic-tree` — `src/routes/subsidiaries/DynamicTree.jsx`
- LuxePrime → `/subsidiaries/luxe-prime` — `src/routes/subsidiaries/LuxePrime.jsx`
- AltaVenture → `/subsidiaries/alta-venture` — `src/routes/subsidiaries/AltaVenture.jsx`
- Prime88 → `/subsidiaries/88prime` — `src/routes/subsidiaries/Prime88.jsx`

If the target is a brand-new enterprise not in that list, tell your AI agent to STOP and add only the import + `<Route>` line, then wait for confirmation.

### 2. Branch hygiene

Each enterprise should go on its own feature branch off the same base commit. Example:

```
git checkout main
git pull
git checkout -b feature/integrate-luxe-prime
# unzip Figma export to "luxe prime realty/" inside the repo (or any temp path)
# run the AI integration
# when done, the "luxe prime realty/" source Figma folder should be DELETED before commit
# commit only the changes under src/ and public/assets/
```

The Figma Make source folder (`luxe prime realty/`, in your case) MUST NOT be committed. It's a build input — not part of the final repo. Add it to `.gitignore` temporarily, or just delete it before staging:

```
# inside the repo root, before committing:
Remove-Item -Recurse -Force "luxe prime realty"
git status   # confirm the folder is gone
```

### 3. What to expect from the AI

This is a hard conversion task — not a file copy. The AI agent will need to:

- Rewrite ~1,400 lines of TypeScript + Tailwind into plain JSX + CSS
- Hand-build replacements for ~3–5 shadcn components that are actually used
- Reimplement scroll animations using AOS instead of Framer Motion
- Scope every selector so the main APG site (header, footer, chatbot, other subsidiaries, admin, contact form) is visually untouched

Expect multiple rounds of review. The first pass will likely have visual differences. That's normal — iterate on it.

### 4. Cleanup reminder

After every successful integration (reviewed and merged), delete the leftover Figma Make folder from the repo. It's currently sitting untracked at `luxe prime realty/` and will show up as a dirty entry in `git status` until then. Same applies to anyone else's Figma export folder.
