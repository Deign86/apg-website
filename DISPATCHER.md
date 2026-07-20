# Dispatcher Prompt — Read this first, then follow INTEGRATION_PROMPT.md

> **For the human sharing this:** copy everything between the `---` lines below and paste it into your AI coding assistant (Claude / Copilot / Cursor / etc.). Do NOT paste INTEGRATION_PROMPT.md yourself — let the agent read it from the repo.

---

In the root of this repo there is a file named `INTEGRATION_PROMPT.md`. Read it now. It defines the full rules for integrating a Figma Make code export into the main APG website as an enterprise subsidiary page. After you've read it, follow this dispatcher protocol exactly — do NOT skip any step, do NOT start coding until I've answered the questions below.

### Step 1 — Branch guard (mandatory, non-negotiable)

1. Run `git branch --show-current` (or the equivalent for your environment) and tell me which branch I'm on.
2. The current branch MUST match the pattern `feat/<enterprise-name>` where `<enterprise-name>` is the lowercase hyphenated slug of one of the seven existing subsidiaries OR a new enterprise I'm introducing (in which case STOP and confirm with me before doing anything else — see rule 13 of INTEGRATION_PROMPT.md).
3. If I am NOT on a `feat/<enterprise-name>` branch (e.g. I'm on `main`, `master`, or some other branch):
   - STOP. Do NOT open any file. Do NOT write any code.
   - Tell me to run, and do NOT run these commands for me:
     ```
     git checkout main
     git pull origin main
     git checkout -b feat/<enterprise-name>
     ```
   - Tell me to reply here once I've switched branches.
4. If I AM on a matching branch, confirm the branch name to me and continue to Step 2.

### Step 2 — Verify the Figma Make export is present

1. Ask me for the path to the unzipped Figma Make folder (or confirm the one you can see in the repo root). It should contain at minimum: `package.json`, `vite.config.ts`, `src/app/App.tsx`, `src/styles/`, `src/imports/`.
2. If the folder is missing or incomplete, STOP and tell me what's expected. Do NOT proceed.

### Step 3 — Confirm the target enterprise

Tell me which of these seven enterprises the Figma export is for, and I will confirm or correct:

- Realty → `/subsidiaries/realty` → `src/routes/subsidiaries/Realty.jsx`
- Construction → `/subsidiaries/construction` → `src/routes/subsidiaries/Construction.jsx`
- SwiftClear → `/subsidiaries/swiftclear` → `src/routes/subsidiaries/SwiftClear.jsx`
- DynamicTree → `/subsidiaries/dynamic-tree` → `src/routes/subsidiaries/DynamicTree.jsx`
- LuxePrime → `/subsidiaries/luxe-prime` → `src/routes/subsidiaries/LuxePrime.jsx`
- AltaVenture → `/subsidiaries/alta-venture` → `src/routes/subsidiaries/AltaVenture.jsx`
- Prime88 → `/subsidiaries/88prime` → `src/routes/subsidiaries/Prime88.jsx`

If none of these match, STOP — this might be a new enterprise, and I need to confirm before any code is written.

### Step 4 — Mode choice (you must ask, do not decide for me)

Present these two options and wait for me to pick one. Do NOT proceed until I answer.

> **Option A — Guided mode:** You walk me through every step of INTEGRATION_PROMPT.md, one phase at a time, explaining what you're about to do before each change. I make the final call on each step. Best if I want to learn the codebase along the way.
>
> **Option B — Autonomous mode with checkpoints:** You execute the entire integration yourself, but you PAUSE at every phase boundary listed below and wait for my "continue" before moving on. You still must not commit, push, create a branch yourself, or add any dependency without my prior approval — those rules from INTEGRATION_PROMPT.md always apply.

### If I pick Option B (Autonomous with checkpoints) — the checkpoint phases

Execute these phases in order. After each `[STOP]`, give me a one-paragraph summary of what you just did, what's about to happen next, and wait for me to say "continue" (or give you feedback). Do NOT batch phases.

1. **Read phase.** Read `src/App.jsx`, `src/components/Layout.jsx`, one existing un-upgraded subsidiary JSX+CSS pair (e.g. `src/routes/subsidiaries/Realty.jsx` and `src/routes/subsidiaries/Subsidiary.css`), the Figma export's `src/app/App.tsx`, `src/styles/*.css`, and the `src/imports/` file list. **[STOP]** — report what you found and confirm the integration plan.
2. **Image copy phase.** Copy every file in `<figma-export>/src/imports/` to `public/assets/<enterprise-slug>/` in the main repo. Preserve filenames. **[STOP]** — list the files copied and the destination path.
3. **JSX scaffold phase.** Create `src/routes/subsidiaries/<Enterprise>.jsx` by replacing the existing placeholder (or, if this is a brand-new enterprise entirely, STOP and confirm with me — do NOT proceed with creating a new route without explicit approval). Strip out TypeScript types, strip out the Figma-export's `<Nav>`, `<Footer>`, `<CustomCursor>`, `<ScrollProgress>`, `<FloatingParticles>` (the main repo's `Layout.jsx` provides header/footer/chatbot). Convert page-switching `useState` into either React Router sub-routes under `/subsidiaries/<slug>/...` OR in-page anchor sections — you decide, but mention which you chose and why. **[STOP]** — show me the JSX file shape and the route/anchor approach.
4. **CSS phase.** Create `src/routes/subsidiaries/<enterprise-slug>.css` (or a `<enterprise-slug>/` subfolder if the styles are large). Scope every selector under a top-level wrapper class unique to this subsidiary (e.g. `.luxe-prime-scope` or `.luxe-prime-*`). Move every inline `<style>` keyframe from the Figma `App.tsx` into this CSS file, with each animation name namespaced (e.g. `luxe-prime-page-fade-in` instead of `pageFadeIn`) so nothing collides with the main repo's styles. Move the Google Fonts `@import` (if any) to the top of this CSS file — do NOT edit the main repo's `index.html`. Replace every Tailwind utility class in the JSX with equivalent semantic class names backed by scoped CSS rules. Replace hardcoded Tailwind literals (`text-[#C49A2A]`, `font-['Cinzel']`) with CSS using scoped variables. **[STOP]** — show me the CSS file structure and a few sample conversions.
5. **Animation + shadcn replacement phase.** Swap Framer Motion (`motion.*`, `FadeIn`, `useFadeIn`, `use3DTilt`, `useParallax`) for `AOS` attributes (`data-aos="fade-up"`, etc.) with equivalent durations. For the handful of shadcn components actually rendered (usually just button / dialog / lightbox / carousel), hand-build tiny plain-JSX+CSS replacements. Do NOT touch `src/app/components/ui/*` — reimplement in the page, don't copy the shadcn source. **[STOP]** — list which shadcn components you replaced and how.
6. **Inquiry form phase.** Open `src/routes/Contact.jsx` in the main repo to see how APG submits the contact form (likely `fetch('/api/contact')` or a `mailto:` hack). Mirror that pattern in your integration's inquiry form. Do NOT introduce Resend client-side. **[STOP]** — show me the inquiry submit handler.
7. **Helmet + meta phase.** Wrap the page in `<Helmet>` from `react-helmet-async` setting `<title>Enterprise | Alpha Premier</title>` and a meta description, matching the pattern in the old placeholder. **[STOP]** — show the Helmet block.
8. **Build + verify phase.** Run `npm run build` from the repo root and confirm exit code 0. Run `npm run dev`, navigate to `/subsidiaries/<slug>`, and confirm the page renders. Run `lsp_diagnostics` on every new / changed file. Report any pre-existing diagnostics you saw in untouched files — do NOT silently fix them. **[STOP]** — give me the final summary: files created, files modified, images copied, any Figma feature you couldn't reproduce without a new dependency (ASK before adding), and the diffs.

### Rules that always apply, regardless of mode

- The contents of `INTEGRATION_PROMPT.md` are the source of truth for integration rules. If this dispatcher prompt and INTEGRATION_PROMPT.md ever conflict, INTEGRATION_PROMPT.md wins — re-read it if anything is unclear.
- NEVER add a new dependency to `package.json` without my explicit written approval. If you think one is required to reproduce the Figma design, STOP and ask.
- NEVER touch `src/App.jsx` routing structure, `src/components/Layout.jsx`, `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/Chatbot.jsx`, `vite.config.js`, or the main repo's `index.html`. The only exception is rule 13 of INTEGRATION_PROMPT.md (adding exactly one `<Route>` line for a NEW enterprise — and even then I must approve first).
- NEVER commit, NEVER push, NEVER open a PR. Leave the working tree dirty for my review.
- NEVER silently "fix" pre-existing diagnostics in files you didn't intend to touch. Report them.
- After the integration is complete, remind me to delete the Figma Make source folder from the repo (e.g. `luxe prime realty/`) before staging changes — that folder must NOT be committed.

Acknowledge that you've read this dispatcher protocol, then start with Step 1 (branch guard). Do NOT do anything else until I confirm the branch.

---
