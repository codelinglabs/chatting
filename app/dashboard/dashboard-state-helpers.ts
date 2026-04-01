"use client";

import type { ConversationSummary, ConversationThread, ThreadMessage } from "@/lib/types";
import { sortConversationSummariesByRecency } from "./dashboard-client.utils";

export function toSummary(conversation: ConversationThread): ConversationSummary {
  const { messages: _messages, visitorActivity: _visitorActivity, ...summary } = conversation;
  return summary;
}

export function previewForMessage(message: ThreadMessage) {
  if (message.content.trim()) {
    return message.content;
  }

  if (message.attachments.length) {
    return message.attachments.length === 1
      ? `Shared ${message.attachments[0].fileName}`
      : `Shared ${message.attachments.length} files`;
  }

  return "No messages yet";
}

export function createOptimisticAttachmentUrls(files: File[]) {
  return files.map((file) => ({
    id: `optimistic-attachment-${crypto.randomUUID()}`,
    fileName: file.name || "Attachment",
    contentType: file.type || "application/octet-stream",
    sizeBytes: file.size || 0,
    url: window.URL.createObjectURL(file),
    isImage: (file.type || "").startsWith("image/")
  }));
}

export function revokeOptimisticAttachmentUrls(message: ThreadMessage) {
  window.setTimeout(() => {
    message.attachments.forEach((attachment) => {
      if (attachment.url.startsWith("blob:")) {
        window.URL.revokeObjectURL(attachment.url);
      }
    });
  }, 0);
}

export function markOptimisticMessageFailed(messages: ThreadMessage[], optimisticId: string, retryFiles: File[]) {
  return messages.map((message) =>
    message.id === optimisticId
      ? { ...message, pending: false, failed: true, retryFiles: retryFiles.length ? retryFiles : undefined }
      : message
  );
}

export function syncConversationSummaryList(
  conversations: ConversationSummary[],
  summary: ConversationSummary
) {
  const next = conversations.some((conversation) => conversation.id === summary.id)
    ? conversations.map((conversation) => (conversation.id === summary.id ? summary : conversation))
    : [summary, ...conversations];

  return sortConversationSummariesByRecency(next);
}

export function updateConversationSummaryList(
  conversations: ConversationSummary[],
  conversationId: string,
  updater: (conversation: ConversationSummary) => ConversationSummary
) {
  return sortConversationSummariesByRecency(
    conversations.map((conversation) =>
      conversation.id === conversationId ? updater(conversation) : conversation
    )
  );
}

export function nextTagsForToggle(tags: string[], tag: string) {
  return tags.includes(tag)
    ? tags.filter((entry) => entry !== tag)
    : [...tags, tag].sort((left, right) => left.localeCompare(right));
}

export function settleOptimisticMessage(
  messages: ThreadMessage[],
  optimisticId: string,
  nextMessage: ThreadMessage
) {
  let foundOptimistic = false;
  const settled = messages.map((message) => {
    if (message.id !== optimisticId) {
      return message;
    }

    foundOptimistic = true;
    return { ...nextMessage, pending: false };
  });

  if (foundOptimistic) {
    return settled;
  }

  if (messages.some((message) => message.id === nextMessage.id)) {
    return messages;
  }

  return [...messages, nextMessage];
}

export function filterDashboardConversations(
  conversations: ConversationSummary[],
  threadFilter: "all" | "open" | "resolved",
  searchQuery: string
) {
  const needle = searchQuery.trim().toLowerCase();

  return conversations.filter((conversation) => {
    if (threadFilter === "open" && conversation.status !== "open") {
      return false;
    }

    if (threadFilter === "resolved" && conversation.status !== "resolved") {
      return false;
    }

    if (!needle) {
      return true;
    }

    const haystack = [
      conversation.email,
      conversation.siteName,
      conversation.pageUrl,
      conversation.lastMessagePreview,
      conversation.city,
      conversation.country
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(needle);
  });
}
