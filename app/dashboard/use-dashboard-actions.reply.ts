import type { FormEvent } from "react";
import { postDashboardForm } from "./dashboard-client.api";
import {
  createOptimisticAttachmentUrls,
  previewForMessage,
  removeMessageById,
  revokeOptimisticAttachmentUrls,
  settleOptimisticMessage,
  updateConversationSummaryList
} from "./dashboard-state-helpers";
import type { ConversationSummary, ThreadMessage } from "@/lib/types";
import type { DashboardActionsParams } from "./use-dashboard-actions.types";

type ReplySummaryTarget = Pick<
  ConversationSummary,
  "unreadCount" | "updatedAt" | "lastMessageAt" | "lastMessagePreview"
>;

function applyReplySummary<T extends ReplySummaryTarget>(target: T, createdAt: string, preview: string): T {
  return {
    ...target,
    unreadCount: 0,
    updatedAt: createdAt,
    lastMessageAt: createdAt,
    lastMessagePreview: preview
  };
}

function restoreReplySummary<T extends ReplySummaryTarget>(
  target: T,
  optimisticCreatedAt: string,
  optimisticPreview: string,
  previousSummary: Pick<ReplySummaryTarget, "updatedAt" | "lastMessageAt" | "lastMessagePreview">
): T {
  return {
    ...target,
    updatedAt: target.updatedAt === optimisticCreatedAt ? previousSummary.updatedAt : target.updatedAt,
    lastMessageAt:
      target.lastMessageAt === optimisticCreatedAt ? previousSummary.lastMessageAt : target.lastMessageAt,
    lastMessagePreview:
      target.lastMessagePreview === optimisticPreview
        ? previousSummary.lastMessagePreview
        : target.lastMessagePreview
  };
}

function messageForEmailDelivery(
  emailDelivery: "sent" | "skipped" | "queued_retry" | "failed"
) {
  switch (emailDelivery) {
    case "sent":
      return "Reply posted to the chat thread and emailed to the visitor.";
    case "queued_retry":
      return "Reply posted to the chat thread. Email delivery queued to retry.";
    case "failed":
      return "Reply posted to the chat thread. Email delivery failed.";
    default:
      return "Reply posted to the chat thread.";
  }
}

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
            ...applyReplySummary(current, optimisticCreatedAt, optimisticPreview),
            messages: [...current.messages, optimisticMessage]
          }
        : current
    );
    setConversations((current) =>
      updateConversationSummaryList(current, activeConversation.id, (conversation) =>
        applyReplySummary(conversation, optimisticCreatedAt, optimisticPreview)
      )
    );
    form.reset();
    try {
      const payload = await postDashboardForm<{
        conversationId: string;
        message: ThreadMessage;
        emailDelivery: "sent" | "skipped" | "queued_retry" | "failed";
      }>(
        "/dashboard/reply",
        formData
      );
      const { message, emailDelivery } = payload;
      const postedPreview = previewForMessage(message);
      setActiveConversation((current) =>
        current
          ? {
              ...applyReplySummary(current, message.createdAt, postedPreview),
              messages: settleOptimisticMessage(current.messages, optimisticId, message)
            }
          : current
      );
      setConversations((current) =>
        updateConversationSummaryList(current, activeConversation.id, (conversation) =>
          applyReplySummary(conversation, message.createdAt, postedPreview)
        )
      );

      if (!hadFounderReply) {
        setAnsweredConversations((count) => count + 1);
      }
      recentOptimisticReplyAtRef.current.set(activeConversation.id, Date.now());
      revokeOptimisticAttachmentUrls(optimisticMessage);
      showBanner("success", messageForEmailDelivery(emailDelivery));
    } catch (error) {
      setActiveConversation((current) =>
        current
          ? {
              ...restoreReplySummary(current, optimisticCreatedAt, optimisticPreview, previousSummary),
              messages: removeMessageById(current.messages, optimisticId)
            }
          : current
      );
      setConversations((current) =>
        updateConversationSummaryList(current, activeConversation.id, (conversation) =>
          restoreReplySummary(conversation, optimisticCreatedAt, optimisticPreview, previousSummary)
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
