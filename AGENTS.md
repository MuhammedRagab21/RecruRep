# RecruRep

Landing page for a SaaS that lets non-native English teachers apply to teaching jobs abroad with one click. Built with AI-powered job matching, global job feed, and one-click applications.

## website/ — Landing Page

**Stack:** Vanilla HTML5, CSS3, ES6+. No frameworks, no build step.

**To preview:** Open `website/index.html` in a browser.

### Waitlist (Supabase)
The waitlist form submits directly to a Supabase table (`public.waitlist` with columns: `id`, `name`, `email`, `created_at`). The anon key is embedded in the JS for public inserts — RLS allows insert for everyone, read for admins only.

### Color theme
Slate blue-grey (`#e8eaed` canvas) with navy (`#2a6aaa`) accent.

## SDD artifacts
SDD workflow artifacts are in `website/.specify/`.
