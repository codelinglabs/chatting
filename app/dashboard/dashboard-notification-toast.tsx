"use client";

import { XIcon } from "./dashboard-ui";
import type { DashboardToast } from "./use-dashboard-notification-center";

export function DashboardNotificationToast({
  toast,
  onDismiss,
  onOpen
}: {
  toast: DashboardToast;
  onDismiss: () => void;
  onOpen: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className="fixed right-4 top-20 z-40 w-[320px] rounded-lg border border-slate-200 bg-white px-4 py-3 text-left shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition hover:border-blue-200 sm:right-6"
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">{toast.title}</p>
          <p className="mt-1 truncate text-[13px] text-slate-500">{toast.preview}</p>
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={(event) => {
            event.stopPropagation();
            onDismiss();
          }}
          className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
