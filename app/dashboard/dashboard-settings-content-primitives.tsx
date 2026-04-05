"use client";

import type { ReactNode } from "react";
import { classNames } from "@/lib/utils";

export function SettingsCardBody({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={classNames("-mx-6 border-t border-slate-200 px-6 py-5", className)}>{children}</div>;
}

export function SettingsCardRows({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={classNames("-mx-6 border-t border-slate-200", className)}>{children}</div>;
}

export function SettingsCardRow({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={classNames("border-b border-slate-100 px-6 py-5 last:border-b-0", className)}>{children}</div>;
}

export function SettingsCardEmptyState({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={classNames("-mx-6 border-t border-slate-200 px-6 py-8 text-sm text-slate-500", className)}>{children}</div>;
}
