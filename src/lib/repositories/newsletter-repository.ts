import { query } from "@/lib/db";

export type NewsletterSubscriberRow = {
  id: string;
  email: string;
  source: string;
  last_source: string;
  unsubscribed_at: string | null;
  welcome_email_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

function subscriberFields() {
  return `
    id,
    email,
    source,
    last_source,
    unsubscribed_at,
    welcome_email_sent_at,
    created_at,
    updated_at
  `;
}

export async function findNewsletterSubscriberByEmail(email: string) {
  const result = await query<NewsletterSubscriberRow>(
    `
      SELECT ${subscriberFields()}
      FROM newsletter_subscribers
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
}

export async function findNewsletterSubscriberById(id: string) {
  const result = await query<NewsletterSubscriberRow>(
    `
      SELECT ${subscriberFields()}
      FROM newsletter_subscribers
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function insertNewsletterSubscriberRecord(input: {
  id: string;
  email: string;
  source: string;
}) {
  const result = await query<NewsletterSubscriberRow>(
    `
      INSERT INTO newsletter_subscribers (id, email, source, last_source)
      VALUES ($1, $2, $3, $3)
      RETURNING ${subscriberFields()}
    `,
    [input.id, input.email, input.source]
  );

  return result.rows[0];
}

export async function updateNewsletterSubscriberSource(id: string, source: string) {
  const result = await query<NewsletterSubscriberRow>(
    `
      UPDATE newsletter_subscribers
      SET last_source = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING ${subscriberFields()}
    `,
    [id, source]
  );

  return result.rows[0] ?? null;
}

export async function updateNewsletterSubscriberSubscription(id: string, subscribed: boolean) {
  const result = await query<NewsletterSubscriberRow>(
    `
      UPDATE newsletter_subscribers
      SET unsubscribed_at = CASE WHEN $2 THEN NULL ELSE NOW() END,
          updated_at = NOW()
      WHERE id = $1
      RETURNING ${subscriberFields()}
    `,
    [id, subscribed]
  );

  return result.rows[0] ?? null;
}

export async function updateNewsletterSubscriberSubscriptionByEmail(email: string, subscribed: boolean) {
  const result = await query<NewsletterSubscriberRow>(
    `
      UPDATE newsletter_subscribers
      SET unsubscribed_at = CASE WHEN $2 THEN NULL ELSE NOW() END,
          updated_at = NOW()
      WHERE email = $1
      RETURNING ${subscriberFields()}
    `,
    [email, subscribed]
  );

  return result.rows[0] ?? null;
}

export async function markNewsletterWelcomeEmailSent(id: string) {
  await query(
    `
      UPDATE newsletter_subscribers
      SET welcome_email_sent_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
    `,
    [id]
  );
}
