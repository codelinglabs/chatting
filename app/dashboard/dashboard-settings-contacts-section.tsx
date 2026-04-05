"use client";

import type { ReactNode } from "react";
import type { BillingPlanKey } from "@/lib/billing-plans";
import type { ContactWorkspaceSettings } from "@/lib/contact-types";
import {
  ContactCustomFieldsSettingsCard,
  ContactStatusSettingsCard
} from "./dashboard-settings-contacts-cards";
import { SettingsSectionHeader } from "./dashboard-settings-shared";

export function SettingsContactsSection({
  title,
  subtitle,
  headerActions,
  contacts,
  planKey,
  onUpdateContacts
}: {
  title: string;
  subtitle: string;
  headerActions?: ReactNode;
  contacts: ContactWorkspaceSettings;
  planKey: BillingPlanKey;
  onUpdateContacts: (value: ContactWorkspaceSettings) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} actions={headerActions} />
      <ContactStatusSettingsCard contacts={contacts} planKey={planKey} onUpdateContacts={onUpdateContacts} />
      <ContactCustomFieldsSettingsCard contacts={contacts} planKey={planKey} onUpdateContacts={onUpdateContacts} />
    </div>
  );
}
