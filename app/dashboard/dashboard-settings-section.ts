import type { SettingsSection } from "./dashboard-settings-shared";

const VALID_SETTINGS_SECTIONS = new Set<SettingsSection>([
  "profile",
  "notifications",
  "email",
  "billing",
  "referrals"
]);

export function resolveSettingsSection(value: string | null | undefined): SettingsSection {
  const section = String(value ?? "").trim();
  return VALID_SETTINGS_SECTIONS.has(section as SettingsSection) ? (section as SettingsSection) : "profile";
}
