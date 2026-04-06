"use client";

import type { DashboardTeamMember } from "@/lib/data/settings-types";
import { classNames } from "@/lib/utils";

export function canAssignConversation(teamMembers: DashboardTeamMember[]) {
  return teamMembers.length > 1;
}

export function findConversationAssignee(
  teamMembers: DashboardTeamMember[],
  assignedUserId: string | null | undefined
) {
  if (!assignedUserId) {
    return null;
  }

  return teamMembers.find((member) => member.id === assignedUserId) ?? null;
}

export function ConversationAssigneeBadge({
  assignee,
  compact = false,
  showUnassigned = true
}: {
  assignee: DashboardTeamMember | null;
  compact?: boolean;
  showUnassigned?: boolean;
}) {
  if (!assignee) {
    if (!showUnassigned) {
      return null;
    }

    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
        Unassigned
      </span>
    );
  }

  return (
    <span
      className={classNames(
        "inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700",
        compact ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-xs"
      )}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold">
        {assignee.initials}
      </span>
      <span className="truncate">{compact ? assignee.name.split(" ")[0] || assignee.name : assignee.name}</span>
    </span>
  );
}
