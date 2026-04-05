"use client";

import { SettingsSectionHeader } from "./dashboard-settings-shared";
import { SettingsProfileAvatarCard } from "./dashboard-settings-profile-avatar-card";
import { SettingsProfileFormCard } from "./dashboard-settings-profile-form-card";
import { SettingsProfilePasswordCard } from "./dashboard-settings-profile-password-card";
import { SettingsWorkspaceFormCard } from "./dashboard-settings-workspace-form-card";
import type { SettingsProfileSectionProps } from "./dashboard-settings-profile-types";

export function SettingsProfileSection({
  title,
  subtitle,
  headerActions,
  profile,
  teamName,
  currentProfileName,
  fileInputRef,
  passwordDraft,
  passwordExpanded,
  passwordMeter,
  onUpdateProfile,
  onUpdateTeamName,
  onAvatarPick,
  onSetPasswordExpanded,
  onSetPasswordDraft
}: SettingsProfileSectionProps) {
  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} actions={headerActions} />
      <SettingsProfileAvatarCard
        profile={profile}
        currentProfileName={currentProfileName}
        fileInputRef={fileInputRef}
        onUpdateProfile={onUpdateProfile}
        onAvatarPick={onAvatarPick}
      />
      <SettingsProfileFormCard profile={profile} onUpdateProfile={onUpdateProfile} />
      <SettingsWorkspaceFormCard teamName={teamName} onUpdateTeamName={onUpdateTeamName} />
      <SettingsProfilePasswordCard
        passwordDraft={passwordDraft}
        passwordExpanded={passwordExpanded}
        passwordMeter={passwordMeter}
        onSetPasswordExpanded={onSetPasswordExpanded}
        onSetPasswordDraft={onSetPasswordDraft}
      />
    </div>
  );
}
