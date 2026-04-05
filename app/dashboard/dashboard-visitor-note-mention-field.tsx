"use client";

import { useMemo, useState } from "react";
import { FormTextarea } from "../ui/form-controls";
import type { MentionableTeammate } from "@/lib/mention-identities";
import { classNames } from "@/lib/utils";
import {
  applyVisitorNoteMention,
  findActiveVisitorNoteMention,
  getVisitorNoteMentionSuggestions
} from "./dashboard-visitor-note-mentions";

type DashboardVisitorNoteMentionFieldProps = {
  id: string;
  value: string;
  mentionableUsers: MentionableTeammate[];
  onChange: (nextValue: string) => void;
  placeholder: string;
};

function focusTextareaCursor(textareaId: string, cursor: number) {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  window.setTimeout(() => {
    const field = document.getElementById(textareaId) as HTMLTextAreaElement | null;
    field?.focus();
    field?.setSelectionRange(cursor, cursor);
  }, 0);
}

export function DashboardVisitorNoteMentionField({
  id,
  value,
  mentionableUsers,
  onChange,
  placeholder
}: DashboardVisitorNoteMentionFieldProps) {
  const [activeMention, setActiveMention] = useState<ReturnType<typeof findActiveVisitorNoteMention>>(null);
  const suggestions = useMemo(
    () =>
      activeMention
        ? getVisitorNoteMentionSuggestions(mentionableUsers, activeMention.query)
        : [],
    [activeMention, mentionableUsers]
  );

  function syncActiveMention(nextValue: string, selectionStart: number | null | undefined) {
    if (!mentionableUsers.length) {
      setActiveMention(null);
      return;
    }

    setActiveMention(findActiveVisitorNoteMention(nextValue, selectionStart));
  }

  function handleSelect(handle: string) {
    if (!activeMention) {
      return;
    }

    const nextMention = applyVisitorNoteMention(value, activeMention, handle);
    onChange(nextMention.value);
    setActiveMention(null);
    focusTextareaCursor(id, nextMention.cursor);
  }

  return (
    <div className="relative">
      <FormTextarea
        id={id}
        rows={5}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          syncActiveMention(event.target.value, event.target.selectionStart);
        }}
        onClick={(event) => syncActiveMention(event.currentTarget.value, event.currentTarget.selectionStart)}
        onKeyUp={(event) => syncActiveMention(event.currentTarget.value, event.currentTarget.selectionStart)}
        onKeyDown={(event) => {
          if (!suggestions.length) {
            return;
          }

          if (event.key === "Escape") {
            setActiveMention(null);
            return;
          }

          if (event.key === "Enter" || event.key === "Tab") {
            event.preventDefault();
            handleSelect(suggestions[0].handle);
          }
        }}
        placeholder={placeholder}
        className="min-h-[120px] rounded-2xl"
      />
      {suggestions.length ? (
        <div className="absolute inset-x-0 top-full z-10 mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
            Mention teammate
          </p>
          <div className="space-y-1">
            {suggestions.map((user) => (
              <button
                key={user.userId}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(user.handle)}
                className={classNames(
                  "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left transition",
                  "hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                )}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-800">{user.displayName}</span>
                  <span className="block text-xs text-slate-500">@{user.handle}</span>
                </span>
                <span className="ml-3 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                  Insert
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
