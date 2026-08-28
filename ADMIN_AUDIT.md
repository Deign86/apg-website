# Alpha Premier Group — Admin & Subsidiary Content Audit (ADMIN_AUDIT.md)

**Audit Date:** August 2026  
**Scope:** Full-repo inspection across database schemas, REST endpoints, admin management portals, and 7 subsidiary microsites.

---

## 1. Executive Summary

Alpha Premier Group (APG) operates a hybrid Single Page Application (Vite + React) backed by a Native PHP 8+ REST API with MySQL persistence. While the administrative portal (`/admin`) provides full CRUD operations for corporate blogs, property listings, services, and job vacancies, there is a critical persistence gap for **Job Applicants**, alongside content fragmentation where subsidiary landing pages duplicate or hardcode news, careers, and services rather than pulling from the unified database.

---

## 2. Content Type Management Matrix

| Content Type | MySQL Table | Admin Screen | Public Endpoint | Admin Endpoint | Status & Current Gaps |
|---|---|---|---|---|---|
| **Property Listings** | `listings`, `listing_images` | `ListingsManager.jsx` | `GET /api/listings.php` | `api/admin/listings.php` | **Fully Managed**: Supports full CRUD, photo galleries, status filtering, and featured flags. |
| **Corporate Services** | `service_items` | `ServicesManager.jsx` | `GET /api/services.php` | `api/admin/services.php` | **Partially Unified**: Virtual office & subsidiary categories exist, but some subsidiary sites retain static service arrays. |
| **Job Openings** | `job_openings` | `CareerManager.jsx` | `GET /api/careers.php` | `api/admin/careers.php` | **Managed**: Corporate vacancies are DB-backed; subsidiary pages contain un-synced static job arrays. |
| **Job Applicants** | *None (Missing)* | *None (Missing)* | *None (Missing)* | *None (Missing)* | 🔴 **CRITICAL GAP**: Applications are only dispatched via SMTP email and never saved to the database. Resumes are temporary. |
| **Blog & News Articles** | `blog_posts` | `BlogManager.jsx` | `GET /api/blogs.php` | `api/admin/blogs.php` | **Partially Unified**: Corporate news is managed; 5 subsidiaries hardcode their own blog arrays. |
| **Content Blocks** | `content_blocks` | `ContentEditor.jsx` | `GET /api/content.php` | `api/admin/content.php` | **Managed**: Page copy & key-value sections can be edited dynamically. |
| **Admin Accounts** | `admins` | `Login.jsx` / Session | *N/A* | `api/admin/auth.php` | **Secure**: Password hashing via `password_verify`, session cookie authentication. |

---

## 3. Detailed Subsidiary Gaps Breakdown

### 3.1 Alpha Premier Realty (`src/routes/subsidiaries/alpha-realty/`)
- **Careers:** [`CareersSection.tsx`](file:///c:/Users/Deign/Downloads/apg-website/src/routes/subsidiaries/alpha-realty/app/components/CareersSection.tsx) loads static `JOB_OPENINGS` from `data.ts`. The apply modal sets local state without submitting to any backend endpoint.
- **Blogs:** [`BlogsSection.tsx`](file:///c:/Users/Deign/Downloads/apg-website/src/routes/subsidiaries/alpha-realty/app/components/BlogsSection.tsx) reads static `BLOG_POSTS` from `data.ts`.
- **Services:** `REALTY_SERVICES` are static in `data.ts` instead of querying `category='realty'` from `service_items`.

### 3.2 Alta Venture Outsource (`src/routes/subsidiaries/alta-venture/`)
- **Careers:** [`Careers.jsx`](file:///c:/Users/Deign/Downloads/apg-website/src/routes/subsidiaries/alta-venture/Careers.jsx) contains hardcoded `JOBS_DATA` (6 positions). Form submission only toggles `formSubmitted = true`.
- **Blogs:** [`Blogs.jsx`](file:///c:/Users/Deign/Downloads/apg-website/src/routes/subsidiaries/alta-venture/Blogs.jsx) has 6 hardcoded articles in `BLOG_POSTS`.
- **Inquire:** Properly wired to `EnterpriseInquire.tsx` / `api/inquire.php`.

### 3.3 Dynamic Tree Multimedia (`src/routes/subsidiaries/dynamic-tree/`)
- **Careers:** [`Careers.tsx`](file:///c:/Users/Deign/Downloads/apg-website/src/routes/subsidiaries/dynamic-tree/app/pages/Careers.tsx) contains hardcoded `OPEN_POSITIONS`. Apply form only toggles React state.
- **Blogs:** [`Blogs.tsx`](file:///c:/Users/Deign/Downloads/apg-website/src/routes/subsidiaries/dynamic-tree/app/pages/Blogs.tsx) renders hardcoded blog data.

### 3.4 Luxe Prime Realty (`src/routes/subsidiaries/luxe-prime/`)
- **Careers:** [`App.tsx`](file:///c:/Users/Deign/Downloads/apg-website/src/routes/subsidiaries/luxe-prime/app/App.tsx) has hardcoded `LUXE_POSITIONS` and a two-column application form that does not call any API.
- **Blogs:** Hardcoded `BLOGS` array inside `App.tsx`.
- **Services:** High-craft carousel, static data in `SERVICES`.

### 3.5 Swift Clear Facility & Cleaning (`src/routes/subsidiaries/swift-clear/`)
- **Blogs:** Hardcoded `blogs` array with 4 in-depth sanitization and pest control guides in `App.tsx`.
- **Services:** Static `services` array (9 items).

### 3.6 Alpha Premier Construction (`src/routes/subsidiaries/Construction.jsx`)
- **Careers:** Uses hardcoded `JOB_LISTINGS` (8 roles) and an embedded general application modal.
- **Blogs:** Hardcoded `BLOG_FEATURED` and `BLOG_POSTS` (6 items).

### 3.7 88 Prime Trading (`src/routes/subsidiaries/Prime88.jsx`)
- **Careers:** Spontaneous application form toggles state without API submission.
- **Blogs:** Hardcoded procurement articles in `BlogsView`.

---

## 4. Remediation Strategy

1. **Implement `job_applicants` Table & Migration**: Store all candidate details, uploaded resume paths, status progression (`new` &rarr; `reviewed` &rarr; `interviewing` &rarr; `hired`/`rejected`), and recruiter notes.
2. **Unified Applicant REST Endpoints**:
   - `POST /api/applicants.php`: Public multipart ingestion with secure resume storage in `uploads/resumes/` and SMTP notification.
   - `GET / PUT / DELETE /api/admin/applicants.php`: Authenticated admin pipeline and gated binary resume streaming.
3. **Build `ApplicantsManager.jsx`**: Administrative UI with enterprise tabs, status badges, notes drawer, and secure resume downloader.
4. **Wire All 8 Apply Interfaces**: Connect every subsidiary application form directly to `api/applicants.php` with `enterprise_slug` tagging.
5. **Subsidiary Blog Scoping**: Add `enterprise_slug` to `blog_posts` table to allow subsidiaries to dynamically fetch news while falling back cleanly to curated defaults.
