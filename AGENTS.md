# RecruRep

Landing page for a SaaS that lets non-native English teachers apply to teaching jobs abroad with one click. Built with AI-powered job matching, global job feed, and one-click applications.

## website/ — Landing Page

**Stack:** Vanilla HTML5, CSS3, ES6+. No frameworks, no build step.

**To preview:** Open `website/index.html` in a browser.

### Payments (Stripe + Supabase)
Users pay $1 via Stripe Checkout before being added to the waitlist. Flow:
1. User fills name/email/country → `POST /functions/v1/create-checkout`
2. Edge Function creates a `pending` row in `public.payments`, creates a Stripe Checkout Session
3. User is redirected to Stripe, pays $1
4. Stripe redirects back with `?payment=success` or `?payment=cancelled`
5. Stripe webhook (`/functions/v1/stripe-webhook`) confirms payment → marks `completed` → inserts into `public.waitlist`

**Edge Functions** (both `verify_jwt: false`):
- `create-checkout` — creates Stripe session + payment record
- `stripe-webhook` — verifies webhook sig, marks paid, adds to waitlist

**Required secrets** (set via Supabase Dashboard → Edge Functions → Secrets):
- `STRIPE_SECRET_KEY` — Stripe secret key (starts with `sk_live_` or `sk_test_`)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret (starts with `whsec_`)

**Stripe webhook endpoint:** `https://hvynpslokgslpmekqwmg.supabase.co/functions/v1/stripe-webhook`
Listen for: `checkout.session.completed`

**Database:** `public.payments` (id, email, name, country, stripe_session_id, stripe_payment_intent_id, amount, currency, status, created_at, completed_at)

### Waitlist (Supabase)
The waitlist table (`public.waitlist` with columns: `id`, `name`, `email`, `country`, `created_at`) is populated by the `stripe-webhook` Edge Function after payment confirms. RLS allows insert for everyone, read for admins only.

### Color theme
Slate blue-grey (`#e8eaed` canvas) with navy (`#2a6aaa`) accent.

## SDD artifacts
SDD workflow artifacts are in `website/.specify/`.
