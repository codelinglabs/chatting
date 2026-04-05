"use client";

import type { ReactNode } from "react";
import type { DashboardSettingsReports } from "@/lib/data/settings-types";
import { Input } from "../components/ui/Input";
import { SettingsCard, SettingsSectionHeader, ToggleRow } from "./dashboard-settings-shared";

function formatTimeLabel(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return "9:00 AM";
  }

  const hour24 = Number(match[1]);
  const minute = match[2];
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute} ${suffix}`;
}

export function SettingsReportsSection({
  title,
  subtitle,
  headerActions,
  reports,
  onUpdateReports
}: {
  title: string;
  subtitle: string;
  headerActions?: ReactNode;
  reports: DashboardSettingsReports;
  onUpdateReports: <K extends keyof DashboardSettingsReports>(
    key: K,
    value: DashboardSettingsReports[K]
  ) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} actions={headerActions} />

      <SettingsCard
        title="Your weekly report"
        description={`Delivered Monday around ${formatTimeLabel(reports.weeklyReportSendTime)} in ${reports.recipientTimeZone ?? "your local timezone"}.`}
      >
        <div className="space-y-3">
          <ToggleRow
            label="Weekly performance report"
            description="Email the team-level weekly chat recap every Monday."
            checked={reports.weeklyReportEnabled}
            onChange={(value) => onUpdateReports("weeklyReportEnabled", value)}
          />
          <ToggleRow
            label="Include personal stats"
            description="Include your personal handled-conversation stats alongside the team report."
            checked={reports.weeklyReportIncludePersonalStats}
            onChange={(value) => onUpdateReports("weeklyReportIncludePersonalStats", value)}
          />
          <label className="block rounded-lg bg-slate-50 px-4 py-4">
            <span className="block text-sm font-medium text-slate-700">Send time</span>
            <span className="mt-1 block text-[13px] text-slate-500">
              Delivered in your local timezone.
            </span>
            <Input
              type="time"
              step={60}
              value={reports.weeklyReportSendTime}
              onChange={(event) => onUpdateReports("weeklyReportSendTime", event.target.value)}
              className="mt-3"
            />
          </label>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Team report defaults"
        description={
          reports.canManageWorkspaceReports
            ? `Applies across the workspace. Team timezone: ${reports.teamTimeZone ?? "UTC"}.`
            : "Only owners and admins can change team-wide weekly report defaults."
        }
      >
        <div className="space-y-3">
          <ToggleRow
            label="Enable weekly reports"
            description="Allow Chatting to send the Monday team report for this workspace."
            checked={reports.workspaceWeeklyReportsEnabled}
            onChange={(value) => onUpdateReports("workspaceWeeklyReportsEnabled", value)}
            disabled={!reports.canManageWorkspaceReports}
          />
          <ToggleRow
            label="Team leaderboard"
            description="Show the top teammate performance rows in the weekly report."
            checked={reports.workspaceIncludeTeamLeaderboard}
            onChange={(value) => onUpdateReports("workspaceIncludeTeamLeaderboard", value)}
            disabled={!reports.canManageWorkspaceReports}
          />
          <ToggleRow
            label="AI insights"
            description="Include the generated weekly insight sentence when the report has enough signal."
            checked={reports.workspaceAiInsightsEnabled}
            onChange={(value) => onUpdateReports("workspaceAiInsightsEnabled", value)}
            disabled={!reports.canManageWorkspaceReports}
          />
        </div>
      </SettingsCard>
    </div>
  );
}
