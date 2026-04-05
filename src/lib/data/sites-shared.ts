import { getWorkspaceAccess } from "@/lib/workspace-access";
import { mapSite, querySites } from "./shared";

export async function getWorkspaceOwnerId(userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  return workspace.ownerUserId;
}

export async function loadOwnedSite(siteId: string, ownerUserId: string) {
  const result = await querySites("s.id = $1 AND s.user_id = $2", [siteId, ownerUserId], "LIMIT 1");
  return result.rows[0] ? mapSite(result.rows[0]) : null;
}
