"use client";

import type { ContactListPayload, ContactSummary } from "@/lib/contact-types";
import { Button } from "../components/ui/Button";
import { DashboardModal } from "./dashboard-modal";

const EXPORT_FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  company: "Company",
  phone: "Phone",
  status: "Status",
  tags: "Tags",
  firstSeen: "First seen",
  lastSeen: "Last seen",
  conversations: "Conversations",
  source: "Source"
};

export function DashboardContactsExportModal({
  payload,
  contacts,
  exportFields,
  onToggleField,
  onExport,
  onClose
}: {
  payload: ContactListPayload;
  contacts: ContactSummary[];
  exportFields: string[];
  onToggleField: (field: string, checked: boolean) => void;
  onExport: () => Promise<void>;
  onClose: () => void;
}) {
  const allFields = [
    ...Object.keys(EXPORT_FIELD_LABELS),
    ...payload.settings.customFields.map((field) => field.key)
  ];

  return (
    <DashboardModal title="Export contacts" description={`Export ${contacts.length} contacts to CSV`} onClose={onClose} widthClass="max-w-[520px]">
      <div className="space-y-4 px-6 py-6">
        {!payload.limits.exportEnabled ? (
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Contact export unlocks on paid plans in the current billing model.
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          {allFields.map((field) => (
            <label key={field} className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={exportFields.includes(field)}
                onChange={(event) => onToggleField(field, event.currentTarget.checked)}
              />
              {EXPORT_FIELD_LABELS[field] ?? payload.settings.customFields.find((entry) => entry.key === field)?.label ?? field}
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button
            type="button"
            size="md"
            disabled={!payload.limits.exportEnabled}
            onClick={() => void onExport()}
          >
            Export CSV
          </Button>
        </div>
      </div>
    </DashboardModal>
  );
}

export function DashboardContactsDeleteModal({
  count,
  onClose,
  onConfirm
}: {
  count: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <DashboardModal title="Delete contacts" description="This removes contact memory, notes, tags, and custom fields for the selected people." onClose={onClose} widthClass="max-w-[480px]">
      <div className="space-y-4 px-6 py-6">
        <p className="text-sm text-slate-600">Delete {count} selected contacts?</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button
            type="button"
            size="md"
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </DashboardModal>
  );
}
