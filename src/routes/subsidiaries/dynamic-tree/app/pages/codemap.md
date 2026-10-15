# dynamic-tree/app/pages/
## Responsibility
- Implements Dynamic Tree's Home, Services, Blogs, Careers, and Inquire page views.
- Each view is a React module selected by `app/App.tsx`.
- Home introduces the agency with galleries; Services and Blogs present offerings and editorial content.
- Careers lists openings with an application form; Inquire provides the contact form.
- Shared decoration (`SakuraBurst`) is defined outside this directory.
## Design
- Pages use the pale-pink/rose theme and Outfit typography from Dynamic Tree styles.
- Tailwind utilities, Motion, and model/brand imagery from `/imports/` (`public/imports`) compose page content.
- Home defines a local `Lightbox` (Esc/arrow keys) that locks `<html>` overflow while open.
- Home's ambient hero loops use a local `useLoop` (Web Animations API on transform/opacity, compositor), running only while the hero is on screen and off under reduced motion.
- `SakuraBurst` provides brand decoration on Services, Blogs, Careers, and Inquire.
- Plain `<img>` elements render imagery.
## Flow
- `app/App.tsx` renders a view by its current page key and passes `onNavigate` callbacks.
- Embedded navigation callbacks return page changes to the APG wrapper.
- Home and Services actions lead to services, careers, or inquiry via `onNavigate`.
- Inquire posts JSON to `/api/inquire.php` with `form_started_at`; failures show an inline error.
- Careers posts multipart data to `/api/applicants.php` with `form_started_at` and shows submit errors.
## Integration
- Only the embedded page switcher (`app/App.tsx`) imports these view modules.
- `DynamicTree.jsx` owns enterprise context, `EnterpriseSeo`, the scope class, and the CSS import.
- `serviceCards.ts` and `public/imports` provide supporting data and imagery.
- `useServices`/`useCareers('dynamic-tree')` back data-driven views; Blogs loads through `../../../blogApi.ts` (`loadBlogList('dynamic-tree')`; body via `useBlogBody` when a post opens).
- Parent theme CSS supplies utilities, colors, and font rules while `dynamic-tree-active` is set.
