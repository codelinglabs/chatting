import { query } from "@/lib/db";
import { normalizeTimeZone } from "@/lib/timezones";

export type EmailReportRecipientRow = {
  user_id: string;
  owner_user_id: string;
  email: string;
  notification_email: string | null;
  timezone: string | null;
};

export async function listEmailReportRecipientRows() {
  const result = await query<EmailReportRecipientRow>(
    `
      WITH recipients AS (
        SELECT
          u.id AS user_id,
          u.id AS owner_user_id
        FROM users u
        WHERE EXISTS (
          SELECT 1
          FROM sites owned_site
          WHERE owned_site.user_id = u.id
        )

        UNION ALL

        SELECT
          tm.member_user_id AS user_id,
          tm.owner_user_id
        FROM team_memberships tm
        WHERE tm.status = 'active'
      )
      SELECT
        r.user_id,
        r.owner_user_id,
        u.email,
        us.notification_email,
        COALESCE(
          NULLIF(us.timezone, ''),
          NULLIF(primary_site.operating_hours_timezone, '')
        ) AS timezone
      FROM recipients r
      INNER JOIN users u
        ON u.id = r.user_id
      LEFT JOIN user_settings us
        ON us.user_id = u.id
      LEFT JOIN LATERAL (
        SELECT s.operating_hours_timezone
        FROM sites s
        WHERE s.user_id = r.owner_user_id
        ORDER BY s.created_at ASC
        LIMIT 1
      ) primary_site ON TRUE
      WHERE COALESCE(us.email_notifications, TRUE)
        AND EXISTS (
          SELECT 1
          FROM sites s
          WHERE s.user_id = r.owner_user_id
        )
      ORDER BY r.owner_user_id ASC, r.user_id ASC
    `
  );

  return result.rows.map((row) => ({
    ...row,
    timezone: normalizeTimeZone(row.timezone)
  }));
}
