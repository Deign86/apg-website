# alta-venture/
## Responsibility
- Supplies Alta Venture's branded sub-site chrome and page modules used by `AltaVenture.jsx`.
- `AltaVenture.jsx` wraps nested routes with Header, `<main><Outlet/></main>`, Footer, and Chatbot.
- `Home.jsx`, `Services.jsx`, `Blogs.jsx`, `Careers.jsx`, and `Inquire.jsx` implement page content.
- `shared.jsx` holds palette constants, asset paths, and `Glass`, `Pill`, and `ImageWithFallback` helpers.
- `av-header.css` and `av-footer.css` style chrome; `av-chatbot.css` is not imported anywhere (unused).
## Design
- Bespoke JSX pages use a dark teal shell (`#082636`) with mint/teal accents from `shared.jsx`.
- Plus Jakarta Sans font links and the favicon are set in the layout's Helmet block.
- The parent imports `alta-venture.css` (Tailwind v4 `source(none)` scanning only these files plus `.alta-venture-scope` helpers).
- The page set is custom JSX rather than the generated Figma app pattern used elsewhere.
- `alta-venture-active` is toggled on `<html>` on mount/unmount; content is wrapped in `.alta-venture-scope`.
## Flow
- Served at `alta-venture.alphapremiergroup.com`; routes stay nested under `/subsidiaries/alta-venture`.
- `App.jsx` mounts the layout outside `EnterpriseShell`, so it does not use `EnterpriseNavContext`.
- Named exports (`AltaVentureHome`, `...Services`, `...Blogs`, `...Careers`, `...Inquire`) each render `EnterpriseSeo` plus the page.
- Header links move between nested routes; its APG badge links to `MAIN_SITE_HREF` (apex when on a subdomain).
- Inquire posts to `/api/inquire.php` and Careers to `/api/applicants.php`, both sending `form_started_at`.
## Integration
- `AltaVenture.jsx` imports the page modules, shell components, CSS, and React Router Outlet.
- `Chatbot.jsx` simply renders the shared `EnterpriseChatbot` component.
- Services/Careers use `useServices`/`useCareers('alta-venture')`; Blogs fetches `/api/blogs.php?enterprise=alta-venture`.
- Fallback content comes from `@/data/companyData`; branding assets come from `/assets/alta-venture/...`.
- Header/Footer also import the shared `components/Header.css` and `Footer.css` base styles.
