"use client";

import type { ContactStatusDefinition } from "@/lib/contact-types";
import { contactStatusToneClass } from "@/lib/contact-utils";

export function DashboardContactStatusBadge({
  statusKey,
  statuses
}: {
  statusKey: string;
  statuses: ContactStatusDefinition[];
}) {
  const status = statuses.find((entry) => entry.key === statusKey);
  if (!status) {
    return null;
  }

  return (
    <span className={`${contactStatusToneClass(status.color)} inline-flex rounded-full px-2.5 py-1 text-xs font-medium`}>
      {status.label}
    </span>
  );
}
