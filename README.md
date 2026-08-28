# Alpha Premier Group (APG) — Official Web Portal

The official enterprise web portal for **Alpha Premier Group of Companies OPC**, a diversified Philippine-based business conglomerate operating across real estate, construction, logistics, luxury consulting, corporate incubation, and specialized professional services.

---

## 🏛️ System Overview

The system is built as a high-performance **Single Page Application (SPA)** with a lightweight, secure **Native PHP 8+ REST API** backend and **MySQL** database, hosted on **Hostinger Web Hosting** with Apache `.htaccess` rewrites and an integrated legacy archive.

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 Vite 7 + React 18 SPA                  │
                  │   Tailwind CSS v4 • React Router 7 • Framer Motion     │
                  └──────────────┬─────────────────────────┬───────────────┘
                                 │                         │
                     Public Client / Admin UI          REST API Calls
                                 │                         │
                                 ▼                         ▼
                  ┌────────────────────────────┐ ┌─────────────────────────┐
                  │       Apache Web Server    │ │    Native PHP 8+ API    │
                  │    (.htaccess SPA Rewrite) │ │ (PDO Prepared / REST)   │
                  └──────────────┬─────────────┘ └─────────┬───────────────┘
                                 │                         │
                     ┌───────────┴───────────┐             ▼
                     │                       │   ┌─────────────────────────┐
                     ▼                       ▼   │    MySQL Relational DB  │
             ┌───────────────┐       ┌───────────┤   (Schema & Migrations) │
             │  Dist Assets  │       │  /legacy  │   └─────────────────────────┘
             │  (Production) │       │ (Archive) │             │
             └───────────────┘       └───────────┘             ▼
                                                 ┌─────────────────────────┐
                                                 │   Titan Email / SMTP    │
                                                 │   (Inquiry Dispatch)    │
                                                 └─────────────────────────┘
```

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18 (`react`, `react-dom`)
- **Build Tool & Bundler:** Vite 7 (`@vitejs/plugin-react`)
- **Styling & Design System:** Tailwind CSS v4 (`@tailwindcss/vite`), Custom Gold Waves & Luxury Themes
- **Routing:** React Router 7 (`react-router-dom`)
- **Animations & Effects:** Motion (`motion/react`), AOS (`aos`), Tw-Animate-CSS
- **Icons & Visuals:** Lucide React (`lucide-react`)
- **Charts & Dashboards:** Recharts (`recharts`)
- **Document Generation:** jsPDF (`jspdf`)
- **SEO & Meta:** React Helmet Async (`react-helmet-async`)

### Backend & Infrastructure
- **Runtime:** Native PHP 8.2+
- **Database Access:** PHP Data Objects (PDO) with strict parameterized prepared statements
- **Database:** MySQL 8.0+ / MariaDB
- **Email Dispatcher:** Hostinger / Titan Email SMTP with direct TLS/SSL socket dispatcher (`api/lib/Mailer.php`)
- **Web Server:** Apache with `.htaccess` URL rewrites for SPA routing and API isolation
- **Hosting:** Hostinger Web Hosting (`public_html`)

---

## 🏢 Subsidiary Showcases

The portal provides landing pages and interactive portfolios for all 7 subsidiary enterprises:

| Subsidiary | Route | Description |
|---|---|---|
| **Alpha Premier Realty** | `/subsidiaries/realty` | Real estate brokerage, leasing, property sales, and portfolio management |
| **Alpha Premier Construction** | `/subsidiaries/construction` | General contracting, civil engineering, fit-outs, and renovations |
| **Swift Clear** | `/subsidiaries/swiftclear` | Customs brokerage, freight forwarding, customs clearance, and cargo solutions |
| **Dynamic Tree** | `/subsidiaries/dynamic-tree` | Business incubation, corporate strategy, digital solutions, and creative consultancy |
| **Luxe Prime** | `/subsidiaries/luxe-prime` | High-end luxury properties, concierge services, and exclusive lifestyle investments |
| **Alta Venture** | `/subsidiaries/alta-venture` | Venture building, corporate finance, venture capital, and private equity |
| **88 Prime** | `/subsidiaries/88prime` | Supply chain management, warehousing, distribution, and commercial logistics |

---

## 📁 Repository Structure

```
├── .github/
│   └── workflows/ci.yml       # GitHub Actions CI (Type check, Vite build, PHP lint)
├── api/                       # Native PHP 8+ REST API
│   ├── admin/                 # Admin-only endpoints (auth, blogs, careers, content, services)
│   │   ├── auth.php           # Admin login, logout, and session verification
│   │   ├── blogs.php          # Blog CRUD & publication controls
│   │   ├── careers.php        # Job vacancy CRUD & applicant management
│   │   ├── content.php        # Dynamic site content management
│   │   └── services.php       # Subsidiary service configuration
│   ├── lib/
│   │   └── Mailer.php         # Standalone direct SMTP socket mailer (Titan Email / SSL)
│   ├── blogs.php              # Public blog API
│   ├── careers.php            # Public careers & applications API
│   ├── config.php             # Environment loader and database/SMTP configuration
│   ├── content.php            # Dynamic site settings & copy API
│   ├── db.php                 # PDO database connection factory
│   ├── inquire.php            # Public lead / inquiry submission & email dispatcher
│   ├── schema.sql             # MySQL relational database schema & initial seed
│   ├── services.php           # Public services API
│   └── setup.php              # One-time CLI/web database migration runner
├── public/                    # Static public assets
│   ├── assets/                # Subsidiary media, graphics, and branding assets
│   ├── legacy/                # Preserved legacy website archive accessible at /legacy
│   └── .htaccess              # Apache rewrite rules for production deployment
├── src/                       # React frontend source code
│   ├── components/            # Shared UI components (Navigation, Footer, Lightbox, Modals)
│   ├── routes/                # Route components and subsidiary sub-applications
│   │   ├── admin/             # Secure admin portal
│   │   └── subsidiaries/      # 7 Subsidiary sub-applications
│   ├── views/                 # Top-level public views (Home, Careers, Enterprises, etc.)
│   ├── App.tsx                # Main router & application shell
│   ├── index.css              # Global styles & Tailwind v4 theme directives
│   └── main.tsx               # Application entry point
├── .env.example               # Example environment variable template
├── index.html                 # Vite HTML entry point
├── package.json               # Frontend dependencies and npm scripts
├── tsconfig.json              # TypeScript strict configuration
└── vite.config.ts             # Vite configuration with Tailwind CSS plugin
```

---

## ⚙️ Getting Started & Local Development

### 1. Prerequisites
- **Node.js:** `>= 18.x` (Recommended: `20.x` or `22.x`)
- **PHP:** `>= 8.1` with `pdo`, `pdo_mysql`, `mbstring`, `openssl` extensions enabled
- **MySQL / MariaDB:** Local MySQL server or remote database instance

### 2. Installation

Clone the repository and install Node.js dependencies:

```bash
git clone https://github.com/Deign86/apg-website.git
cd apg-website
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env` or `.env.local`:

```bash
cp .env.example .env
```

Configure your local MySQL and SMTP credentials:

```ini
# Database Connection (MySQL)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=apg_website
DB_USER=root
DB_PASS=

# SMTP / Email Configuration (Titan Email / Hostinger)
SMTP_HOST=smtp.titan.email
SMTP_PORT=465
SMTP_SECURE=ssl
SMTP_USER=inquiries@alphapremiergroup.com
SMTP_PASS=your_smtp_password_here
MAIL_FROM_EMAIL=inquiries@alphapremiergroup.com
MAIL_FROM_NAME="Alpha Premier Group"
MAIL_TO_EMAIL=inquiries@alphapremiergroup.com
```

### 4. Initialize Database Schema & Default Admin

Run the database setup script via PHP CLI:

```bash
php api/setup.php
```

This creates the necessary tables (`admins`, `inquiries`, `blog_posts`, `job_openings`, `services`, `site_settings`, `activity_log`) and provisions the default administrator account:
- **Email:** `admin@alphapremiergroup.com`
- **Default Password:** `AlphaPremier2026!` *(Change immediately after first login)*

### 5. Running Local Development

Start the frontend Vite development server:

```bash
npm run dev
```

The frontend will run at `http://localhost:5173`. 

To test PHP endpoints locally, run PHP's built-in web server in a separate terminal:

```bash
php -S localhost:8000 -t .
```

---

## 🛠️ Verification & Quality Checks

Run the automated verification suite before submitting any changes:

```bash
# TypeScript strict type check (0 errors required)
npx tsc --noEmit

# Production build verification
npm run build

# Code linting
npm run lint

# Backend PHP syntax check
php -l api/config.php
php -l api/db.php
php -l api/inquire.php
php -l api/setup.php
```

---

## 🌐 Production Deployment (Hostinger Web Hosting)

1. Build the production frontend:
   ```bash
   npm run build
   ```
2. Upload the contents of `dist/` into your Hostinger `public_html/` root.
3. Upload the `api/` directory into `public_html/api/`.
4. Ensure `public/legacy/` is uploaded to `public_html/legacy/` if the legacy archive is desired.
5. Create your production MySQL database in the Hostinger hPanel and run `api/schema.sql` via phpMyAdmin or `php api/setup.php`.
6. Configure the production `.env` in `public_html/` with your Hostinger MySQL and Titan Email credentials.
7. Ensure `.htaccess` is present in `public_html/` for proper SPA route resolution and API handling.

---

## 📄 License & Proprietary Rights

All rights reserved. © 2026 **Alpha Premier Group of Companies OPC**.
Unpublished proprietary work. Unauthorized copying, distribution, or reproduction is strictly prohibited.
