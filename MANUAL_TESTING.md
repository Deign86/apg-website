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
  - [ ] Enterprise tabs (`All`, `Realty`, `Luxe Prime`, `Construction`, `Swift Clear`, `Dynamic Tree`, `Alta Venture`, `88 Prime`, `General`) accurately filter candidates.
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
- [ ] **Blogs Management (`api/admin/blogs.php`):** Create, edit, set `enterprise_slug`, and toggle publication status of blog posts.
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

## 5. Automated Build & Quality Verification

Execute the following commands:
- [ ] `npx tsc --noEmit` — passes with **0 errors**.
- [ ] `npm run build` — completes successfully with production artifacts in `dist/`.
- [ ] `npm run lint` — completes with no blocking errors.
- [ ] `php -l api/config.php` — syntax check passes.
- [ ] `php -l api/db.php` — syntax check passes.
- [ ] `php -l api/inquire.php` — syntax check passes.
- [ ] `php -l api/setup.php` — syntax check passes.

