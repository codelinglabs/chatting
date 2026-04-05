import { updateConversationAssignmentRecord } from "@/lib/repositories/conversations-repository";
import { hasWorkspaceMemberRecord } from "@/lib/repositories/workspace-repository";
import { optionalText } from "@/lib/utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import { hasConversationAccess } from "./shared";

export async function updateConversationAssignment(
  conversationId: string,
  assignedUserId: string | null | undefined,
  userId: string
) {
  const workspace = await getWorkspaceAccess(userId);
  const normalizedAssignedUserId = optionalText(assignedUserId);

  if (!(await hasConversationAccess(conversationId, workspace.ownerUserId, userId))) {
    return null;
  }

  if (
    normalizedAssignedUserId &&
    !(await hasWorkspaceMemberRecord(workspace.ownerUserId, normalizedAssignedUserId))
  ) {
    throw new Error("INVALID_ASSIGNEE");
  }

  return {
    assignedUserId:
      (await updateConversationAssignmentRecord({
        conversationId,
        ownerUserId: workspace.ownerUserId,
        assignedUserId: normalizedAssignedUserId ?? null
      })) ?? null
  };
}
