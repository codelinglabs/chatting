"use client";

import { useToast } from "../ui/toast-provider";
import { Button } from "../components/ui/Button";
import type { DashboardTeamMember } from "@/lib/data/settings-types";
import {
  canAssignConversation,
  ConversationAssigneeBadge,
  findConversationAssignee
} from "./dashboard-conversation-assignee";
import { DASHBOARD_SELECT_CLASS } from "./dashboard-controls";

export function DashboardThreadAssignmentControls({
  assignedUserId,
  teamMembers,
  assigningConversation,
  onAssignConversation
}: {
  assignedUserId: string | null;
  teamMembers: DashboardTeamMember[];
  assigningConversation: boolean;
  onAssignConversation: (assignedUserId: string | null) => Promise<void>;
}) {
  const { showToast } = useToast();
  const showAssignmentControls = canAssignConversation(teamMembers);
  const assignee = findConversationAssignee(teamMembers, assignedUserId);
  const currentUser = teamMembers.find((member) => member.isCurrentUser) ?? null;

  if (!showAssignmentControls) {
    return null;
  }

  async function handleAssign(nextAssignedUserId: string | null) {
    try {
      await onAssignConversation(nextAssignedUserId);
      if (!nextAssignedUserId) {
        showToast("success", "Conversation unassigned");
        return;
      }

      const nextAssignee = findConversationAssignee(teamMembers, nextAssignedUserId);
      showToast("success", "Conversation assigned", nextAssignee ? `Now assigned to ${nextAssignee.name}.` : undefined);
    } catch (error) {
      showToast(
        "error",
        "We couldn't update the assignee.",
        error instanceof Error ? error.message : "Please try again in a moment."
      );
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.05em] text-slate-400">Assignment</h3>
        <ConversationAssigneeBadge assignee={assignee} />
      </div>

      <div className="mt-3 space-y-3">
        <select
          aria-label="Assign conversation"
          value={assignedUserId ?? ""}
          onChange={(event) => void handleAssign(event.currentTarget.value || null)}
          disabled={assigningConversation}
          className={DASHBOARD_SELECT_CLASS}
        >
          <option value="">Unassigned</option>
          {teamMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>

        {currentUser && currentUser.id !== assignedUserId ? (
          <Button
            type="button"
            size="md"
            variant="secondary"
            fullWidth
            disabled={assigningConversation}
            onClick={() => void handleAssign(currentUser.id)}
          >
            Take conversation
          </Button>
        ) : null}
      </div>
    </section>
  );
}
