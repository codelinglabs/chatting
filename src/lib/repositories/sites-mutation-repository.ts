import { query } from "@/lib/db";
import type { SiteRow } from "./shared-site-repository";

export async function insertSiteRecord(input: {
  siteId: string;
  userId: string;
  name: string;
  domain: string | null;
  brandColor: string;
  widgetTitle: string;
  greetingText: string;
}) {
  await query(
    `
      INSERT INTO sites (id, user_id, name, domain, brand_color, widget_title, greeting_text)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [input.siteId, input.userId, input.name, input.domain, input.brandColor, input.widgetTitle, input.greetingText]
  );
}

export async function findCreatedSiteRow(siteId: string) {
  const result = await query<SiteRow>(
    `
      SELECT
        id, user_id, name, domain, brand_color, widget_title, greeting_text,
        launcher_position, avatar_style, team_photo_url, show_online_status,
        require_email_offline, offline_title, offline_message, away_title, away_message,
        sound_notifications, auto_open_paths, response_time_mode, operating_hours_enabled,
        operating_hours_timezone, operating_hours_json, widget_install_verified_at,
        widget_install_verified_url, widget_last_seen_at, widget_last_seen_url,
        created_at, '0'::text AS conversation_count
      FROM sites
      WHERE id = $1
      LIMIT 1
    `,
    [siteId]
  );

  return result.rows[0] ?? null;
}

export async function updateSiteWidgetTitleRecord(siteId: string, userId: string, widgetTitle: string) {
  const result = await query<{ widget_title: string }>(
    `
      UPDATE sites
      SET widget_title = $3
      WHERE id = $1
        AND user_id = $2
      RETURNING widget_title
    `,
    [siteId, userId, widgetTitle]
  );

  return result.rows[0]?.widget_title ?? null;
}

export async function updateSiteNameRecord(siteId: string, userId: string, name: string) {
  const result = await query<{ id: string }>(
    `
      UPDATE sites
      SET name = $3
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [siteId, userId, name]
  );

  return Boolean(result.rows[0]);
}

export async function updateSiteOnboardingSetupRecord(input: {
  siteId: string;
  userId: string;
  name: string;
  domain: string;
  widgetTitle: string;
}) {
  const result = await query<{ id: string }>(
    `
      UPDATE sites
      SET
        name = $3,
        domain = $4,
        widget_title = $5
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [input.siteId, input.userId, input.name, input.domain, input.widgetTitle]
  );

  return Boolean(result.rows[0]);
}

export async function updateSiteWidgetSettingsRecord(input: {
  siteId: string;
  userId: string;
  domain: string | null;
  brandColor: string;
  widgetTitle: string;
  greetingText: string;
  launcherPosition: string;
  avatarStyle: string;
  showOnlineStatus: boolean;
  requireEmailOffline: boolean;
  offlineTitle: string;
  offlineMessage: string;
  awayTitle: string;
  awayMessage: string;
  soundNotifications: boolean;
  autoOpenPaths: string[];
  responseTimeMode: string;
  operatingHoursEnabled: boolean;
  operatingHoursTimezone: string;
  operatingHoursJson: string;
}) {
  const result = await query<{ id: string }>(
    `
      UPDATE sites
      SET
        domain = $3,
        brand_color = $4,
        widget_title = $5,
        greeting_text = $6,
        launcher_position = $7,
        avatar_style = $8,
        show_online_status = $9,
        require_email_offline = $10,
        offline_title = $11,
        offline_message = $12,
        away_title = $13,
        away_message = $14,
        sound_notifications = $15,
        auto_open_paths = $16,
        response_time_mode = $17,
        operating_hours_enabled = $18,
        operating_hours_timezone = $19,
        operating_hours_json = $20
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `,
    [
      input.siteId,
      input.userId,
      input.domain,
      input.brandColor,
      input.widgetTitle,
      input.greetingText,
      input.launcherPosition,
      input.avatarStyle,
      input.showOnlineStatus,
      input.requireEmailOffline,
      input.offlineTitle,
      input.offlineMessage,
      input.awayTitle,
      input.awayMessage,
      input.soundNotifications,
      input.autoOpenPaths,
      input.responseTimeMode,
      input.operatingHoursEnabled,
      input.operatingHoursTimezone,
      input.operatingHoursJson
    ]
  );

  return Boolean(result.rows[0]);
}
