# Curric

Landing page for a SaaS that helps non-native English teachers find and apply to teaching jobs abroad. Built by two teachers (Moe & Ford) with 6 years of ESL experience in Vietnam.

## website/ — Landing Page

**Stack:** Vanilla HTML5, CSS3, ES6+. No frameworks, no build step.

**To preview:** Open `website/index.html` in a browser.

**Live:** https://curric.app (hosted on Vercel)

### Payments (Stripe + Supabase)
Users pay **$1** via Stripe Checkout before being added to the waitlist. Flow:
1. User fills name/email/country → `POST /functions/v1/create-checkout`
2. Edge Function creates a `pending` row in `public.payments` (amount: 100 USD cents), creates a Stripe Checkout Session
3. User is redirected to Stripe, pays $1
4. Stripe redirects back with `?payment=success` or `?payment=cancelled`
5. Stripe webhook (`/functions/v1/stripe-webhook`) confirms payment → marks `completed` → inserts into `public.waitlist` (with country)

**Edge Functions:**
- `create-checkout` (verify_jwt: false) — creates Stripe session + payment record
- `stripe-webhook` (verify_jwt: false) — verifies webhook sig, marks paid, adds to waitlist
- `send-welcome-email` (verify_jwt: false) — sends welcome email via Resend; called via DB trigger on waitlist INSERT

**Required secrets** (set via Supabase Dashboard → Edge Functions → Secrets):
- `STRIPE_SECRET_KEY` — Stripe secret key (starts with `sk_live_` or `sk_test_`)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret (starts with `whsec_`)
- `RESEND_API_KEY` — Resend API key for welcome emails

**Stripe webhook endpoint:** `https://hvynpslokgslpmekqwmg.supabase.co/functions/v1/stripe-webhook`
Listen for: `checkout.session.completed`

**Database:** `public.payments` (id, email, name, country, stripe_session_id, stripe_payment_intent_id, amount default 100, currency, status, created_at, completed_at)

### Waitlist (Supabase)
The `public.waitlist` table (id, name, email, country, created_at) is populated by the `stripe-webhook` Edge Function **only after payment confirms**. RLS allows insert for everyone (service_role inserts from webhook), read for admins only.

On INSERT into waitlist, a database trigger (`on_waitlist_insert`) calls `send-welcome-email` Edge Function via `pg_net`.

### Spot counter
The hero shows remaining beta spots (15 - count from waitlist). Uses Supabase REST API with `Prefer: count=exact` header, reads `content-range` header from response.

### Sample job listings
4 sample Vietnam jobs loaded dynamically from `public.jobs` table via Supabase REST API on page load.

### Color theme
Slate blue-grey (`#e8eaed` canvas) with navy (`#2a6aaa`) accent.

## Vercel deployment
- **Deploy command:** `vercel --prod --cwd website` (from root)
- Config stored in `website/vercel.json`

## SDD artifacts
SDD workflow artifacts are in `website/.specify/`.
