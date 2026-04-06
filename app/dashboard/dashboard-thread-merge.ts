"use client";

import type { ConversationThread, ThreadMessage } from "@/lib/types";
import { previewForMessage } from "./dashboard-state-helpers";

function matchesServerReply(local: ThreadMessage, remote: ThreadMessage) {
  if (remote.id === local.id || remote.sender !== "team" || remote.content !== local.content) {
    return remote.id === local.id;
  }

  if (remote.attachments.length !== local.attachments.length || remote.createdAt < local.createdAt) {
    return false;
  }

  return remote.attachments.every(
    (attachment, index) => attachment.fileName === local.attachments[index]?.fileName
  );
}

export function mergeConversationThread(
  current: ConversationThread | null,
  incoming: ConversationThread
): ConversationThread {
  if (!current || current.id !== incoming.id) {
    return incoming;
  }

  const visitorActivity = incoming.visitorActivity ?? current.visitorActivity;

  const localMessages = current.messages.filter(
    (message) =>
      message.sender === "team" &&
      (message.pending || message.failed) &&
      !incoming.messages.some((remote) => matchesServerReply(message, remote))
  );

  if (!localMessages.length) {
    return {
      ...incoming,
      visitorActivity
    };
  }

  const summaryMessage =
    localMessages.find(
      (message) =>
        message.createdAt === current.lastMessageAt &&
        previewForMessage(message) === current.lastMessagePreview
    ) ?? null;

  return {
    ...incoming,
    visitorActivity,
    messages: [...incoming.messages, ...localMessages].sort((left, right) =>
      left.createdAt.localeCompare(right.createdAt)
    ),
    unreadCount: current.unreadCount,
    updatedAt: summaryMessage ? current.updatedAt : incoming.updatedAt,
    lastMessageAt: summaryMessage ? current.lastMessageAt : incoming.lastMessageAt,
    lastMessagePreview: summaryMessage ? current.lastMessagePreview : incoming.lastMessagePreview
  };
}
