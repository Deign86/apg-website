# src/components/ui/

## Responsibility
Reusable visual primitives: a customizable hover-glow content card.

## Design
- `GlowCard` (`spotlight-card.tsx`) wraps arbitrary `children`. Props include `className`, `glowColor`, `size` (`sm`/`md`/`lg`), `width`, `height`, and `customSize`; internal hover state controls inline border/shadow. It uses no data/context.

## Flow
- Consumer passes children and sizing/class props to `GlowCard`; it applies the selected preset unless `customSize`, applies width/height overrides, and changes hover treatment on pointer enter/leave.

## Integration
- **Consumers/routes:** `GlowCard` is used by `src/routes/subsidiaries/luxe-prime/app/App.tsx`. The site's AI assistant is `components/EnterpriseChatbot` (Gemini-backed via `/api/chat/*`), mounted by `EnterpriseShell` and by the redesign through `AlphaAssistant`.
- **Dependencies:** React state APIs; Tailwind utility classes. No application data hooks, context, or backend integration.
