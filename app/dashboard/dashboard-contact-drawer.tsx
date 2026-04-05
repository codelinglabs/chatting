"use client";

import type { BillingPlanKey } from "@/lib/billing-plans";
import type {
  ContactCustomFieldDefinition,
  ContactDetail,
  ContactStatusDefinition
} from "@/lib/contact-types";
import { DashboardContactDrawerContent } from "./dashboard-contact-drawer-content";
import { addOptimisticContactNote } from "./dashboard-contact-note-optimistic";
import { DashboardContactNoteModal } from "./dashboard-contact-note-modal";
import { XIcon } from "./dashboard-ui";
import { useDashboardContactDrawer } from "./use-dashboard-contact-drawer";

function DrawerSkeleton() {
  return (
    <div className="space-y-4 animate-pulse p-5">
      <div className="h-16 w-16 rounded-full bg-slate-100" />
      <div className="h-5 w-40 rounded bg-slate-100" />
      <div className="h-4 w-56 rounded bg-slate-100" />
      <div className="h-24 rounded-xl bg-slate-100" />
      <div className="h-24 rounded-xl bg-slate-100" />
    </div>
  );
}

export function DashboardContactDrawer({
  contactId,
  initialStatuses,
  initialCustomFields,
  initialPlanKey,
  initialTagOptions,
  onClose,
  onContactUpdated,
  onSettingsUpdated,
  onNavigateConversation
}: {
  contactId: string | null;
  initialStatuses?: ContactStatusDefinition[];
  initialCustomFields?: ContactCustomFieldDefinition[];
  initialPlanKey?: BillingPlanKey;
  initialTagOptions?: string[];
  onClose: () => void;
  onContactUpdated: (contact: ContactDetail) => void;
  onSettingsUpdated: (input: {
    statuses: ContactStatusDefinition[];
    customFields: ContactCustomFieldDefinition[];
    planKey: BillingPlanKey;
  }) => void;
  onNavigateConversation: (conversationId: string) => void;
}) {
  const {
    detail,
    planKey,
    statuses,
    customFields,
    tagOptions,
    conversations,
    conversationsLoading,
    loading,
    saving,
    draftTag,
    activeNote,
    profileDraft,
    locationDraft,
    customFieldDraft,
    setDraftTag,
    setActiveNote,
    setProfileDraft,
    setLocationDraft,
    setCustomFieldDraft,
    loadConversations,
    saveSettingsPatch,
    savePatch,
    addTag
  } = useDashboardContactDrawer({
    contactId,
    initialStatuses,
    initialCustomFields,
    initialPlanKey,
    initialTagOptions,
    onContactUpdated
  });

  if (!contactId) {
    return null;
  }

  async function saveSettingsOptimistically(payload: Record<string, unknown>) {
    const previousSettings = { statuses, customFields, planKey };
    const optimisticSettings = {
      statuses,
      customFields: Array.isArray(payload.customFields)
        ? (payload.customFields as ContactCustomFieldDefinition[])
        : customFields,
      planKey
    };

    onSettingsUpdated(optimisticSettings);
    const result = await saveSettingsPatch(payload, { optimisticSettings });
    if (!result?.settings) {
      onSettingsUpdated(previousSettings);
      return false;
    }

    onSettingsUpdated({
      statuses: result.settings.statuses,
      customFields: result.settings.customFields,
      planKey: result.planKey ?? planKey
    });
    return true;
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/25" onClick={onClose}>
        <aside
          className="absolute bottom-0 right-0 top-0 flex w-full max-w-[400px] flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.1)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5">
            <div>
              <p className="text-base font-medium text-slate-900">Contact profile</p>
            </div>
            <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {loading || !detail ? (
            <DrawerSkeleton />
          ) : (
            <DashboardContactDrawerContent
              key={detail.id}
              detail={detail}
              conversations={conversations}
              conversationsLoading={conversationsLoading}
              planKey={planKey}
              statuses={statuses}
              customFields={customFields}
              tagOptions={tagOptions}
              profileDraft={profileDraft}
              locationDraft={locationDraft}
              customFieldDraft={customFieldDraft}
              draftTag={draftTag}
              saving={saving}
              onSavePatch={savePatch}
              onProfileChange={(field, value) =>
                setProfileDraft((current) => ({ ...current, [field]: value }))
              }
              onLocationChange={(field, value) =>
                setLocationDraft((current) => ({ ...current, [field]: value }))
              }
              onCustomFieldChange={(fieldKey, value) =>
                setCustomFieldDraft((current) => ({ ...current, [fieldKey]: value }))
              }
              onDraftTagChange={setDraftTag}
              onAddTag={addTag}
              onLoadConversations={loadConversations}
              onSaveSettingsPatch={saveSettingsOptimistically}
              onEditNote={(note) => setActiveNote(note ?? "new")}
              onNavigateConversation={onNavigateConversation}
            />
          )}
        </aside>
      </div>

      {activeNote ? (
        <DashboardContactNoteModal
          note={activeNote === "new" ? null : activeNote}
          onClose={() => setActiveNote(null)}
          onSave={async (body, noteId) => {
            const trimmedBody = body.trim();
            if (!noteId && detail) {
              const previousDetail = detail;
              setActiveNote(null);
              await savePatch(
                { note: { id: noteId, body: trimmedBody } },
                {
                  optimisticDetail: addOptimisticContactNote(detail, trimmedBody),
                  previousDetail
                }
              );
              return;
            }

            await savePatch({ note: { id: noteId, body: trimmedBody } });
            setActiveNote(null);
          }}
        />
      ) : null}
    </>
  );
}
