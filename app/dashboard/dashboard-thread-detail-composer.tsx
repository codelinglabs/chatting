import type { FormEvent, KeyboardEvent } from "react";
import type { ConversationThread } from "@/lib/types";
import { PaperclipIcon } from "./dashboard-ui";
import { replyPlaceholder } from "./dashboard-thread-detail.utils";

function handleReplyKeyDown(
  event: KeyboardEvent<HTMLTextAreaElement>
) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }
}

export function renderDashboardThreadDetailComposer(input: {
  activeConversation: ConversationThread;
  sendingReply: boolean;
  onSendReply: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onReplyComposerBlur: () => void;
  onReplyComposerFocus: (value: string) => void;
  onReplyComposerInput: (value: string) => void;
}) {
  return (
    <div className="border-t border-slate-200 bg-white px-5 py-4">
      <form onSubmit={input.onSendReply}>
        <input type="hidden" name="conversationId" value={input.activeConversation.id} />

        <textarea
          name="content"
          rows={3}
          onBlur={input.onReplyComposerBlur}
          onFocus={(event) => input.onReplyComposerFocus(event.currentTarget.value)}
          onInput={(event) => input.onReplyComposerInput(event.currentTarget.value)}
          onKeyDown={handleReplyKeyDown}
          placeholder={replyPlaceholder(input.activeConversation)}
          className="min-h-[44px] w-full rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100"
        />

        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex items-center">
            <label className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-300 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700">
              <PaperclipIcon className="h-4 w-4" />
              <input type="file" name="attachments" multiple className="hidden" />
            </label>
          </div>

          <button
            type="submit"
            disabled={input.sendingReply}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Send reply"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M22 2 11 13" />
              <path d="m22 2-7 20-4-9-9-4Z" />
            </svg>
          </button>
        </div>

        <p className="mt-2 text-[11px] font-normal text-slate-400">Press Enter to send · Shift+Enter for new line</p>
      </form>
    </div>
  );
}
