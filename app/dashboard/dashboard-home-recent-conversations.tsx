import type { DashboardHomeData } from "@/lib/data/dashboard-home";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { displayNameFromEmail, initialsFromLabel } from "@/lib/user-display";
import { DashboardLink } from "./dashboard-shell";
import { pageLabelFromUrl } from "./dashboard-ui";

function conversationLabel(email: string | null, fallback: string) {
  return email ? displayNameFromEmail(email) : fallback;
}

function conversationInitials(email: string | null, fallback: string) {
  return initialsFromLabel(conversationLabel(email, fallback));
}

export function DashboardHomeRecentConversations({
  conversations
}: {
  conversations: DashboardHomeData["recentConversations"];
}) {
  const hasConversations = conversations.length > 0;

  return (
    <article className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Recent conversations</h2>
          <p className="mt-1 text-sm font-normal text-slate-500">The latest threads that need a quick glance.</p>
        </div>
        {hasConversations ? (
          <DashboardLink href="/dashboard/inbox" className="text-sm font-medium text-blue-600 transition hover:text-blue-700">
            View all
          </DashboardLink>
        ) : null}
      </div>

      <div className="divide-y divide-slate-200">
        {hasConversations ? (
          conversations.map((conversation) => {
            const unread = conversation.unreadCount > 0;
            const displayName = conversationLabel(conversation.email, "Visitor");

            return (
              <DashboardLink
                key={conversation.id}
                href={`/dashboard/inbox?id=${conversation.id}`}
                className="flex items-start gap-4 px-4 py-4 transition hover:bg-slate-50"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    unread ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {conversationInitials(conversation.email, "Visitor")}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {unread ? <span className="h-2 w-2 rounded-full bg-blue-600" /> : null}
                        <p className={`truncate text-sm ${unread ? "font-semibold text-slate-900" : "font-normal text-slate-700"}`}>
                          {displayName}
                        </p>
                      </div>
                      <p className="mt-1 truncate text-xs font-normal text-slate-400">
                        {conversation.email || "Anonymous visitor"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-normal text-slate-400">
                      {formatRelativeTime(conversation.lastMessageAt || conversation.updatedAt)}
                    </span>
                  </div>

                  <p className={`mt-1.5 truncate text-sm font-normal ${unread ? "text-slate-700" : "text-slate-500"}`}>
                    {truncate(conversation.lastMessagePreview || "No message preview yet", 88)}
                  </p>

                  <div className="mt-3">
                    <span className="inline-flex rounded bg-slate-100 px-2 py-1 text-xs font-normal text-slate-400">
                      {pageLabelFromUrl(conversation.pageUrl)}
                    </span>
                  </div>
                </div>
              </DashboardLink>
            );
          })
        ) : (
          <div className="px-5 py-10 text-sm text-slate-500">New conversations will show up here once visitors start chatting.</div>
        )}
      </div>
    </article>
  );
}
