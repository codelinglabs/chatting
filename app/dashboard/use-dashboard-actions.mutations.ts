import type { FormEvent } from "react";
import { postDashboardForm } from "./dashboard-client.api";
import { nextTagsForToggle } from "./dashboard-state-helpers";
import type { ConversationStatus } from "@/lib/types";
import type { DashboardActionsParams } from "./use-dashboard-actions.types";

export function createDashboardMutationActions({
  activeConversation,
  conversations,
  setSites,
  setConversations,
  setActiveConversation,
  setSavingSiteId,
  setSavingEmail,
  setUpdatingStatus,
  setBanner,
  pendingTagMutationsRef,
  showBanner
}: DashboardActionsParams) {
  async function handleSiteTitleSave(event: FormEvent<HTMLFormElement>, siteId: string) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSavingSiteId(siteId);
    setBanner(null);
    try {
      const payload = await postDashboardForm<{ siteId: string; widgetTitle: string }>(
        "/dashboard/sites/update",
        formData
      );
      setSites((current) =>
        current.map((site) => (site.id === siteId ? { ...site, widgetTitle: payload.widgetTitle } : site))
      );
      showBanner("success", "Widget title saved without leaving the page.");
    } catch (error) {
      showBanner("error", error instanceof Error ? error.message : "Widget title could not be saved.");
    } finally {
      setSavingSiteId(null);
    }
  }

  async function handleSaveConversationEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeConversation) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    setSavingEmail(true);
    setBanner(null);
    try {
      const payload = await postDashboardForm<{ conversationId: string; email: string }>(
        "/dashboard/email",
        formData
      );
      setActiveConversation((current) => (current ? { ...current, email: payload.email } : current));
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversation.id ? { ...conversation, email: payload.email } : conversation
        )
      );
      showBanner("success", "Visitor email saved.");
    } catch (error) {
      showBanner("error", error instanceof Error ? error.message : "Visitor email could not be saved.");
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleConversationStatusChange(status: ConversationStatus) {
    if (!activeConversation) {
      return;
    }
    const activeConversationId = activeConversation.id;
    const previousActiveStatus = activeConversation.status;
    const previousActiveUnreadCount = activeConversation.unreadCount;
    const previousSummary = conversations.find((conversation) => conversation.id === activeConversationId);
    const previousSummaryStatus = previousSummary?.status ?? previousActiveStatus;
    const previousSummaryUnreadCount = previousSummary?.unreadCount ?? previousActiveUnreadCount;
    const formData = new FormData();
    formData.set("conversationId", activeConversationId);
    formData.set("status", status);
    setUpdatingStatus(true);
    setBanner(null);
    setActiveConversation((current) =>
      current && current.id === activeConversationId
        ? {
            ...current,
            status,
            unreadCount: status === "resolved" ? 0 : previousActiveUnreadCount
          }
        : current
    );
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversationId
          ? {
              ...conversation,
              status,
              unreadCount: status === "resolved" ? 0 : previousSummaryUnreadCount
            }
          : conversation
      )
    );
    try {
      const payload = await postDashboardForm<{ conversationId: string; status: ConversationStatus }>(
        "/dashboard/status",
        formData
      );
      setActiveConversation((current) =>
        current && current.id === activeConversationId
          ? {
              ...current,
              status: payload.status,
              unreadCount: payload.status === "resolved" ? 0 : current.unreadCount
            }
          : current
      );
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversationId
            ? {
                ...conversation,
                status: payload.status,
                unreadCount: payload.status === "resolved" ? 0 : conversation.unreadCount
              }
            : conversation
        )
      );
      showBanner("success", payload.status === "resolved" ? "Thread marked as resolved." : "Thread reopened.");
    } catch (error) {
      setActiveConversation((current) =>
        current && current.id === activeConversationId
          ? {
              ...current,
              status: previousActiveStatus,
              unreadCount: previousActiveUnreadCount
            }
          : current
      );
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversationId
            ? {
                ...conversation,
                status: previousSummaryStatus,
                unreadCount: previousSummaryUnreadCount
              }
            : conversation
        )
      );
      showBanner("error", error instanceof Error ? error.message : "Thread status could not be updated.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleTagToggle(tag: string) {
    if (!activeConversation || pendingTagMutationsRef.current.has(tag)) {
      return;
    }
    const previousTags = activeConversation.tags;
    const nextTags = nextTagsForToggle(previousTags, tag);
    const formData = new FormData();
    formData.set("conversationId", activeConversation.id);
    formData.set("tag", tag);
    pendingTagMutationsRef.current.add(tag);
    setBanner(null);
    setActiveConversation((current) => (current ? { ...current, tags: nextTags } : current));
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversation.id ? { ...conversation, tags: nextTags } : conversation
      )
    );

    try {
      await postDashboardForm<{ conversationId: string; tag: string }>("/dashboard/tags", formData);
    } catch (error) {
      setActiveConversation((current) => (current ? { ...current, tags: previousTags } : current));
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversation.id ? { ...conversation, tags: previousTags } : conversation
        )
      );
      showBanner("error", error instanceof Error ? error.message : "Tag update failed.");
    } finally {
      pendingTagMutationsRef.current.delete(tag);
    }
  }

  return {
    handleSiteTitleSave,
    handleSaveConversationEmail,
    handleConversationStatusChange,
    handleTagToggle
  };
}
