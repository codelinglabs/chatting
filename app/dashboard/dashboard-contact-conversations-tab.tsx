"use client";

import type { ContactConversationHistoryEntry } from "@/lib/contact-types";
import { ContactConversationCard } from "./dashboard-contact-conversation-card";
import { ContactProfileSection } from "./dashboard-contact-profile-ui";

export function ContactConversationsTab({
  conversations,
  loading,
  onNavigateConversation
}: {
  conversations: ContactConversationHistoryEntry[];
  loading: boolean;
  onNavigateConversation: (conversationId: string) => void;
}) {
  return (
    <ContactProfileSection title="Conversations">
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="h-4 w-40 rounded bg-slate-100" />
                <div className="mt-3 h-3 w-28 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : null}
        {conversations.length ? conversations.map((conversation) => (
          <ContactConversationCard key={conversation.id} conversation={conversation} onOpen={onNavigateConversation} />
        )) : null}
        {!loading && !conversations.length ? <p className="text-sm text-slate-400">No conversations yet.</p> : null}
      </div>
    </ContactProfileSection>
  );
}
