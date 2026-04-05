"use client";

import type { ReactNode } from "react";
import { classNames } from "@/lib/utils";

export const CONTACT_SELECT_CLASS_NAME =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export function ContactProfileSection({
  title,
  action,
  children
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-slate-200 pt-5 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.05em] text-slate-400">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ContactProfileRow({
  label,
  value,
  action,
  valueClassName
}: {
  label: string;
  value: ReactNode;
  action?: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 text-sm">
      <span className="min-w-[92px] text-slate-500">{label}</span>
      <div className="flex min-w-0 items-start gap-3">
        <span className={classNames("text-right text-slate-900", valueClassName)}>{value}</span>
        {action}
      </div>
    </div>
  );
}
