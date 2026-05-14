# Curric

Landing page for a SaaS that helps non-native English teachers find and apply to teaching jobs abroad. Built by two teachers (Moe & Ford) with 6 years of ESL experience in Vietnam.

## website/ — Landing Page

**Stack:** Vanilla HTML5, CSS3, ES6+. No frameworks, no build step.

**To preview:** Open `website/index.html` in a browser.

**Live:** https://curric.app (hosted on Vercel)

### Payments (Stripe + Supabase)
Users pay **$1.99** via Stripe Checkout before being added to the waitlist. Flow:
1. User fills name/email/country → `POST /functions/v1/create-checkout`
2. Edge Function creates a `pending` row in `public.payments` (amount: 199 USD cents), creates a Stripe Checkout Session
3. User is redirected to Stripe, pays $1.99
4. Stripe redirects back with `?payment=success` or `?payment=cancelled`
5. Stripe webhook (`/functions/v1/stripe-webhook`) confirms payment → marks `completed` → inserts into `public.waitlist`

**Edge Functions:**
- `create-checkout` (verify_jwt: false) — creates Stripe session + payment record
- `stripe-webhook` (verify_jwt: false) — verifies webhook sig, marks paid, adds to waitlist
- `send-welcome-email` (verify_jwt: false) — placeholder; called via DB trigger on waitlist INSERT

**Required secrets** (set via Supabase Dashboard → Edge Functions → Secrets):
- `STRIPE_SECRET_KEY` — Stripe secret key (starts with `sk_live_` or `sk_test_`)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret (starts with `whsec_`)

**Stripe webhook endpoint:** `https://hvynpslokgslpmekqwmg.supabase.co/functions/v1/stripe-webhook`
Listen for: `checkout.session.completed`

**Database:** `public.payments` (id, email, name, country, stripe_session_id, stripe_payment_intent_id, amount default 199, currency, status, created_at, completed_at)

### Waitlist (Supabase)
The `public.waitlist` table (id, name, email, country, created_at) is populated by the `stripe-webhook` Edge Function **only after payment confirms**. RLS allows insert for everyone (service_role inserts from webhook), read for admins only.

On INSERT into waitlist, a database trigger (`on_waitlist_insert`) calls `send-welcome-email` Edge Function via `pg_net` (placeholder — email copy TBD).

### Frontend behavior
- Form submission calls `create-checkout` Edge Function via `fetch()`
- On success, redirects browser to Stripe Checkout URL
- On return from Stripe, `?payment=success` or `?payment=cancelled` query params are handled on page load
- Cancelled payments show a yellow notice; success hides the form and shows confirmation
- Supabase REST API used for loading sample jobs (`public.jobs`) and spot counter (`public.waitlist` count)
- `vercel.json` in root (outputDirectory: `.`)

### Color theme
Slate blue-grey (`#e8eaed` canvas) with navy (`#2a6aaa`) accent.

## Vercel deployment

- **Project:** `moes-projects-c7d57ba2/website`
- **Production URL:** `https://website-two-navy-72.vercel.app`
- **Custom domain:** `curric.app` (DNS via Cloudflare — add CNAME `www` → `website-two-navy-72.vercel.app`)
- **Deploy command:** `vercel --prod --cwd website`
- Config stored in `website/vercel.json`

## Git

- Single branch: `master` on `D:\RecruRep`
- No `.gitignore` for the website (`.vercel/` is gitignored by Vercel CLI)

## SDD artifacts
SDD workflow artifacts are in `website/.specify/`.
