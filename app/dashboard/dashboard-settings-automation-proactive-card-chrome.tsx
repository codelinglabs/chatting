"use client";

import type { DragEventHandler, ReactNode } from "react";
import { classNames } from "@/lib/utils";
import { DotsVerticalIcon } from "./dashboard-ui";

type DragHandlers = {
  onDragEnter?: DragEventHandler<HTMLDivElement>;
  onDragOver?: DragEventHandler<HTMLDivElement>;
  onDrop?: DragEventHandler<HTMLDivElement>;
};

export function ProactiveDroppableCard({
  children,
  className,
  isDragging,
  isDropTarget,
  onDragEnter,
  onDragOver,
  onDrop
}: DragHandlers & {
  children: ReactNode;
  className: string;
  isDragging?: boolean;
  isDropTarget?: boolean;
}) {
  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={classNames(
        "rounded-xl border border-slate-200 bg-slate-50 transition",
        isDragging && "opacity-90 shadow-lg",
        isDropTarget && "border-blue-300 bg-blue-50",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ProactiveRuleDragHandle({
  isDragging,
  onDragStart,
  onDragEnd
}: {
  isDragging?: boolean;
  onDragStart?: DragEventHandler<HTMLButtonElement>;
  onDragEnd?: DragEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      draggable
      aria-label="Drag rule"
      aria-grabbed={isDragging}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="mt-0.5 hidden shrink-0 cursor-grab rounded-lg p-1 text-slate-300 transition hover:bg-white hover:text-slate-500 active:cursor-grabbing md:inline-flex"
    >
      <DotsVerticalIcon className="h-4 w-4" />
    </button>
  );
}

export function ProactiveDeleteConfirmation({
  onCancel,
  onConfirm
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
      <p className="text-sm text-slate-700">Delete this rule?</p>
      <div className="flex items-center gap-3">
        <button type="button" className="text-sm font-medium text-slate-600 transition hover:text-slate-900" onClick={onCancel}>Cancel</button>
        <button type="button" className="text-sm font-medium text-red-600 transition hover:text-red-700" onClick={onConfirm}>Yes, delete</button>
      </div>
    </div>
  );
}
