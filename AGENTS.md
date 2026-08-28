# AGENTS.md — Alpha Premier Group Agent Directives

<!-- always-on-skills-trigger -->
## Mandatory Automatic Skills Trigger

On every prompt and task, automatically activate and enforce the following 4 core skills:

### 1. 🎯 Grill-Me (`grill-me`) — Pre-Alignment & Interview
- **Trigger:** Automatic on every initial user prompt, new feature request, architecture plan, or design task.
- **Protocol:**
  - Never guess or make assumptions when a requirement has trade-offs or ambiguity.
  - Explore existing codebase context first (never ask what is already in code).
  - Walk decision trees branch-by-branch, asking one sharp, high-signal question at a time with concrete options before making large modifications.
  - Eliminate the "ambiguity tax" before writing code.

### 2. ✂️ Ponytail (`ponytail`) — Ruthless Simplicity & YAGNI
- **Trigger:** Automatic on all coding, refactoring, designing, and reviewing tasks. Default intensity: **`full`**.
- **The Ladder:**
  1. *Does it need to exist at all?* Skip speculative features (YAGNI).
  2. *Already in codebase / stdlib?* Reuse existing functions and standard libraries.
  3. *Native platform feature?* Use Native PHP 8+ PDO, Apache `.htaccess`, native HTML5/CSS before adding packages.
  4. *Deletion over addition:* The best code is code never written. Shortest working diff wins.
  5. *Root cause fixes:* Fix shared bugs at the root, never patch symptoms in callers.

### 3. 🛡️ Anti-Slop (`install-anti-slop`) — Code Hygiene & Type Safety
- **Trigger:** Automatic on all TypeScript, JavaScript, and backend code.
- **Rules:**
  - No speculative abstractions, unneeded factories, or one-implementation interfaces.
  - Enforce strict type safety without unchecked `as any` or unvalidated type assertions.
  - Handle inputs at trust boundaries (I/O) with schema validation and sanitization.
  - Zero dead flexibility or placeholder boilerplate.

### 4. ⚡ Unlazy (`unlazy`) — Anti-Laziness Execution Discipline
- **Trigger:** Automatic on all execution, migration, and build tasks.
- **Rules:**
  - **No half-done work:** Full sweeps across all affected files. No placeholders, no `// TODO`, no skipped edges.
  - **Runnable Gates:** Verify every change with actual executions:
    - Type Check: `npx tsc --noEmit` (0 errors required)
    - Production Build: `npm run build` (0 errors required)
  - **Evidence-backed reports:** Always verify actual output measurements before stating task completion.
  - **No stopping at 80%:** When encountering blockers or errors, immediately investigate root causes and drive through to 100% completion.

---

## Stack Context
- **Frontend:** Vite 7 + React 18 + Tailwind v4 + React Router 7 (Single Page App)
- **Backend:** Native PHP 8+ REST API with PDO prepared statements (`/api/`)
- **Hosting:** Hostinger Web Hosting (`public_html`) with Apache `.htaccess` rewrites
- **Database:** MySQL
- **Email:** Hostinger/Titan Email SMTP direct dispatcher (`api/inquire.php`)
- **Legacy Archive:** Maintained in `public/legacy/` accessible at `/legacy`
