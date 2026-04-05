import type { DashboardAutomationContext } from "@/lib/data/settings-types";

export function isValidHelpCenterUrl(value: string) {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function resolveHelpCenterArticleCount(
  helpCenterUrl: string,
  context: DashboardAutomationContext | undefined
) {
  if (!context?.helpCenterPath) {
    return null;
  }

  try {
    return new URL(helpCenterUrl).pathname === context.helpCenterPath
      ? context.helpCenterArticleCount
      : null;
  } catch {
    return helpCenterUrl.trim() === context.helpCenterPath ? context.helpCenterArticleCount : null;
  }
}
