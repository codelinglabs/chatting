"use client";

import { useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import { Button } from "../components/ui/Button";
import { PaperclipIcon } from "../dashboard/dashboard-ui";
import { FormInput } from "../ui/form-controls";
import { ConversationResumeMessage } from "./[token]/conversation-resume-message";
import { ConversationThreadNav } from "./conversation-thread-nav";
import type { MessageAttachment } from "@/lib/types";

export type ConversationThreadMessage = {
  id: string;
  content: string;
  createdAt: string;
  sender: "team" | "user";
  attachments: MessageAttachment[];
};

type ConversationThreadShellProps = {
  brandingLabel: string;
  brandingUrl: string;
  brandColor: string;
  content: string;
  messages: ConversationThreadMessage[];
  attachments?: File[];
  allowAttachments?: boolean;
  onAddAttachments?: (files: File[]) => void;
  onChangeContent: (value: string) => void;
  onRemoveAttachment?: (index: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  sending: boolean;
  showBranding: boolean;
  teamPhotoUrl: string | null;
  teamTyping?: boolean;
  widgetTitle: string;
};

export function ConversationThreadShell({
  brandingLabel,
  brandingUrl,
  brandColor,
  content,
  messages,
  attachments = [],
  allowAttachments = false,
  onAddAttachments,
  onChangeContent,
  onRemoveAttachment,
  onSubmit,
  sending,
  showBranding,
  teamPhotoUrl,
  teamTyping = false,
  widgetTitle
}: ConversationThreadShellProps) {
  const canSend = Boolean(content.trim() || attachments.length);
  const composerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!sending) {
      return;
    }

    composerRef.current?.focus();
  }, [sending]);

  function handleAttachmentInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []).filter((file) => file.size > 0);
    if (files.length) {
      onAddAttachments?.(files);
    }
    event.currentTarget.value = "";
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <section className="glass-panel mx-auto flex min-h-[70vh] max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <ConversationThreadNav
          brandingLabel={brandingLabel}
          brandingUrl={brandingUrl}
          brandColor={brandColor}
          showBranding={showBranding}
          teamPhotoUrl={teamPhotoUrl}
          widgetTitle={widgetTitle}
        />
        <div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_100%)] px-4 py-5 sm:px-6">
          {messages.map((message) => (
            <ConversationResumeMessage key={message.id} {...message} teamColor={brandColor} />
          ))}
          {teamTyping ? (
            <div className="flex justify-start">
              <div className="rounded-[18px] rounded-bl-md bg-white px-4 py-3 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
                <span className="typing-dot inline-block h-2 w-2 rounded-full bg-slate-300" />
                <span className="typing-dot ml-1 inline-block h-2 w-2 rounded-full bg-slate-300" />
                <span className="typing-dot ml-1 inline-block h-2 w-2 rounded-full bg-slate-300" />
              </div>
            </div>
          ) : null}
        </div>

        <form onSubmit={onSubmit} className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          {allowAttachments && attachments.length ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((attachment, index) => (
                <div
                  key={`${attachment.name || "attachment"}-${attachment.size}-${index}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                >
                  <span className="max-w-[180px] truncate">{attachment.name || "Attachment"}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment?.(index)}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                    aria-label={`Remove ${attachment.name || "attachment"}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {allowAttachments ? (
                <label className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700">
                  <PaperclipIcon className="h-4 w-4" />
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleAttachmentInputChange}
                  />
                </label>
              ) : null}

              <FormInput
                ref={composerRef}
                value={content}
                onChange={(event) => onChangeContent(event.target.value)}
                placeholder={allowAttachments ? "Type your reply or add files" : "Type your reply"}
                className="min-w-0 flex-1"
              />
            </div>
            <Button
              type="submit"
              disabled={sending || !canSend}
              className="w-full shrink-0 whitespace-nowrap px-6 sm:w-auto sm:min-w-[190px] glow-send"
              style={{ backgroundColor: brandColor }}
            >
              {sending ? "Sending..." : "Send message"}
            </Button>
          </div>
          <p className="mt-2 text-[11px] font-normal text-slate-400">
            {allowAttachments
              ? "Up to 3 files, 4 MB each · Press Enter to send · Shift+Enter for new line"
              : "Press Enter to send · Shift+Enter for new line"}
          </p>
        </form>
      </section>
    </main>
  );
}
