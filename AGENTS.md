# Curric

Landing page for a SaaS that helps non-native English teachers find and apply to teaching jobs abroad. Built by two teachers (Moe & Ford) with 6 years of ESL experience in Vietnam.

## website/ — Landing Page

**Stack:** Vanilla HTML5, CSS3, ES6+. No frameworks, no build step.

**To preview:** Open `website/index.html` in a browser.

### Waitlist (Supabase)
Users sign up via the hero form — name, email, country. Submits directly to `public.waitlist` (id, name, email, country, created_at) via Supabase REST API. RLS allows insert for everyone, read for admins only.

### Color theme
Slate blue-grey (`#e8eaed` canvas) with navy (`#2a6aaa`) accent.

## SDD artifacts
SDD workflow artifacts are in `website/.specify/`.
