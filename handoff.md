# APG Website â€” Asset Layer Migration Handoff

**Date:** 2026-07-05  
**Agent:** Sisyphus (OhMyOpenCode)  
**Plan:** `plan.md` â€” Supabase-Native Asset Layer for apg-website  
**Project:** Alpha Premier Group â€” Vite 5 + React 18 + Supabase  
**Supabase project ref:** `ldtavdybcgwjgticrymz`

---

## What Was Completed (Verified)

### Phase 1 â€” Schema Migration âœ…
- **File:** `supabase/migrations/011_asset_layer.sql`
- **Status:** Pushed to remote Supabase successfully
- **Contents:**
  - `apg-public` and `apg-private` storage buckets created
  - 4 new tables: `assets`, `property_asset_relations`, `import_batches`, `import_file_mappings`
  - `offerings` extended: `cover_asset_id` (uuid FK to assets), `gallery_count` (int), `import_batch_id` (text)
  - All indexes, RLS policies, and `updated_at` triggers applied
- **Key note:** `offerings.id` is `bigint` (SERIAL from 0001_init.sql) â€” `property_asset_relations.offering_id` is `bigint` (NOT uuid). This was a failure point during migration â€” fixed before final push.

### Phase 2 â€” Storage RLS âœ…
- **File:** `supabase/migrations/012_storage_rls.sql`
- **Status:** Pushed to remote Supabase successfully
- **Contents:**
  - `apg-public`: public read, staff write/update/delete
  - `apg-private`: staff-only read/write/update/delete (no public read)

### Phase 5 â€” Frontend Hooks & Components âœ…
- **`src/hooks/usePropertyGallery.js`** â€” New. Returns `{ relations, hero, gallery, loading, error }` for a given `offeringId` (bigint). Includes `getPublicUrl()`, `getTransformedUrl()`, `usePrivateAsset()`.
- **`src/lib/assetUrls.js`** â€” New. Re-exports `getPublicUrl`, `getTransformedUrl`.
- **`src/components/PropertyImage.jsx`** â€” New. `<PropertyImage asset={...} transform={{width:800}} />` with onError fallback chain.

### Phase 6 â€” Dual-Read Frontend âœ…
- **`src/routes/Properties.jsx`** â€” Modified. Extracted `PropertyCard` sub-component. Calls `usePropertyGallery(p.id)` for hero image; falls back to `p.images[0]` (legacy JSONB). Dev warning logged when fallback is used. Modal and lightbox also use new hook.
- **`src/routes/VirtualOffice.jsx`** â€” Modified. Extracted `VirtualOfficeCard` sub-component. Same dual-read pattern.
- **Build verified:** `pnpm build` passes (718 modules, exit 0).

### Phase 7 â€” Deprecation Checklist âœ…
- **File:** `supabase/migrations/013_deprecate_old_columns.sql`
- **Status:** Written but NOT pushed (destructive ops intentionally left commented out per plan)
- **Contents:** Records `asset_layer_migration_completed_at` in `site_settings`. All DROP COLUMN / DROP BUCKET ops are commented out with a verification checklist. Manual step after 1 sprint of observation.

### Phase 8 â€” Admin Assets Page âœ…
- **File:** `src/routes/admin/Assets.jsx` â€” New page
- **Registered in:** `src/routes/admin/AdminShell.jsx` (import + route added)
- **Features:** Asset table with filters (type, status), archive/delete actions, replace-image flow (upload â†’ new asset UUID â†’ update property_asset_relations â†’ archive old), linked offering display
- **Build verified:** `pnpm build` passes after route registration.

### Phase 10 â€” Health Check Script âœ…
- **File:** `scripts/asset-health-check.js`
- **Status:** Written, syntax-checked, NOT yet run against live DB
- **Checks:** orphaned relations (error/pending_review assets), unmatched import_file_mappings, broken cover_asset_id refs, storage object existence spot-check (10 random public assets)

### Phase 3 - Ingest Pipeline Script ✅
- **Primary:** `scripts/sync-drive-listings.cjs` (Google Drive API - canonical source of truth)
- **Fallback (deprecated):** `scripts/ingest-apg-listings.cjs` (local filesystem ingest, kept for compatibility)
- **Status:** Drive sync script is syntax-verified. Requires Google service-account creds + Drive folder share.
### Phase 4 â€” Edge Functions âœ…
- **Files:** `api/assets/signed-url.js`, `api/assets/public-meta.js`
- **Status:** Written, syntax-checked, NOT yet deployed or tested live

---

## BLOCKER â€” Ingest Script Cannot Run

**Root cause:** The ingest script (`scripts/ingest-apg-listings.cjs`) requires `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables. These are set in the user's local shell session but are **not** inherited by agent-spawned shells.

**Attempts made:**
1. Inline `$env:VAR=value` in `ctx_shell` â†’ key returned `Invalid API key` from Supabase
2. User confirmed env is set in their own terminal â†’ agent shells don't inherit it
3. User pasted two `sbp_` keys â†’ both rejected as invalid for project `ldtavdybcgwjgticrymz`

**What the next agent needs to do to unblock:**
1. Ask the user to run the dry-run themselves in their terminal (where env is set):
   ```powershell
   node scripts/ingest-apg-listings.cjs --source-root "C:\Users\Deign\Downloads\APG Prototype System for Automated Posting\APR LISTING" --batch-id "batch-initial-2026-07-04" --dry-run
   ```
2. If dry-run succeeds, immediately run the live version:
   ```powershell
   node scripts/ingest-apg-listings.cjs --source-root "C:\Users\Deign\Downloads\APG Prototype System for Automated Posting\APR LISTING" --batch-id "batch-initial-2026-07-04"
   ```
3. Verify: check `assets`, `property_asset_relations`, `import_file_mappings` row counts in Supabase dashboard
4. If the user cannot provide env vars, ask for the **exact** `service_role` key from Supabase Dashboard â†’ Settings â†’ API (the secret key, not the anon key)

---

## Remaining Work After Ingest

### Immediate (after successful ingest)
1. **Verify frontend dual-read works:** Start dev server (`pnpm dev:all`), browse `/properties` and `/virtual-office`, confirm images load from `property_asset_relations`. Check browser console for `[DualRead]` warnings â€” every warning means an unmatched offering.
2. **Manual matching:** Any `import_file_mappings` rows with `status = 'skipped_no_match'` need admin review in the `/admin/assets` page (or directly in Supabase table editor) to assign them to the correct `offering_id`.
3. **Re-run ingest for unmatched:** After manual assignment, re-run with a new `--batch-id` to pick up skipped files.

### Phase 9 â€” Posting Desk Decoupling (separate repo)
- Update the Posting Desk to call `/api/assets/public/:id` (or use Supabase CDN URLs directly) instead of reading the Windows `APR LISTING` folder.
- This is explicitly deferred â€” separate repo, not apg-website.

### Phase 7 Finalization (after 1 sprint of stable dual-read)
1. Confirm zero `[DualRead]` warnings in production console
2. Push migration `013`: uncomment the `ALTER TABLE offerings DROP COLUMN images` and run via `supabase db push --include-all`
3. Search codebase for remaining `p.images` references and remove them
4. Empty and delete old `listing-images` bucket from Supabase dashboard

### Phase 10 â€” Health Check Integration
1. Run `node scripts/asset-health-check.js` manually to verify it works
2. Wire results into `/admin/assets` page as a red-flag count (future enhancement)
3. Optionally set up as a nightly cron

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `plan.md` | Authoritative plan document |
| `supabase/migrations/011_asset_layer.sql` | Schema: 4 tables + offerings extensions |
| `scripts/asset-health-check.js` | Nightly verification |
| `scripts/sync-drive-listings.cjs` | **Google Drive → Supabase import (primary, canonical source)** |
| `scripts/ingest-apg-listings.cjs` | Legacy local-filesystem ingest (deprecated — use sync-drive instead) |
| `scripts/asset-health-check.js` | Nightly verification |
| `api/assets/signed-url.js` | Edge function: private file signed URLs |
| `api/assets/public-meta.js` | Edge function: public asset metadata |
| `src/hooks/usePropertyGallery.js` | Frontend hook for gallery data |
| `src/lib/assetUrls.js` | URL helper re-exports |
| `src/components/PropertyImage.jsx` | Image component with fallback chain |
| `src/routes/Properties.jsx` | Modified: dual-read with hook |
| `src/routes/VirtualOffice.jsx` | Modified: dual-read with hook |
| `src/routes/admin/Assets.jsx` | Admin asset management page |
| `src/routes/admin/AdminShell.jsx` | Route registration (Assets route added) |

---

## Known Gotchas

1. **`offerings.id` is `bigint`, not UUID.** The plan doc shows uuid examples but the actual DB uses SERIAL. All FK queries and hook parameters must use `Number` type.
2. **`package.json` has `"type": "module"`** â€” any new `.js` script must be `.cjs` or use ESM `import` syntax.
3. **React hooks cannot be called inside `.map()`** â€” card components must be extracted to named sub-components (done in Properties.jsx and VirtualOffice.jsx).
4. **Supabase `db push` needs `--include-all`** if local migrations outnumber remote (0001_init.sql is local-only).
5. **Storage list() for health check** â€” `supabase.storage.from('apg-public').list('')` returns all objects; the script uses `search` param to filter by filename.

---

## Next Agent - Your First Action

The canonical property-listing source is now the Google Drive folder. To sync from Drive:

> **Prerequisite:** This requires a Google service account with read access to the APR LISTING Drive folder.
> See `README.md` - Property Listings -- Source of Truth for setup steps.

```powershell
# 1. Confirm Google service-account credentials are set in .env.local
# 2. Run dry-run against the Drive folder
pnpm sync-drive --batch-id "batch-initial-2026-07" --dry-run

# 3. If dry-run looks correct, run live
pnpm sync-drive --batch-id "batch-initial-2026-07"
```

Then verify row counts, fix any unmatched offerings with manual reassignment, and proceed with Phase 7 cutover when stable.
