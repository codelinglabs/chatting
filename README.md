# Chatting

Async team chat for high-intent visitors. This MVP gives each SaaS account:

- An embeddable widget loaded with `<script src="https://yourapp.com/widget.js" data-site-id="xxx"></script>`
- Per-account authentication with owned sites and isolated inbox data
- Postgres-backed message capture with page URL, referrer, user agent, email, and session tracking
- A team inbox to read threads, tag conversations, and reply by email
- Email-based thread continuation with a webhook endpoint for inbound replies
- Helpful / not helpful feedback capture after each team reply

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Postgres via `pg`
- Amazon SES for outbound email and inbound reply threading

## Recent Updates

- Forced schema reinitialization for the visitor-presence rollout so existing processes stop hitting missing-table errors.
- Added an internal Chatting distribution playbook markdown file under `app/` for growth-channel planning and launch copy.
- Added dashboard growth insights for activation, workspace health, and expansion signals on the home view.
- Added scheduled lifecycle growth nudges for activation, health, and upgrade reminders without running email checks on widget requests.
- Added seat-based `Starter / Growth / Pro` packaging with annual pricing, proactive-chat gating, and 7-day trial extensions for active workspaces.
- Tightened the social content generator rules around lowercase output, Chatting branding, and the canonical site URL.
- Removed the visible onboarding step counts to keep setup screens cleaner.
- Split the dashboard home into focused modules and cleaned up empty-state conversation actions.
- Added referral links, signup attribution, and referral reward tracking in billing.
- Added recurring affiliate commission ledger entries tied to paid billing activity.
- Redesigned the public landing, login, and signup flows around the new Chatting brand.
- Added a guided onboarding flow for widget customization, installation, and verification.
- Shipped the embeddable widget runtime, public conversation APIs, and live conversation plumbing.
- Rebuilt the dashboard into modular inbox, visitors, analytics, settings, team, and widget surfaces.
- Added repo guidance, product notes, and design system references for contributors.

## 🚀 Key Modules

### Public Site & Auth

- Editorial landing page with modular sections and brand-aligned auth entry flows.
- Dedicated login and signup screens with shared form controls, referral-code signup support, and direct onboarding handoff.

### Onboarding

- Post-signup setup flow for widget customization, install verification, and completion.
- Setup screens now rely on the dot progress indicator without repeating step-count copy.
- Live verification state that surfaces the actual site URL the widget was detected on.

### Widget & Public APIs

- Embeddable widget with optimistic sending, typing, conversation polling, and install detection.
- Public API endpoints for conversation messages, status, typing, site config, and attachments.

### Dashboard

- Shared dashboard shell with focused pages for inbox, visitors, analytics, team, settings, and widget setup.
- Dashboard home now uses dedicated metrics, recent-conversations, and sidebar modules with cleaner empty states.
- Dashboard home now surfaces activation, health, and expansion growth signals for the workspace.
- Optimistic inbox interactions for replies and tags, plus modularized page components throughout.

### Billing & Operations

- Stripe-backed billing flows for checkout, portal access, invoice sync, and webhook handling.
- Scheduled lifecycle nudges now deliver activation, health, and upgrade reminders from the node runtime instead of widget pageviews.
- Schema version bumps now rerun auto-initialized Postgres setup during visitor-presence rollouts so existing processes do not miss new tables.
- Seat-based `Growth` and `Pro` billing with monthly/annual pricing, plan-aware widget gating, and trial-extension support for active workspaces.
- Referral programs with per-workspace codes and paid-conversion reward tracking in billing settings.
- Affiliate commission ledger visibility tied to paid billing activity.
- Cloudflare R2-backed team photo uploads for widget presentation.
- Vitest-based app test suite covering routes, pages, helpers, onboarding, widget flows, and billing.

### Contributor Docs

- Repo agent guidance, product context, and design-system reference docs live alongside the codebase.
- The social content generator now enforces lowercase output, `https://usechatting.com`, and Chatting-first branding.
- The app now includes an internal Chatting distribution playbook markdown file for channel planning and launch messaging.

## Ops Note

- Vercel is currently connected through the personal GitHub account.
- The production Postgres database is hosted on Neon.
- Neon is currently managed from the Letterflow account `tina@letterflow.so`.
- This is only an account-ownership note. Runtime config still comes from environment variables.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` if you are not using an attached IAM role
- `MAIL_FROM`
- `REPLY_DOMAIN` and `SES_INBOUND_SNS_TOPIC_ARN` if you want inbound email replies to continue threads
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_BASE_URL` if you want real uploaded team photos in the widget
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_GROWTH_MONTHLY`, `STRIPE_PRICE_GROWTH_ANNUAL`, `STRIPE_PRICE_PRO_MONTHLY`, and `STRIPE_PRICE_PRO_ANNUAL` if you want real Stripe-backed billing

Paid Stripe prices should be configured as graduated tiers so seats 1-5 bill at the plan rate and seats 6+ bill at the lower overflow rate.

3. Start the app:

```bash
npm run dev
```

Run the test suite:

```bash
npm test
```

Generate coverage:

```bash
npm run test:coverage
```

The app auto-creates the MVP tables on first request.

For live billing, point Stripe webhooks at:

```text
POST /api/stripe/webhook
```

For local testing, the easiest setup is:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Account Auth

- URL: `/login`
- Create an account with email + password
- The app creates your first site automatically
- Each site gets its own `data-site-id` snippet inside `/dashboard`

## Widget Snippet

```html
<script
  src="http://localhost:3983/widget.js"
  data-site-id="your-site-id"
  data-brand-color="#0f766e"
  data-greeting="Ask us anything before you bounce"
></script>
```

Optional attributes:

- `data-brand-color`
- `data-greeting`
- `data-position`
- `data-api-base`

## Email Setup

Outbound email and inbound reply threading both use Amazon SES.

- founder replies set `Reply-To` to `reply+<conversationId>@<REPLY_DOMAIN>`
- SES receives that inbound reply and sends an SNS notification to `POST /api/email/inbound`

## Inbound Email Webhook

Configure an SNS HTTPS subscription to deliver to:

```text
POST /api/email/inbound
```

The outbound email sets `reply-to` as `reply+<conversationId>@<REPLY_DOMAIN>`. The inbound route extracts the `conversationId` from that alias and appends the reply to the correct thread.

Recommended setup:

1. Verify `MAIL_FROM` in Amazon SES and move the SES account out of sandbox if you need to send to unverified recipients.
2. Create an SES receipt rule for the domain or subdomain used in `REPLY_DOMAIN`.
3. Add an SNS action to that receipt rule and configure it to include UTF-8 email content.
4. Subscribe `POST /api/email/inbound` to that SNS topic.
5. Set `SES_INBOUND_SNS_TOPIC_ARN` to that SNS topic ARN.
6. Set `REPLY_DOMAIN` to the SES-receiving domain you want to use for `reply+<conversationId>@...`.

The inbound route now:

- verifies SNS signatures
- auto-confirms SNS subscription requests
- handles SES `Received` notifications
- parses raw MIME email content with `mailparser`
- strips common quoted reply blocks before saving the new user message
