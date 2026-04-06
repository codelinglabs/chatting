import { randomUUID } from "node:crypto";
import {
  findCreatedSiteRow,
  insertSiteRecord,
  updateSiteNameRecord,
  updateSiteOnboardingSetupRecord,
  updateSiteWidgetSettingsRecord,
  updateSiteWidgetTitleRecord
} from "@/lib/repositories/sites-repository";
import { optionalText } from "@/lib/utils";
import {
  DEFAULT_AWAY_MESSAGE,
  DEFAULT_AWAY_TITLE,
  DEFAULT_GREETING_TEXT,
  DEFAULT_OFFLINE_MESSAGE,
  DEFAULT_OFFLINE_TITLE,
  DEFAULT_OPERATING_TIMEZONE,
  DEFAULT_WIDGET_TITLE,
  normalizeAutoOpenPaths,
  normalizeAvatarStyle,
  normalizeBrandColor,
  normalizeLauncherPosition,
  normalizeSiteDomain,
  normalizeResponseTimeMode,
  normalizeWidgetCopy,
  serializeOperatingHours
} from "@/lib/widget-settings";
import type { UpdateSiteWidgetSettingsInput } from "./sites-types";
import { getWorkspaceOwnerId, loadOwnedSite } from "./sites-shared";
import { mapSite, querySites } from "./shared";

export async function createSiteForUser(
  userId: string,
  input: { name: string; domain?: string | null; brandColor?: string | null; widgetTitle?: string | null; greetingText?: string | null }
) {
  const siteId = randomUUID();
  const name = input.name.trim();

  await insertSiteRecord({
    siteId,
    userId,
    name: name || "My site",
    domain: optionalText(input.domain),
    brandColor: normalizeBrandColor(input.brandColor),
    widgetTitle: optionalText(input.widgetTitle) || DEFAULT_WIDGET_TITLE,
    greetingText: optionalText(input.greetingText) || DEFAULT_GREETING_TEXT
  });

  const created = await findCreatedSiteRow(siteId);
  if (!created) {
    throw new Error("SITE_NOT_FOUND");
  }

  return mapSite(created);
}

export async function listSitesForUser(userId: string, ownerUserId?: string) {
  const workspaceOwnerId = ownerUserId ?? (await getWorkspaceOwnerId(userId));
  const result = await querySites("s.user_id = $1", [workspaceOwnerId], "ORDER BY s.created_at ASC");
  return result.rows.map(mapSite);
}

export async function updateSiteWidgetTitle(siteId: string, widgetTitle: string, userId: string) {
  const normalizedTitle = optionalText(widgetTitle) || DEFAULT_WIDGET_TITLE;
  const ownerUserId = await getWorkspaceOwnerId(userId);
  return updateSiteWidgetTitleRecord(siteId, ownerUserId, normalizedTitle);
}

export async function updateSiteName(siteId: string, name: string, userId: string) {
  const ownerUserId = await getWorkspaceOwnerId(userId);
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new Error("MISSING_TEAM_NAME");
  }

  return updateSiteNameRecord(siteId, ownerUserId, normalizedName);
}

export async function updateSiteOnboardingSetup(siteId: string, userId: string, input: { name: string; domain: string }) {
  const ownerUserId = await getWorkspaceOwnerId(userId);
  const name = input.name.trim();
  const domain = normalizeSiteDomain(input.domain);

  if (!name) throw new Error("MISSING_SITE_NAME");
  if (!domain) throw new Error("MISSING_DOMAIN");

  const updated = await updateSiteOnboardingSetupRecord({
    siteId,
    userId: ownerUserId,
    name,
    domain,
    widgetTitle: name
  });

  return updated ? loadOwnedSite(siteId, ownerUserId) : null;
}

export async function updateSiteWidgetSettings(siteId: string, userId: string, input: UpdateSiteWidgetSettingsInput) {
  const ownerUserId = await getWorkspaceOwnerId(userId);
  const updated = await updateSiteWidgetSettingsRecord({
    siteId,
    userId: ownerUserId,
    domain: normalizeSiteDomain(input.domain),
    brandColor: normalizeBrandColor(input.brandColor),
    widgetTitle: optionalText(input.widgetTitle) || DEFAULT_WIDGET_TITLE,
    greetingText: optionalText(input.greetingText) || DEFAULT_GREETING_TEXT,
    launcherPosition: normalizeLauncherPosition(input.launcherPosition),
    avatarStyle: normalizeAvatarStyle(input.avatarStyle),
    showOnlineStatus: input.showOnlineStatus,
    requireEmailOffline: input.requireEmailOffline,
    offlineTitle: normalizeWidgetCopy(input.offlineTitle, DEFAULT_OFFLINE_TITLE, 80),
    offlineMessage: normalizeWidgetCopy(input.offlineMessage, DEFAULT_OFFLINE_MESSAGE, 180),
    awayTitle: normalizeWidgetCopy(input.awayTitle, DEFAULT_AWAY_TITLE, 80),
    awayMessage: normalizeWidgetCopy(input.awayMessage, DEFAULT_AWAY_MESSAGE, 180),
    soundNotifications: input.soundNotifications,
    autoOpenPaths: normalizeAutoOpenPaths(input.autoOpenPaths),
    responseTimeMode: normalizeResponseTimeMode(input.responseTimeMode),
    operatingHoursEnabled: input.operatingHoursEnabled,
    operatingHoursTimezone: optionalText(input.operatingHoursTimezone) || DEFAULT_OPERATING_TIMEZONE,
    operatingHoursJson: serializeOperatingHours(input.operatingHours)
  });

  return updated ? loadOwnedSite(siteId, ownerUserId) : null;
}

export async function getSiteByPublicId(siteId: string) {
  const result = await querySites("s.id = $1", [siteId], "LIMIT 1");
  return result.rows[0] ? mapSite(result.rows[0]) : null;
}
