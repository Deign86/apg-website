# data/

## Responsibility
Shared static APG company/portfolio content, fallback records, canonical enterprise identifiers/configuration, and client-side admin capability metadata.

## Design
- `companyData.ts` exports typed `COMPANY_INFO`, `PROPERTY_TYPES`, `CORE_VALUES`, `ENTERPRISES`, `OPEN_POSITIONS`, and `BLOG_POSTS`. Its `ENTERPRISES` holds the public division profiles (display name, id, category, logo/image, narrative, optional highlights/badges); blog records follow `BlogPost`; openings follow `JobPosition`.
- `enterprises.js` is the single source of enterprise slugs: `ENTERPRISES` (`{ slug, name }` for `corporate`, `virtual-office`, `realty`, `luxe-prime`, `swiftclear`, `88prime`, `alta-venture`, `dynamic-tree`, `construction`), plus `CORPORATE_SLUG`, `ENTERPRISE_SLUGS`, admin-oriented `ENTERPRISE_TABS` (leading `all`), and `isValidEnterprise(slug)`. A slug must equal the `/subsidiaries/<slug>` path segment, the `ENTERPRISE_CONFIGS` key, and the stored `enterprise_slug`; every non-corporate slug is also its production subdomain.
- `enterpriseConfig.js` maps subsidiary slugs to shared header/footer/chatbot configuration: names, bot title and quick prompts, accent/logo, navigation and footer keys, colors, contact details, social links, and copyright. `getEnterpriseConfig(pathname)` selects a config from the (in-app) route path or returns `DEFAULT_ENTERPRISE_CONFIG`.
- `permissions.js` defines `CAPABILITIES` by role and `roleCan(role, capability)`. Roles are `superadmin`, `admin`, `editor`, and `recruiter`; e.g. listings/deletes are admin or superadmin only, careers/applicants also allow recruiters, and user administration is superadmin-only.

## Flow
- Static exports flow into views as initial/fallback state: `HomeView` renders enterprise/category/value data; `BlogsView` seeds from `BLOG_POSTS`; `CareersView` seeds from `OPEN_POSITIONS`; `InquireView` uses `ENTERPRISES` for selectable divisions.
- Data hooks fetch live records from `/api/listings.php`, `/api/blogs.php`, `/api/careers.php`, `/api/content.php`, and `/api/services.php`, keeping fallback records when responses are empty or fail.
- `enterprises.js` `ENTERPRISE_SLUGS` drives `lib/enterpriseHost` (subdomain slugs = all except `corporate`), and its `ENTERPRISES` names feed `components/Seo.tsx` JSON-LD; `enterpriseConfig.js` uses the same keys for shell configuration.
- Admin UI checks `roleCan(user.role, capability)` before showing capability-gated controls; actual authorization is enforced server-side in `api/config.php`.

## Integration
- `src/types` defines the TypeScript contracts used by `companyData.ts`; hooks and public views import its fixtures.
- `src/context/AuthContext.jsx` derives `can(capability)` from `roleCan`; `EnterpriseHeader`/`EnterpriseFooter`/`EnterpriseChatbot` use `getEnterpriseConfig`.
- Canonical slug discipline matters for `/api/careers.php?enterprise=...`, `/api/services.php?category=...`, blog scoping, subdomain routing, and SEO canonicals; client capability metadata is a UI aid, never the security boundary.
