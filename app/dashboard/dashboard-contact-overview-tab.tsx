"use client";

import { useState } from "react";
import type { BillingPlanKey } from "@/lib/billing-plans";
import type {
  ContactCustomFieldDefinition,
  ContactDetail,
  ContactNote
} from "@/lib/contact-types";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  contactLocationLabel,
  contactSourceSummary,
  formatAvgSessionLabel
} from "./dashboard-contact-drawer-utils";
import { ContactCustomFieldsSection } from "./dashboard-contact-custom-fields-section";
import { ContactProfileRow, ContactProfileSection } from "./dashboard-contact-profile-ui";
import { AutomationTagPicker } from "./dashboard-settings-automation-tag-picker";

export function ContactOverviewTab({
  detail,
  planKey,
  customFields,
  tagOptions,
  profileDraft,
  locationDraft,
  customFieldDraft,
  draftTag,
  saving,
  tagInputId,
  onSavePatch,
  onSaveSettingsPatch,
  onProfileChange,
  onLocationChange,
  onCustomFieldChange,
  onDraftTagChange,
  onAddTag,
  onEditNote
}: {
  detail: ContactDetail;
  planKey: BillingPlanKey;
  customFields: ContactCustomFieldDefinition[];
  tagOptions: string[];
  profileDraft: Record<"name" | "phone" | "company" | "role", string>;
  locationDraft: Record<"city" | "region" | "country", string>;
  customFieldDraft: Record<string, string>;
  draftTag: string;
  saving: boolean;
  tagInputId: string;
  onSavePatch: (
    payload: Record<string, unknown>,
    options?: {
      optimisticDetail?: ContactDetail | null;
      previousDetail?: ContactDetail | null;
    }
  ) => Promise<void>;
  onSaveSettingsPatch: (payload: Record<string, unknown>) => Promise<boolean>;
  onProfileChange: (field: "name" | "phone" | "company" | "role", value: string) => void;
  onLocationChange: (field: "city" | "region" | "country", value: string) => void;
  onCustomFieldChange: (fieldKey: string, value: string) => void;
  onDraftTagChange: (value: string) => void;
  onAddTag: () => void;
  onEditNote: (note?: ContactNote | null) => void;
}) {
  const [editingContactInfo, setEditingContactInfo] = useState(false);

  async function saveContactInfo() {
    await onSavePatch({
      name: profileDraft.name,
      phone: profileDraft.phone || null,
      company: profileDraft.company || null,
      role: profileDraft.role || null,
      location: {
        city: locationDraft.city || null,
        region: locationDraft.region || null,
        country: locationDraft.country || null
      }
    });
    setEditingContactInfo(false);
  }

  return (
    <div className="space-y-5">
      <ContactProfileSection
        title="Contact info"
        action={<Button type="button" variant="secondary" size="md" className="h-8 rounded-xl px-3 text-xs" onClick={() => setEditingContactInfo((current) => !current)}>{editingContactInfo ? "Cancel" : "Edit"}</Button>}
      >
        {editingContactInfo ? (
          <div className="space-y-3">
            <ContactProfileRow label="Email" value={detail.email} />
            {(["name", "phone", "company", "role"] as const).map((fieldKey) => (
              <label key={fieldKey} className="space-y-2 text-sm text-slate-700">
                <span className="block font-medium capitalize">{fieldKey}</span>
                <Input value={profileDraft[fieldKey]} onChange={(event) => onProfileChange(fieldKey, event.currentTarget.value)} />
              </label>
            ))}
            <div className="grid gap-3 sm:grid-cols-3">
              {(["city", "region", "country"] as const).map((fieldKey) => (
                <label key={fieldKey} className="space-y-2 text-sm text-slate-700">
                  <span className="block font-medium capitalize">{fieldKey}</span>
                  <Input value={locationDraft[fieldKey]} onChange={(event) => onLocationChange(fieldKey, event.currentTarget.value)} />
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" size="md" onClick={() => setEditingContactInfo(false)}>Cancel</Button>
              <Button type="button" size="md" disabled={saving} onClick={() => void saveContactInfo()}>Save</Button>
            </div>
          </div>
        ) : (
          <div>
            <ContactProfileRow label="Email" value={detail.email} valueClassName="break-all" />
            <ContactProfileRow label="Phone" value={detail.phone ?? "—"} />
            <ContactProfileRow label="Company" value={detail.company ?? "—"} />
            <ContactProfileRow label="Role" value={detail.role ?? "—"} />
            <ContactProfileRow label="Location" value={contactLocationLabel(detail.location) || "—"} />
          </div>
        )}
      </ContactProfileSection>

      <ContactProfileSection title="Activity">
        <div>
          <ContactProfileRow label="First seen" value={formatDateTime(detail.firstSeenAt)} />
          <ContactProfileRow label="Last seen" value={formatRelativeTime(detail.lastSeenAt)} />
          <ContactProfileRow label="Conversations" value={String(detail.conversationCount)} />
          <ContactProfileRow label="Page views" value={String(detail.totalPageViews)} />
          <ContactProfileRow label="Avg. session" value={formatAvgSessionLabel(detail.avgSessionSeconds)} />
          <ContactProfileRow label="Source" value={contactSourceSummary(detail.source) || "—"} />
        </div>
      </ContactProfileSection>

      <ContactProfileSection
        title="Tags"
        action={<Button type="button" variant="secondary" size="md" className="h-8 rounded-xl px-3 text-xs" onClick={() => document.getElementById(tagInputId)?.focus()}>Add</Button>}
      >
        <div className="flex flex-wrap gap-2">
          {detail.tags.length ? detail.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => void onSavePatch({ tags: detail.tags.filter((entry) => entry !== tag) })}
              className="rounded-full bg-blue-100 px-2.5 py-1 text-xs text-blue-700"
            >
              {tag} ×
            </button>
          )) : <p className="text-sm text-slate-400">No tags added yet.</p>}
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex-1">
            <AutomationTagPicker
              inputId={tagInputId}
              value={draftTag}
              options={tagOptions}
              primaryOptions={tagOptions}
              placeholder="Search or create tag..."
              onChange={onDraftTagChange}
            />
          </div>
          <Button type="button" size="md" onClick={onAddTag}>Add</Button>
        </div>
      </ContactProfileSection>

      <ContactProfileSection
        title="Notes"
        action={<Button type="button" variant="secondary" size="md" className="h-8 rounded-xl px-3 text-xs" onClick={() => onEditNote(null)}>Add note</Button>}
      >
        <div className="space-y-3">
          {detail.notes.length ? detail.notes.map((note) => (
            <div key={note.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm leading-6 text-slate-700">{note.body}</p>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400">
                <span>{note.authorName} · {formatDateTime(note.updatedAt)}</span>
                <div className="flex gap-3">
                  <button type="button" onClick={() => onEditNote(note)} className="text-slate-500 hover:text-slate-700">Edit</button>
                  <button type="button" onClick={() => void onSavePatch({ deleteNoteId: note.id })} className="text-slate-500 hover:text-slate-700">Delete</button>
                </div>
              </div>
            </div>
          )) : <p className="text-sm text-slate-400">No notes yet.</p>}
        </div>
      </ContactProfileSection>

      <ContactCustomFieldsSection
        detail={detail}
        planKey={planKey}
        customFields={customFields}
        customFieldDraft={customFieldDraft}
        saving={saving}
        onSavePatch={onSavePatch}
        onSaveSettingsPatch={onSaveSettingsPatch}
        onCustomFieldChange={onCustomFieldChange}
      />
    </div>
  );
}
