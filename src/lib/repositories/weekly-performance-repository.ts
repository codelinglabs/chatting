import { query } from "@/lib/db";
import { normalizeTimeZone } from "@/lib/timezones";

export type WeeklyPerformanceRecipientRow = {
  user_id: string;
  owner_user_id: string;
  workspace_role: "owner" | "admin" | "member";
  email: string;
  notification_email: string | null;
  first_name: string | null;
  recipient_timezone: string | null;
  team_timezone: string | null;
  team_name: string | null;
  weekly_report_enabled: boolean;
  weekly_report_send_hour: number;
  weekly_report_send_minute: number;
  weekly_report_include_personal_stats: boolean;
  workspace_weekly_reports_enabled: boolean;
  workspace_include_team_leaderboard: boolean;
  workspace_ai_insights_enabled: boolean;
  widget_installed: boolean;
};

export type WeeklyPerformanceWorkspaceRow = {
  owner_user_id: string;
  team_timezone: string | null;
  team_name: string | null;
  workspace_include_team_leaderboard: boolean;
  workspace_ai_insights_enabled: boolean;
  widget_installed: boolean;
};

export async function listWeeklyPerformanceRecipientRows() {
  const result = await query<WeeklyPerformanceRecipientRow>(
    `
      WITH recipients AS (
        SELECT
          u.id AS user_id,
          u.id AS owner_user_id,
          'owner'::text AS workspace_role
        FROM users u
        WHERE EXISTS (
          SELECT 1
          FROM sites owned_site
          WHERE owned_site.user_id = u.id
        )

        UNION ALL

        SELECT
          tm.member_user_id AS user_id,
          tm.owner_user_id,
          tm.role::text AS workspace_role
        FROM team_memberships tm
        WHERE tm.status = 'active'
      )
      SELECT
        r.user_id,
        r.owner_user_id,
        r.workspace_role::text AS workspace_role,
        u.email,
        us.notification_email,
        us.first_name,
        COALESCE(
          NULLIF(us.timezone, ''),
          NULLIF(primary_site.operating_hours_timezone, '')
        ) AS recipient_timezone,
        NULLIF(primary_site.operating_hours_timezone, '') AS team_timezone,
        primary_site.name AS team_name,
        COALESCE(us.weekly_report_enabled, TRUE) AS weekly_report_enabled,
        GREATEST(0, LEAST(COALESCE(us.weekly_report_send_hour, 9), 23)) AS weekly_report_send_hour,
        GREATEST(0, LEAST(COALESCE(us.weekly_report_send_minute, 0), 59)) AS weekly_report_send_minute,
        COALESCE(us.weekly_report_include_personal_stats, TRUE) AS weekly_report_include_personal_stats,
        COALESCE(wrs.weekly_reports_enabled, TRUE) AS workspace_weekly_reports_enabled,
        COALESCE(wrs.include_team_leaderboard, TRUE) AS workspace_include_team_leaderboard,
        COALESCE(wrs.ai_insights_enabled, TRUE) AS workspace_ai_insights_enabled,
        EXISTS (
          SELECT 1
          FROM sites installed_site
          WHERE installed_site.user_id = r.owner_user_id
            AND (
              installed_site.widget_install_verified_at IS NOT NULL
              OR installed_site.widget_last_seen_at IS NOT NULL
              OR EXISTS (
                SELECT 1
                FROM conversations c
                WHERE c.site_id = installed_site.id
              )
            )
        ) AS widget_installed
      FROM recipients r
      INNER JOIN users u
        ON u.id = r.user_id
      LEFT JOIN user_settings us
        ON us.user_id = r.user_id
      LEFT JOIN workspace_report_settings wrs
        ON wrs.owner_user_id = r.owner_user_id
      LEFT JOIN LATERAL (
        SELECT s.name, s.operating_hours_timezone
        FROM sites s
        WHERE s.user_id = r.owner_user_id
        ORDER BY s.created_at ASC
        LIMIT 1
      ) primary_site ON TRUE
      WHERE u.email_verified_at IS NOT NULL
        AND COALESCE(us.weekly_report_enabled, TRUE)
        AND COALESCE(wrs.weekly_reports_enabled, TRUE)
      ORDER BY r.owner_user_id ASC, r.user_id ASC
    `
  );

  return result.rows.map((row) => ({
    ...row,
    recipient_timezone: normalizeTimeZone(row.recipient_timezone),
    team_timezone: normalizeTimeZone(row.team_timezone)
  }));
}

export async function listWeeklyPerformanceWorkspaceRows() {
  const result = await query<WeeklyPerformanceWorkspaceRow>(
    `
      SELECT
        owner_user.id AS owner_user_id,
        NULLIF(primary_site.operating_hours_timezone, '') AS team_timezone,
        primary_site.name AS team_name,
        COALESCE(wrs.include_team_leaderboard, TRUE) AS workspace_include_team_leaderboard,
        COALESCE(wrs.ai_insights_enabled, TRUE) AS workspace_ai_insights_enabled,
        EXISTS (
          SELECT 1
          FROM sites installed_site
          WHERE installed_site.user_id = owner_user.id
            AND (
              installed_site.widget_install_verified_at IS NOT NULL
              OR installed_site.widget_last_seen_at IS NOT NULL
              OR EXISTS (
                SELECT 1
                FROM conversations c
                WHERE c.site_id = installed_site.id
              )
            )
        ) AS widget_installed
      FROM users owner_user
      INNER JOIN sites owned_site
        ON owned_site.user_id = owner_user.id
      LEFT JOIN workspace_report_settings wrs
        ON wrs.owner_user_id = owner_user.id
      LEFT JOIN LATERAL (
        SELECT s.name, s.operating_hours_timezone
        FROM sites s
        WHERE s.user_id = owner_user.id
        ORDER BY s.created_at ASC
        LIMIT 1
      ) primary_site ON TRUE
      WHERE COALESCE(wrs.weekly_reports_enabled, TRUE)
      GROUP BY owner_user.id, primary_site.name, primary_site.operating_hours_timezone, wrs.include_team_leaderboard, wrs.ai_insights_enabled
      ORDER BY owner_user.id ASC
    `
  );

  return result.rows.map((row) => ({
    ...row,
    team_timezone: normalizeTimeZone(row.team_timezone)
  }));
}

export async function hasWeeklyPerformanceDelivery(
  userId: string,
  ownerUserId: string,
  weekStart: string
) {
  const result = await query<{ user_id: string }>(
    `
      SELECT user_id
      FROM weekly_performance_deliveries
      WHERE user_id = $1
        AND owner_user_id = $2
        AND week_start = $3::date
      LIMIT 1
    `,
    [userId, ownerUserId, weekStart]
  );

  return Boolean(result.rowCount);
}

export async function insertWeeklyPerformanceDelivery(
  userId: string,
  ownerUserId: string,
  weekStart: string
) {
  await query(
    `
      INSERT INTO weekly_performance_deliveries (user_id, owner_user_id, week_start)
      VALUES ($1, $2, $3::date)
      ON CONFLICT (user_id, owner_user_id, week_start) DO NOTHING
    `,
    [userId, ownerUserId, weekStart]
  );
}
