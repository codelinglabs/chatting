import type { FormEvent } from "react";
import { postDashboardForm } from "./dashboard-client.api";
import { moveConversationToFront } from "./dashboard-client.utils";
import {
  createOptimisticAttachmentUrls,
  previewForMessage,
  removeMessageById,
  revokeOptimisticAttachmentUrls,
  settleOptimisticMessage
} from "./dashboard-state-helpers";
import type { ThreadMessage } from "@/lib/types";
import type { DashboardActionsParams } from "./use-dashboard-actions.types";

export function createDashboardReplyActions({
  activeConversation,
  setConversations,
  setActiveConversation,
  setSendingReply,
  setAnsweredConversations,
  setBanner,
  recentOptimisticReplyAtRef,
  showBanner,
  clearTypingSignal
}: DashboardActionsParams) {
  async function handleReplySend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeConversation) {
      return;
    }
    const form = event.currentTarget;
    const formData = new FormData(form);
    const hadFounderReply = activeConversation.messages.some((message) => message.sender === "founder");
    const content = String(formData.get("content") ?? "").trim();
    const files = Array.from(formData.getAll("attachments")).filter(
      (entry): entry is File => entry instanceof File && entry.size > 0
    );
    const optimisticId = `optimistic-founder-${crypto.randomUUID()}`;
    const optimisticCreatedAt = new Date().toISOString();
    const optimisticMessage: ThreadMessage = {
      id: optimisticId,
      conversationId: activeConversation.id,
      sender: "founder",
      content,
      createdAt: optimisticCreatedAt,
      attachments: createOptimisticAttachmentUrls(files),
      pending: true
    };
    const optimisticPreview = previewForMessage(optimisticMessage);
    const previousSummary = {
      updatedAt: activeConversation.updatedAt,
      lastMessageAt: activeConversation.lastMessageAt,
      lastMessagePreview: activeConversation.lastMessagePreview
    };
    setSendingReply(true);
    setBanner(null);
    await clearTypingSignal();
    setActiveConversation((current) =>
      current
        ? {
            ...current,
            unreadCount: 0,
            updatedAt: optimisticCreatedAt,
            lastMessageAt: optimisticCreatedAt,
            lastMessagePreview: optimisticPreview,
            messages: [...current.messages, optimisticMessage]
          }
        : current
    );
    setConversations((current) =>
      moveConversationToFront(current, activeConversation.id, (conversation) => ({
        ...conversation,
        unreadCount: 0,
        updatedAt: optimisticCreatedAt,
        lastMessageAt: optimisticCreatedAt,
        lastMessagePreview: optimisticPreview
      }))
    );
    form.reset();
    try {
      const payload = await postDashboardForm<{
        conversationId: string;
        message: ThreadMessage;
        emailDelivery: "sent" | "skipped" | "failed";
      }>(
        "/dashboard/reply",
        formData
      );
      const { message, emailDelivery } = payload;
      setActiveConversation((current) =>
        current
          ? {
              ...current,
              unreadCount: 0,
              updatedAt: message.createdAt,
              lastMessageAt: message.createdAt,
              lastMessagePreview: previewForMessage(message),
              messages: settleOptimisticMessage(current.messages, optimisticId, message)
            }
          : current
      );
      setConversations((current) =>
        moveConversationToFront(current, activeConversation.id, (conversation) => ({
          ...conversation,
          unreadCount: 0,
          updatedAt: message.createdAt,
          lastMessageAt: message.createdAt,
          lastMessagePreview: previewForMessage(message)
        }))
      );

      if (!hadFounderReply) {
        setAnsweredConversations((count) => count + 1);
      }
      recentOptimisticReplyAtRef.current.set(activeConversation.id, Date.now());
      revokeOptimisticAttachmentUrls(optimisticMessage);
      showBanner(
        "success",
        emailDelivery === "sent"
          ? "Reply posted to the chat thread and emailed to the visitor."
          : emailDelivery === "failed"
            ? "Reply posted to the chat thread. Email delivery failed."
            : "Reply posted to the chat thread."
      );
    } catch (error) {
      setActiveConversation((current) =>
        current
          ? {
              ...current,
              updatedAt:
                current.updatedAt === optimisticCreatedAt ? previousSummary.updatedAt : current.updatedAt,
              lastMessageAt:
                current.lastMessageAt === optimisticCreatedAt
                  ? previousSummary.lastMessageAt
                  : current.lastMessageAt,
              lastMessagePreview:
                current.lastMessagePreview === optimisticPreview
                  ? previousSummary.lastMessagePreview
                  : current.lastMessagePreview,
              messages: removeMessageById(current.messages, optimisticId)
            }
          : current
      );
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                updatedAt:
                  conversation.updatedAt === optimisticCreatedAt
                    ? previousSummary.updatedAt
                    : conversation.updatedAt,
                lastMessageAt:
                  conversation.lastMessageAt === optimisticCreatedAt
                    ? previousSummary.lastMessageAt
                    : conversation.lastMessageAt,
                lastMessagePreview:
                  conversation.lastMessagePreview === optimisticPreview
                    ? previousSummary.lastMessagePreview
                    : conversation.lastMessagePreview
              }
            : conversation
        )
      );
      revokeOptimisticAttachmentUrls(optimisticMessage);
      showBanner("error", error instanceof Error ? error.message : "Reply could not be sent.");
    } finally {
      setSendingReply(false);
    }
  }

  return {
    handleReplySend
  };
}
