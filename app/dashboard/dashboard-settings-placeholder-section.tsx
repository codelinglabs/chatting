"use client";

import type { ReactNode } from "react";
import { SettingsCard, SettingsSectionHeader } from "./dashboard-settings-shared";

export function SettingsPlaceholderSection({
  title,
  subtitle,
  headerActions,
  message
}: {
  title: string;
  subtitle: string;
  headerActions?: ReactNode;
  message: string;
}) {
  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} actions={headerActions} />
      <SettingsCard title="Coming soon" description="This settings area is now in the sidebar and ready for the next pass.">
        <div className="space-y-3 text-sm leading-6 text-slate-600">
          <p>{message}</p>
          <p>We have not wired up editable controls here yet.</p>
        </div>
      </SettingsCard>
    </div>
  );
}
