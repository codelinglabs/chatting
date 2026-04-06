export type SummaryRow = {
  id: string;
  site_id: string;
  site_name: string;
  email: string | null;
  assigned_user_id: string | null;
  session_id: string;
  status: "open" | "resolved";
  created_at: string;
  updated_at: string;
  page_url: string | null;
  recorded_page_url: string | null;
  referrer: string | null;
  user_agent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  locale: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: string;
  rating: number | null;
  tags: string[] | null;
};

export const INBOX_CONVERSATION_SUMMARY_SELECT = `
  c.id,
  c.site_id,
  s.name AS site_name,
  c.email,
  c.assigned_user_id,
  c.session_id,
  c.status,
  c.created_at,
  c.updated_at,
  cm.page_url AS page_url,
  cm.page_url AS recorded_page_url,
  NULL::text AS referrer,
  NULL::text AS user_agent,
  cm.country AS country,
  cm.region AS region,
  cm.city AS city,
  cm.timezone AS timezone,
  cm.locale AS locale,
  latest.created_at AS last_message_at,
  latest.content AS last_message_preview,
  COALESCE(unread.unread_count, '0') AS unread_count,
  NULL::int AS rating,
  '{}'::text[] AS tags
`;

export const INBOX_CONVERSATION_SUMMARY_FROM = `
  FROM conversations c
  INNER JOIN sites s
    ON s.id = c.site_id
  LEFT JOIN conversation_metadata cm
    ON cm.conversation_id = c.id
  LEFT JOIN LATERAL (
    SELECT m.content, m.created_at
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) latest ON TRUE
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::text AS unread_count
    FROM messages unread_messages
    LEFT JOIN conversation_reads cr
      ON cr.conversation_id = c.id
     AND cr.user_id = $VIEWER_USER_PARAM
    WHERE unread_messages.conversation_id = c.id
      AND unread_messages.sender = 'user'
      AND unread_messages.created_at > COALESCE(cr.last_read_at, TO_TIMESTAMP(0))
  ) unread ON TRUE
`;

export const CONVERSATION_SUMMARY_SELECT = `
  c.id,
  c.site_id,
  s.name AS site_name,
  COALESCE(live_visitor.email, c.email) AS email,
  c.assigned_user_id,
  c.session_id,
  c.status,
  c.created_at,
  c.updated_at,
  COALESCE(live_visitor.current_page_url, cm.page_url) AS page_url,
  cm.page_url AS recorded_page_url,
  COALESCE(live_visitor.referrer, cm.referrer) AS referrer,
  COALESCE(live_visitor.user_agent, cm.user_agent) AS user_agent,
  COALESCE(live_visitor.country, cm.country) AS country,
  COALESCE(live_visitor.region, cm.region) AS region,
  COALESCE(live_visitor.city, cm.city) AS city,
  COALESCE(live_visitor.timezone, cm.timezone) AS timezone,
  COALESCE(live_visitor.locale, cm.locale) AS locale,
  latest.created_at AS last_message_at,
  latest.content AS last_message_preview,
  unread.unread_count,
  f.rating,
  COALESCE(ARRAY_AGG(t.tag ORDER BY t.tag) FILTER (WHERE t.tag IS NOT NULL), '{}') AS tags
`;

export const CONVERSATION_SUMMARY_FROM = `
  FROM conversations c
  INNER JOIN sites s
    ON s.id = c.site_id
  LEFT JOIN conversation_metadata cm
    ON cm.conversation_id = c.id
  LEFT JOIN LATERAL (
    SELECT
      vps.email,
      vps.current_page_url,
      vps.referrer,
      vps.user_agent,
      vps.country,
      vps.region,
      vps.city,
      vps.timezone,
      vps.locale
    FROM visitor_presence_sessions vps
    WHERE vps.site_id = c.site_id
      AND vps.last_seen_at > NOW() - INTERVAL '5 minutes'
      AND (vps.conversation_id = c.id OR vps.session_id = c.session_id)
    ORDER BY
      CASE WHEN vps.conversation_id = c.id THEN 0 ELSE 1 END,
      vps.last_seen_at DESC
    LIMIT 1
  ) live_visitor ON TRUE
  LEFT JOIN feedback f
    ON f.conversation_id = c.id
  LEFT JOIN LATERAL (
    SELECT m.content, m.created_at
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) latest ON TRUE
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::text AS unread_count
    FROM messages unread_messages
    LEFT JOIN conversation_reads cr
      ON cr.conversation_id = c.id
     AND cr.user_id = $VIEWER_USER_PARAM
    WHERE unread_messages.conversation_id = c.id
      AND unread_messages.sender = 'user'
      AND unread_messages.created_at > COALESCE(cr.last_read_at, TO_TIMESTAMP(0))
  ) unread ON TRUE
  LEFT JOIN tags t
    ON t.conversation_id = c.id
`;

export const CONVERSATION_SUMMARY_GROUP_BY = `
  c.id,
  c.site_id,
  s.name,
  c.email,
  live_visitor.email,
  c.assigned_user_id,
  c.session_id,
  c.status,
  c.created_at,
  c.updated_at,
  cm.page_url,
  live_visitor.current_page_url,
  cm.referrer,
  live_visitor.referrer,
  cm.user_agent,
  live_visitor.user_agent,
  cm.country,
  live_visitor.country,
  cm.region,
  live_visitor.region,
  cm.city,
  live_visitor.city,
  cm.timezone,
  live_visitor.timezone,
  cm.locale,
  live_visitor.locale,
  latest.created_at,
  latest.content,
  unread.unread_count,
  f.rating
`;
