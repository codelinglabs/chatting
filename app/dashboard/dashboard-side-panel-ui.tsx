"use client";

import type { ReactNode } from "react";
import { classNames } from "@/lib/utils";

export type SidebarKeyValueRow = {
  label: string;
  value: ReactNode;
  valueClassName?: string;
};

export function SidebarDivider() {
  return <div className="my-4 h-px bg-slate-200" />;
}

export function SidebarSection({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.05em] text-slate-400">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function SidebarKeyValueRows({
  rows
}: {
  rows: readonly SidebarKeyValueRow[];
}) {
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-start justify-between gap-3 text-[13px]"
        >
          <span className="text-slate-500">{row.label}</span>
          <span
            className={classNames(
              "max-w-[180px] break-all text-right text-slate-900",
              row.valueClassName
            )}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
