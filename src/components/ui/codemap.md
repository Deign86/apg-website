# src/components/ui/

## Responsibility
Reusable visual primitives: a customizable hover-glow content card and a standalone floating AI-chat UI prototype.

## Design
- `GlowCard` (`spotlight-card.tsx`) wraps arbitrary `children`. Props include `className`, `glowColor`, `size` (`sm`/`md`/`lg`), `width`, `height`, and `customSize`; internal hover state controls inline border/shadow. It uses no data/context.
- `FloatingAiAssistant` (`glowing-ai-chat-assistant.tsx`) owns panel-open, draft and character-count state, textarea keyboard behavior, and click-outside close behavior. Sending currently logs the draft and clears it; attachment/link/code/voice controls are presentational only. No props/context.

## Flow
- Consumer passes children and sizing/class props to `GlowCard`; it applies the selected preset unless `customSize`, applies width/height overrides, and changes hover treatment on pointer enter/leave.
- `FloatingAiAssistant` toggler opens its panel; textarea updates draft/count, Enter sends unless Shift is held, and sending clears a nonblank draft. A document mousedown outside the panel and `.floating-ai-button` closes it.

## Integration
- **Consumers/routes:** `GlowCard` is used by `src/routes/subsidiaries/luxe-prime/app/App.tsx`. No current consumer of `FloatingAiAssistant` was found; the main redesign uses `EnterpriseChatbot` through `AlphaAssistant` instead.
- **Dependencies:** React state/ref/effect APIs; `lucide-react`; Tailwind utility classes. No application data hooks, context, or backend integration.
