# alpha-realty/app/components/
## Responsibility
- Contains Alpha Realty's themed sections, inquiry modal, logo, and background components.
- `HomeSection` presents the introduction; `ListingsSection` renders services via `useServices('realty')`.
- `BlogsSection` and `CareersSection` provide editorial content and the inline application form.
- `InquireModal`, `GoldWavesBackground`, and `AlphaPremierLogo` provide inquiry and shared visual support.
## Design
- React TypeScript modules use Motion and Tailwind classes for the premium page presentation.
- The parent Realty stylesheet provides black/gold fonts, background, and active-scope rules.
- Modal overlays use `useModalDialog` (Esc, focus trap, `<html>` scroll lock, focus return).
- Props keep navigation and submission feedback controlled by the app shell.
## Flow
- App selects a section from the current tab and mounts it in the animated content region.
- Home links to services/listings, blogs, and generic or property-specific inquiry.
- Listings report the service title to open a prefilled inquiry modal.
- Careers opens an inline application form per job (or general), posting with `form_started_at` and showing submit errors.
- InquireModal posts JSON to `/api/inquire.php`; failures surface an inline error message instead of success.
## Integration
- `app/App.tsx` imports components and owns their callback/state wiring.
- Local data contracts and fallback records live in `app/types.ts` and `app/data.ts`.
- `BlogsSection` fetches `/api/blogs.php?enterprise=realty`; `CareersSection` uses `useCareers` and `/api/applicants.php`.
- Parent `Realty.jsx` manages `alpha-realty-active`, `EnterpriseSeo`, and `EnterpriseNavContext`.
- Unified APG enterprise chrome supplies navigation; there are no local Header/Footer components.
