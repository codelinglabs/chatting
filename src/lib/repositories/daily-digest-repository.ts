import { query } from "@/lib/db";
import { listEmailReportRecipientRows } from "@/lib/email-report-timezone";

export async function listDailyDigestRecipientRows() {
  return listEmailReportRecipientRows();
}

export async function claimDailyDigestDelivery(userId: string, ownerUserId: string, digestDate: string) {
  const result = await query<{ claimed: number }>(
    `
      INSERT INTO daily_digest_deliveries (user_id, owner_user_id, digest_date)
      VALUES ($1, $2, $3::date)
      ON CONFLICT (user_id, owner_user_id, digest_date) DO NOTHING
      RETURNING 1 AS claimed
    `,
    [userId, ownerUserId, digestDate]
  );

  return Boolean(result.rowCount);
}

export async function releaseDailyDigestDelivery(userId: string, ownerUserId: string, digestDate: string) {
  await query(
    `
      DELETE FROM daily_digest_deliveries
      WHERE user_id = $1
        AND owner_user_id = $2
        AND digest_date = $3::date
    `,
    [userId, ownerUserId, digestDate]
  );
}
