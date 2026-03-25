# Chatly

Async founder chat for high-intent visitors. This MVP gives each SaaS account:

- An embeddable widget loaded with `<script src="https://yourapp.com/widget.js" data-site-id="xxx"></script>`
- Per-account authentication with owned sites and isolated inbox data
- Postgres-backed message capture with page URL, referrer, user agent, email, and session tracking
- A founder inbox to read threads, tag conversations, and reply by email
- Email-based thread continuation with a webhook endpoint for inbound replies
- Helpful / not helpful feedback capture after each founder reply

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Postgres via `pg`
- Resend for outbound email and inbound reply threading

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `MAIL_FROM`
- `REPLY_DOMAIN` if you want inbound email replies to continue threads

3. Start the app:

```bash
npm run dev
```

The app auto-creates the MVP tables on first request.

## Account Auth

- URL: `/login`
- Create an account with email + password
- The app creates your first site automatically
- Each site gets its own `data-site-id` snippet inside `/dashboard`

## Widget Snippet

```html
<script
  src="http://localhost:3000/widget.js"
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

## Inbound Email Webhook

Configure a Resend webhook to deliver to:

```text
POST /api/email/inbound
```

The outbound email sets `reply-to` as `reply+<conversationId>@<REPLY_DOMAIN>`. The inbound route extracts the `conversationId` from that alias and appends the reply to the correct thread.

Recommended Resend setup:

1. Add a verified sending domain in Resend for `MAIL_FROM`.
2. Set up a Resend receiving domain or use the Resend-managed `*.resend.app` receiving domain.
3. Add a webhook for `email.received` pointing to `POST /api/email/inbound`.
4. Copy the webhook signing secret into `RESEND_WEBHOOK_SECRET`.
5. Set `REPLY_DOMAIN` to the receiving domain you want to use for `reply+<conversationId>@...`.

The inbound route now:

- verifies Resend webhook signatures
- handles `email.received` events
- fetches the full received email body with the Resend Receiving API
- strips common quoted reply blocks before saving the new user message

Official docs:

- [Send Email](https://resend.com/docs/api-reference/emails)
- [Receiving Emails](https://resend.com/docs/dashboard/receiving/introduction)
- [Retrieve Received Email](https://resend.com/docs/api-reference/emails/retrieve-received-email)
- [Verify Webhook Requests](https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests)
