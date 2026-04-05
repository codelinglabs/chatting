import { query } from "@/lib/db";
import { normalizeTimeZone } from "@/lib/timezones";

export type DashboardReportSettingsRow = {
  weekly_report_enabled: boolean | null;
  weekly_report_send_hour: number | null;
  weekly_report_send_minute: number | null;
  weekly_report_include_personal_stats: boolean | null;
  weekly_reports_enabled: boolean | null;
  include_team_leaderboard: boolean | null;
  ai_insights_enabled: boolean | null;
  recipient_timezone: string | null;
  team_timezone: string | null;
};

export async function findDashboardReportSettingsRow(userId: string, ownerUserId: string) {
  const result = await query<DashboardReportSettingsRow>(
    `
      SELECT
        us.weekly_report_enabled,
        us.weekly_report_send_hour,
        us.weekly_report_send_minute,
        us.weekly_report_include_personal_stats,
        wrs.weekly_reports_enabled,
        wrs.include_team_leaderboard,
        wrs.ai_insights_enabled,
        COALESCE(
          NULLIF(us.timezone, ''),
          NULLIF(primary_site.operating_hours_timezone, '')
        ) AS recipient_timezone,
        NULLIF(primary_site.operating_hours_timezone, '') AS team_timezone
      FROM users u
      LEFT JOIN user_settings us
        ON us.user_id = u.id
      LEFT JOIN workspace_report_settings wrs
        ON wrs.owner_user_id = $2
      LEFT JOIN LATERAL (
        SELECT s.operating_hours_timezone
        FROM sites s
        WHERE s.user_id = $2
        ORDER BY s.created_at ASC
        LIMIT 1
      ) primary_site ON TRUE
      WHERE u.id = $1
      LIMIT 1
    `,
    [userId, ownerUserId]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return {
    ...row,
    recipient_timezone: normalizeTimeZone(row.recipient_timezone),
    team_timezone: normalizeTimeZone(row.team_timezone)
  };
}

export async function upsertDashboardReportUserSettings(input: {
  userId: string;
  weeklyReportEnabled: boolean;
  weeklyReportSendHour: number;
  weeklyReportSendMinute: number;
  weeklyReportIncludePersonalStats: boolean;
}) {
  await query(
    `
      INSERT INTO user_settings (
        user_id,
        weekly_report_enabled,
        weekly_report_send_hour,
        weekly_report_send_minute,
        weekly_report_include_personal_stats,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        weekly_report_enabled = EXCLUDED.weekly_report_enabled,
        weekly_report_send_hour = EXCLUDED.weekly_report_send_hour,
        weekly_report_send_minute = EXCLUDED.weekly_report_send_minute,
        weekly_report_include_personal_stats = EXCLUDED.weekly_report_include_personal_stats,
        updated_at = NOW()
    `,
    [
      input.userId,
      input.weeklyReportEnabled,
      input.weeklyReportSendHour,
      input.weeklyReportSendMinute,
      input.weeklyReportIncludePersonalStats
    ]
  );
}

export async function upsertWorkspaceReportSettings(input: {
  ownerUserId: string;
  weeklyReportsEnabled: boolean;
  includeTeamLeaderboard: boolean;
  aiInsightsEnabled: boolean;
}) {
  await query(
    `
      INSERT INTO workspace_report_settings (
        owner_user_id,
        weekly_reports_enabled,
        include_team_leaderboard,
        ai_insights_enabled,
        updated_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (owner_user_id) DO UPDATE SET
        weekly_reports_enabled = EXCLUDED.weekly_reports_enabled,
        include_team_leaderboard = EXCLUDED.include_team_leaderboard,
        ai_insights_enabled = EXCLUDED.ai_insights_enabled,
        updated_at = NOW()
    `,
    [
      input.ownerUserId,
      input.weeklyReportsEnabled,
      input.includeTeamLeaderboard,
      input.aiInsightsEnabled
    ]
  );
}
