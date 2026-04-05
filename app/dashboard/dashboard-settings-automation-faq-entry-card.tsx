"use client";

import { useState } from "react";
import type { DashboardAutomationFaqEntry } from "@/lib/data/settings-types";

export function AutomationFaqEntryCard({
  entry,
  onEdit,
  onDelete
}: {
  entry: DashboardAutomationFaqEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-sm font-semibold text-violet-500">?</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{entry.question}</p>
          <p className="mt-3 text-[13px] text-slate-500">
            <span className="font-medium text-slate-600">Keywords:</span> {entry.keywords.join(", ")}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-700">{entry.answer}</p>
          {entry.link ? <p className="mt-2 text-[13px] text-slate-500">Read more: {entry.link}</p> : null}
          <div className="mt-4 flex items-center justify-end gap-4">
            <button type="button" onClick={onEdit} className="text-[13px] font-medium text-blue-600 transition hover:text-blue-700">
              Edit
            </button>
            <button type="button" onClick={() => setConfirmingDelete(true)} className="text-[13px] font-medium text-slate-400 transition hover:text-red-600">
              Delete
            </button>
          </div>
          {confirmingDelete ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] text-slate-700">Delete this FAQ?</p>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setConfirmingDelete(false)} className="text-[13px] font-medium text-slate-600 transition hover:text-slate-900">
                    Cancel
                  </button>
                  <button type="button" onClick={onDelete} className="text-[13px] font-medium text-red-600 transition hover:text-red-700">
                    Yes, delete
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
