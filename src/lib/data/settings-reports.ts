import type { DashboardSettingsReports, UpdateDashboardSettingsReportsInput } from "@/lib/data/settings-types";
import type { DashboardReportSettingsRow } from "@/lib/repositories/report-settings-repository";
import {
  clampWeeklyReportSendHour,
  clampWeeklyReportSendMinute,
  formatWeeklyReportSendTime,
  parseWeeklyReportSendTime
} from "@/lib/weekly-report-send-time";

export function defaultDashboardSettingsReports(): DashboardSettingsReports {
  return {
    weeklyReportEnabled: true,
    weeklyReportSendTime: formatWeeklyReportSendTime(9, 0),
    weeklyReportIncludePersonalStats: true,
    workspaceWeeklyReportsEnabled: true,
    workspaceIncludeTeamLeaderboard: true,
    workspaceAiInsightsEnabled: true,
    canManageWorkspaceReports: false,
    recipientTimeZone: null,
    teamTimeZone: null
  };
}

export function mapDashboardSettingsReports(
  row: DashboardReportSettingsRow | null,
  canManageWorkspaceReports: boolean
): DashboardSettingsReports {
  const fallback = defaultDashboardSettingsReports();
  if (!row) {
    return { ...fallback, canManageWorkspaceReports };
  }

  return {
    weeklyReportEnabled: row.weekly_report_enabled ?? true,
    weeklyReportSendTime: formatWeeklyReportSendTime(
      clampWeeklyReportSendHour(row.weekly_report_send_hour),
      clampWeeklyReportSendMinute(row.weekly_report_send_minute)
    ),
    weeklyReportIncludePersonalStats: row.weekly_report_include_personal_stats ?? true,
    workspaceWeeklyReportsEnabled: row.weekly_reports_enabled ?? true,
    workspaceIncludeTeamLeaderboard: row.include_team_leaderboard ?? true,
    workspaceAiInsightsEnabled: row.ai_insights_enabled ?? true,
    canManageWorkspaceReports,
    recipientTimeZone: row.recipient_timezone,
    teamTimeZone: row.team_timezone
  };
}

export function normalizeDashboardSettingsReports(
  value: DashboardSettingsReports | UpdateDashboardSettingsReportsInput | null | undefined
): DashboardSettingsReports {
  const fallback = defaultDashboardSettingsReports();
  if (!value) {
    return fallback;
  }

  const parsedSendTime =
    typeof value.weeklyReportSendTime === "string"
      ? parseWeeklyReportSendTime(value.weeklyReportSendTime)
      : null;

  return {
    ...fallback,
    weeklyReportSendTime:
      parsedSendTime != null
        ? formatWeeklyReportSendTime(parsedSendTime.hour, parsedSendTime.minute)
        : fallback.weeklyReportSendTime,
    weeklyReportEnabled:
      typeof value.weeklyReportEnabled === "boolean"
        ? value.weeklyReportEnabled
        : fallback.weeklyReportEnabled,
    weeklyReportIncludePersonalStats:
      typeof value.weeklyReportIncludePersonalStats === "boolean"
        ? value.weeklyReportIncludePersonalStats
        : fallback.weeklyReportIncludePersonalStats,
    workspaceWeeklyReportsEnabled:
      typeof value.workspaceWeeklyReportsEnabled === "boolean"
        ? value.workspaceWeeklyReportsEnabled
        : fallback.workspaceWeeklyReportsEnabled,
    workspaceIncludeTeamLeaderboard:
      typeof value.workspaceIncludeTeamLeaderboard === "boolean"
        ? value.workspaceIncludeTeamLeaderboard
        : fallback.workspaceIncludeTeamLeaderboard,
    workspaceAiInsightsEnabled:
      typeof value.workspaceAiInsightsEnabled === "boolean"
        ? value.workspaceAiInsightsEnabled
        : fallback.workspaceAiInsightsEnabled,
    canManageWorkspaceReports:
      "canManageWorkspaceReports" in value && typeof value.canManageWorkspaceReports === "boolean"
        ? value.canManageWorkspaceReports
        : fallback.canManageWorkspaceReports,
    recipientTimeZone:
      "recipientTimeZone" in value && typeof value.recipientTimeZone === "string"
        ? value.recipientTimeZone
        : fallback.recipientTimeZone,
    teamTimeZone:
      "teamTimeZone" in value && typeof value.teamTimeZone === "string"
        ? value.teamTimeZone
        : fallback.teamTimeZone
  };
}

export function validateDashboardSettingsReports(input: UpdateDashboardSettingsReportsInput) {
  const normalized = normalizeDashboardSettingsReports(input);
  const sendTime = parseWeeklyReportSendTime(normalized.weeklyReportSendTime);
  return {
    weeklyReportEnabled: normalized.weeklyReportEnabled,
    weeklyReportSendHour: sendTime.hour,
    weeklyReportSendMinute: sendTime.minute,
    weeklyReportIncludePersonalStats: normalized.weeklyReportIncludePersonalStats,
    workspaceWeeklyReportsEnabled: normalized.workspaceWeeklyReportsEnabled,
    workspaceIncludeTeamLeaderboard: normalized.workspaceIncludeTeamLeaderboard,
    workspaceAiInsightsEnabled: normalized.workspaceAiInsightsEnabled
  };
}
