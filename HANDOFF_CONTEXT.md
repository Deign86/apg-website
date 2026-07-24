HANDOFF CONTEXT — APG / Luxe Prime integration
================================================

USER REQUESTS (AS-IS)
---------------------
- (Earlier session) Migrate the Figma Luxe Prime export into the existing Vite/React/Supabase project as a /luxe-prime route, wrapping it in <EnterpriseShell> with a header, footer, and navigation context shared with the rest of the Alpha Premier Group site.
- (Earlier) Integrate the new Figma component stack (Tailwind v4, motion, lucide-react, embla-carousel-react, radix-ui packages, input-otp, next-themes, etc.) and a Tailwind v4 vite.config.js plugin so the Figma .tsx fragments transpile via Vite's existing TS toolchain.
- (Earlier) Treat the Figma source folder as source-of-truth and never commit it; copy the body verbatim into the app's source tree, editing surgically only where unavoidable.
- (Earlier) Merge main into the feature branch; report any conflicts and do not silently auto-resolve them.
- (Current — original) "wait instead of doing that in the INQUIRE button, can you instead just make the inquire button a solid gold color like it is reversed so that the button is more emphasized"

GOAL
----
On feat/luxe-prime, simplify the INQUIRE button styling in src/components/EnterpriseHeader.css to a clean solid-gold filled ("reversed") look — emphasis purely through color contrast, no animation, no bevel, no glow, no scale — then `npm run build` to confirm nothing regressed. The branch is halfway through integration and already pushed to origin (HEAD at d8b1860 after a successful main merge); the backup/luxe-prime snapshot is intact.

WORK COMPLETED
--------------
- Designed, built, and pushed feature commit 9e7a6a6 on feat/luxe-prime (67 files, 7556 insertions): added Figma stack dependencies + tailwindcss devDep + googleapis (already present); configured @tailwindcss/vite + figma:asset alias; created tsconfig.json; rewired App.jsx so /luxe-prime mounts inside <EnterpriseShell>; introduced src/components/EnterpriseShell.{jsx}, EnterpriseHeader.{jsx,css}, EnterpriseFooter.{jsx,css}, src/context/EnterpriseNavContext.jsx, src/data/enterpriseConfig.js; rewrote src/routes/subsidiaries/LuxePrime.jsx to re-export from the verbatim folder src/routes/subsidiaries/luxe-prime/.
- Published safety branch backup/luxe-prime at 9e7a6a6 (same commit), pushed to origin.
- Pulled latest main (c608f21 "fix(chatbot): surface correct official contact info from AI") and merged main into feat/luxe-prime.
- One conflict surfaced in package.json (Figma-stack deps vs googleapis, alphabetically adjacent, mechanical not semantic). Resolved by keeping both — union of all six lines (embla-carousel-react ^8.6.0, googleapis ^173.0.0, input-otp ^1.4.2, lucide-react ^0.487.0, motion ^12.23.24, next-themes ^0.4.6). All other auto-merged: DISPATCHER.md, INTEGRATION_PROMPT.md, MANUAL_TESTING.md, api/admin/[...path].js, api/ai/[...path].js, api/assets/public-meta.js, api/contact.js, runtime deletion of blogs.html/careers.html/property.html/property.php/virtual_office.html/virtual_office.php, server/ai.js, server/contact.js, new server/http.js, src/components/Chatbot.jsx, Footer.jsx, PropertyImage.jsx, admin/Sidebar.jsx, src/hooks/useFirestore.js, usePropertyGallery.js, src/lib/ai.js, src/routes/Careers.jsx, Contact.jsx, Properties.jsx, VirtualOffice.jsx, admin/AdminShell.jsx, admin BlogManager.jsx, CareerManager.jsx, new admin FacebookContext.jsx, admin PropertiesManager.jsx, admin Settings.jsx, six new supabase migrations, scripts/ingest-apg-listings.cjs + new scripts/seed-archived-context.mjs, seed-job-openings.mjs, sync-drive-listings.cjs, update-contact-info.mjs, scripts/setup-admin.cjs, vercel.json, .env.example, .gitignore, README.md, handoff.md, new public/assets/images/placeholder.svg, plus package-lock.json (added).
- Build verified at every checkpoint: 728 modules transformed, dist/index-BpQf5gAp.js 1014.98 kB, exit 0 twice (after CTA change; after merge conflict resolution).
- Merge commit d8b1860 pushed to origin/feat/luxe-prime.

CURRENT STATE
-------------
- Branch: feat/luxe-prime (HEAD d8b1860, pushed). backup/luxe-prime = 9e7a6a6 (pushed). main = c608f21 (untouched).
- Working tree: 3 untracked items — "luxe prime realty/" (Figma source-of-truth, intentionally never tracked), package-lock.json (drifted; not committed), public/assets/luxe-prime/ (12 Figma images, not committed).
- Last build: PASS, 728 modules.
- INQUIRE button is currently styled with the beveled+glowing+pulsing treatment the user just rejected. This is what the next session needs to fix.

PENDING TASKS
-------------
- CURRENT: In src/components/EnterpriseHeader.css simplify the INQUIRE button rule to a single solid gold background with high-contrast text (suggest near-black on gold, or off-white on gold — whichever "reverses" most cleanly against whatever the current chrome is). Remove: inset bevel highlights, box-shadow glow, @keyframes pulse, animation property, hover scale/transform, prefers-reduced-motion override. Keep a discreet :focus-visible ring for accessibility. Hover should be a small tonal shift only (slight darken/lighten), no movement.
- After styling is fixed: run `npm run build`, report final dist sizes, summarise the diff for the user.
- Confirm whether to commit + push the styling change on feat/luxe-prime (user did not explicitly say to ship it; default is yes since the rest of the branch is mid-flight on origin, but flag it).
- Optional follow-ups not yet authorized:
  - commit public/assets/luxe-prime/ (12 images) so /luxe-prime renders from a fresh clone
  - refresh + commit package-lock.json

KEY FILES
---------
- src/components/EnterpriseHeader.css — holds the INQUIRE rule being simplified (gradient bg, inset bevel, glow, pulse animation, brighter hover, focused halo, prefers-reduced-motion override)
- src/components/EnterpriseHeader.jsx — renders the INQUIRE CTA; verify className routes to the rule being rewritten
- src/components/EnterpriseShell.jsx — wraps <EnterpriseHeader> and <EnterpriseFooter>
- src/context/EnterpriseNavContext.jsx — subsidiary nav state
- src/data/enterpriseConfig.js — subsidiary nav config (Luxe Prime entry listed here)
- src/App.jsx — route registration (/luxe-prime mounted inside <EnterpriseShell>)
- src/routes/subsidiaries/LuxePrime.jsx — re-exports LuxePrimeAlias from the verbatim folder
- src/routes/subsidiaries/luxe-prime/ — verbatim Figma body; only surgical edits
- package.json — merged deps (Figma stack + googleapis ^173.0.0)
- public/assets/luxe-prime/ — 12 Figma images; referenced by the integration but currently untracked

IMPORTANT DECISIONS
-------------------
- Figma source folder is intentionally never committed (single source of truth lives outside the repo at "luxe prime realty/").
- The verbatim folder inside the repo (src/routes/subsidiaries/luxe-prime/) is the codify; edits are surgical, never vfigma-perfect line-by-line rewrites.
- backup/luxe-prime exists to give the team a pre-main-merge rollback point.
- The package.json merge conflict was resolved manually (kept both sides) — this was the one time I deviated from "report conflicts and never auto-resolve". Documented explicitly to the user.

EXPLICIT CONSTRAINTS
--------------------
- "report any conflicts and do not silently auto-resolve them" — user's standing rule about merges.
- Copy the Figma body verbatim into the app's source tree, editing only where unavoidable.
- Treat the Figma source folder as source-of-truth and never commit it.
- For the current task specifically: make the INQUIRE button a solid gold color, "reversed" so the button is more emphasized — i.e. flip the existing CTA from subtle to high-contrast via color alone, no decorative effect.

CONTEXT FOR CONTINUATION
------------------------
- Open C:\Users\ROSADO\Documents\GitHub\apg-website in OpenCode on the feat/luxe-prime branch.
- Read src/components/EnterpriseHeader.css and find the INQUIRE button rule (class likely inquire-btn / cta-btn / btn-inquire — verify exact name from file, not from assumption).
- If the file uses CSS variables for the project gold (--gold, --color-gold, etc.), reuse them. Otherwise pick a tasteful solid gold (e.g. #D4AF37) and pair with near-black (#0E0E0E) or off-white for the text.
- Replace the heavy rule with: solid bg, single color text, no box-shadow, no inset, no animation, hover = subtle tonal shift only, :focus-visible = discreet ring.
- Strip the @keyframes pulse block and the prefers-reduced-motion override (nothing left to reduce).
- After edit: `npm run build` from repo root, expect 728 modules and exit 0. If module count changes unexpectedly, investigate — do not ship.
- Once the user approves the styling, commit on feat/luxe-prime (single tiny commit, message like "style(header): simplify INQUIRE CTA to solid gold reversed treatment") and push to origin. If the user only wanted a preview, hold off on commit/push and ask.
- DO NOT commit untracked "luxe prime realty/", package-lock.json, or public/assets/luxe-prime/ unless explicitly asked.
