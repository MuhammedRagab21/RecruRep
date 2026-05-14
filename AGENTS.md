# Curric Workspace

Three independent projects:

- `spec-kit/` — GitHub Spec Kit toolkit (Spec-Driven Development). Has its own `AGENTS.md`.
- `awesome-design-md/` — Collection of DESIGN.md files for UI inspiration.
- `website/` — Curric landing page (React + Vite + TypeScript).

## website/ — Landing Page

**Stack:** Vite + React 19 + TypeScript + Tailwind CSS v4 + Three.js + shadcn/ui.

**Theme:** 4 color variants (Navy+Gold, Teal+Terracotta, Slate+Amber, Deep Blue+Sage).

**Key files:**
- `src/App.tsx` — entry point with theme switcher
- `src/components/ui/waitlist-landing-page-with-countdown-timer.tsx` — main waitlist component with Three.js animated background
- `src/index.css` — Tailwind import
- `vite.config.ts` — Vite + React + Tailwind + `@/` path alias

**Commands:**
- `npm run dev` — start dev server (http://localhost:5173)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build

**Dependencies:** `three`, `lucide-react`, `tailwindcss`, `@tailwindcss/vite`.

**Supabase:** Waitlist form submits to Supabase via MCP (configured in `opencode.json`). Update `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the component.

## Key conventions

- Use `@/` path alias for imports (e.g., `@/components/ui/...`)
- Default component path: `src/components/ui/`
- All DESIGN.md files use [Stitch format](https://stitch.withgoogle.com/docs/design-md/format/)
