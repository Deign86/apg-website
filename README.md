## Property Listings — Source of Truth

The canonical source for all property-listing media files (images, PDFs) is the **Google Drive folder**:
- **Folder ID:** `1GXeGULYswb7jXcMGCCRm2RQ_h0EKsDll`
- **Access:** Share this folder with the service account email used for Drive API authentication.

A local copy (`APR LISTING/`) was removed in favor of reading directly from Drive.

### Syncing from Drive to Supabase

```bash
# 1. Set up Google service-account credentials in .env.local (see .env.example)
# 2. Run a dry-run first to see what would be ingested:
pnpm sync-drive --batch-id "batch-$(date +%Y-%m-%d)" --dry-run

# 3. When ready, run live:
pnpm sync-drive --batch-id "batch-$(date +%Y-%m-%d)"

# 4. Optionally limit to one category for testing:
pnpm sync-drive --batch-id "test-office" --category "OFFICE SPACE" --dry-run
```

**Architecture:**
1. The script authenticates to Google Drive via a service account (read-only scope).
2. It recursively lists the Drive folder, downloading only files with allowed types (JPEG, PNG, WebP, PDF).
3. Files are uploaded to the `apr-listing` staging bucket (raw mirror); matched files also go to `apg-public` for public rendering.
4. Each file is matched to an existing `offerings` row by folder-name similarity scoring.
5. Idempotency is maintained via `import_file_mappings.checksum_sha256` — re-runs skip already-ingested files.

### Prerequisites (one-time Google Cloud setup)

1. Create a **Google Cloud project** (or use an existing one).
2. Enable the **Google Drive API**.
3. Create a **service account** and download its JSON key.
4. Share the APR LISTING Drive folder with the service account email (Viewer role minimum).
5. Set credentials in `.env.local` (see `.env.example` for the exact variables).

> **Note:** The deprecated `scripts/ingest-apg-listings.cjs` (local filesystem ingest) is retained as a fallback but is no longer the primary ingestion path.

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

