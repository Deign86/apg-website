# Alpha Premier Group (APG) Website — Manual Testing Guide

> **Stack:** Vite 7 + React 18 + Tailwind CSS v4 + React Router 7 + Native PHP 8+ REST API + MySQL + Hostinger

This document provides an end-to-end verification and testing guide covering the public SPA pages, subsidiary sub-applications, REST API endpoints, Admin portal, email dispatch, and deployment sanity checks.

---

## 1. Environment & Local Setup

### 1.1 Local Prerequisites Check
- [ ] Node.js `>= 18.x` installed (`node -v`)
- [ ] PHP `>= 8.1` installed (`php -v`) with `pdo_mysql`, `openssl`, `mbstring`
- [ ] MySQL server running locally (`3306`)

### 1.2 Environment File
- [ ] `.env` or `.env.local` created from `.env.example`
- [ ] `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` set properly
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` set for email verification

### 1.3 Database Initialization
- [ ] Run `php api/setup.php` in CLI
- [ ] Confirm output indicates `Schema applied successfully!` and admin user initialized.

### 1.4 Development Servers
- [ ] Run `npm run dev` (Vite dev server runs at `http://localhost:5173`)
- [ ] In another terminal, run `php -S localhost:8000 -t .` for local PHP API testing.

---

## 2. Public Pages & Subsidiary Showcases

### 2.1 Core Navigation & Pages
- [ ] **Home Page (`/`):** Hero section, Enterprise subsidiaries grid, Unique Homes property type cards (`Condominium`, `Commercial Space`, `Office Space`, `Warehouse`), Mission/Vision, and Core values render without visual defects.
- [ ] **Properties Page (`/properties`):**
  - [ ] Clicking any property type card on Home navigates to `/properties?type=<category>` with active filter pill applied.
  - [ ] Search input filters listings dynamically by property title, location, or features.
  - [ ] Property cards display 3D hover effects, status badge (`FOR SALE`, `FOR LEASE`), pricing, location, and sqm specs.
  - [ ] Clicking **"VIEW DETAILS"** opens the modal dialog with interactive multi-photo carousel, specs table, and description.
  - [ ] Clicking the modal image expands the full-screen photo lightbox viewer with next/prev controls.
  - [ ] Clicking **"INQUIRE NOW"** opens the inquiry modal pre-tagged with the property title.
- [ ] **Enterprises Page (`/enterprises`):** Grid of 7 subsidiaries rendered with interactive cards and quick links.
- [ ] **Careers Page (`/careers`):** Interactive job cards, job application modal, and resume submission form render smoothly.
- [ ] **Blogs Page (`/blogs`):** Blog post grid with cover images, category pills, and full read modals.

### 2.2 Subsidiary Sub-Applications
Verify all 7 subsidiary landing pages render with their dedicated styling and scoped assets:
- [ ] `/subsidiaries/realty` — Alpha Premier Realty
- [ ] `/subsidiaries/construction` — Alpha Premier Construction
- [ ] `/subsidiaries/swiftclear` — Swift Clear
- [ ] `/subsidiaries/dynamic-tree` — Dynamic Tree
- [ ] `/subsidiaries/luxe-prime` — Luxe Prime
- [ ] `/subsidiaries/alta-venture` — Alta Venture
- [ ] `/subsidiaries/88prime` — 88 Prime

### 2.3 Legacy Archive
- [ ] Navigate to `/legacy` or `/legacy/index.html` — confirm preserved legacy site renders cleanly.

---

## 3. Inquiry & Email Dispatch Testing

### 3.1 Public Inquiry Submission (`api/inquire.php`)
- [ ] Open Contact / Inquire form on the website.
- [ ] Submit valid inquiry with name, email, contact number, subsidiary selection, and message.
- [ ] Verify HTTP 200 response with `{ "success": true, "message": "Inquiry submitted successfully", "id": <number> }`.
- [ ] Check MySQL database `inquiries` table: verify new row is inserted.
- [ ] If SMTP credentials configured, verify notification email received at destination address.

### 3.2 Inquiry Validation & Error Handling
- [ ] Submit form with missing name or email → Verify HTTP 400 with validation error message.
- [ ] Submit form with invalid email format → Verify HTTP 400.

---

## 4. Admin Portal (`/admin`)

### 4.1 Admin Authentication (`api/admin/auth.php`)
- [ ] Navigate to `/admin` while unauthenticated → Verify redirection to login screen.
- [ ] Attempt login with incorrect credentials → Verify error message.
- [ ] Sign in with default credentials (`admin@alphapremiergroup.com` / `AlphaPremier2026!`).
- [ ] Verify successful authentication, session establishment, and redirection to admin dashboard.

### 4.2 Admin Modules & Management
- [ ] **Dashboard (`/admin`):** KPI summary cards (Total Openings, Applicants, New Applicants counter, Listings, Services, Blogs) render correctly with real-time database counts.
- [ ] **Job Applicants (ATS) (`/admin/applicants` / `api/admin/applicants.php`):**
  - [ ] Enterprise tabs (`All Enterprises`, `Alpha Premier Group`, `Virtual Office`, `Alpha Premier Realty`, `Luxe Prime Realty`, `SwiftClear`, `88 Prime`, `Alta Venture`, `Dynamic Tree`, `Alpha Premier Construction`) accurately filter candidates. Slugs come from the single source of truth in `src/data/enterprises.js`.
  - [ ] Status filter pills (`New`, `Reviewed`, `Interviewing`, `Hired`, `Rejected`) filter the pipeline.
  - [ ] Real-time search by candidate name, email, phone, and role.
  - [ ] Change candidate status using inline select pill and verify update persists upon reload.
  - [ ] Click view icon to open Candidate Detail Modal:
    - [ ] Contact details and submission timestamp display properly.
    - [ ] Cover note and candidate message render clearly.
    - [ ] Click **"Open Resume"** and verify secure streaming download (`/api/admin/applicants.php?action=resume&id=<id>`).
    - [ ] Add Recruiter & Interview Notes, click **"Save Recruiter Notes"**, and verify persistence.
  - [ ] Click delete button on applicant, confirm in dialog, and verify row and local resume file are deleted.
- [ ] **Property Listings (`/admin/listings` / `api/admin/listings.php`):**
  - [ ] Add new listing with title, property type, price, location, specs, and description.
  - [ ] Upload image files or add image URLs, set primary thumbnail, and reorder.
  - [ ] Edit existing listing and verify changes reflect on `/properties`.
  - [ ] Delete listing and confirm attached image records cascade delete.
- [ ] **Careers Management (`api/admin/careers.php`):** Add, update, and activate/deactivate job vacancy postings.
- [ ] **Blogs Management (`api/admin/blogs.php`):** Create, edit, re-assign `enterprise_slug`, toggle publication status, and delete blog posts. See section 8 for the full cross-enterprise verification matrix.
- [ ] **Logout:** Clicking logout terminates session and redirects back to `/admin/login`.

---

## 5. Applicant Tracking System (ATS) Pipeline Verification

### 5.1 Public Application Submission (`api/applicants.php`)
- [ ] **Corporate Portal (`/careers`):**
  - [ ] Click "Apply Now" on any active role or general application.
  - [ ] Fill full name, email, mobile number, career summary, and upload a `.pdf` or `.docx` resume.
  - [ ] Submit form → Confirm submission ticket (e.g., `APG-APP-XXXXXXXX`).
- [ ] **Alpha Premier Realty (`/subsidiaries/realty`):**
  - [ ] Navigate to careers section, apply for a role with resume attachment.
  - [ ] Verify applicant record is tagged with `enterprise_slug: "realty"`.
- [ ] **Alta Venture (`/subsidiaries/alta-venture`):**
  - [ ] Submit application form with resume → verify `enterprise_slug: "alta-venture"`.
- [ ] **Dynamic Tree (`/subsidiaries/dynamic-tree`):**
  - [ ] Submit creative portfolio application with resume → verify `enterprise_slug: "dynamic-tree"`.
- [ ] **88 Prime (`/subsidiaries/88prime`):**
  - [ ] Submit candidate form with resume → verify `enterprise_slug: "88-prime"`.

### 5.2 Resume Vault & Security Verification
- [ ] Attempt direct browser navigation to `/uploads/resumes/` → verify 403 Forbidden or directory indexing blocked by `.htaccess`.
- [ ] Attempt direct file access to uploaded `.php` or malicious scripts → verify execution is strictly denied.
- [ ] Attempt downloading resume via `GET /api/admin/applicants.php?action=resume&id=1` unauthenticated → verify 401 Unauthorized redirect.
- [ ] Verify authenticated admin can stream and view candidate resumes directly inline.

---

---

## 6. Scripted FAQ Chatbot & Live Broker Handoff Testing

### 6.1 Deterministic FAQ Intent Engine
- [ ] **Corporate Queries:**
  - [ ] Open widget on `/` -> Ask "Who is your CEO?" -> Verify response names President and CEO Mr. Mark Anthony Abito-Santos.
  - [ ] Ask "Where is your office located?" -> Verify address: Unit 3104, Tektite East Tower, Ortigas Center.
  - [ ] Ask "What are your operating hours?" -> Verify Mon-Fri 8:30 AM - 5:30 PM, Sat 9:00 AM - 1:00 PM.
  - [ ] Ask "Virtual office packages" -> Verify Bronze, Silver, Gold, Platinum breakdown with pricing.
- [ ] **Subsidiary-Specific Queries:**
  - [ ] Navigate to `/subsidiaries/luxe-prime` -> Ask "Tell me about co-managed subleasing" -> Verify Luxe Prime subleasing explanation.
  - [ ] Navigate to `/subsidiaries/dynamic-tree` -> Ask "Do you manage models?" -> Verify Dynamic Tree talent roster reply.
  - [ ] Navigate to `/subsidiaries/swiftclear` -> Ask "Aircon cleaning and disinfection" -> Verify SwiftClear medical-grade sanitation reply.
  - [ ] Navigate to `/subsidiaries/construction` -> Ask "Architectural fit-out services" -> Verify Construction fit-out reply.

### 6.2 Live Human Agent Handoff Triggers
- [ ] **Trigger 1 (Explicit Button):** Click "Talk to Live Agent" button in the chip bar -> Verify widget transitions to `waiting_for_agent` status with "Connecting you to a live broker..." banner.
- [ ] **Trigger 2 (Keyword Match):** Type "I need to talk to a broker/representative" -> Verify immediate transition to `waiting_for_agent`.
- [ ] **Trigger 3 (High-Stakes / Transactional):** Type "Can I negotiate a 20% discount on the penthouse?" or "Book a viewing schedule for unit 12" -> Recognized as transactional inquiry requiring human broker -> transitions directly to `waiting_for_agent`.
- [ ] **Trigger 4 (Two Consecutive Misses):**
  - [ ] Type 1st unrecognized query -> Verify bot says "I didn't quite catch that..." and suggests categories.
  - [ ] Type 2nd unrecognized query -> Verify bot automatically flips status to `waiting_for_agent` and routes to live queue.
- [ ] **Email Notification Dispatch:** Verify SMTP email sent to `contact@alphapremiergroup.com` with subject `[APG Live Chat Handoff] Visitor Request — <Enterprise>`, conversation transcript excerpt, and direct admin session link.

### 6.3 Admin Live Chat Queue & Two-Way Messaging
- [ ] **Queue Visibility & Badge:**
  - [ ] When a visitor is in `waiting_for_agent`, verify Sidebar shows red badge count on "Live Chat" item.
  - [ ] On `/admin` Dashboard, verify "Live Chat & Triage" card displays waiting count.
- [ ] **Claiming a Session:**
  - [ ] Navigate to `/admin/live-chat` -> Click waiting session from queue -> Click **"Claim Session"**.
  - [ ] Verify session status transitions to `agent_active` and admin's name is assigned.
- [ ] **Two-Way Polling Exchange:**
  - [ ] Admin types reply (e.g. "Hello! This is Mark from Alpha Brokerage. How can I assist you with this unit?") and clicks Send.
  - [ ] On the visitor side, within ~3.5 seconds via interval polling, verify the message arrives and displays with distinctive **"Live Broker"** badge and bubble styling.
  - [ ] Visitor types response -> Admin view receives it via short-polling within ~3.5 seconds without manual refresh.
- [ ] **Resolving & Closing Session:**
  - [ ] Admin clicks "Close Chat" and confirms in dialog.
  - [ ] On visitor side, verify widget transitions to `closed` state with resolution notice, hotline contact details, and a "Start New Inquiry" button.
  - [ ] Clicking "Start New Inquiry" resets session token and restarts back in fresh `bot` state.

---

## 7. Automated Build & Quality Verification

Execute the following commands:
- [ ] `npx tsc --noEmit` — passes with **0 errors**.
- [ ] `npm run build` — completes successfully with production artifacts in `dist/`.
- [ ] `npm run lint` — completes with no blocking errors.
- [ ] `php -l api/config.php` — syntax check passes.
- [ ] `php -l api/db.php` — syntax check passes.
- [ ] `php -l api/inquire.php` — syntax check passes.
- [ ] `php -l api/setup.php` — syntax check passes.
- [ ] `php -l api/chat/start.php` — syntax check passes.
- [ ] `php -l api/chat/message.php` — syntax check passes.
- [ ] `php -l api/chat/poll.php` — syntax check passes.
- [ ] `php -l api/admin/chat.php` — syntax check passes.

---

## 8. Cross-Enterprise Blog Verification

Articles are stored once in `blog_posts` and scoped by `enterprise_slug`. The canonical slug list lives in `src/data/enterprises.js` and mirrors the `/subsidiaries/<slug>` URL segments; the PHP mirror is `enterpriseSlugs()` in `api/config.php`. Keep both in sync.

**Prerequisites**
- [ ] `php api/setup.php` has been run (applies the schema migrations and creates the admin account).
- [ ] `php api/migrate.php` has been run (adds the enterprise columns, normalises legacy slugs, and backfills blogs, careers, and services).
- [ ] Logged into `/admin` as an admin.

### 8.1 Enterprise Scoping
- [ ] `/admin/blogs` shows one tab per enterprise plus **All Enterprises**, each with a live article count.
- [ ] Clicking the **Luxe Prime Realty** tab lists only `enterprise_slug = luxe-prime` articles.
- [ ] Visit `/subsidiaries/luxe-prime`, open the Blogs page, and confirm only Luxe Prime articles appear (no corporate articles mixed in).
- [ ] The **All Enterprises** tab lists every article across every enterprise.

### 8.2 Corporate Fallback
- [ ] Confirm a subsidiary page with its own published articles shows **only** those articles.
- [ ] Set every article for one enterprise to `draft` via the admin status pill.
- [ ] Reload that subsidiary's public Blogs page and confirm it now shows **corporate** articles instead (fallback), not an empty grid.
- [ ] Restore the articles to `published` and confirm the page reverts to its own articles.

### 8.3 Re-assigning an Article's Enterprise
- [ ] In `/admin/blogs`, edit an article and change its **Enterprise** dropdown from one enterprise to another; save.
- [ ] Confirm the article disappears from the original enterprise's public Blogs page.
- [ ] Confirm it appears on the new enterprise's public Blogs page.
- [ ] Confirm it appears exactly once under **All Enterprises**.

### 8.4 Deletion
- [ ] Delete an article from `/admin/blogs` and confirm the dialog.
- [ ] Confirm the row disappears from the admin list.
- [ ] Confirm it disappears from the relevant public Blogs page.

### 8.5 Draft Isolation
- [ ] Create an article with status `draft` for a specific enterprise.
- [ ] Confirm it appears in the admin list for that enterprise.
- [ ] Confirm it does **not** appear on that enterprise's public Blogs page.
- [ ] Publish it and confirm it becomes visible publicly.

### 8.6 Authentication & Validation
- [ ] `GET /api/admin/blogs.php` without a session returns **401**.
- [ ] `POST /api/admin/blogs.php` without a session returns **401**.
- [ ] `DELETE /api/admin/blogs.php?id=1` without a session returns **401**.
- [ ] `POST` with an unknown `enterprise_slug` returns **422**.
- [ ] `GET ?enterprise=<unknown>` returns **422**.
- [ ] `POST` with a duplicate slug returns **409**.
- [ ] `POST` with an empty title or empty content returns **400**.
- [ ] `PATCH` against a non-existent id returns **404**.
- [ ] `PATCH` with an invalid `status` returns **422**.

### 8.7 Article Detail Resolution
- [ ] `GET /api/blogs.php?slug=curating-luxury` resolves to `enterprise_slug = luxe-prime`.
- [ ] `GET /api/blogs.php?slug=why-regular-disinfection-matters-more-than-you-think` resolves to `enterprise_slug = swiftclear`.
- [ ] `GET /api/blogs.php?slug=commercial-real-estate-trends-2026` resolves to `enterprise_slug = corporate`.
- [ ] The public reader at `/blogs` opens articles authored by any enterprise without a 404.

---

## 9. Cross-Enterprise Careers & Services

Careers and services follow the same model as articles: one row per item, scoped by
`enterprise_slug` (careers) or `category` (services), both drawn from the canonical
slug list. Scoping is **fallback-only** — an enterprise with nothing of its own is
served corporate rows instead, so a subsidiary page is never empty.

### 9.1 Careers Management (`/admin/careers`)
- [ ] Enterprise tabs appear above the table with a live count per enterprise.
- [ ] Clicking a tab filters the table; **All Enterprises** shows every opening.
- [ ] The table shows an **Enterprise** column for each row.
- [ ] Creating an opening lets you pick the **Enterprise**, and set **Salary** and **Feature this opening**.
- [ ] Requirements and Responsibilities are separate list builders, each add/remove capable.
- [ ] Editing an opening and changing its Enterprise moves it between tabs and public pages.
- [ ] Deleting an opening removes it from the admin list and the public careers page.

### 9.2 Services Management (`/admin/services`)
- [ ] The category filter lists all nine enterprises plus **All Services** (no stale `altaventure` entry).
- [ ] The Category dropdown in the form lists the canonical enterprises only.
- [ ] Creating a service lets you set **Summary**, **Tag**, **Feature Bullets** (one per line), and **Gallery Image URLs** (one per line).
- [ ] Editing a service round-trips features and photos without loss.
- [ ] Deleting a service removes it from the admin list and the public services page.

### 9.3 Public Scoping
- [ ] `/subsidiaries/luxe-prime` careers page shows only Luxe Prime openings.
- [ ] `/subsidiaries/swiftclear` careers and services pages show only SwiftClear content.
- [ ] `/subsidiaries/alta-venture` services page shows the six services with their icon and tag styling intact.
- [ ] `/subsidiaries/dynamic-tree` services page and home page show the same six services.
- [ ] A subsidiary with no careers of its own (e.g. virtual-office) falls back to corporate openings rather than showing an empty list.

### 9.4 Careers Application Forms (ATS)
Each of these must POST to `api/applicants.php` and create a `job_applicants` row tagged
with the correct `enterprise_slug`:
- [ ] `/subsidiaries/realty` careers apply modal.
- [ ] `/subsidiaries/luxe-prime` careers application form.
- [ ] `/subsidiaries/swiftclear` careers application form.
- [ ] `/subsidiaries/alta-venture` careers application form.
- [ ] `/subsidiaries/dynamic-tree` careers application form.
- [ ] `/subsidiaries/88prime` application form.
- [ ] `/careers` (corporate) application form.
- [ ] Submitting with an invalid email or a missing resume shows an inline error and does not submit.
- [ ] A submission error (e.g. server down) surfaces a visible message rather than failing silently.

### 9.5 Enterprise Slug Resolution
Free-text enterprise names from public forms must resolve to canonical slugs:
- [ ] `Swift Clear Facility & Cleaning` stores `swiftclear`.
- [ ] `88 Prime Trading` stores `88prime`.
- [ ] `Alpha Premier Group` stores `corporate`.
- [ ] `Luxe Prime Realty` stores `luxe-prime` (not `realty`).
- [ ] `Alta Venture Outsourcing` stores `alta-venture`.
- [ ] Legacy values already in the database (`general`, `swift-clear`, `88-prime`, `apg-main`, `altaventure`) are rewritten by `api/migrate.php`.

### 9.6 Roles (RBAC)
- [ ] Logging in returns the real `admins.role` value, not a hardcoded `admin`.
- [ ] The role badge in the admin top bar shows that same value.
- [ ] Changing a user's role in the database and re-logging in shows the new role.

> Note: no endpoint currently restricts actions by role. Any authenticated admin can
> manage any enterprise's content. `requireAdminRole()` in `api/config.php` is the
> helper to call if that policy changes.

### 9.7 Endpoint Status Codes
- [ ] `GET /api/admin/careers.php` without a session returns **401**.
- [ ] `GET /api/admin/services.php` without a session returns **401**.
- [ ] `POST /api/admin/careers.php` with an unknown `enterprise_slug` returns **422**.
- [ ] `POST /api/admin/services.php` with an unknown `category` returns **422**.
- [ ] `GET /api/admin/careers.php?enterprise=<unknown>` returns **422**.
- [ ] `DELETE /api/admin/careers.php?id=<missing>` returns **404**.
- [ ] `PUT /api/admin/services.php` with a missing id returns **404**.


