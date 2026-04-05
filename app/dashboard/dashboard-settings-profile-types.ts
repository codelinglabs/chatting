"use client";

import type { ChangeEvent, ReactNode, RefObject } from "react";
import type { DashboardSettingsProfile } from "@/lib/data/settings-types";

export type PasswordDraft = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type PasswordMeter = {
  label: string;
  widthClass: string;
  toneClass: string;
};

export type SettingsProfileSectionProps = {
  title: string;
  subtitle: string;
  headerActions?: ReactNode;
  profile: DashboardSettingsProfile;
  teamName: string;
  currentProfileName: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  passwordDraft: PasswordDraft;
  passwordExpanded: boolean;
  passwordMeter: PasswordMeter;
  onUpdateProfile: <K extends keyof DashboardSettingsProfile>(
    key: K,
    value: DashboardSettingsProfile[K]
  ) => void;
  onUpdateTeamName: (value: string) => void;
  onAvatarPick: (event: ChangeEvent<HTMLInputElement>) => void;
  onSetPasswordExpanded: (value: boolean | ((current: boolean) => boolean)) => void;
  onSetPasswordDraft: (
    value: PasswordDraft | ((current: PasswordDraft) => PasswordDraft)
  ) => void;
};
