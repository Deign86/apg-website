# alta-venture/
## Responsibility
- Supplies Alta Venture's full branded sub-site layout and named page exports.
- `AltaVenture.jsx` wraps nested routes with Header, Outlet, Footer, and Chatbot.
- `Home.jsx`, `Services.jsx`, `Blogs.jsx`, `Careers.jsx`, and `Inquire.jsx` implement page content.
- `shared.jsx` holds utilities or shared content for this page set.
- `av-header.css`, `av-footer.css`, and `av-chatbot.css` style site chrome and chatbot.
## Design
- Bespoke JSX pages use a dark teal shell with bright teal-green accents.
- Plus Jakarta Sans font links and title metadata are configured in the layout's Helmet block.
- Header/footer/chatbot styling is split into dedicated CSS files; the parent imports `alta-venture.css`.
- The page set is custom rather than the generated Figma app pattern used elsewhere.
- `alta-venture-active` scopes its route-level document behavior.
## Flow
- The parent router mounts Alta Venture as a layout and selects a nested page route.
- The layout renders shared header, current `<Outlet />`, footer, and persistent chatbot.
- Named exports expose Home, Services, Blogs, Careers, and Inquire to nested route declarations.
- Header links move between nested routes and the current page occupies the main region.
- Page-specific inquiry metadata can override the layout metadata.
## Integration
- `AltaVenture.jsx` imports the page modules, shell components, CSS, and React Router Outlet.
- Mount/unmount toggles `alta-venture-active` on the document root.
- Individual pages integrate shared services and inquiry behavior as implemented by each module.
- Public branding references `/assets/images/...`; font links use Google Fonts.
- React Router provides the nested route outlet and navigation environment.
