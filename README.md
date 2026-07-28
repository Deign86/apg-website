## Property Listings - APG Admin Is Authoritative

Supabase is the canonical source for listing records, lifecycle state, and website media. The public website reads only published Supabase offerings and related assets. Google Drive root `1GXeGULYswb7jXcMGCCRm2RQ_h0EKsDll` is a one-time bulk-import source, optional controlled intake source, and archive/reference location.

Drive changes never update the website automatically. All published changes happen through the APG Admin dashboard.

### Controlled Drive import

```bash
# Preview direct child folders without writing anything (default behavior):
npm run sync:drive:dry

# Commit selected folders as drafts; actor must be an active admin/owner profile:
node scripts/sync-drive-listings.cjs --commit --actor-id <admin-profile-uuid>
node scripts/sync-drive-listings.cjs --commit --folder-id <drive-folder-id> --actor-id <admin-profile-uuid>
```

The admin dashboard provides the same preview/commit workflow. Imports are keyed by immutable Drive folder/file IDs, preserve provenance in Supabase, and never publish automatically. Published re-imports require an explicit confirmation and stage changes until all selected files succeed.

### Prerequisites (one-time Google Cloud setup)

1. Create a **Google Cloud project** (or use an existing one).
2. Enable the **Google Drive API**.
3. Create a **service account** and download its JSON key.
4. Share the configured Drive root folder with the service account email as Viewer.
5. Set server-only credentials, `GOOGLE_DRIVE_FOLDER_ID`, and `DRIVE_IMPORT_ACTOR_ID` in `.env.local` (see `.env.example`).

> **Note:** There are no Drive webhooks, watch channels, cron reconciliations, or two-way synchronization jobs in this architecture.

### Metadata Doc format

Use one Google Doc per property folder. Labels are case-insensitive and accept `:` or `-` separators:

```text
Title: The Grove Residences Unit 12A
Status: Available
Property Type: Condominium
Transaction Type: Sale
Price: PHP 8,500,000
Location: Quezon City, Metro Manila
Bedrooms: 2
Bathrooms: 2
Floor Area: 74 sqm
Lot Area:
Description:
Modern two-bedroom condominium.
Includes parking and building amenities.
```

Supported aliases include `Property Name`, `Address`, `BR`, `Bath`, and `Overview`. Blank values remain null, and invalid numeric values are returned as warnings for admin correction. Folders with more than one metadata Doc are rejected.

### Admin lifecycle

Manual listings and Drive imports start as `draft`. Staff/editors can edit drafts and submit them as `for_review`; admins/owners validate required fields and media before `published`. Published listings can be unpublished, marked `unavailable`, archived, or restored by admins/owners. The public site excludes every state except `published`.

Use Admin > Properties to create listings without Drive, correct imported metadata, upload images/PDFs, choose a cover, and reorder the gallery. A rerun of the same folder is keyed by its Drive folder/file IDs and updates only draft/review listings by default. A published listing requires the explicit published re-import confirmation; failed files leave the published record unchanged and are reported in the import batch.

For troubleshooting, first run `npm run verify:env`, `npm run verify:supabase`, and `npm run verify:drive-import`. Confirm the service account can read the configured root and that the root is shared with it as Viewer. Import errors and per-file failures are available from the batch endpoint and the Admin import result; Drive edits alone never publish or replace website data.

---

# Alpha Premier Group

> **Live site:** https://apg-website-alpha-deign86s-projects.vercel.app

Alpha Premier Group of Companies is a diversified Philippine-based business group serving as the parent organization of several companies operating across real estate, business support, construction, and professional services.

## Tech Stack

- **Frontend:** Vite 5, React 18, React Router 6, react-helmet-async
- **Backend:** Supabase (PostgreSQL, Auth, Storage), Node.js API server
- **AI:** NVIDIA NIM (chatbot LLM, lead insights, dashboard analysis)
- **Email:** Resend
- **Styling:** CSS with custom properties, AOS animations, Font Awesome icons
- **Charts:** Recharts (admin dashboard)

## Features

### Public Site
- Home page with enterprise listings, mission/vision, core values
- Properties catalog with search, filters, and detail modal/lightbox
- Virtual Office listings
- Careers page with job openings
- Blogs
- Contact form with email notification
- Subsidiary landing pages: Realty, Construction, Swift Clear, Dynamic Tree, Luxe Prime, Alta Venture, 88 Prime

### Admin Panel (`/admin`)
- Dashboard with KPIs and charts
- Properties CRUD (create, read, update, archive/restore)
- Leads pipeline management
- Blog and Career post managers
- Chatbot knowledge-base trainer
- User management with roles
- Activity log
- Settings

### AI Integration
- Chatbot trained on company knowledge base (NVIDIA NIM)
- Lead insight generation and scoring
- Dashboard trend analysis

## Getting Started

### Prerequisites
- Node.js >= 18
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Deign86/apg-website.git
cd apg-website

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase credentials and other keys in .env.local

# Start development server
pnpm dev:all
```

The Vite dev server runs at `http://localhost:3000` and the API server at `http://localhost:3001`.

### Supabase Setup

```bash
# Link your Supabase project
supabase link --project-ref your-project-ref

# Push schema to your database
supabase db push

# Create admin owner and seed content
pnpm setup-admin
```

### Build

```bash
pnpm build
```

Output goes to the `dist/` directory.

## Project Structure

```
src/
  components/       # Reusable UI components (Header, Footer, Chatbot, etc.)
  context/          # React context providers (Auth)
  hooks/            # Custom hooks (useFirestore, useAdminCrud)
  lib/              # Utility modules (Supabase client, admin API, activity log, insights)
  routes/           # Page components
    admin/          # Admin panel pages
    subsidiaries/   # Subsidiary landing pages
  styles/           # Global CSS
api/                # Vercel serverless functions
server/             # Node.js backend (contact form, admin API)
scripts/            # Utility scripts (setup-admin, migration)
website/            # SQL schema files
```

## Deployment

**Live site:** https://apg-website-alpha-deign86s-projects.vercel.app

The site is deployed on Vercel (project `apg-website-alpha`) with serverless API functions. Pushes to `main` trigger automatic production deployments. SPA rewrites are configured in `vercel.json` for client-side routing.

## Environment Variables

See `.env.example` for all required variables:
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for client-side Supabase access
- `SUPABASE_SERVICE_ROLE_KEY` for server-side admin operations
- `RESEND_API_KEY` for contact form email
- NVIDIA NIM API credentials for AI features

## License

All rights reserved. Alpha Premier Group of Companies OPC.

## Shared Supabase Backend (apg-posting-desk interop)

This site shares **one Supabase project** with `apg-posting-desk` (project ref `ldtavdybcgwjgticrymz`).
This repo owns the canonical asset schema (`offerings`, `assets`, `property_asset_relations`,
`property_asset_versions`, `raw_folder_mappings`, `import_batches`, `import_file_mappings`,
`categories`, `transaction_types`, `activity_log`); the desk owns `posting_jobs`,
`posting_job_assets`, `posted_log`, `daily_report`. Both repos read/write the same canonical
asset rows and the same `apg-public` / `apg-private` buckets — listing images are uploaded once
by the desk's import pipeline and rendered here with no duplication.

See `SHARED_ASSET_ARCHITECTURE.md` (this repo) for the full design, and migrations
`014_shared_canonical_extensions.sql`, `015_unified_roles.sql`, `016_storage_path_convention.sql`.

### Canonical roles (shared with the desk)

`profiles.role` ∈ `owner | admin | editor | staff | viewer` (migration `015`). Desk operators
are `staff` (satisfies `is_staff()` RLS). `is_admin()` = owner/admin; `is_staff()` = owner/admin/editor/staff.

### Storage convention

Listing assets use nested keys: `properties/{offering_id}/images/{asset_id}/original.{ext}` etc.
Migration `016` adds the `v_assets_noncanonical_path` view to find any legacy flat-path assets to migrate.

### Asset guardrails (CI)

```bash
node scripts/check-asset-guardrails.cjs   # no service-role key in client src/bundle; .env.example marked server-only
```

