"use client";

import type { DragEventHandler } from "react";
import type { DashboardAutomationPagePrompt } from "@/lib/data/settings-types";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { AutomationSelect } from "./dashboard-settings-automation-ui";
import { PROMPT_DELAY_OPTIONS } from "./dashboard-settings-automation-options";
import {
  ProactiveDeleteConfirmation,
  ProactiveDroppableCard,
  ProactiveRuleDragHandle
} from "./dashboard-settings-automation-proactive-card-chrome";
import {
  proactivePromptErrors,
  proactivePromptMeta,
  proactivePromptSummary
} from "./dashboard-settings-automation-proactive-helpers";

const ACTION_BUTTON_CLASS = "text-sm font-medium transition";

export function SettingsAutomationProactiveRuleCard({
  prompt,
  isExpanded,
  isDeleteConfirming,
  canCollapse,
  onExpand,
  onCollapse,
  onUpdatePrompt,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragOver,
  onDrop
}: {
  prompt: DashboardAutomationPagePrompt;
  isExpanded: boolean;
  isDeleteConfirming: boolean;
  canCollapse: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onUpdatePrompt: (next: DashboardAutomationPagePrompt) => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onDragStart?: DragEventHandler<HTMLButtonElement>;
  onDragEnd?: DragEventHandler<HTMLButtonElement>;
  onDragEnter?: DragEventHandler<HTMLDivElement>;
  onDragOver?: DragEventHandler<HTMLDivElement>;
  onDrop?: DragEventHandler<HTMLDivElement>;
}) {
  const errors = proactivePromptErrors(prompt);

  if (!isExpanded) {
    return (
      <ProactiveDroppableCard
        className="px-5 py-4"
        isDragging={isDragging}
        isDropTarget={isDropTarget}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <ProactiveRuleDragHandle isDragging={isDragging} onDragStart={onDragStart} onDragEnd={onDragEnd} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{prompt.pagePath.trim() || "Draft rule"}</p>
              <p className="mt-1 truncate text-sm text-slate-600">{proactivePromptSummary(prompt)}</p>
              <p className="mt-2 text-xs text-slate-400">{proactivePromptMeta(prompt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className={`${ACTION_BUTTON_CLASS} text-blue-600 hover:text-blue-700`} onClick={onExpand}>
              Edit
            </button>
            <button type="button" className={`${ACTION_BUTTON_CLASS} text-slate-400 hover:text-red-600`} onClick={onRequestDelete}>
              Delete
            </button>
          </div>
        </div>
        {isDeleteConfirming ? <ProactiveDeleteConfirmation onCancel={onCancelDelete} onConfirm={onConfirmDelete} /> : null}
      </ProactiveDroppableCard>
    );
  }

  return (
    <ProactiveDroppableCard
      className="p-5"
      isDragging={isDragging}
      isDropTarget={isDropTarget}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <ProactiveRuleDragHandle isDragging={isDragging} onDragStart={onDragStart} onDragEnd={onDragEnd} />
          <div>
            <p className="text-sm font-semibold text-slate-900">Rule details</p>
            <p className="mt-1 text-sm text-slate-500">Each page only triggers the first matching message.</p>
          </div>
        </div>
        {canCollapse ? (
          <button type="button" className={`${ACTION_BUTTON_CLASS} text-slate-500 hover:text-slate-900`} onClick={onCollapse}>
            Collapse
          </button>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Page path</label>
          <Input
            value={prompt.pagePath}
            placeholder="/pricing, /checkout, /products/*"
            className={errors.pagePath ? "border-red-500 focus:border-red-500 focus:ring-red-100" : undefined}
            onChange={(event) => {
              const value = event.currentTarget.value;
              onUpdatePrompt({ ...prompt, pagePath: value });
            }}
          />
          <p className="mt-2 text-xs text-slate-500">Use * as wildcard. Example: /products/* matches all product pages.</p>
          {errors.pagePath ? <p className="mt-2 text-xs text-red-600">{errors.pagePath}</p> : null}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-slate-700">Message</label>
            <span className="text-xs text-slate-400">{prompt.message.length}/150</span>
          </div>
          <Textarea
            rows={3}
            maxLength={150}
            value={prompt.message}
            placeholder="What would you like to say?"
            className={errors.message ? "border-red-500 focus:border-red-500 focus:ring-red-100" : undefined}
            onChange={(event) => {
              const value = event.currentTarget.value;
              onUpdatePrompt({ ...prompt, message: value });
            }}
          />
          {errors.message ? <p className="mt-2 text-xs text-red-600">{errors.message}</p> : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Show after</label>
            <AutomationSelect
              value={prompt.delaySeconds}
              onChange={(value) => onUpdatePrompt({ ...prompt, delaySeconds: Number(value) as typeof prompt.delaySeconds })}
            >
              {PROMPT_DELAY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AutomationSelect>
          </div>
          <div className="pt-7">
            <label className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4">
              <input
                type="checkbox"
                checked={prompt.autoOpenWidget}
                onChange={(event) => {
                  const checked = event.currentTarget.checked;
                  onUpdatePrompt({ ...prompt, autoOpenWidget: checked });
                }}
                className="h-4 w-4 rounded border-slate-300 accent-blue-600"
              />
              <span className="text-sm font-medium text-slate-700">Open widget automatically</span>
            </label>
            <p className="mt-2 text-xs text-slate-500">
              Message appears as a bubble. Visitor clicks to open.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-400">{proactivePromptMeta(prompt)}</p>
        <button type="button" className={`${ACTION_BUTTON_CLASS} text-slate-400 hover:text-red-600`} onClick={onRequestDelete}>
          Delete
        </button>
      </div>
      {isDeleteConfirming ? <ProactiveDeleteConfirmation onCancel={onCancelDelete} onConfirm={onConfirmDelete} /> : null}
    </ProactiveDroppableCard>
  );
}
