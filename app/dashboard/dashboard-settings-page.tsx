"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { DashboardSettingsData } from "@/lib/data/settings-types";
import { resolveSettingsSection } from "./dashboard-settings-section";
import { DashboardSettingsScaffold } from "./dashboard-settings-scaffold";
import {
  getSettingsPageCopy,
  renderSettingsPageSection
} from "./dashboard-settings-page-sections";
import { useDashboardSettingsBilling } from "./use-dashboard-settings-billing";
import { useDashboardSettingsForm } from "./use-dashboard-settings-form";

export function DashboardSettingsPage({ initialData }: { initialData: DashboardSettingsData }) {
  const searchParams = useSearchParams();
  const requestedSection = resolveSettingsSection(searchParams.get("section"));
  const [activeSection, setActiveSection] = useState(requestedSection);
  const form = useDashboardSettingsForm(initialData);
  const billing = useDashboardSettingsBilling({
    activeSection,
    initialBilling: initialData.billing,
    searchParams,
    setNotice: form.setNotice
  });

  useEffect(() => {
    setActiveSection((current) => (current === requestedSection ? current : requestedSection));
  }, [requestedSection]);

  return (
    <DashboardSettingsScaffold
      activeSection={activeSection}
      onSetActiveSection={setActiveSection}
      notice={form.notice}
      isDirty={form.isDirty}
      isSaving={form.isSaving}
      onDiscard={form.handleDiscard}
      onSave={form.handleSave}
    >
      {renderSettingsPageSection({
        activeSection,
        billing: billing.billing,
        billingPlanPending: billing.billingPlanPending,
        billingPortalPending: billing.billingPortalPending,
        billingSyncPending: billing.billingSyncPending,
        currentProfileName: form.currentProfileName,
        draftSettings: form.draftSettings,
        fileInputRef: form.fileInputRef,
        onAvatarPick: form.handleAvatarPick,
        onChangePlan: billing.handleBillingPlanChange,
        onNotice: form.setNotice,
        onOpenBillingPortal: billing.openBillingPortal,
        onSetPasswordDraft: form.setPasswordDraft,
        onSetPasswordExpanded: form.setPasswordExpanded,
        onSetSelectedInterval: billing.setSelectedBillingInterval,
        onSyncBilling: () => void billing.syncBillingFromStripe(),
        onUpdateEmail: form.updateEmail,
        onUpdateNotifications: form.updateNotifications,
        onUpdateProfile: form.updateProfile,
        pageCopy: getSettingsPageCopy(activeSection),
        passwordDraft: form.passwordDraft,
        passwordExpanded: form.passwordExpanded,
        passwordMeter: form.passwordMeter,
        selectedBillingInterval: billing.selectedBillingInterval
      })}
    </DashboardSettingsScaffold>
  );
}
