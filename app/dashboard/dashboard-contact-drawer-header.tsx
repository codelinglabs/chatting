"use client";

import type { ContactDetail, ContactStatusDefinition } from "@/lib/contact-types";
import { Button } from "../components/ui/Button";
import { DashboardContactAvatar } from "./dashboard-contact-avatar";
import { contactSummaryLine } from "./dashboard-contact-drawer-utils";
import { CONTACT_SELECT_CLASS_NAME } from "./dashboard-contact-profile-ui";

export function DashboardContactDrawerHeader({
  detail,
  statuses,
  onStatusChange,
  onAddTag
}: {
  detail: ContactDetail;
  statuses: ContactStatusDefinition[];
  onStatusChange: (status: string) => void;
  onAddTag: () => void;
}) {
  const summary = contactSummaryLine(detail.company, detail.location);

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-4">
        <DashboardContactAvatar name={detail.name} avatarUrl={detail.avatarUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[18px] font-medium text-slate-900">{detail.name}</p>
          <p className="truncate text-sm text-slate-500">{detail.email}</p>
          <p className="mt-1 truncate text-sm text-slate-500">{summary || "No company or location yet"}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {statuses.length ? (
          <select
            value={detail.status}
            onChange={(event) => onStatusChange(event.currentTarget.value)}
            className={`${CONTACT_SELECT_CLASS_NAME} max-w-[180px]`}
          >
            {statuses.map((status) => (
              <option key={status.key} value={status.key}>
                {status.label}
              </option>
            ))}
          </select>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="h-10 rounded-xl px-4"
          onClick={onAddTag}
        >
          Add tag
        </Button>
      </div>
    </section>
  );
}
