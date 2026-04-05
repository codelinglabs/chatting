import type { ContactWorkspaceSettings } from "@/lib/contact-types";
import { parseContactSettingsJson } from "@/lib/contact-utils";
import { upsertWorkspaceContactSettings } from "@/lib/repositories/contact-settings-repository";
import { resolveContactSettings } from "@/lib/data/contact-access";

export async function getDashboardContactSettings(userId: string) {
  const { planKey, settings, limits } = await resolveContactSettings(userId);
  return { planKey, settings, limits };
}

export async function updateDashboardContactSettings(
  userId: string,
  input: ContactWorkspaceSettings
) {
  const { workspace, planKey } = await resolveContactSettings(userId);
  if (workspace.role === "member") {
    throw new Error("CONTACT_SETTINGS_FORBIDDEN");
  }

  const normalized = parseContactSettingsJson(JSON.stringify(input), planKey);
  await upsertWorkspaceContactSettings(workspace.ownerUserId, JSON.stringify(normalized));
  return normalized;
}
