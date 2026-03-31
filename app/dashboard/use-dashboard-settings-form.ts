"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import type {
  DashboardSettingsData,
  DashboardSettingsEmail,
  DashboardSettingsNotifications,
  DashboardSettingsProfile
} from "@/lib/data/settings-types";
import type { DashboardNoticeState } from "./dashboard-controls";
import { buildOwnerName, editableSignature, passwordStrength, settingsErrorMessage, type EditableSettings } from "./dashboard-settings-shared";

type PasswordDraft = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const emptyPasswordDraft = (): PasswordDraft => ({ currentPassword: "", newPassword: "", confirmPassword: "" });

export function useDashboardSettingsForm(initialData: DashboardSettingsData) {
  const initialSettings = {
    profile: initialData.profile,
    notifications: initialData.notifications,
    email: initialData.email
  };
  const [savedSettings, setSavedSettings] = useState<EditableSettings>(initialSettings);
  const [draftSettings, setDraftSettings] = useState<EditableSettings>(initialSettings);
  const [passwordDraft, setPasswordDraft] = useState<PasswordDraft>(emptyPasswordDraft);
  const [passwordExpanded, setPasswordExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<DashboardNoticeState>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentProfileName = buildOwnerName(draftSettings.profile);
  const passwordMeter = passwordStrength(passwordDraft.newPassword);
  const isDirty = useMemo(
    () =>
      editableSignature(savedSettings) !== editableSignature(draftSettings) ||
      Boolean(passwordDraft.currentPassword || passwordDraft.newPassword || passwordDraft.confirmPassword),
    [draftSettings, passwordDraft, savedSettings]
  );

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setNotice(null);
    }, 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  function updateProfile<K extends keyof DashboardSettingsProfile>(key: K, value: DashboardSettingsProfile[K]) {
    setDraftSettings((current) => ({
      ...current,
      profile: { ...current.profile, [key]: value }
    }));
  }

  function updateNotifications<K extends keyof DashboardSettingsNotifications>(
    key: K,
    value: DashboardSettingsNotifications[K]
  ) {
    setDraftSettings((current) => ({
      ...current,
      notifications: { ...current.notifications, [key]: value }
    }));
  }

  function updateEmail<K extends keyof DashboardSettingsEmail>(key: K, value: DashboardSettingsEmail[K]) {
    setDraftSettings((current) => ({
      ...current,
      email: { ...current.email, [key]: value }
    }));
  }

  async function handleSave() {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/dashboard/settings/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profile: draftSettings.profile,
          notifications: draftSettings.notifications,
          email: draftSettings.email,
          password:
            passwordDraft.currentPassword || passwordDraft.newPassword || passwordDraft.confirmPassword
              ? passwordDraft
              : null
        })
      });
      const payload = (await response.json()) as
        | { ok: true; settings: DashboardSettingsData }
        | { ok: false; error: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "settings-save-failed" : payload.error);
      }

      setSavedSettings({
        profile: payload.settings.profile,
        notifications: payload.settings.notifications,
        email: payload.settings.email
      });
      setDraftSettings({ profile: payload.settings.profile, notifications: payload.settings.notifications, email: payload.settings.email });
      window.dispatchEvent(
        new CustomEvent("chatly:notification-settings-updated", {
          detail: payload.settings.notifications
        })
      );
      setPasswordDraft(emptyPasswordDraft());
      setPasswordExpanded(false);
      setNotice({ tone: "success", message: "Settings saved" });
    } catch (error) {
      setNotice({
        tone: "error",
        message: settingsErrorMessage(error instanceof Error ? error.message : "settings-save-failed")
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    setDraftSettings(savedSettings);
    setPasswordDraft(emptyPasswordDraft());
    setPasswordExpanded(false);
  }

  function handleAvatarPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateProfile("avatarDataUrl", reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  return {
    currentProfileName,
    draftSettings,
    fileInputRef,
    handleAvatarPick,
    handleDiscard,
    handleSave,
    isDirty,
    isSaving,
    notice,
    passwordDraft,
    passwordExpanded,
    passwordMeter,
    setNotice,
    setPasswordDraft,
    setPasswordExpanded,
    updateEmail,
    updateNotifications,
    updateProfile
  };
}
