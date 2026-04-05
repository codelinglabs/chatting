"use client";

import type { FormEvent } from "react";
import type { ContactDetail } from "@/lib/contact-types";
import type { ConversationThread } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { addOptimisticContactNote } from "./dashboard-contact-note-optimistic";
import { DashboardContactNoteModal } from "./dashboard-contact-note-modal";
import { SidebarDivider, SidebarSection } from "./dashboard-side-panel-ui";
import { DashboardVisitorNoteEditor } from "./dashboard-visitor-note-editor";
import { tagToneClass } from "./dashboard-thread-detail.utils";

type ThreadSidebarVisitor = {
  initials: string;
  name: string;
  secondary: string;
};

export function ThreadSidebarIdentity({
  visitor,
  conversationId,
  hasEmail,
  savingEmail,
  onSaveConversationEmail
}: {
  visitor: ThreadSidebarVisitor;
  conversationId: string;
  hasEmail: boolean;
  savingEmail: boolean;
  onSaveConversationEmail: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <>
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[22px] font-medium text-blue-700">
          {visitor.initials}
        </div>
        <p className="mt-3 text-[15px] font-medium text-slate-900">{visitor.name}</p>
        <p className="mt-1 text-[13px] font-normal text-slate-500">{visitor.secondary}</p>
      </div>

      {!hasEmail ? (
        <form onSubmit={onSaveConversationEmail} className="mt-4">
          <input type="hidden" name="conversationId" value={conversationId} />
          <Input type="email" name="email" required placeholder="visitor@company.com" />
          <Button
            type="submit"
            disabled={savingEmail}
            className="mt-3 w-full"
            size="md"
          >
            {savingEmail ? "Saving..." : "Save visitor email"}
          </Button>
        </form>
      ) : null}
    </>
  );
}

export function ThreadConversationTagsSection({
  tags,
  availableTags,
  onToggleTag
}: {
  tags: string[];
  availableTags: string[];
  onToggleTag: (tag: string) => Promise<void>;
}) {
  return (
    <SidebarSection title="Tags">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onToggleTag(tag)}
            className={
              tagToneClass(tag) +
              " rounded-full px-2.5 py-1 text-xs font-normal transition"
            }
          >
            {tag}
          </button>
        ))}
        {availableTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onToggleTag(tag)}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-normal text-slate-500 transition hover:bg-slate-200"
          >
            {`+ ${tag}`}
          </button>
        ))}
      </div>
    </SidebarSection>
  );
}

export function ThreadSharedVisitorNotesSection({
  conversationId
}: {
  conversationId: string;
}) {
  return (
    <SidebarSection title="Shared visitor notes">
      <DashboardVisitorNoteEditor conversationId={conversationId} />
    </SidebarSection>
  );
}

export function ThreadRecentHistorySection({
  visitorActivity
}: {
  visitorActivity: ConversationThread["visitorActivity"];
}) {
  if (!visitorActivity?.otherQuestionsLastMonth) {
    return null;
  }

  return (
    <>
      <SidebarDivider />
      <SidebarSection title="Recent history">
        <div className="space-y-2 rounded-lg bg-slate-50 px-3 py-3 text-[13px] leading-6 text-slate-600">
          <p>
            Matched using the visitor&apos;s{" "}
            {visitorActivity.matchType === "email" ? "email address" : "session history"}.
          </p>
          <p>
            This visitor asked {visitorActivity.otherQuestionsLastMonth} other question
            {visitorActivity.otherQuestionsLastMonth === 1 ? "" : "s"} last month.
          </p>
        </div>
      </SidebarSection>
    </>
  );
}

export function ThreadContactNoteModalSection({
  contact,
  activeNoteId,
  onClose,
  onSavePatch
}: {
  contact: ContactDetail | null;
  activeNoteId: string | null;
  onClose: () => void;
  onSavePatch: (
    payload: Record<string, unknown>,
    options?: { optimisticContact?: ContactDetail | null; previousContact?: ContactDetail | null }
  ) => Promise<void>;
}) {
  if (!contact || !activeNoteId) {
    return null;
  }

  return (
    <DashboardContactNoteModal
      note={activeNoteId === "new" ? null : contact.notes.find((note) => note.id === activeNoteId) ?? null}
      onClose={onClose}
      onSave={async (body, noteId) => {
        const trimmedBody = body.trim();
        if (!noteId) {
          await onSavePatch(
            { note: { id: noteId, body: trimmedBody } },
            {
              optimisticContact: addOptimisticContactNote(contact, trimmedBody),
              previousContact: contact
            }
          );
          onClose();
          return;
        }

        await onSavePatch({ note: { id: noteId, body: trimmedBody } });
        onClose();
      }}
    />
  );
}
