"use client";

import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from "react";
import type { BillingInterval, BillingPlanKey, DashboardBillingSummary } from "@/lib/data/billing-types";
import { shouldShowTranscriptBranding } from "@/lib/billing-plans";
import type { DashboardNoticeState } from "./dashboard-controls";
import { type EditableSettings, type SettingsSection } from "./dashboard-settings-shared";
import { SettingsEmailSection, SettingsBillingSection } from "./dashboard-settings-email-billing-sections";
import { SettingsNotificationsSection } from "./dashboard-settings-notifications-section";
import { SettingsProfileSection } from "./dashboard-settings-profile-section";
import { SettingsReferralsSection } from "./dashboard-settings-referrals-section";

type PasswordDraft = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type PasswordMeter = {
  label: string;
  widthClass: string;
  toneClass: string;
};

export function getSettingsPageCopy(activeSection: SettingsSection) {
  switch (activeSection) {
    case "profile":
      return { title: "Profile", subtitle: "Manage your personal information and preferences" };
    case "notifications":
      return { title: "Notifications", subtitle: "Choose how you want to be notified" };
    case "email":
      return { title: "Email", subtitle: "Configure email notifications and templates" };
    case "billing":
      return { title: "Plans & Billing", subtitle: "Manage your subscription, usage, and billing history" };
    case "referrals":
      return { title: "Referrals", subtitle: "Track referral programs, signups, and earned rewards" };
  }
}

export function renderSettingsPageSection(input: {
  activeSection: SettingsSection;
  billing: DashboardBillingSummary;
  billingPlanPending: string | null;
  billingPortalPending: boolean;
  billingSyncPending: boolean;
  currentProfileName: string;
  draftSettings: EditableSettings;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onChangePlan: (planKey: BillingPlanKey, billingInterval: BillingInterval) => Promise<void>;
  onNotice: (notice: DashboardNoticeState) => void;
  onOpenBillingPortal: () => Promise<void>;
  onSetPasswordDraft: Dispatch<SetStateAction<PasswordDraft>>;
  onSetPasswordExpanded: Dispatch<SetStateAction<boolean>>;
  onSetSelectedInterval: Dispatch<SetStateAction<BillingInterval>>;
  onSyncBilling: () => void;
  onUpdateEmail: <K extends keyof EditableSettings["email"]>(
    key: K,
    value: EditableSettings["email"][K]
  ) => void;
  onUpdateNotifications: <K extends keyof EditableSettings["notifications"]>(
    key: K,
    value: EditableSettings["notifications"][K]
  ) => void;
  onUpdateProfile: <K extends keyof EditableSettings["profile"]>(
    key: K,
    value: EditableSettings["profile"][K]
  ) => void;
  onAvatarPick: (event: ChangeEvent<HTMLInputElement>) => void;
  pageCopy: ReturnType<typeof getSettingsPageCopy>;
  passwordDraft: PasswordDraft;
  passwordExpanded: boolean;
  passwordMeter: PasswordMeter;
  selectedBillingInterval: BillingInterval;
}) {
  if (input.activeSection === "profile") {
    return (
      <SettingsProfileSection
        title={input.pageCopy.title}
        subtitle={input.pageCopy.subtitle}
        profile={input.draftSettings.profile}
        currentProfileName={input.currentProfileName}
        fileInputRef={input.fileInputRef}
        passwordDraft={input.passwordDraft}
        passwordExpanded={input.passwordExpanded}
        passwordMeter={input.passwordMeter}
        onUpdateProfile={input.onUpdateProfile}
        onAvatarPick={input.onAvatarPick}
        onSetPasswordExpanded={input.onSetPasswordExpanded}
        onSetPasswordDraft={input.onSetPasswordDraft}
      />
    );
  }

  if (input.activeSection === "notifications") {
    return (
      <SettingsNotificationsSection
        title={input.pageCopy.title}
        subtitle={input.pageCopy.subtitle}
        notifications={input.draftSettings.notifications}
        onUpdateNotifications={input.onUpdateNotifications}
      />
    );
  }

  if (input.activeSection === "email") {
    return (
      <SettingsEmailSection
        title={input.pageCopy.title}
        subtitle={input.pageCopy.subtitle}
        email={input.draftSettings.email}
        profileEmail={input.draftSettings.profile.email}
        profileName={input.currentProfileName}
        profileAvatarDataUrl={input.draftSettings.profile.avatarDataUrl}
        showTranscriptBrandingPreview={shouldShowTranscriptBranding(input.billing.planKey)}
        onUpdateEmail={input.onUpdateEmail}
        onNotice={input.onNotice}
      />
    );
  }

  if (input.activeSection === "billing") {
    return (
      <SettingsBillingSection
        title={input.pageCopy.title}
        subtitle={input.pageCopy.subtitle}
        billing={input.billing}
        billingPlanPending={input.billingPlanPending}
        selectedInterval={input.selectedBillingInterval}
        billingPortalPending={input.billingPortalPending}
        billingSyncPending={input.billingSyncPending}
        onOpenBillingPortal={input.onOpenBillingPortal}
        onChangePlan={input.onChangePlan}
        onSetSelectedInterval={input.onSetSelectedInterval}
        onSyncBilling={input.onSyncBilling}
      />
    );
  }

  return (
    <SettingsReferralsSection
      title={input.pageCopy.title}
      subtitle={input.pageCopy.subtitle}
      referrals={input.billing.referrals}
    />
  );
}
