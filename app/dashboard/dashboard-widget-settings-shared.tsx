"use client";

import type { ComponentType, SVGProps } from "react";
import type { Site, WidgetOperatingHours } from "@/lib/types";
import {
  getWidgetInstallGuidance,
  getWidgetInstallSnippet,
  type WidgetInstallTarget
} from "@/lib/widget-installation";
import { buildWidgetSettingsPayload } from "@/lib/widget-settings";
import { classNames } from "@/lib/utils";
import {
  CodeIcon,
  PaintbrushIcon,
  SlidersIcon
} from "./dashboard-ui";

export type WidgetTab = "appearance" | "behavior" | "installation";
export type PreviewDevice = "desktop" | "mobile";
export type InstallPlatform = Exclude<WidgetInstallTarget, "other">;

export const COLOR_PRESETS = ["#2563EB", "#7C3AED", "#059669", "#DC2626", "#EA580C", "#DB2777", "#475569", "#18181B"];
export const TEAM_PHOTO_ACCEPT = "image/png,image/jpeg,image/gif,image/webp";

export const TAB_OPTIONS: Array<{
  value: WidgetTab;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}> = [
  { value: "appearance", label: "Appearance", icon: PaintbrushIcon },
  { value: "behavior", label: "Behavior", icon: SlidersIcon },
  { value: "installation", label: "Installation", icon: CodeIcon }
];

export const PLATFORM_OPTIONS: Array<{ value: InstallPlatform; label: string }> = [
  { value: "html", label: "HTML" },
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "wordpress", label: "WordPress" },
  { value: "shopify", label: "Shopify" },
  { value: "webflow", label: "Webflow" }
];

export const TIMEZONES = ["UTC", "Europe/London", "America/New_York", "America/Los_Angeles", "Europe/Berlin", "Asia/Singapore"];

export const DAYS: Array<{ key: keyof WidgetOperatingHours; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" }
];

export const RESPONSE_TIME_OPTIONS: Array<{ value: Site["responseTimeMode"]; label: string }> = [
  { value: "minutes", label: "Typically replies in minutes" },
  { value: "hours", label: "Typically replies in a few hours" },
  { value: "day", label: "Typically replies in a day" },
  { value: "hidden", label: "Don't show response time" }
];

export function siteSettingsSignature(site: Site) {
  return JSON.stringify(buildWidgetSettingsPayload(site));
}

export function responseTimeCopy(mode: Site["responseTimeMode"]) {
  if (mode === "hours") {
    return "Typically replies in a few hours";
  }
  if (mode === "day") {
    return "Typically replies in a day";
  }
  if (mode === "hidden") {
    return "";
  }
  return "Typically replies in minutes";
}

export function photoUploadErrorMessage(code: string) {
  if (code === "invalid-image-type") {
    return "Use a PNG, JPG, GIF, or WebP image.";
  }
  if (code === "image-too-large") {
    return "Use an image smaller than 2MB.";
  }
  if (code === "storage-not-configured") {
    return "Cloudflare R2 is not configured yet.";
  }
  return "Unable to update the team photo right now.";
}

export function widgetSaveErrorMessage(code: string) {
  if (code === "site-domain-required") {
    return "Site URL is required before you can save widget setup.";
  }
  if (code === "proactive_chat_requires_growth") {
    return "Proactive chat is available on Growth.";
  }
  return "Unable to save widget settings.";
}

export function installationCheckErrorMessage(code: string, hasDomain: boolean) {
  if (code === "missing-domain") {
    return "Save a site URL first so Chatting can verify the install.";
  }
  if (code === "site-unreachable") {
    return hasDomain
      ? "We couldn't reach the site URL right now. Double-check the domain and try again."
      : "We couldn't reach the site URL right now.";
  }
  if (code === "installation-check-failed") {
    return "Unable to check installation right now.";
  }
  return hasDomain
    ? "We didn't find the Chatting snippet on the checked page yet."
    : "Set and save your site URL first, then check installation again.";
}

export function previewStatus(site: Site) {
  if (!site.showOnlineStatus) {
    return "";
  }

  const replyCopy = responseTimeCopy(site.responseTimeMode);
  return replyCopy ? `Online • ${replyCopy}` : "Online";
}

export function getPlatformGuidance(platform: InstallPlatform) {
  return getWidgetInstallGuidance(platform);
}

export function getPlatformSnippet(site: Site, platform: InstallPlatform) {
  return getWidgetInstallSnippet(platform, site.id);
}

export function ToggleRow({
  label,
  description,
  checked,
  onToggle
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 rounded-lg bg-slate-50 px-4 py-4 text-left"
    >
      <div>
        <div className="text-sm font-medium text-slate-700">{label}</div>
        <div className="mt-1 text-[13px] text-slate-500">{description}</div>
      </div>
      <span
        className={classNames(
          "relative h-6 w-11 rounded-full transition",
          checked ? "bg-blue-600" : "bg-slate-300"
        )}
      >
        <span
          className={classNames(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}

export function WidgetTabIcon({ icon: Icon }: { icon: ComponentType<SVGProps<SVGSVGElement>> }) {
  return <Icon className="h-4 w-4" />;
}
