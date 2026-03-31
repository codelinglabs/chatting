import { query } from "@/lib/db";

export type DailyDigestRecipientRow = {
  user_id: string;
  email: string;
  notification_email: string | null;
};

export async function listDailyDigestRecipientRows() {
  const result = await query<DailyDigestRecipientRow>(
    `
      SELECT
        u.id AS user_id,
        u.email,
        us.notification_email
      FROM users u
      LEFT JOIN team_memberships tm
        ON tm.member_user_id = u.id
       AND tm.status = 'active'
      LEFT JOIN user_settings us
        ON us.user_id = u.id
      WHERE COALESCE(us.email_notifications, TRUE)
        AND EXISTS (
          SELECT 1
          FROM sites s
          WHERE s.user_id = COALESCE(tm.owner_user_id, u.id)
        )
      ORDER BY u.created_at ASC
    `
  );

  return result.rows;
}

export async function hasDailyDigestDelivery(userId: string, digestDate: string) {
  const result = await query<{ user_id: string }>(
    `
      SELECT user_id
      FROM daily_digest_deliveries
      WHERE user_id = $1
        AND digest_date = $2::date
      LIMIT 1
    `,
    [userId, digestDate]
  );

  return Boolean(result.rowCount);
}

export async function insertDailyDigestDelivery(userId: string, digestDate: string) {
  await query(
    `
      INSERT INTO daily_digest_deliveries (user_id, digest_date)
      VALUES ($1, $2::date)
      ON CONFLICT (user_id, digest_date) DO NOTHING
    `,
    [userId, digestDate]
  );
}
