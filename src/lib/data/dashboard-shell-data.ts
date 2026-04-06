import "server-only";

import {
  buildDashboardAiAssistWarningBanner,
  type DashboardAiAssistWarningBanner
} from "@/lib/ai-assist-warning";
import { getDashboardAiAssistBillingCycle } from "@/lib/data/dashboard-ai-assist-billing-cycle";
import { mapDashboardNotificationSettings } from "@/lib/data/settings-helpers";
import type { DashboardSettingsNotifications } from "@/lib/data/settings-types";
import { findDashboardShellRow } from "@/lib/repositories/dashboard-shell-repository";

type WorkspaceRole = "owner" | "admin" | "member";

export type DashboardShellData = {
  unreadCount: number;
  notificationSettings: DashboardSettingsNotifications;
  aiAssistWarning: DashboardAiAssistWarningBanner | null;
  canManageBilling: boolean;
};

function toCount(value: string | null | undefined) {
  return Number(value ?? "0");
}

export async function getDashboardShellData(input: {
  userId: string;
  ownerUserId: string;
  workspaceRole: WorkspaceRole;
  now?: Date;
}): Promise<DashboardShellData> {
  const canManageBilling = input.workspaceRole !== "member";
  const cycle = !canManageBilling
    ? null
    : input.now
      ? await getDashboardAiAssistBillingCycle(input.ownerUserId, input.now)
      : await getDashboardAiAssistBillingCycle(input.ownerUserId);
  const row = await findDashboardShellRow({
    viewerUserId: input.userId,
    ownerUserId: input.ownerUserId,
    includeAiAssistWarning: canManageBilling,
    cycleStart: cycle?.startIso ?? null,
    cycleEnd: cycle?.nextIso ?? null
  });

  if (!row) {
    throw new Error("User not found.");
  }

  return {
    unreadCount: toCount(row.unread_count),
    notificationSettings: mapDashboardNotificationSettings(row),
    aiAssistWarning:
      canManageBilling && cycle
        ? buildDashboardAiAssistWarningBanner({
            ownerUserId: input.ownerUserId,
            planKey: cycle.planKey,
            used: toCount(row.ai_assist_requests_used),
            limit: cycle.limit,
            resetsAt: cycle.nextIso
          })
        : null,
    canManageBilling
  };
}
