import { query } from "@/lib/db";

export type WeeklyPerformanceRecipientRow = {
  user_id: string;
  email: string;
  notification_email: string | null;
};

export async function listWeeklyPerformanceRecipientRows() {
  const result = await query<WeeklyPerformanceRecipientRow>(
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

export async function hasWeeklyPerformanceDelivery(userId: string, weekStart: string) {
  const result = await query<{ user_id: string }>(
    `
      SELECT user_id
      FROM weekly_performance_deliveries
      WHERE user_id = $1
        AND week_start = $2::date
      LIMIT 1
    `,
    [userId, weekStart]
  );

  return Boolean(result.rowCount);
}

export async function insertWeeklyPerformanceDelivery(userId: string, weekStart: string) {
  await query(
    `
      INSERT INTO weekly_performance_deliveries (user_id, week_start)
      VALUES ($1, $2::date)
      ON CONFLICT (user_id, week_start) DO NOTHING
    `,
    [userId, weekStart]
  );
}
