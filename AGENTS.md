# RecruRep

Landing page for a SaaS that lets non-native English teachers apply to teaching jobs abroad with one click. Built with AI-powered job matching, global job feed, and one-click applications.

## website/ — Landing Page

**Stack:** Vanilla HTML5, CSS3, ES6+. No frameworks, no build step.

**To preview:** Open `website/index.html` in a browser.

### Waitlist (Supabase)
The waitlist form submits directly to a Supabase table (`public.waitlist` with columns: `id`, `name`, `email`, `created_at`). The anon key is embedded in the JS for public inserts — RLS allows insert for everyone, read for admins only.

### Color themes
5 built-in grey variants switchable via the floating color picker (bottom-right), all with navy (#2a6aaa) as the accent:
- Slate (default): blue-grey, most harmonious with navy
- Ash: warm brown-grey, earthy contrast
- Smoke: neutral pure grey, balanced
- Frost: bright cool grey, highest contrast
- Graphite: deepest, moodiest, dramatic

Theme is persisted in localStorage (`recrurep-theme`).

## SDD artifacts
SDD workflow artifacts are in `website/.specify/`.
