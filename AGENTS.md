# RecruRep

Landing page for a SaaS that lets non-native English teachers apply to teaching jobs abroad with one click. Built with AI-powered job matching, global job feed, and one-click applications.

## website/ — Landing Page

**Stack:** Vanilla HTML5, CSS3, ES6+. No frameworks, no build step.

**To preview:** Open `website/index.html` in a browser.

### Waitlist (Supabase)
The waitlist form submits directly to a Supabase table (`public.waitlist` with columns: `id`, `name`, `email`, `created_at`). The anon key is embedded in the JS for public inserts — RLS allows insert for everyone, read for admins only.

### Color themes
5 built-in themes switchable via the floating color picker (bottom-right):
- Earth (default): terracotta + olive + cream
- Ocean: deep blue + teal + sand
- Sunset: amber + coral + deep purple
- Fresh: sage + mint + charcoal
- Passport: burgundy + gold + cream

Theme is persisted in localStorage (`recrurep-theme`).

## SDD artifacts
SDD workflow artifacts are in `website/.specify/`.
