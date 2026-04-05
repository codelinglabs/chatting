"use client";

import type { BillingPlanKey } from "@/lib/billing-plans";
import type { ContactWorkspaceSettings } from "@/lib/contact-types";
import { getContactPlanLimits } from "@/lib/plan-limits";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  ContactCustomFieldsEditor,
  createContactCustomFieldDefinition
} from "./dashboard-contact-custom-fields-editor";
import { SettingsCard } from "./dashboard-settings-shared";

const STATUS_COLORS = ["blue", "purple", "green", "amber", "gray"] as const;
const SELECT_CLASS_NAME =
  "h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export function ContactStatusSettingsCard({
  contacts,
  planKey,
  onUpdateContacts
}: {
  contacts: ContactWorkspaceSettings;
  planKey: BillingPlanKey;
  onUpdateContacts: (value: ContactWorkspaceSettings) => void;
}) {
  const limits = getContactPlanLimits(planKey);
  const atLimit =
    limits.customStatusesLimit !== null &&
    contacts.statuses.length >= limits.customStatusesLimit;
  const addStatusButton = (
    <Button
      type="button"
      variant="secondary"
      size="md"
      disabled={atLimit}
      onClick={() =>
        onUpdateContacts({
          ...contacts,
          statuses: [
            ...contacts.statuses,
            { key: `status-${Date.now()}`, label: "New status", color: "blue" }
          ]
        })
      }
    >
      Add status
    </Button>
  );

  return (
    <SettingsCard
      title="Statuses"
      description="Customize the labels your team uses to categorize contacts."
      actions={addStatusButton}
    >
      <div className="space-y-3">
        {!contacts.statuses.length ? (
          <p className="rounded-lg bg-slate-50 px-4 py-4 text-sm text-slate-500">
            No statuses yet. Add the labels your team wants to use.
          </p>
        ) : null}
        {contacts.statuses.map((status, index) => (
          <div key={status.key} className="grid gap-3 rounded-lg bg-slate-50 p-4 md:grid-cols-[minmax(0,1fr)_160px_auto]">
            <Input
              value={status.label}
              onChange={(event) =>
                onUpdateContacts({
                  ...contacts,
                  statuses: contacts.statuses.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, label: event.currentTarget.value } : entry
                  )
                })
              }
              placeholder="Customer"
            />
            <select
              value={status.color}
              onChange={(event) =>
                onUpdateContacts({
                  ...contacts,
                  statuses: contacts.statuses.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, color: event.currentTarget.value as typeof status.color } : entry
                  )
                })
              }
              className={SELECT_CLASS_NAME}
            >
              {STATUS_COLORS.map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() =>
                onUpdateContacts({
                  ...contacts,
                  statuses: contacts.statuses.filter((_, entryIndex) => entryIndex !== index)
                })
              }
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
      {limits.customStatusesLimit !== null ? (
        <p className="mt-4 text-sm text-slate-500">
          {contacts.statuses.length} of {limits.customStatusesLimit} statuses used
        </p>
      ) : null}
    </SettingsCard>
  );
}

export function ContactCustomFieldsSettingsCard({
  contacts,
  planKey,
  onUpdateContacts
}: {
  contacts: ContactWorkspaceSettings;
  planKey: BillingPlanKey;
  onUpdateContacts: (value: ContactWorkspaceSettings) => void;
}) {
  const limits = getContactPlanLimits(planKey);
  const atLimit =
    limits.customFieldsLimit !== null &&
    contacts.customFields.length >= limits.customFieldsLimit;
  const addFieldButton = (
    <Button
      type="button"
      variant="secondary"
      size="md"
      disabled={atLimit}
      onClick={() =>
        onUpdateContacts({
          ...contacts,
          customFields: [...contacts.customFields, createContactCustomFieldDefinition()]
        })
      }
    >
      Add field
    </Button>
  );

  return (
    <SettingsCard
      title="Custom fields"
      description="Add workspace-specific fields that appear on every contact profile."
      actions={addFieldButton}
    >
      <ContactCustomFieldsEditor
        fields={contacts.customFields}
        onChange={(customFields) => onUpdateContacts({ ...contacts, customFields })}
      />
      {limits.customFieldsLimit !== null ? (
        <p className="mt-4 text-sm text-slate-500">
          {contacts.customFields.length} of {limits.customFieldsLimit} custom fields used
        </p>
      ) : null}
    </SettingsCard>
  );
}
