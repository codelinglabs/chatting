"use client";

import { useState } from "react";
import type { BillingPlanKey } from "@/lib/billing-plans";
import type {
  ContactConversationHistoryEntry,
  ContactCustomFieldDefinition,
  ContactDetail,
  ContactNote,
  ContactStatusDefinition
} from "@/lib/contact-types";
import { DashboardContactDrawerHeader } from "./dashboard-contact-drawer-header";
import { ContactActivityTab } from "./dashboard-contact-activity-tab";
import { ContactConversationsTab } from "./dashboard-contact-conversations-tab";
import { ContactOverviewTab } from "./dashboard-contact-overview-tab";

type DrawerTab = "overview" | "activity" | "conversations";

export function DashboardContactDrawerContent({
  detail,
  conversations,
  conversationsLoading,
  planKey,
  statuses,
  customFields,
  tagOptions,
  profileDraft,
  locationDraft,
  customFieldDraft,
  draftTag,
  saving,
  onSavePatch,
  onSaveSettingsPatch,
  onProfileChange,
  onLocationChange,
  onCustomFieldChange,
  onDraftTagChange,
  onAddTag,
  onLoadConversations,
  onEditNote,
  onNavigateConversation
}: {
  detail: ContactDetail;
  conversations: ContactConversationHistoryEntry[];
  conversationsLoading: boolean;
  planKey: BillingPlanKey;
  statuses: ContactStatusDefinition[];
  customFields: ContactCustomFieldDefinition[];
  tagOptions: string[];
  profileDraft: Record<"name" | "phone" | "company" | "role", string>;
  locationDraft: Record<"city" | "region" | "country", string>;
  customFieldDraft: Record<string, string>;
  draftTag: string;
  saving: boolean;
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
  onLoadConversations: () => Promise<void>;
  onEditNote: (note?: ContactNote | null) => void;
  onNavigateConversation: (conversationId: string) => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("overview");
  const tagInputId = `contact-tag-input-${detail.id}`;

  function focusTagComposer() {
    setTab("overview");
    window.requestAnimationFrame(() => {
      document.getElementById(tagInputId)?.focus();
    });
  }

  return (
    <div className="space-y-5 p-5">
      <DashboardContactDrawerHeader
        detail={detail}
        statuses={statuses}
        onStatusChange={(status) => void onSavePatch({ status })}
        onAddTag={focusTagComposer}
      />

      <div className="flex gap-2 border-b border-slate-200">
        {(["overview", "activity", "conversations"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setTab(value);
              if (value === "conversations") {
                void onLoadConversations();
              }
            }}
            className={`border-b-2 px-1 py-3 text-sm ${tab === value ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}
          >
            {value === "overview" ? "Overview" : value === "activity" ? "Activity" : "Conversations"}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <ContactOverviewTab
          detail={detail}
          planKey={planKey}
          customFields={customFields}
          tagOptions={tagOptions}
          profileDraft={profileDraft}
          locationDraft={locationDraft}
          customFieldDraft={customFieldDraft}
          draftTag={draftTag}
          saving={saving}
          tagInputId={tagInputId}
          onSavePatch={onSavePatch}
          onSaveSettingsPatch={onSaveSettingsPatch}
          onProfileChange={onProfileChange}
          onLocationChange={onLocationChange}
          onCustomFieldChange={onCustomFieldChange}
          onDraftTagChange={onDraftTagChange}
          onAddTag={onAddTag}
          onEditNote={onEditNote}
        />
      ) : null}

      {tab === "activity" ? <ContactActivityTab detail={detail} /> : null}
      {tab === "conversations" ? (
        <ContactConversationsTab
          conversations={conversations}
          loading={conversationsLoading}
          onNavigateConversation={onNavigateConversation}
        />
      ) : null}
    </div>
  );
}
