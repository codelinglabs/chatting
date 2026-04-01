import type { FormEvent } from "react";
import {
  applyReplySummary,
  buildOptimisticReply,
  buildReplyFormData,
  findRetryableReply,
  hasPostedFounderReply,
  messageForReplyDelivery,
  parseReplyFiles,
  restoreReplySummary,
  snapshotReplySummary,
  type ReplyDelivery
} from "./dashboard-reply-helpers";
import { postDashboardForm } from "./dashboard-client.api";
import {
  markOptimisticMessageFailed,
  previewForMessage,
  revokeOptimisticAttachmentUrls,
  settleOptimisticMessage,
  updateConversationSummaryList
} from "./dashboard-state-helpers";
import type { ThreadMessage } from "@/lib/types";
import type { DashboardActionsParams } from "./use-dashboard-actions.types";

type ReplyResponse = { conversationId: string; message: ThreadMessage; emailDelivery: ReplyDelivery };

export function createDashboardReplyActions({
  activeConversation,
  sendingReply,
  setConversations,
  setActiveConversation,
  setSendingReply,
  setAnsweredConversations,
  setBanner,
  recentOptimisticReplyAtRef,
  showBanner,
  clearTypingSignal
}: DashboardActionsParams) {
  function syncConversationSummary(createdAt: string, preview: string) {
    if (!activeConversation) {
      return;
    }

    setConversations((current) =>
      updateConversationSummaryList(current, activeConversation.id, (conversation) =>
        applyReplySummary(conversation, createdAt, preview)
      )
    );
  }

  function restoreConversationSummary(
    optimisticCreatedAt: string,
    optimisticPreview: string,
    previousSummary: ReturnType<typeof snapshotReplySummary>
  ) {
    if (!activeConversation) {
      return;
    }

    setConversations((current) =>
      updateConversationSummaryList(current, activeConversation.id, (conversation) =>
        restoreReplySummary(conversation, optimisticCreatedAt, optimisticPreview, previousSummary)
      )
    );
  }

  async function submitReply({
    content,
    files,
    messageId
  }: {
    content: string;
    files: File[];
    messageId?: string;
  }) {
    if (!activeConversation) {
      return;
    }
    const retryingMessage = messageId ? findRetryableReply(activeConversation.messages, messageId) : null;
    if (messageId && !retryingMessage) {
      return;
    }
    const hadFounderReply = hasPostedFounderReply(activeConversation.messages, messageId);
    const optimisticCreatedAt = new Date().toISOString();
    const optimisticMessage: ThreadMessage = buildOptimisticReply({
      content,
      conversationId: activeConversation.id,
      createdAt: optimisticCreatedAt,
      files,
      retryingMessage
    });
    const optimisticPreview = previewForMessage(optimisticMessage);
    const previousSummary = snapshotReplySummary(activeConversation);
    const formData = buildReplyFormData(activeConversation.id, content, files);

    setSendingReply(true);
    setBanner(null);
    await clearTypingSignal();
    setActiveConversation((current) =>
      current
        ? {
            ...applyReplySummary(current, optimisticCreatedAt, optimisticPreview),
            messages: retryingMessage
              ? current.messages.map((message) =>
                  message.id === optimisticMessage.id ? optimisticMessage : message
                )
              : [...current.messages, optimisticMessage]
          }
        : current
    );
    syncConversationSummary(optimisticCreatedAt, optimisticPreview);
    try {
      const payload = await postDashboardForm<ReplyResponse>("/dashboard/reply", formData);
      const { message, emailDelivery } = payload;
      const postedPreview = previewForMessage(message);
      setActiveConversation((current) =>
        current
          ? {
              ...applyReplySummary(current, message.createdAt, postedPreview),
              messages: settleOptimisticMessage(current.messages, optimisticMessage.id, message)
            }
          : current
      );
      syncConversationSummary(message.createdAt, postedPreview);

      if (!hadFounderReply) {
        setAnsweredConversations((count) => count + 1);
      }
      recentOptimisticReplyAtRef.current.set(activeConversation.id, Date.now());
      revokeOptimisticAttachmentUrls(optimisticMessage);
      showBanner("success", messageForReplyDelivery(emailDelivery));
    } catch (error) {
      setActiveConversation((current) =>
        current
          ? {
              ...restoreReplySummary(current, optimisticCreatedAt, optimisticPreview, previousSummary),
              messages: markOptimisticMessageFailed(current.messages, optimisticMessage.id, files)
            }
          : current
      );
      restoreConversationSummary(optimisticCreatedAt, optimisticPreview, previousSummary);
      showBanner("error", error instanceof Error ? error.message : "Reply could not be sent.");
    } finally {
      setSendingReply(false);
    }
  }

  async function handleReplySend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const content = String(formData.get("content") ?? "").trim();
    const files = parseReplyFiles(formData);

    event.currentTarget.reset();
    await submitReply({ content, files });
  }

  async function handleReplyRetry(messageId: string) {
    if (!activeConversation || sendingReply) {
      return;
    }
    const retryingMessage = findRetryableReply(activeConversation.messages, messageId);
    if (!retryingMessage) {
      return;
    }

    await submitReply({
      messageId,
      content: retryingMessage.content,
      files: retryingMessage.retryFiles ?? []
    });
  }

  return {
    handleReplySend,
    handleReplyRetry
  };
}
