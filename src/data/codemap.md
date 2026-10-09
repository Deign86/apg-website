# data/

## Responsibility
Shared static APG company/portfolio content, fallback records, canonical enterprise identifiers/configuration, and client-side admin capability metadata.

## Design
- `companyData.ts` exports typed `COMPANY_INFO`, `PROPERTY_TYPES`, `CORE_VALUES`, `ENTERPRISES`, `OPEN_POSITIONS`, and `BLOG_POSTS`. `ENTERPRISES` contains seven public divisions with display name, canonical-ish id, category, logo/image, narrative and optional highlights/badges; blog records follow `BlogPost`; openings follow `JobPosition`.
- `enterprises.js` is the canonical slug list for subsidiary routes, `ENTERPRISE_CONFIGS` keys, and enterprise-scoped blog data: `corporate`, `virtual-office`, `realty`, `luxe-prime`, `swiftclear`, `88prime`, `alta-venture`, `dynamic-tree`, and `construction`. It also exports `CORPORATE_SLUG`, `ENTERPRISE_SLUGS`, admin-oriented `ENTERPRISE_TABS`, and `isValidEnterprise(slug)`.
- `enterpriseConfig.js` maps supported subsidiary slugs to shared header/footer configuration: names, AI prompt labels, accent/logo, navigation keys, text/background colors, contact details, social links, and copyright. `getEnterpriseConfig(pathname)` selects a config from route path or returns `DEFAULT_ENTERPRISE_CONFIG`.
- `permissions.js` defines `CAPABILITIES` by role and `roleCan(role, capability)`. Roles are `superadmin`, `admin`, `editor`, and `recruiter`; access varies by capability (for example, listings/deletes are admin or superadmin only, while careers/applicants also allow recruiters; user administration is superadmin-only).

## Flow
- Static exports flow into views as initial/fallback state: `HomeView` renders enterprise/category/value data and dynamic page content fallback; `BlogsView` seeds from `BLOG_POSTS`; `CareersView` seeds from `OPEN_POSITIONS`; `InquireView` uses `ENTERPRISES` for selectable inquiry divisions.
- Data hooks fetch live records from `/api/listings.php`, `/api/blogs.php`, `/api/careers.php`, `/api/content.php`, and `/api/services.php`; if responses are empty or fail, they retain/use fallback records where configured, then expose data to UI state/rendering.
- `ENTERPRISES` in `enterprises.js` validates and normalizes the shared route/API slug vocabulary; `enterpriseConfig.js` uses the same slug keys to resolve shared subsidiary shell configuration.
- Admin UI checks `roleCan(user.role, capability)` before showing capability-gated controls; actual API authorization remains enforced server-side by the capability map in `api/config.php`.

## Integration
- `src/types` defines the TypeScript contracts used by `companyData.ts`; hooks and public views import its fixtures.
- `src/context/AuthContext.jsx` derives `can(capability)` from `roleCan`; enterprise shell components can use `getEnterpriseConfig` plus `useEnterpriseNav` for page navigation.
- Canonical slug discipline matters for enterprise query parameters in `/api/careers.php?enterprise=...` and `/api/services.php?category=...`, plus blog scoping; client capability metadata is a UI aid, never the security boundary.
