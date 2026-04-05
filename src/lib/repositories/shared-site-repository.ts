import { query } from "@/lib/db";

export type SiteRow = {
  id: string;
  user_id: string;
  name: string;
  domain: string | null;
  brand_color: string;
  widget_title: string;
  greeting_text: string;
  launcher_position: string | null;
  avatar_style: string | null;
  team_photo_url: string | null;
  show_online_status: boolean | null;
  require_email_offline: boolean | null;
  offline_title: string | null;
  offline_message: string | null;
  away_title: string | null;
  away_message: string | null;
  sound_notifications: boolean | null;
  auto_open_paths: string[] | null;
  response_time_mode: string | null;
  operating_hours_enabled: boolean | null;
  operating_hours_timezone: string | null;
  operating_hours_json: string | null;
  widget_install_verified_at: string | null;
  widget_install_verified_url: string | null;
  widget_last_seen_at: string | null;
  widget_last_seen_url: string | null;
  created_at: string;
  conversation_count: string;
};

const SITE_SELECT = `
  s.id,
  s.user_id,
  s.name,
  s.domain,
  s.brand_color,
  s.widget_title,
  s.greeting_text,
  s.launcher_position,
  s.avatar_style,
  s.team_photo_url,
  s.show_online_status,
  s.require_email_offline,
  s.offline_title,
  s.offline_message,
  s.away_title,
  s.away_message,
  s.sound_notifications,
  s.auto_open_paths,
  s.response_time_mode,
  s.operating_hours_enabled,
  s.operating_hours_timezone,
  s.operating_hours_json,
  s.widget_install_verified_at,
  s.widget_install_verified_url,
  s.widget_last_seen_at,
  s.widget_last_seen_url,
  s.created_at,
  (
    SELECT COUNT(*)::text
    FROM conversations c
    WHERE c.site_id = s.id
  ) AS conversation_count
`;

export async function querySites(whereClause: string, values: unknown[], suffix: string) {
  return query<SiteRow>(
    `
      SELECT
        ${SITE_SELECT}
      FROM sites s
      WHERE ${whereClause}
      ${suffix}
    `,
    values
  );
}
