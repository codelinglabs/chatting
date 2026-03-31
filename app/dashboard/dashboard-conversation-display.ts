import type { ConversationSummary } from "@/lib/types";
import { displayNameFromEmail, initialsFromLabel } from "@/lib/user-display";
import { formatRelativeTime } from "@/lib/utils";

type ConversationRowSource = Pick<
  ConversationSummary,
  "id" | "email" | "lastMessageAt" | "updatedAt" | "lastMessagePreview"
>;

type ConversationPageSource = Pick<ConversationSummary, "pageUrl" | "recordedPageUrl">;

export function conversationIdentity(
  email: string | null,
  secondaryFallback: string,
  nameFallback = "Visitor"
) {
  const name = email ? displayNameFromEmail(email) : nameFallback;

  return {
    name,
    initials: initialsFromLabel(name),
    secondary: email || secondaryFallback
  };
}

export function conversationHref(conversationId: string) {
  return `/dashboard/inbox?id=${conversationId}`;
}

export function conversationPageUrl(conversation: ConversationPageSource) {
  return conversation.recordedPageUrl || conversation.pageUrl || "/";
}

export function conversationRowDetails(
  conversation: ConversationRowSource,
  options: {
    secondaryFallback: string;
    previewFallback: string;
  }
) {
  return {
    ...conversationIdentity(conversation.email, options.secondaryFallback),
    href: conversationHref(conversation.id),
    preview: conversation.lastMessagePreview || options.previewFallback,
    timestamp: formatRelativeTime(conversation.lastMessageAt || conversation.updatedAt)
  };
}
