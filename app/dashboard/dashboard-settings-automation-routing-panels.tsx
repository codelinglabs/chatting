"use client";

import type { ReactNode } from "react";
import { classNames } from "@/lib/utils";
import { InfoIcon, PlusIcon } from "./dashboard-ui";

export function AutomationRoutingPanel({
  title,
  description,
  action,
  children
}: {
  title: string;
  description: string;
  action: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-[15px] font-semibold text-slate-900">{title}</h4>
          <p className="mt-1 text-[13px] text-slate-500">{description}</p>
        </div>
        {action}
      </div>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  );
}

export function AutomationRoutingAddRuleRow({
  onClick,
  disabled
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 px-4 py-4 text-sm font-medium text-slate-500 transition hover:border-blue-200 hover:bg-slate-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <PlusIcon className="h-4 w-4" />
      Add rule
    </button>
  );
}

export function AutomationRoutingHintRow({
  text,
  tone = "neutral"
}: {
  text: string;
  tone?: "neutral" | "amber";
}) {
  return (
    <div
      className={classNames(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-[13px]",
        tone === "amber" ? "border border-amber-200 bg-amber-50 text-amber-800" : "text-slate-500"
      )}
    >
      <InfoIcon className="h-4 w-4 shrink-0" />
      <p>{text}</p>
    </div>
  );
}
