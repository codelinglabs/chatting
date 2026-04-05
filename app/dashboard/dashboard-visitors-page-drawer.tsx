"use client";

import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import {
  SidebarDivider,
  SidebarKeyValueRows,
  SidebarSection
} from "./dashboard-side-panel-ui";
import { DashboardVisitorNoteEditor } from "./dashboard-visitor-note-editor";
import { ChevronRightIcon, XIcon } from "./dashboard-ui";
import { formatDuration, type VisitorRecord } from "./visitors-data";

export function VisitorDetailsDrawer({
  visitor,
  onClose,
  onOpenConversation,
  onNavigateVisit
}: {
  visitor: VisitorRecord | null;
  onClose: () => void;
  onOpenConversation: () => void;
  onNavigateVisit: (conversationId: string) => void;
}) {
  if (!visitor) {
    return null;
  }

  const contactRows = [
    { label: "Record", value: visitor.email ? "Email" : "Session" },
    { label: "Session", value: visitor.sessionId },
    { label: "First seen", value: formatDateTime(visitor.firstSeenAt) },
    { label: "Last seen", value: formatRelativeTime(visitor.lastSeenAt) },
    { label: "Conversations", value: `${visitor.conversationCount}` }
  ] as const;
  const sessionRows = [
    { label: "Page", value: visitor.currentPage, valueClassName: "text-blue-600" },
    { label: "Referrer", value: visitor.source },
    { label: "Location", value: visitor.location || "Unknown" },
    { label: "Browser", value: visitor.browser },
    { label: "Timezone", value: visitor.timezone || "Unknown" },
    {
      label: "Time on site",
      value: formatDuration(visitor.timeOnSiteSeconds)
    }
  ] as const;

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/25" onClick={onClose}>
      <aside
        className="absolute bottom-0 right-0 top-0 flex w-full max-w-[400px] flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.1)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5">
          <p className="text-base font-medium text-slate-900">Contact profile</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close visitor details"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <section className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[22px] font-medium text-blue-700">
              {visitor.initials}
            </div>
            <p className="mt-3 text-[15px] font-medium text-slate-900">{visitor.name}</p>
            <p className="mt-1 text-[13px] text-slate-500">{visitor.email || "Anonymous visitor"}</p>
          </section>

          <SidebarDivider />

          <SidebarSection title="Contact profile">
            <SidebarKeyValueRows rows={contactRows} />
          </SidebarSection>

          <SidebarDivider />

          <SidebarSection title="Current session">
            <SidebarKeyValueRows rows={sessionRows} />
          </SidebarSection>

          <SidebarDivider />

          <SidebarSection title="Page history">
            {visitor.pageHistory.length ? (
              visitor.pageHistory.map((page, index) => (
                <div key={`${page.page}-${page.seenAt}-${index}`} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-[13px] text-blue-600">{page.page}</span>
                    <span className="text-[13px] text-slate-500">{formatDuration(page.durationSeconds)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(page.seenAt)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No page history captured yet.</p>
            )}
          </SidebarSection>

          <SidebarDivider />

          <SidebarSection title="Conversation history">
            {visitor.visitHistory.length ? (
              visitor.visitHistory.map((visit) => (
                <button
                  key={visit.conversationId}
                  type="button"
                  onClick={() => onNavigateVisit(visit.conversationId)}
                  className="block w-full rounded-lg bg-slate-50 px-3 py-3 text-left transition hover:bg-slate-100"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[13px] text-blue-600">{visit.page}</span>
                    <span className="text-[13px] text-slate-500">{formatRelativeTime(visit.lastSeenAt)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Started {formatDateTime(visit.startedAt)} · Source {visit.source}
                  </p>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-400">No conversation history captured yet.</p>
            )}
          </SidebarSection>

          <SidebarDivider />

          <SidebarSection title="Latest conversation">
            {visitor.latestConversationId ? (
              <>
                <button
                  type="button"
                  onClick={onOpenConversation}
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Open latest conversation
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
                <p className="mt-2 text-sm text-slate-500">
                  {visitor.conversationCount} conversation{visitor.conversationCount === 1 ? "" : "s"} recorded
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                This visitor is browsing live, but they haven&apos;t started a conversation yet.
              </p>
            )}
          </SidebarSection>

          <SidebarDivider />

          <SidebarSection title="Tags">
            <div className="flex flex-wrap gap-2">
              {visitor.tags.length ? (
                visitor.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-blue-100 px-2.5 py-1 text-xs text-blue-700">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">No tags yet.</span>
              )}
            </div>
          </SidebarSection>

          <SidebarDivider />

          <SidebarSection title="Shared visitor notes">
            <DashboardVisitorNoteEditor
              siteId={visitor.siteId}
              sessionId={visitor.sessionId}
              email={visitor.email}
            />
          </SidebarSection>
        </div>
      </aside>
    </div>
  );
}
