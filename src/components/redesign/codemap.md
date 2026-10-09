# src/components/redesign/

## Responsibility
Main APG redesign presentation layer: path-aware public shell with per-tab SEO, navigation/footer, home sections/background effects, and shared inquiry, job-application, and blog-reader modal flows.

## Design
- `RedesignShell` is the composition root. It owns active tab and modal selection/open state, and renders `Seo` (per-tab title/description/canonical; home adds `ORGANIZATION_JSONLD` + `WEBSITE_JSONLD`), a favicon `Helmet`, `UnifiedLuxuryBackground`, `Navbar`, the tab view plus `<Outlet />`, `Footer`, `AlphaAssistant`, and the three controlled modals. Outlet pages (properties, contact, legal, virtual-office) set their own SEO.
- `Navbar({ currentTab, onNavigate, onOpenInquire? })` is controlled for active navigation while mobile-menu/scroll state are internal; the menu toggle is a `<button>` with `aria-expanded`/`aria-controls`, Escape closes the menu, and active items carry `aria-current`. `Footer({ onNavigate, onOpenInquire })` connects public navigation, inquiries, and local newsletter state.
- `AboutUsSection` accepts optional inquiry/enterprise callbacks, gets editable copy from `useContent('home', {})` with hard-coded fallbacks, and owns a full-story dialog state. `EnterprisesGallery({ enterprises, onSelectEnterprise?, onNavigate? })` excludes the parent company; cards are keyboard-operable (`role="button"`, Enter/Space, focus = hover).
- `InquireModal` (`isOpen`, `onClose`, optional default enterprise/inquiry type), `JobApplyModal` (`job`, `isOpen`, `onClose`), and `BlogDetailModal` (`post`, `isOpen`, `onClose`, `onOpenInquire`) are `role="dialog"`/`aria-modal` overlays wired to `useModalDialog` (Escape closes, focus trap/restore, `<html>` scroll lock, `data-modal-open`). Inquiry POSTs JSON to `/api/inquire.php`; job application POSTs `FormData` (name, email, phone, job title/id, enterprise, cover letter, optional resume) to `/api/applicants.php`. Both send a `website` honeypot and `form_started_at` timestamp and treat `!res.ok` or `success` false as an error.
- `AlphaAssistant` adapts `onOpenInquire` to shared `EnterpriseChatbot`. `SeamlessHeroVideo` manages paired crossfading video playback. `UnifiedLuxuryBackground({ currentTab })` is a canvas animation driven by pointer, click, scroll and resize events.

## Flow
- `RedesignShell` derives current tab from `useLocation().pathname` (`null` for outlet pages), and on every path change re-syncs the tab and closes all modals so Back/Forward never leaves a modal over a new page. Tabs navigate with `useNavigate`.
- Shell callbacks connect view intent to shared state: enterprise selection navigates to a mapped `/subsidiaries/...` route; job/blog selection stores the record and opens its modal; inquiry without a preset enterprise navigates to `/inquire`, while a named enterprise opens `InquireModal` with that default.
- Modal success/error is handled locally: submit → POST → server `ticket` (or generated fallback ref) shows the confirmation, or the server's `error` string is shown. Blog inquiry CTA invokes the shell inquiry callback.
- `HomeView` composes `AboutUsSection`, `EnterprisesGallery`, and `SeamlessHeroVideo`; `AlphaAssistant` delegates to the shared chatbot.

## Integration
- **Consumers/routes:** `src/App.jsx` wraps the index, `enterprises`, `careers/*`, `blogs`, `inquire`, and outlet pages (properties, virtual-office, contact, privacy, terms) in `RedesignShell`. `HomeView` imports `AboutUsSection`, `EnterprisesGallery`, and `SeamlessHeroVideo`; `routes/Properties.jsx` also renders `InquireModal`.
- **Dependencies:** `@/hooks/useContent`, `@/hooks/useModalDialog`; `components/Seo`; `src/types`; `src/data/companyData`; React Router; `react-helmet-async`; `motion/react`; `lucide-react`; `EnterpriseChatbot`; `/api/inquire.php`, `/api/applicants.php`; browser canvas/video/clipboard APIs.
