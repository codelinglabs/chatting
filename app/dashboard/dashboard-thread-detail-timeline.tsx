import { Button } from "../components/ui/Button";
import type { ConversationThread } from "@/lib/types";
import { groupedMessages, messageTime, renderAttachments } from "./dashboard-thread-detail.utils";

export function renderDashboardThreadDetailTimeline(input: {
  activeConversation: ConversationThread;
  isVisitorTyping: boolean;
  sendingReply: boolean;
  teamInitials: string;
  teamName: string;
  onRetryReply: (messageId: string) => Promise<void>;
}) {
  const timeline = groupedMessages(input.activeConversation.messages);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-5">
      <div className="space-y-4">
        {timeline.map((entry, index) =>
          entry.type === "day" ? (
            <div key={`day-${entry.value}-${index}`} className="py-1 text-center text-xs text-slate-400">
              <span>&#9472;&#9472; {entry.value} &#9472;&#9472;</span>
            </div>
          ) : entry.value.sender === "founder" ? (
            <div key={entry.value.id} className="flex justify-end">
              <div className="flex max-w-[70%] items-end gap-2">
                <div className="min-w-0 text-right">
                  <article className="rounded-[12px_12px_4px_12px] bg-blue-600 px-4 py-3 text-sm leading-6 text-white">
                    {entry.value.content ? <p className="whitespace-pre-wrap break-words">{entry.value.content}</p> : null}
                    {renderAttachments(entry.value)}
                  </article>
                  <div className="mt-1 flex items-center justify-end gap-2 text-[11px] font-normal text-slate-400">
                    <span className={entry.value.failed ? "text-red-500" : undefined}>
                      {input.teamName} · {entry.value.failed ? "Didn't send" : messageTime(entry.value.createdAt)}
                    </span>
                    {entry.value.failed ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        className="h-auto rounded-full px-3 py-1 text-[11px] font-medium"
                        disabled={input.sendingReply}
                        onClick={() => void input.onRetryReply(entry.value.id)}
                      >
                        Retry
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-medium text-blue-700">
                  {input.teamInitials}
                </div>
              </div>
            </div>
          ) : (
            <div key={entry.value.id} className="flex justify-start">
              <div className="max-w-[70%]">
                <article className="rounded-[12px_12px_12px_4px] bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-900">
                  {entry.value.content ? <p className="whitespace-pre-wrap break-words">{entry.value.content}</p> : null}
                  {renderAttachments(entry.value)}
                </article>
                <div className="mt-1 text-[11px] font-normal text-slate-400">{messageTime(entry.value.createdAt)}</div>
              </div>
            </div>
          )
        )}

        {input.isVisitorTyping ? (
          <div className="flex justify-start">
            <div className="rounded-[12px_12px_12px_4px] bg-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
                </div>
                <span className="text-xs font-normal text-slate-500">Visitor is typing...</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
