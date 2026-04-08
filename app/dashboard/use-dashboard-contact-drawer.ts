"use client";

import { useEffect, useState } from "react";
import type { BillingPlanKey } from "@/lib/billing-plans";
import type {
  ContactConversationHistoryEntry,
  ContactCustomFieldDefinition,
  ContactDetail,
  ContactNote,
  ContactStatusDefinition
} from "@/lib/contact-types";
import {
  fetchDashboardContact,
  fetchDashboardContactConversations,
  patchDashboardContact,
  patchDashboardContactSettings
} from "./dashboard-contact-drawer-requests";
import { buildOptimisticContactTagAddition } from "./dashboard-contact-tag-optimistic";
import { type SavePatchOptions, type SaveSettingsOptions } from "./dashboard-contact-drawer-state";
import { useDashboardContactDrawerDrafts } from "./use-dashboard-contact-drawer-drafts";
import { useDashboardContactDrawerSettings } from "./use-dashboard-contact-drawer-settings";
import { useToast } from "../ui/toast-provider";

export function useDashboardContactDrawer({
  contactId,
  initialStatuses,
  initialCustomFields,
  initialPlanKey,
  initialTagOptions,
  onContactUpdated
}: {
  contactId: string | null;
  initialStatuses?: ContactStatusDefinition[];
  initialCustomFields?: ContactCustomFieldDefinition[];
  initialPlanKey?: BillingPlanKey;
  initialTagOptions?: string[];
  onContactUpdated: (contact: ContactDetail) => void;
}) {
  const { showToast } = useToast();
  const [detail, setDetail] = useState<ContactDetail | null>(null);
  const [conversations, setConversations] = useState<ContactConversationHistoryEntry[]>([]);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftTag, setDraftTag] = useState("");
  const [activeNote, setActiveNote] = useState<ContactNote | "new" | null>(null);
  const { planKey, statuses, customFields, tagOptions, applySettings } =
    useDashboardContactDrawerSettings({
      initialStatuses,
      initialCustomFields,
      initialPlanKey,
      initialTagOptions
    });
  const {
    profileDraft,
    locationDraft,
    customFieldDraft,
    setProfileDraft,
    setLocationDraft,
    setCustomFieldDraft
  } = useDashboardContactDrawerDrafts(detail);

  function resetConversationState() {
    setConversations([]);
    setConversationsLoaded(false);
    setConversationsLoading(false);
  }

  async function loadContact() {
    if (!contactId) return;
    setLoading(true);
    resetConversationState();
    try {
      const { response, payload } = await fetchDashboardContact(contactId);
      if (!response.ok || !payload.ok || !payload.contact) throw new Error("Contact not found.");
      setDetail(payload.contact);
      if (payload.settings) {
        applySettings({
          statuses: payload.settings.statuses,
          customFields: payload.settings.customFields,
          planKey
        });
      }
    } catch (error) {
      showToast("error", "We couldn't load that contact.", error instanceof Error ? error.message : "Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  async function loadConversations() {
    if (!contactId || conversationsLoaded || conversationsLoading) return;
    setConversationsLoading(true);
    try {
      const { response, payload } = await fetchDashboardContactConversations(contactId);
      if (!response.ok || !payload.ok || !payload.conversations) throw new Error("Unable to load conversations.");
      setConversations(payload.conversations);
      setConversationsLoaded(true);
    } catch (error) {
      showToast("error", "We couldn't load contact conversations.", error instanceof Error ? error.message : "Please try again in a moment.");
    } finally {
      setConversationsLoading(false);
    }
  }

  async function saveSettingsPatch(
    payload: Record<string, unknown>,
    options?: SaveSettingsOptions
  ) {
    const previousSettings = {
      statuses,
      customFields,
      planKey
    };
    if (options?.optimisticSettings) {
      applySettings(options.optimisticSettings);
    }
    setSaving(true);
    try {
      const result = await patchDashboardContactSettings(payload);
      if (!result.response.ok || !result.payload.ok || !result.payload.settings) throw new Error(result.payload.error ?? "Unable to save contact settings.");
      applySettings({
        statuses: result.payload.settings.statuses,
        customFields: result.payload.settings.customFields,
        planKey: result.payload.planKey ?? planKey
      });
      showToast("success", "Contact settings updated");
      return result.payload;
    } catch (error) {
      if (options?.optimisticSettings) {
        applySettings(previousSettings);
      }
      showToast("error", "We couldn't update contact settings.", error instanceof Error ? error.message : "Please try again in a moment.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function savePatch(payload: Record<string, unknown>, options?: SavePatchOptions) {
    if (!contactId) return;
    const previousDetail = options?.previousDetail ?? detail;
    if (options?.optimisticDetail) setDetail(options.optimisticDetail);
    setSaving(true);
    try {
      const result = await patchDashboardContact(contactId, payload);
      if (!result.response.ok || !result.payload.ok || !result.payload.contact) throw new Error(result.payload.error ?? "Unable to save contact.");
      setDetail(result.payload.contact);
      onContactUpdated(result.payload.contact);
      showToast("success", "Contact updated");
    } catch (error) {
      if (options?.optimisticDetail && previousDetail) setDetail(previousDetail);
      showToast("error", "We couldn't update that contact.", error instanceof Error ? error.message : "Please try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  function addTag() {
    if (!detail) return;
    const optimisticDetail = buildOptimisticContactTagAddition(detail, draftTag);
    if (!optimisticDetail) return;
    setDraftTag("");
    void savePatch(
      { tags: optimisticDetail.tags },
      { optimisticDetail, previousDetail: detail }
    );
  }

  useEffect(() => void loadContact(), [contactId]);

  return {
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
  };
}
