"use client";

import type { ReactNode } from "react";
import type { WidgetOperatingHours } from "@/lib/types";

function formatOperatingHoursTime(value: string) {
  const [hour = "0", minute = "0"] = value.split(":");
  const date = new Date(Date.UTC(2024, 0, 1, Number(hour), Number(minute)));

  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

export function summarizeOperatingHours(operatingHours: WidgetOperatingHours | null) {
  if (!operatingHours) {
    return [];
  }

  return [
    { label: "Mon - Fri", keys: ["monday", "tuesday", "wednesday", "thursday", "friday"] as const },
    { label: "Sat - Sun", keys: ["saturday", "sunday"] as const }
  ].map(({ label, keys }) => {
    const rows = keys.map((key) => operatingHours[key]);
    const allClosed = rows.every((row) => !row.enabled);
    const sameWindow = rows.every(
      (row) => row.enabled === rows[0].enabled && row.from === rows[0].from && row.to === rows[0].to
    );

    return {
      label,
      value: allClosed
        ? "Closed"
        : sameWindow
          ? `${formatOperatingHoursTime(rows[0].from)} - ${formatOperatingHoursTime(rows[0].to)}`
          : "Custom hours"
    };
  });
}

export function AutomationOfflinePanel({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 p-5">
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function AutomationOfficeHoursSummary({
  officeHoursEnabled,
  officeHoursTimezone,
  officeRows
}: {
  officeHoursEnabled: boolean;
  officeHoursTimezone: string | null;
  officeRows: Array<{ label: string; value: string }>;
}) {
  if (!officeHoursEnabled || !officeRows.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
        No office hours set. Your team appears online based on their activity.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-900">Office hours enabled</p>
      <div className="mt-3 space-y-2 text-sm text-slate-600">
        {officeRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">Timezone: {officeHoursTimezone ?? "UTC"}</p>
    </div>
  );
}
