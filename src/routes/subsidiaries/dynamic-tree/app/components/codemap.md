# dynamic-tree/app/components/
## Responsibility
- Provides visual helpers for Dynamic Tree page views.
- `SakuraBurst.tsx` renders the brand's decorative motif.
## Design
- Components use React, TypeScript, Tailwind classes, and the subsidiary rose/pink theme.
- In production the shared APG `EnterpriseShell` header/footer provide site chrome.
- SakuraBurst is a visual utility independent of page state.
## Flow
- Pages include SakuraBurst as a background decoration.
- Individual page components own page actions; embedded navigation uses `onNavigate` callbacks.
## Integration
- Services, Blogs, Careers, and Inquire import `SakuraBurst` from this folder.
- `styles/index.css` supplies tokens and Tailwind rules; components do not load CSS directly.
- Theme tokens apply only while `dynamic-tree-active` is on `<html>`.
