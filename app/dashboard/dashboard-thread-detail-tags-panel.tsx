"use client";

import type { ContactDetail } from "@/lib/contact-types";
import { SidebarSection } from "./dashboard-side-panel-ui";
import { ThreadContactTags } from "./dashboard-thread-detail-contact-panels";
import { ThreadConversationTagsSection } from "./dashboard-thread-detail-sidebar-sections";

export function DashboardThreadTagsPanel({
  contact,
  draftTag,
  onDraftTagChange,
  onSaveContactPatch,
  tags,
  availableTags,
  onToggleTag
}: {
  contact: ContactDetail | null;
  draftTag: string;
  onDraftTagChange: (value: string) => void;
  onSaveContactPatch: (
    payload: Record<string, unknown>,
    options?: { optimisticContact?: ContactDetail | null; previousContact?: ContactDetail | null }
  ) => Promise<void>;
  tags: string[];
  availableTags: string[];
  onToggleTag: (tag: string) => Promise<void>;
}) {
  return (
    <SidebarSection title="Tags">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3">
        {contact ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-800">Contact tags</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Saved on the contact profile.
                </p>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
                {contact.tags.length}
              </span>
            </div>
            <ThreadContactTags
              contact={contact}
              draftTag={draftTag}
              onDraftTagChange={onDraftTagChange}
              onSavePatch={onSaveContactPatch}
              title={null}
            />
          </div>
        ) : null}
        <div className={contact ? "border-t border-slate-200 pt-4" : ""}>
          {contact ? (
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-800">Conversation tags</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Apply tags to this thread.
                </p>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
                {tags.length}
              </span>
            </div>
          ) : null}
          <ThreadConversationTagsSection
            title={null}
            tags={tags}
            availableTags={availableTags}
            onToggleTag={onToggleTag}
          />
        </div>
      </div>
    </SidebarSection>
  );
}
