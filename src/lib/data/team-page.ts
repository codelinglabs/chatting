import type { DashboardTeamInvite, DashboardTeamMember } from "@/lib/data/settings-types";
import { listDashboardTeamMembers } from "@/lib/data/dashboard-team-members";
import { listTeamInvites } from "@/lib/data/settings";
import { getWorkspaceAccess } from "@/lib/workspace-access";

export async function getDashboardTeamPageData(userId: string): Promise<{
  teamMembers: DashboardTeamMember[];
  teamInvites: DashboardTeamInvite[];
}> {
  const workspace = await getWorkspaceAccess(userId);
  const [teamMembers, teamInvites] = await Promise.all([
    listDashboardTeamMembers(userId),
    listTeamInvites(workspace.ownerUserId)
  ]);

  return { teamMembers, teamInvites };
}
