# APG Property Listing Management Implementation Plan

> **For agentic workers:** Implement task-by-task with tests before behavior changes. Preserve unrelated dirty-worktree changes and never commit credentials.

**Goal:** Make Supabase and APG Admin authoritative for listings and media, with Google Drive limited to explicit preview/import operations.

**Architecture:** Public pages read published data directly from Supabase and refresh through Realtime. All listing, lifecycle, import, and media mutations pass through authenticated Node/Vercel admin APIs. Draft media remains private until publication.

**Tech Stack:** Vite 5, React 18, Node ESM, Supabase PostgreSQL/Auth/Storage/Realtime, Vercel Functions, Google Drive API, Node test runner, `tus-js-client` for files above 6 MB.

## Schema And Security

- Expand the pending additive migration `supabase/migrations/0026_offerings_drive_metadata.sql`; remove its live-sync queue/watch design before it is applied.
- Keep legacy `offerings.status` as the availability/marketing label. Add `listing_status` constrained to `draft`, `for_review`, `published`, `unavailable`, or `archived`.
- Backfill lifecycle status from `deleted_at`, `archived_at`, and `is_published`. Keep `is_published` as a compatibility flag synchronized by server lifecycle actions.
- Add missing provenance/timestamps: `drive_doc_id`, `imported_at`, `imported_by`, `published_at`, `archived_at`, `bedrooms`, `bathrooms`, and `parking_slots`; retain `beds`, `baths`, `garage`, and `price_unit` for compatibility.
- Use existing `transaction_type_id` and seed `rent` if missing. Treat `price_unit` as the compatible currency field, defaulting new records to `PHP`.
- Ensure the non-null `drive_folder_id` partial unique index exists.
- Extend `assets` with `source_type`, Drive file/folder IDs, checksums, and provenance. Extend `import_batches` and `import_file_mappings` with folder, Doc, offering, importer, and Drive-file identifiers while retaining existing `stats` and error columns.
- Tighten RLS: public reads require `listing_status='published'`, `is_published=true`, and no archive/delete timestamp; editor/staff writes are limited to drafts and review records; admin/owner can perform lifecycle operations.
- Allow staff to read import provenance but only admin/owner or server-side service operations to create imports.
- Update Storage policies and bucket MIME limits for JPEG, PNG, WebP, and PDF. Draft assets use `apg-private`; only media belonging to published listings is promoted to `apg-public`.
- Preserve `offering_drive_sync` and `drive_asset_sync` as historical compatibility tables, but stop all runtime writes that treat Drive as authoritative.

## Import And Admin APIs

- Refactor `server/drive/client.js`, `metadata.js`, and `media.js` into reusable, dependency-injectable helpers; replace reconciliation logic with preview, commit, and explicit bulk-import services.
- Validate pasted IDs/URLs and require the target to be an accessible, active direct child of configured root `1GXeGULYswb7jXcMGCCRm2RQ_h0EKsDll`.
- Parse exactly one Google Doc recursively, support the requested aliases/separators/multiline descriptions, return structured warnings, and reject multiple Docs.
- Parse Doc `Status` into legacy availability status, not lifecycle status. Imports always begin as `draft`.
- Implement these authenticated routes through the existing admin catch-all and local server router:
  - `POST /api/admin/drive-import/preview`
  - `POST /api/admin/drive-import/commit`
  - `GET /api/admin/drive-import/:batchId`
  - `POST` and `PATCH /api/admin/offerings[/:id]`
  - `POST /api/admin/offerings/:id/{submit-review|publish|unpublish|unavailable|archive|restore}`
  - `POST /api/admin/offerings/:id/assets/upload-intent`
  - `POST /api/admin/offerings/:id/assets/complete`
  - `PATCH /api/admin/offerings/:id/assets/order`
  - `DELETE /api/admin/offerings/:id/assets/:relationId`
- Preview must perform no database or Storage writes and return normalized metadata, validation, field/media diffs, deterministic ordering, cover proposal, and permitted operation.
- Commit must re-fetch Drive data, allowlist overrides, upsert by folder ID, deduplicate by Drive file ID/checksum, retain per-file results, and never publish automatically.
- Default commit mode updates only `draft` or `for_review`. Updating published records requires `mode: "update_published_listing"` and a separate UI confirmation.
- For published re-import failure, retain successful files as staged batch assets, mark `partial_failure`, and leave visible metadata/gallery unchanged until every selected file succeeds.
- Manual listing creation requires a title and produces a draft. Review submission requires title, property type, transaction type, and location. Publishing additionally requires a description, active image, and valid cover.
- Publish promotes private objects before updating database visibility; failed promotion rolls back new public objects. Unpublish, unavailable, and archive demote media and remove public objects before completing the lifecycle transition.
- Record every import, publish, unpublish, unavailable, archive, restore, asset unlink, and hard-delete action in `activity_log`. Hard-delete assets only when no relations remain.
- Do not automatically create `posting_jobs`; published offerings and ordered canonical asset relations remain the posting console’s source records.

## Admin And Public UI

- Split `PropertiesManager.jsx` into focused list, editor, Drive import, lifecycle, and gallery components while retaining existing admin styling and routes.
- Add search and status/type/transaction filters, manual draft creation, editable fields, role-aware lifecycle buttons, confirmation dialogs, and validation feedback.
- Add a Drive import dialog with URL input, preview/diff, file selection, cover selection, warning display, retryable partial failures, and explicit published-update confirmation.
- Show Drive folder/Doc provenance, import date, last batch, and the statement that Drive changes do not update the listing automatically.
- Reserve upload paths server-side. Use signed standard uploads through 6 MB and authenticated TUS uploads above 6 MB, with 10 MB image and 25 MB PDF limits and per-file progress/errors.
- Add gallery cover selection, ordering controls, PDF classification, relation-only removal, asset archive/restore, and admin-only unreferenced deletion.
- Include `staff` in the permitted Properties navigation while keeping publishing, archive, import, and destructive asset controls admin/owner-only.
- Update `useListings.ts` and gallery queries to require canonical published status and active public assets. Retain the existing `/properties` route, loading/empty/error states, Supabase URLs, and cleaned-up Realtime subscriptions.
- Never render Drive URLs or expose server configuration in browser responses.

## Remove Live Drive Sync

- Delete Drive watch/webhook/renewal/queue/reconciliation handlers and `server/drive/watch.js`.
- Remove all Drive cron entries from `vercel.json`.
- Delete the scheduled `.github/workflows/sync-apr-listings.yml` workflow.
- Remove webhook/cron settings from server configuration and `.env.example`.
- Refactor `scripts/sync-drive-listings.cjs` into an explicit intake CLI: dry-run by default, `--commit` required for writes, optional `--folder-id`, no archive-missing behavior, no published overwrite, and an active admin/owner actor ID required for committed bulk imports.
- Add `scripts/verify-drive-import.mjs`; retain `sync:drive:dry` and replace live-sync verification with `verify:drive-import`.

## Tests And Verification

- Add parser tests for valid documents, aliases/casing, both separators, multiline fields, blanks, invalid integers/prices, missing Doc, and multiple Docs.
- Add preview tests for invalid/inaccessible/out-of-root folders, existing imports, deterministic manifest/cover ordering, diffs, and zero writes.
- Add commit tests for draft creation, folder/file idempotency, partial failure, no auto-publish, published overwrite rejection, confirmed staging, cover validation, and audit counts.
- Add route tests for anonymous/editor/admin/owner access, inactive accounts, sanitized errors, and absence of service credentials.
- Add lifecycle/storage tests for validation, promotion rollback, demotion, archive/restore, relation-only removal, and referenced-asset deletion rejection.
- Add public query tests proving drafts, review, unavailable, archived, and deleted records are hidden while published galleries render and Realtime triggers refetch.
- Update `MANUAL_TESTING.md`, `README.md`, `.env.example`, and root `plan.md` with setup, metadata format, manual creation/import/rerun workflows, failure recovery, and the explicit archive/intake-only Drive policy.
- Run `npm install`, `npm test`, `npm run build`, `npm run verify:env`, `npm run verify:supabase`, `npm run verify:drive-import`, and `npm run verify:e2e`; record exact results and any environment-dependent skips.
- Manually verify desktop/mobile listing CRUD, import preview/commit, direct uploads, gallery ordering, lifecycle visibility, published re-import failure, and Realtime refresh.

## Assumptions

- Existing numeric offering IDs and current public `/properties` route remain unchanged.
- The live database currently has 329 offerings and 3,857 assets; migration work must be additive and safe for those records.
- Existing `status` values remain availability labels; lifecycle authority moves to `listing_status`.
- Drive intake accepts only direct property-folder children of the configured root, though media may be nested inside them.
- No Drive webhooks, watch channels, scheduled reconciliation, two-way synchronization, or automatic Facebook posting will remain.
- Applying the migration, configuring the service account, sharing the root folder as Viewer, setting server-only credentials, and enabling the required Realtime tables remain deployment steps.
