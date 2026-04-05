"use client";

import { useState } from "react";
import type { DashboardBillingSummary } from "@/lib/data/billing-types";
import type { DashboardAutomationContext, DashboardAutomationSettings, DashboardTeamMember } from "@/lib/data/settings-types";
import { SettingsSaveActions } from "./dashboard-settings-save-actions";
import { SettingsSectionHeader } from "./dashboard-settings-shared";
import { SettingsAutomationOfflineSection } from "./dashboard-settings-automation-offline-section";
import { SettingsAutomationProactiveSection } from "./dashboard-settings-automation-proactive-section";
import { SettingsAutomationRoutingSection } from "./dashboard-settings-automation-routing-section";
import { SettingsAutomationFaqSection } from "./dashboard-settings-automation-speed-section";

export function SettingsAutomationSection({
  title,
  subtitle,
  automation,
  context,
  teamMembers,
  billing,
  isDirty,
  isSaving,
  onSave,
  onDiscard,
  onChange
}: {
  title: string;
  subtitle: string;
  automation: DashboardAutomationSettings;
  context?: DashboardAutomationContext;
  teamMembers: DashboardTeamMember[];
  billing: DashboardBillingSummary;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onChange: (updater: (current: DashboardAutomationSettings) => DashboardAutomationSettings) => void;
}) {
  const [announcement, setAnnouncement] = useState("");

  return (
    <div className="space-y-6">
      <SettingsSectionHeader
        title={title}
        subtitle={subtitle}
        actions={<SettingsSaveActions isDirty={isDirty} isSaving={isSaving} onSave={onSave} onDiscard={onDiscard} />}
      />

      <p className="sr-only" aria-live="polite">{announcement}</p>

      <SettingsAutomationOfflineSection automation={automation} context={context} onChange={onChange} />
      <SettingsAutomationRoutingSection automation={automation} billing={billing} teamMembers={teamMembers} tagOptions={context?.tagOptions ?? []} onChange={onChange} onAnnounce={setAnnouncement} />
      <SettingsAutomationFaqSection automation={automation} context={context} growthUnlocked={billing.planKey === "growth"} onChange={onChange} onAnnounce={setAnnouncement} />
      <SettingsAutomationProactiveSection automation={automation} billing={billing} onChange={onChange} onAnnounce={setAnnouncement} />
    </div>
  );
}
