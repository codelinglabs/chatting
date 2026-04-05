"use client";

import { classNames } from "@/lib/utils";
import {
  DASHBOARD_INPUT_CLASS,
  DASHBOARD_SECONDARY_BUTTON_CLASS
} from "./dashboard-controls";
import { SettingsCard } from "./dashboard-settings-shared";
import type { SettingsProfileSectionProps } from "./dashboard-settings-profile-types";

export function SettingsProfilePasswordCard({
  passwordDraft,
  passwordExpanded,
  passwordMeter,
  onSetPasswordExpanded,
  onSetPasswordDraft
}: Pick<
  SettingsProfileSectionProps,
  | "passwordDraft"
  | "passwordExpanded"
  | "passwordMeter"
  | "onSetPasswordExpanded"
  | "onSetPasswordDraft"
>) {
  return (
    <SettingsCard
      title="Password"
      actions={
        <button
          type="button"
          onClick={() => onSetPasswordExpanded((value) => !value)}
          className={DASHBOARD_SECONDARY_BUTTON_CLASS}
        >
          {passwordExpanded ? "Cancel" : "Change password"}
        </button>
      }
    >
      {passwordExpanded ? (
        <div className="space-y-4">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Current password</span>
            <input
              type="password"
              value={passwordDraft.currentPassword}
              onChange={(event) =>
                onSetPasswordDraft((current) => ({
                  ...current,
                  currentPassword: event.target.value
                }))
              }
              className={DASHBOARD_INPUT_CLASS}
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">New password</span>
            <input
              type="password"
              value={passwordDraft.newPassword}
              onChange={(event) =>
                onSetPasswordDraft((current) => ({
                  ...current,
                  newPassword: event.target.value
                }))
              }
              className={DASHBOARD_INPUT_CLASS}
            />
            <div className="h-1 rounded-full bg-slate-200">
              <div
                className={classNames(
                  "h-full rounded-full transition",
                  passwordMeter.widthClass,
                  passwordMeter.toneClass
                )}
              />
            </div>
            <p className="text-xs text-slate-400">{passwordMeter.label}</p>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Confirm password</span>
            <input
              type="password"
              value={passwordDraft.confirmPassword}
              onChange={(event) =>
                onSetPasswordDraft((current) => ({
                  ...current,
                  confirmPassword: event.target.value
                }))
              }
              className={DASHBOARD_INPUT_CLASS}
            />
          </label>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Your password is hidden for security. Open this section when you want to update it.
        </p>
      )}
    </SettingsCard>
  );
}
