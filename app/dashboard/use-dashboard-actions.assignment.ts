import { postDashboardForm } from "./dashboard-client.api";
import type { DashboardActionsParams } from "./use-dashboard-actions.types";

export function createDashboardAssignmentActions({
  activeConversation,
  conversations,
  setActiveConversation,
  setConversations,
  setAssigningConversation,
  setBanner
}: DashboardActionsParams) {
  async function handleConversationAssignmentChange(assignedUserId: string | null) {
    if (!activeConversation) {
      return;
    }

    const formData = new FormData();
    formData.set("conversationId", activeConversation.id);
    if (assignedUserId) {
      formData.set("assignedUserId", assignedUserId);
    }

    setAssigningConversation(true);
    setBanner(null);

    try {
      const payload = await postDashboardForm<{ conversationId: string; assignedUserId: string | null }>(
        "/dashboard/assignment",
        formData
      );

      setActiveConversation((current) =>
        current && current.id === activeConversation.id
          ? { ...current, assignedUserId: payload.assignedUserId }
          : current
      );
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversation.id
            ? { ...conversation, assignedUserId: payload.assignedUserId }
            : conversation
        )
      );
    } finally {
      setAssigningConversation(false);
    }
  }

  return { handleConversationAssignmentChange };
}
