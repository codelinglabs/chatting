import { getWorkspaceAccess } from "@/lib/workspace-access";
import { findDashboardUnreadCount } from "@/lib/repositories/dashboard-shell-repository";

export async function getDashboardUnreadCount(userId: string, ownerUserId?: string) {
  const workspaceOwnerId = ownerUserId ?? (await getWorkspaceAccess(userId)).ownerUserId;
  return findDashboardUnreadCount({
    viewerUserId: userId,
    ownerUserId: workspaceOwnerId
  });
}
