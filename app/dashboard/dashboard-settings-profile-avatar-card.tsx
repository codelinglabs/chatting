"use client";

import { initialsFromLabel } from "@/lib/user-display";
import { CameraIcon } from "./dashboard-ui";
import { DASHBOARD_SECONDARY_BUTTON_CLASS } from "./dashboard-controls";
import { SettingsCard } from "./dashboard-settings-shared";
import type { SettingsProfileSectionProps } from "./dashboard-settings-profile-types";

export function SettingsProfileAvatarCard({
  profile,
  currentProfileName,
  fileInputRef,
  onUpdateProfile,
  onAvatarPick
}: Pick<
  SettingsProfileSectionProps,
  | "profile"
  | "currentProfileName"
  | "fileInputRef"
  | "onUpdateProfile"
  | "onAvatarPick"
>) {
  return (
    <SettingsCard className="p-0">
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <div className="group relative">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-blue-100">
            {profile.avatarDataUrl ? (
              <img
                src={profile.avatarDataUrl}
                alt={`${currentProfileName} avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[28px] font-medium text-blue-700">
                {initialsFromLabel(currentProfileName)}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 hidden items-center justify-center bg-slate-900/50 text-white transition group-hover:flex"
              aria-label="Change profile photo"
            >
              <CameraIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={DASHBOARD_SECONDARY_BUTTON_CLASS}
            >
              Upload photo
            </button>
            <button
              type="button"
              onClick={() => onUpdateProfile("avatarDataUrl", null)}
              className="inline-flex h-9 items-center rounded-lg text-sm font-medium text-red-600 transition hover:text-red-700"
            >
              Remove
            </button>
          </div>
          <p className="text-xs text-slate-400">JPG, PNG or GIF. Max 2MB.</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="hidden"
          onChange={onAvatarPick}
        />
      </div>
    </SettingsCard>
  );
}
