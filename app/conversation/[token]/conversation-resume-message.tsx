"use client";

import type { MessageAttachment } from "@/lib/types";

type ConversationResumeMessageProps = {
  attachments: MessageAttachment[];
  content: string;
  createdAt: string;
  sender: "team" | "user";
  teamColor: string;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function ConversationResumeMessage({
  attachments,
  content,
  createdAt,
  sender,
  teamColor
}: ConversationResumeMessageProps) {
  const fromTeam = sender === "team";

  return (
    <div className={`message-enter flex ${fromTeam ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[85%] ${fromTeam ? "items-start" : "items-end"} flex flex-col gap-2`}>
        <div
          className={`rounded-[18px] px-4 py-3 text-sm leading-6 shadow-sm ${
            fromTeam ? "rounded-bl-md text-white" : "rounded-br-md bg-slate-100 text-slate-900"
          }`}
          style={fromTeam ? { backgroundColor: teamColor } : undefined}
        >
          {content.trim() || "(attachment only)"}
          {attachments.length ? (
            <div className="mt-3 space-y-2 border-t border-white/20 pt-3 text-xs text-inherit">
              {attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block underline decoration-white/40 underline-offset-4"
                >
                  {attachment.fileName}
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <p className="px-1 text-xs text-slate-400">{formatTime(createdAt)}</p>
      </div>
    </div>
  );
}
