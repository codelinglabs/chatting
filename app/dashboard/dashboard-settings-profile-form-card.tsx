"use client";

import { DASHBOARD_INPUT_CLASS } from "./dashboard-controls";
import { SettingsCard } from "./dashboard-settings-shared";
import type { SettingsProfileSectionProps } from "./dashboard-settings-profile-types";

export function SettingsProfileFormCard({
  profile,
  onUpdateProfile
}: Pick<SettingsProfileSectionProps, "profile" | "onUpdateProfile">) {
  return (
    <SettingsCard title="Personal information">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">First name</span>
          <input
            value={profile.firstName}
            onChange={(event) => onUpdateProfile("firstName", event.target.value)}
            className={DASHBOARD_INPUT_CLASS}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Last name</span>
          <input
            value={profile.lastName}
            onChange={(event) => onUpdateProfile("lastName", event.target.value)}
            className={DASHBOARD_INPUT_CLASS}
          />
        </label>
        <label className="space-y-1.5 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={profile.email}
            onChange={(event) => onUpdateProfile("email", event.target.value)}
            className={DASHBOARD_INPUT_CLASS}
          />
        </label>
        <label className="space-y-1.5 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Job title</span>
          <input
            value={profile.jobTitle}
            onChange={(event) => onUpdateProfile("jobTitle", event.target.value)}
            placeholder="Support lead"
            className={DASHBOARD_INPUT_CLASS}
          />
        </label>
      </div>
    </SettingsCard>
  );
}
