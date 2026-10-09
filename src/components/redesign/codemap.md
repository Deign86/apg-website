# src/components/redesign/

## Responsibility
Main APG redesign presentation layer: path-aware public shell, navigation/footer, home sections/background effects, and shared inquiry, job-application, and blog-reader modal flows.

## Design
- `RedesignShell` is the composition root. It owns active tab and modal selection/open state, and renders `Navbar`, page content/`Outlet`, `Footer`, `AlphaAssistant`, and the controlled modal instances alongside `Helmet` and `UnifiedLuxuryBackground`.
- `Navbar({ currentTab, onNavigate, onOpenInquire? })` is controlled for active navigation while mobile-menu/scroll state are internal. `Footer({ onNavigate, onOpenInquire })` connects public navigation, inquiries, and locally controlled newsletter state.
- `AboutUsSection` accepts optional inquiry/enterprise callbacks, gets editable copy from `useContent('home', {})`, falls back to hard-coded copy, and owns a full-story dialog state. `EnterprisesGallery({ enterprises, onSelectEnterprise?, onNavigate? })` excludes the parent company and tracks hover state.
- `InquireModal` (`isOpen`, `onClose`, optional default enterprise/inquiry type), `JobApplyModal` (`job`, `isOpen`, `onClose`), and `BlogDetailModal` (`post`, `isOpen`, `onClose`, `onOpenInquire`) use controlled visibility/data with internal form/submission or share state. Inquiry sends JSON; job application sends `FormData` with optional resume; both post to `/api/inquire.php`.
- `AlphaAssistant` adapts `onOpenInquire` to shared `EnterpriseChatbot`. `SeamlessHeroVideo` accepts video/poster/class/overlay/crossfade props and manages paired video playback. `UnifiedLuxuryBackground({ currentTab })` uses a canvas animation driven by pointer, click, scroll and resize events.

## Flow
- `RedesignShell` derives current tab from `useLocation().pathname`, syncs it when the path changes, and navigates tabs with `useNavigate`. Home, enterprises, blogs, careers, and inquire tabs render their respective views; dedicated nested pages render through `<Outlet />`.
- Shell callbacks connect view intent to shared state: enterprise selection navigates to a mapped subsidiary route; job/blog selection stores the record and opens its modal; inquiry without a preset enterprise navigates to `/inquire`, while a named enterprise opens `InquireModal` with that default.
- Modal success/error is handled locally. Blog inquiry CTA closes the article then invokes the shell inquiry callback; inquiry/job submit handlers post to the API then show the returned/fallback ticket result.
- `HomeView` composes `AboutUsSection`, `EnterprisesGallery`, and `SeamlessHeroVideo` and passes shell callbacks for navigation/inquiry/enterprise selection. `AlphaAssistant` delegates to the shared chatbot implementation.
- Footer tab controls call shell `onNavigate`; subsidiary, legal, and property destinations use React Router navigation.

## Integration
- **Consumers/routes:** `src/App.jsx` wraps `/`, `/enterprises`, `/careers/*`, `/blogs`, `/inquire`, and dedicated pages (properties, virtual-office, contact, privacy, terms) in `RedesignShell`. `HomeView` imports `AboutUsSection`, `EnterprisesGallery`, and `SeamlessHeroVideo`; `Properties.jsx` also renders `InquireModal`. `RedesignShell` imports all shared redesign shell/modal components and the public views.
- **Dependencies:** `useContent` hook and home content API; `src/types` (`NavTab`, `Enterprise`, `InquireFormData`, `JobPosition`, `BlogPost`); `src/data/companyData` (`ENTERPRISES`, `COMPANY_INFO`); React Router; `react-helmet-async`; `motion/react`; `lucide-react`; `EnterpriseChatbot`; `/api/inquire.php`; browser canvas/video/clipboard APIs.
