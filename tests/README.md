# Regression tests

One command runs everything before a deploy:

```bash
npm test                   # unit -> API -> browser; prints a PASS/FAIL summary per suite
npm run test:unit          # pure modules (node:test), ~1 s
npm run test:api           # every public + admin endpoint (node:test + fetch), ~30 s
npm run test:e2e           # Playwright in local Chrome: smoke, flows, admin, visual
npm run test:update-snapshots   # re-record the visual baselines
```

Extra arguments pass through, e.g. `npm run test:api -- --test-name-pattern=inquir`,
`npm run test:e2e -- flows --project=desktop`, `npx playwright show-report test-results/e2e-report`.

## What you need

| Requirement | Notes |
|---|---|
| Node 22.18+ | runs the TypeScript sources directly (built-in type stripping) |
| PHP 8.2+ on `PATH` (or `PHP_BINARY`) | with `pdo_mysql`; the suites start their own `php -S` servers |
| MySQL reachable with the `DB_*` values in `.env` | the user must be allowed to `CREATE`/`DROP DATABASE apg_test` |
| `.env.local` with `LOCAL_QA_ADMIN_EMAIL` / `LOCAL_QA_ADMIN_PASSWORD` | becomes the superadmin of the test database (never printed) |
| Google Chrome installed | Playwright uses `channel: 'chrome'`; install deps with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install` |
| `api/data/listings.generated.json` | the Drive feed (local QA fixture refs `APR-A0A000..09`); listing tests skip without it |
| `MAIL_SINK_DIR` (optional) | folder for captured emails; mail assertions are skipped when unset |

Nothing else needs to be running: the developer servers (`:5173`, `:8000`) and the `apg_website`
database are never touched.

## How isolation works

`tests/support/stack.mjs` boots a private stack for `test:api` and `test:e2e` and tears it down after:

1. **Fresh database** `apg_test`: dropped and recreated, `api/schema.sql` applied, then `api/migrate.php`
   (exactly the fresh-install path; its output is kept in `test-results/migrate.log` and asserted by
   `tests/api/fresh-install.test.mjs`), then the seeded accounts: the QA superadmin from `.env.local`
   plus `qa-admin@`, `qa-editor@`, `qa-recruiter@apg.test` with a random password generated per run.
   `tests/support/reset-db.php` refuses any database name not ending in `_test`.
2. **PHP servers** on that database, each with its own temp dir (sessions, rate-limit buckets, uploads):
   - `:8001` with `APG_TEST_MODE=1`: `rateLimit()` lifts every cap so suites can submit many forms
     from 127.0.0.1. The flag is honoured only by PHP's built-in server (`PHP_SAPI === 'cli-server'`),
     never by Apache/LiteSpeed in production, and is off by default.
   - `:8002` with production limits: `tests/api/rate-limits.test.mjs` proves the caps still work.
   - Mail goes to the stack's SMTP sink on `:2526` (writing `.eml` files to `MAIL_SINK_DIR`), or, without
     a sink, to a closed port, so a test run can never send real email. Gemini and Turnstile are off.
3. **Browser targets** (e2e only): a production build (`vite build --mode test`, so the live Turnstile
   site key in `.env.production` stays out) served by `vite preview` on `:5180`, plus a Vite dev server on
   `:5181` for the dev-only checks (`dev-server.spec.mjs`: unbundled modules and the `/api` proxy rules
   that once blanked every page). Both proxy `/api` to `:8001` using the rules from `vite.config.js`.

Tests create their own uniquely named rows (`uid()`), delete them afterwards, and never depend on
another test's data or on run order. Global edits made by the admin specs (Contact page title, Gold plan
price, one listing's visibility, the announcement banner) are restored in `finally` blocks.
Ports are configurable: `APG_TEST_PHP_PORT`, `APG_TEST_PHP_STRICT_PORT`, `APG_TEST_VITE_PORT`,
`APG_TEST_VITE_DEV_PORT`, `APG_TEST_SMTP_PORT`, `APG_TEST_DB`.

## Layout

```
tests/
  unit/        node:test, pure modules (resumeFile, enterpriseHost, content registry, listings parser,
               permissions parity with api/config.php) + src/routes/admin/__tests__/site-alignment.test.mjs
  api/         node:test + fetch against :8001/:8002 (public reads, forms, auth, RBAC matrix, every admin endpoint)
  e2e/         Playwright: smoke (every route x 1280/390 + overflow at 360/768/1280), dev-server,
               flows (apply, inquiries, listings, VO plan, blogs, nav history, chat, cookies, stale chunk),
               admin (pages per role, editing round trips, CSV, announcement, session expiry), visual
  support/     stack, env, HTTP/mail helpers, unit module loader, PHP DB reset, SMTP sink
```

## Adding tests

- **Unit**: `tests/unit/<name>.test.mjs`, import the module from `src/` directly (`.ts` works;
  `tests/support/unit-loader.mjs` resolves Vite-style extensionless and `@/` imports).
- **API**: `tests/api/<area>.test.mjs`. Use `as('editor')` (signed-in client), `new Client()` (anonymous),
  `formStartedAt()` for public forms, `uid()` for names, and delete what you create in `after()`.
  RBAC expectations come from `adminCapabilities()` in `api/config.php` (`php-capabilities.mjs`);
  a new capability needs a probe in `tests/api/admin-rbac.test.mjs`.
- **Browser**: `tests/e2e/<name>.spec.mjs`. Prefer roles/labels/text locators; if a control has no
  accessible name, add a minimal `aria-label` in the component rather than a CSS selector. New public
  routes go in `tests/e2e/routes.mjs` and are then smoke- and overflow-tested automatically. Public forms
  reject submissions under 3 s old: call `waitForFormTimer(openedAt)` before submitting.

## Visual baselines

`tests/e2e/__screenshots__/home-<site>-<desktop|mobile>.png` hold the first screen of each site's home
at 1280 and 390 px, with animations frozen, `video/iframe/canvas` hidden, live text (`[role=status]`,
`<time>`) masked and the announcement banner hidden. After an intended design change:

```bash
npm run test:update-snapshots          # all baselines
npx playwright test visual -g realty --update-snapshots   # one site
```

Review the new PNGs (and the diff images in `test-results/e2e` on a failure) before committing them.
Baselines are rendered by local Chrome on Windows; a different OS or Chrome version can need re-recording.
