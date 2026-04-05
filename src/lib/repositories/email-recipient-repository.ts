import { query } from "@/lib/db";

export type EmailRecipientPreferenceRow = {
  email: string;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
};

function fields() {
  return `
    email,
    unsubscribed_at,
    created_at,
    updated_at
  `;
}

export async function findEmailRecipientPreferenceByEmail(email: string) {
  const result = await query<EmailRecipientPreferenceRow>(
    `
      SELECT ${fields()}
      FROM email_recipient_preferences
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
}

export async function upsertEmailRecipientSubscription(email: string, subscribed: boolean) {
  const result = await query<EmailRecipientPreferenceRow>(
    `
      INSERT INTO email_recipient_preferences (email, unsubscribed_at)
      VALUES ($1, CASE WHEN $2 THEN NULL ELSE NOW() END)
      ON CONFLICT (email) DO UPDATE
      SET unsubscribed_at = CASE WHEN EXCLUDED.unsubscribed_at IS NULL THEN NULL ELSE NOW() END,
          updated_at = NOW()
      RETURNING ${fields()}
    `,
    [email, subscribed]
  );

  return result.rows[0];
}
