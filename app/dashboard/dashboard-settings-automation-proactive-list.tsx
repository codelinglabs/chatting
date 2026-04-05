"use client";

import type { DragEventHandler } from "react";
import type { DashboardAutomationPagePrompt } from "@/lib/data/settings-types";
import { SettingsAutomationProactiveRuleCard } from "./dashboard-settings-automation-proactive-rule-card";

export function SettingsAutomationProactiveRulesList({
  prompts,
  expandedPromptId,
  pendingDeleteId,
  dragPromptId,
  dropPromptId,
  renderDeleteRequest,
  onExpand,
  onCollapse,
  onUpdatePrompt,
  onCancelDelete,
  onConfirmDelete,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragOver,
  onDrop
}: {
  prompts: DashboardAutomationPagePrompt[];
  expandedPromptId: string | null;
  pendingDeleteId: string | null;
  dragPromptId: string | null;
  dropPromptId: string | null;
  renderDeleteRequest: (prompt: DashboardAutomationPagePrompt) => void;
  onExpand: (promptId: string) => void;
  onCollapse: () => void;
  onUpdatePrompt: (promptId: string, next: DashboardAutomationPagePrompt) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (promptId: string) => void;
  onDragStart: (promptId: string) => void;
  onDragEnd: () => void;
  onDragEnter: (promptId: string) => DragEventHandler<HTMLDivElement>;
  onDragOver: (promptId: string) => DragEventHandler<HTMLDivElement>;
  onDrop: (promptId: string) => DragEventHandler<HTMLDivElement>;
}) {
  return (
    <div className="space-y-4">
      {prompts.map((prompt) => (
        <SettingsAutomationProactiveRuleCard
          key={prompt.id}
          prompt={prompt}
          isExpanded={expandedPromptId === prompt.id}
          isDeleteConfirming={pendingDeleteId === prompt.id}
          canCollapse={prompts.length > 1}
          isDragging={dragPromptId === prompt.id}
          isDropTarget={dropPromptId === prompt.id && dragPromptId !== prompt.id}
          onExpand={() => onExpand(prompt.id)}
          onCollapse={onCollapse}
          onUpdatePrompt={(next) => onUpdatePrompt(prompt.id, next)}
          onRequestDelete={() => renderDeleteRequest(prompt)}
          onCancelDelete={onCancelDelete}
          onConfirmDelete={() => onConfirmDelete(prompt.id)}
          onDragStart={() => onDragStart(prompt.id)}
          onDragEnd={onDragEnd}
          onDragEnter={onDragEnter(prompt.id)}
          onDragOver={onDragOver(prompt.id)}
          onDrop={onDrop(prompt.id)}
        />
      ))}
    </div>
  );
}
