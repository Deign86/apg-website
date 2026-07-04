# Plan — AI Integration: NVIDIA NIM → Chatbot + Dashboards

> **Repository:** `C:\Users\Deign\Downloads\Original APG Website` (branch `main`)
> **Project:** Alpha Premier Group — Vite 5 + React 18 + Supabase website + admin panel
> **Goal:** Wire the NVIDIA NIM (OpenAI-compatible) LLM into the existing public chatbot, admin dashboard analytics, and lead management — with zero new dependencies (uses `fetch` only) and graceful fallback to the existing keyword/heuristic logic.
> **Key constraint:** The NVIDIA API key (`NVIDIA_API_KEY`) is **server-side only** — never `VITE_`-prefixed, never shipped to the browser, never committed to the repo.

---

## 0. Architecture

All AI calls go through server-side endpoints (`/api/ai/*`), mirroring the existing pattern for the Supabase service-role key and /api/contact:

```
Client (browser)
  │
  ├── POST /api/ai/chat        ──→  [ server/contact.js  (dev) ]
  │        (public, no auth)             [ api/ai/[...path].js  (Vercel) ]
  │                                          │
  ├── POST /api/ai/insights    ──→          ├─ builds business context from Supabase
  │        (admin, Bearer token)            │   (offerings, jobs, blogs, KB, settings)
  │                                          │
  └── POST /api/ai/lead        ──→          └─ calls nvidiaChat() via fetch
       (admin, Bearer token)                          │
                                                      ▼
                                           integrate.api.nvidia.com/v1
                                           /chat/completions (OpenAI-compatible)
                                                      │
                                                      ▼
                                           { content }  ◀── returned to client
```

### Shared server module: `server/ai.js`

- `nvidiaConfigured()` — checks `process.env.NVIDIA_API_KEY` exists
- `nvidiaChat(messages, opts)` — raw NVIDIA call via `fetch`, returns content string
- `buildBusinessContext(supabase)` — fetches live Supabase data (settings, offerings, jobs, blogs, KB) using the service-role client
- `formatBusinessContext(ctx)` — assembles a rich system prompt
- `handleAiChat(supabase, body)` — public chatbot handler
- `handleAiInsights(supabase, body)` — admin dashboard narrative
- `handleAiLead(supabase, body)` — admin lead analysis

Both `server/contact.js` (local dev) and `api/ai/[...path].js` (Vercel) import from `server/ai.js`.

---

## 1. Env Vars

| Variable | Location | Purpose |
|---|---|---|
| `NVIDIA_API_KEY` | `.env.local` / Vercel | Server-side NVIDIA NIM key. NO `VITE_` prefix. |
| `NVIDIA_MODEL` | `.env.local` / Vercel | Optional override. Default: `meta/llama-3.1-70b-instruct` |
| `VITE_INSIGHTS_API_URL` | `.env.local` | Points `insights.js` at our own server endpoint. Value: `/api/ai/insights` |

### Security rules
- Never put `NVIDIA_API_KEY` in a `VITE_` prefix (would leak to browser bundle).
- `.env.local` and `.env` are git-ignored (verified in `.gitignore`).

---

## 2. Files Created

| File | Purpose |
|---|---|
| `server/ai.js` | Shared NVIDIA NIM helpers + three route handlers. Server-only. |
| `api/ai/[...path].js` | Vercel serverless catch-all for `/api/ai/*`. |
| `src/lib/ai.js` | Client wrappers: `aiChat()`, `aiInsights()`, `aiLead()`. Each attaches auth for admin routes. |

## 3. Files Modified

| File | Changes |
|---|---|
| `server/contact.js` | Added `import { handleAiChat, handleAiInsights, handleAiLead }` + route dispatch for `/api/ai/*` |
| `vite.config.js` | Added `/api/ai` proxy → `http://localhost:3001` (before the catch-all `/api` → `:8080`) |
| `.env.local` | Added `NVIDIA_API_KEY`, `NVIDIA_MODEL`, `VITE_INSIGHTS_API_URL` |
| `.env.example` | Documented all three vars with instructions |
| `src/components/Chatbot.jsx` | Imports `aiChat`; sends conversation history to `/api/ai/chat`; shows typing indicator; falls back to `getKeywordReply()` on failure |
| `src/components/Chatbot.css` | Added `.chatbot-ai-badge` style for the "AI" label in the header |
| `src/routes/admin/ChatbotTrainer.jsx` | Added "AI response" checkbox toggle; calls `aiChat()` when checked |
| `src/routes/admin/Dashboard.jsx` | Full rewrite: 4 stat cards + AI narrative panel (with Regenerate) + heuristic insight cards + recharts (area + pie) |
| `src/lib/insights.js` | Added `import { supabase }`; updated `getInsights()` to attach auth header |
| `src/routes/admin/Leads.jsx` | Added "AI Analysis" button in lead detail modal |

---

## 4. Chatbot Behavior (public site)

1. User opens the chatbot → hears greeting.
2. User types a message → sent to `POST /api/ai/chat` with conversation history (last 10 exchanges).
3. Server builds a **system prompt** from live data (company settings, active listings, open jobs, recent blog titles, chatbot_kb facts).
4. NVIDIA NIM responds with a concise, on-brand answer.
5. **On failure** (AI down, key missing, network error) → falls back to existing keyword matching. No crash.
6. **Security:** conversation history is sent to the server endpoint (same host). No data sent to third parties besides NVIDIA NIM.

## 5. Dashboard AI Analysis (admin)

1. Dashboard loads properties + inquiries from Supabase (full arrays, not just counts).
2. **Immediately** shows 4 StatCards + heuristic insight cards (stale listings, uncontacted leads, pipeline, win rate, hot lead) from `generateDashboardInsights()`.
3. **Async** calls `POST /api/ai/insights` (with Bearer token) → returns AI-written narrative paragraph.
4. Narrative is displayed in a gold-accented "AI Analysis" card with a "Regenerate" button.
5. **Fallback:** if AI fails → heuristics still show; AI section simply hidden. No errors.
6. Recharts: leads-over-time (14-day area chart) + lead-status breakdown (pie chart).

## 6. Lead AI Analysis (admin)

1. In lead detail modal (click name in Leads table), an "AI Analysis" button appears.
2. Calls `POST /api/ai/lead` → returns `{ summary, nextAction, suggestedReply }`.
3. Results shown below the lead detail as a card with three sections.
4. **Fallback:** on failure → shows "AI unavailable". Heuristic score from `scoreLead()` still visible.

## 7. Security Verification

- [x] `grep "nvapi-|NVIDIA_API_KEY" dist/assets/*.js` → 0 hits
- [x] No `VITE_NVIDIA_API_KEY` in any env file or source
- [x] Admin AI endpoints verify `profiles.role === 'admin'` (reuse `verifyAdmin` pattern)
- [x] Public chatbot endpoint is unauthenticated but bounded (max 1000 chars, last 10 history)
- [x] The NVIDIA key is in `.env.local` which is git-ignored

## 8. Verification Checklist

- [ ] `pnpm build` green (verified: 715 modules, 0 errors)
- [ ] `pnpm dev` → chatbot sends `/api/ai/chat`, gets AI response, falls back gracefully
- [ ] `pnpm dev:all` → `/api/ai/insights` and `/api/ai/lead` work with auth
- [ ] Admin dashboard shows: 4 stat cards, AI narrative (or hidden if AI down), heuristic insights, area/pie charts
- [ ] Chatbot Trainer "Test" works with both keyword and AI modes
- [ ] Console error-free on all public routes (/, /properties, /blogs, /careers, /contact)
- [ ] Console error-free on all admin routes (/admin, /admin/leads, /admin/chatbot)
- [ ] With `NVIDIA_API_KEY` removed: chatbot → keyword fallback, dashboard → heuristic, leads → score-only

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Chatbot says "AI unavailable" | `NVIDIA_API_KEY` missing or invalid | Check `.env.local`; restart server |
| Chatbot uses old keyword responses | AI endpoint unreachable | Check `pnpm dev:all` is running |
| Dashboard "Unauthorized" on AI section | Auth session expired | Log out and back into admin |
| Dashboard AI narrative not appearing | AI returned fallback | Check server logs; heuristics still show |
| "NVIDIA API 401" in server logs | Invalid API key | Rotate key at build.nvidia.com |

## 10. Out of Scope (future)

- Streaming responses
- Realtime subscriptions for live dashboard updates
- Drag-and-drop kanban / WYSIWYG blog editor
- Multi-model LLM fallback chain
- Fine-tuning on APG-specific data
- User feedback on AI responses (thumbs up/down)