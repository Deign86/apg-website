# luxe-prime/app/
## Responsibility
- `App.tsx` is the page switcher: Home, Services, Blogs, Careers and Inquire, each a component in `components/`.
- It owns no data; each page loads its own.
## Design
- The root is transparent over the fixed pinstripe layer in `styles/index.css`.
- Switching pages fades the new one in; the page the site opened on paints at once.
- No looping effects, scroll listeners or inline keyframes: the old gold flakes, shimmer, tilt, ripple, parallax and scroll progress bar were removed with the redesign.
## Flow
- `LuxePrime.jsx` passes `page`, `setPage` and `interest`; `navigate(page, service?)` asks the wrapper for the page's URL and jumps to the top.
- Services' "Inquire about this service" and the inquire buttons go to `inquire` (Luxe's own `InquirePage`, keyed by the service so it starts fresh).
## Integration
- `components/` holds every page and the shared look (`ui.ts`, `reveal.tsx`, `ClosingPanel`, `Lightbox`, `services.ts`).
- `styles/index.css` supplies this app's Tailwind build.
