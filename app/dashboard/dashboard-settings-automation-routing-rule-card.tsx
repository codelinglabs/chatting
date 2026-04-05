"use client";

import { useState, type DragEventHandler, type ReactNode } from "react";
import { classNames } from "@/lib/utils";
import { Input } from "../components/ui/Input";
import { ChevronDownIcon, DotsVerticalIcon, TrashIcon, WarningIcon } from "./dashboard-ui";

export function AutomationRoutingRuleCard({
  conditionControl,
  actionLabel,
  value,
  valueListId,
  valuePlaceholder,
  actionControl,
  valueError,
  actionError,
  onValueChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isDragging,
  onDragStart,
  onDragEnd,
  children
}: {
  conditionControl: ReactNode;
  actionLabel: string;
  value: string;
  valueListId?: string;
  valuePlaceholder?: string;
  actionControl: ReactNode;
  valueError?: string | null;
  actionError?: string | null;
  onValueChange: (value: string) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isDragging?: boolean;
  onDragStart?: DragEventHandler<HTMLButtonElement>;
  onDragEnd?: DragEventHandler<HTMLButtonElement>;
  children?: ReactNode;
}) {
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

  return (
    <div
      tabIndex={0}
      onKeyDown={(event) => {
        if ((event.key === "Backspace" || event.key === "Delete") && event.currentTarget === event.target) {
          event.preventDefault();
          setIsDeleteConfirming(true);
        }
      }}
      className={classNames(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition focus:outline-none focus:ring-4 focus:ring-blue-100",
        isDragging && "shadow-lg opacity-90"
      )}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          draggable
          aria-label="Drag rule"
          aria-grabbed={isDragging}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="mt-1 hidden shrink-0 cursor-grab rounded-lg p-1 text-slate-300 transition hover:bg-slate-50 hover:text-slate-500 active:cursor-grabbing md:inline-flex"
        >
          <DotsVerticalIcon className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 space-y-3.5">
          <div className="grid gap-3 md:grid-cols-[20px_190px_minmax(0,1fr)] md:items-start">
            <div className="flex h-11 items-center">
              <p className="text-sm font-medium text-slate-600">If</p>
            </div>
            <div className="flex min-w-0 h-11 items-center">{conditionControl}</div>
            <div className="min-w-0">
              <Input
                value={value}
                list={valueListId}
                placeholder={valuePlaceholder}
                onChange={(event) => onValueChange(event.currentTarget.value)}
                className={valueError ? "border-red-500 focus:border-red-500 focus:ring-red-100" : undefined}
              />
              {valueError ? <AutomationRoutingErrorText message={valueError} /> : null}
              {children}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-[110px_minmax(0,1fr)_auto] md:items-start">
            <div className="flex h-11 items-center">
              <p className="text-sm font-medium text-slate-600">{actionLabel}</p>
            </div>
            <div className="min-w-0">
              {actionControl}
              {actionError ? <AutomationRoutingErrorText message={actionError} /> : null}
            </div>
            <div className="flex items-center justify-end gap-2 pt-0.5 md:self-start">
              <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button type="button" onClick={onMoveUp} disabled={!canMoveUp} className="rounded-md px-2 py-2 text-sm text-slate-600 transition hover:bg-white disabled:opacity-40" aria-label="Move rule up">↑</button>
                <button type="button" onClick={onMoveDown} disabled={!canMoveDown} className="rounded-md px-2 py-2 text-sm text-slate-600 transition hover:bg-white disabled:opacity-40" aria-label="Move rule down">↓</button>
              </div>
              <button type="button" onClick={() => setIsDeleteConfirming(true)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-[13px] font-medium text-slate-400 transition hover:bg-red-50 hover:text-red-600" aria-label="Delete rule">
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
          {isDeleteConfirming ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] text-slate-700">Delete this rule?</p>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setIsDeleteConfirming(false)} className="text-[13px] font-medium text-slate-600 transition hover:text-slate-900">Cancel</button>
                  <button type="button" onClick={onDelete} className="text-[13px] font-medium text-red-600 transition hover:text-red-700">Yes, delete</button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AutomationRoutingErrorText({ message }: { message: string }) {
  return (
    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-red-600">
      <WarningIcon className="h-3.5 w-3.5" />
      {message}
    </p>
  );
}

export function AutomationSelectField({
  value,
  className,
  autoFocus,
  onChange,
  children
}: {
  value: string;
  className?: string;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.currentTarget.value)}
        className={classNames(
          "h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
          className
        )}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
