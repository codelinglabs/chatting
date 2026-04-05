"use client";

import type { ContactConversationHistoryEntry } from "@/lib/contact-types";
import { formatDateTime } from "@/lib/utils";
import { contactConversationStatusLabel } from "./dashboard-contact-drawer-utils";
import { ChevronRightIcon } from "./dashboard-ui";

export function ContactConversationCard({
  conversation,
  onOpen
}: {
  conversation: ContactConversationHistoryEntry;
  onOpen: (conversationId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(conversation.id)}
      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">{conversation.title}</p>
        <p className="mt-1 text-xs text-slate-400">
          {formatDateTime(conversation.createdAt)} · {contactConversationStatusLabel(conversation.status)} · {conversation.messageCount} messages
        </p>
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
        {contactConversationStatusLabel(conversation.status)}
        <ChevronRightIcon className="h-4 w-4" />
      </span>
    </button>
  );
}
