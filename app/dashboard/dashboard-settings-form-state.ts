import { createDefaultDashboardAutomationSettings } from "@/lib/data/settings-automation";
import { normalizeDashboardSettingsReports } from "@/lib/data/settings-reports";
import type { DashboardSettingsData } from "@/lib/data/settings-types";
import type { EditableSettings } from "./dashboard-settings-shared";

export type PasswordDraft = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const emptyPasswordDraft = (): PasswordDraft => ({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});

export function buildEditableSettings(initialData: DashboardSettingsData): EditableSettings {
  return {
    profile: initialData.profile,
    teamName: initialData.teamName ?? "",
    notifications: initialData.notifications,
    email: initialData.email,
    reports: normalizeDashboardSettingsReports(initialData.reports),
    automation: initialData.automation ?? createDefaultDashboardAutomationSettings()
  };
}
