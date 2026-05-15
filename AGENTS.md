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
5. Stripe webhook (`/functions/v1/stripe-webhook`) confirms payment → marks `completed` → inserts into `public.waitlist` (with country)

**Edge Functions:**
- `create-checkout` (verify_jwt: false) — creates Stripe session + payment record
- `stripe-webhook` (verify_jwt: false) — verifies webhook sig, marks paid, adds to waitlist
- `send-welcome-email` (verify_jwt: false) — sends welcome email via Resend; called via DB trigger on waitlist INSERT

**Required secrets** (set via Supabase Dashboard → Edge Functions → Secrets or `npx supabase secrets set --project-ref hvynpslokgslpmekqwmg KEY=VALUE`):
- `STRIPE_SECRET_KEY` — Stripe secret key (starts with `sk_live_` or `sk_test_`)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret (starts with `whsec_`)
- `RESEND_API_KEY` — Resend API key for welcome emails

**Important:** Resend free tier only allows sending to the account owner's email. To send to any recipient, verify a domain in Resend Dashboard and update the `from` address in `send-welcome-email` to use that domain (`hello@curric.app`).

**Stripe webhook endpoint:** `https://hvynpslokgslpmekqwmg.supabase.co/functions/v1/stripe-webhook`
Listen for: `checkout.session.completed`

**Important:** Stripe SDK v17 in Supabase Edge Runtime (Deno) requires `constructEventAsync()` — the sync `constructEvent()` fails because Deno's Web Crypto is async-only. Always use the async version.

**Database:** `public.payments` (id, email, name, country, stripe_session_id, stripe_payment_intent_id, amount default 199, currency, status, created_at, completed_at)

### Waitlist (Supabase)
The `public.waitlist` table (id, name, email, country, created_at) is populated by the `stripe-webhook` Edge Function **only after payment confirms**. RLS allows insert for everyone (service_role inserts from webhook), read for admins only.

On INSERT into waitlist, a database trigger (`on_waitlist_insert`) calls `send-welcome-email` Edge Function via `pg_net`.

### Spot counter
The hero shows remaining beta spots (15 - count from waitlist). Uses Supabase REST API with `Prefer: count=exact` header, reads `content-range` header from response.

### Sample job listings
4 sample Vietnam jobs loaded dynamically from `public.jobs` table via Supabase REST API on page load.

### Color theme
Slate blue-grey (`#e8eaed` canvas) with navy (`#2a6aaa`) accent.

## Security
Supabase URL and anon key are NOT hardcoded in JS. They're stored as **Vercel Environment Variables** and injected at build time:
1. `config.template.js` has `__SUPABASE_URL__` and `__SUPABASE_ANON_KEY__` placeholders
2. Vercel build runs `cp config.template.js config.js && sed` to substitute real values
3. `config.js` is gitignored — not tracked in the repo
4. `main.js` reads from `window.__CURRIC_CONFIG__`

Vercel env vars to set:
- `SUPABASE_URL` — `https://hvynpslokgslpmekqwmg.supabase.co`
- `SUPABASE_ANON_KEY` — the anon key

## Vercel deployment
- **Deploy command:** `vercel --prod --cwd website` (from root)
- Config stored in `website/vercel.json`

## Production hardening (completed May 2026)

| Area | Fix | Details |
|------|-----|---------|
| **RLS** | Removed public read/insert on `waitlist` & `payments` | Anon key can no longer leak signup emails or insert fake payments |
| **RLS** | Admin read policy restricted to `auth.role() = 'service_role'` | Only service_role can read waitlist data |
| **Grants** | Revoked DELETE/UPDATE/TRUNCATE on `waitlist` & `payments` from anon | Defense in depth against future RLS policy mistakes |
| **CORS** | All 4 edge functions restricted to `https://curric.app` | No origin echo, no `*` fallback |
| **CSP** | Content-Security-Policy, X-Frame-Options, HSTS, etc. in `vercel.json` | Mitigates XSS, clickjacking, MIME sniffing |
| **Rate limiting** | Method restrictions on all functions | spot-count GET-only, stripe-webhook POST-only, etc. |
| **Error handling** | stripe-webhook returns 500 on DB failure | Stripe retries instead of silently dropping payments |
| **Error handling** | create-checkout has try/catch on Stripe calls | Orphaned pending records marked as `failed` |
| **Idempotency** | create-checkout deduplicates by email | No duplicate payment records for same email |
| **spot-count** | Uses `count: exact, head: true` instead of fetching rows | Efficient, no data leak |
| **JS bugs** | Smooth scroll crash fixed, sessionStorage for payment state, Escape key for nav, CSS class for active nav link | Various edge cases handled |
| **Security headers** | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy | All set via `vercel.json` |

## Known bugs and fixes (don't repeat these)

| Bug | Root cause | Fix |
|-----|------------|-----|
| **Webhook 400 — signature mismatch** | `STRIPE_WEBHOOK_SECRET` in Supabase didn't match Stripe Dashboard. Also, sync `constructEvent()` doesn't work in Deno (async Web Crypto). | Set correct secret from Stripe Dashboard. Use `constructEventAsync()` instead of `constructEvent()`. |
| **Welcome email not sending** | `send-welcome-email` was a placeholder with `// TODO` — no email service wired up | Implemented Resend sending in `send-welcome-email`; set `RESEND_API_KEY` secret |
| **Spot counter stuck** | Supabase REST query used invalid syntax `?id=select:count&limit=0` instead of counting via `Prefer: count=exact` + `content-range` header | Rewrote query to use `?select=id&limit=1` with `Prefer: count=exact`, parse count from response header |
| **DB trigger broken** | `handle_new_waitlist()` called `net.http_post()` with `headers` as `text` (cast with `::text`) but `pg_net` expects `jsonb` | Changed headers parameter from `::text` cast to raw `jsonb` object |
| **Webhook missing country** | `stripe-webhook` only inserted `email` and `name` into waitlist, dropped the `country` field | Webhook now fetches `country` from payments table before upserting into waitlist |
| **Supabase client not loading** | `main.js` expected global `supabaseClient` but CDN exposes `supabase` with `createClient` method | Switched from client library to direct REST `fetch()` calls — simpler and more reliable |
| **Price was $1.99 not $1** | `create-checkout` used 199 cents ($1.99) but user wanted $1 | Changed `unit_amount` to 100 cents, later reverted back to 199 at user request |
| **Vercel SUPABASE_URL was 'y'** | `echo y | vercel env add` piped the confirmation `y` as the actual value | Deleted and re-added env var with correct URL |
| **Spot counter still stuck after RLS fix** | `Content-Range` header not exposed via CORS — browser JS can't read it | Switched to dedicated `spot-count` edge function (uses service_role key, proper CORS headers) |
| **Welcome email not sending to new signups** | Resend free tier only allows sending to the account owner's email | Verified `curric.app` domain in Resend; changed `from` to `hello@curric.app` |

## SDD artifacts
SDD workflow artifacts are in `website/.specify/`.
