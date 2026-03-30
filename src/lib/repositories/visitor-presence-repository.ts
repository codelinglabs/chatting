import { query } from "@/lib/db";
import { workspaceAccessClause } from "@/lib/repositories/workspace-repository";

export type VisitorPresenceRow = {
  site_id: string;
  session_id: string;
  conversation_id: string | null;
  email: string | null;
  current_page_url: string | null;
  referrer: string | null;
  user_agent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  locale: string | null;
  started_at: string;
  last_seen_at: string;
};

export async function findSiteOwnerRow(siteId: string) {
  const result = await query<{ user_id: string }>(
    `
      SELECT user_id
      FROM sites
      WHERE id = $1
      LIMIT 1
    `,
    [siteId]
  );

  return result.rows[0] ?? null;
}

export async function findVisitorPresenceSessionRow(siteId: string, sessionId: string) {
  const result = await query<VisitorPresenceRow>(
    `
      SELECT
        site_id,
        session_id,
        conversation_id,
        email,
        current_page_url,
        referrer,
        user_agent,
        country,
        region,
        city,
        timezone,
        locale,
        started_at,
        last_seen_at
      FROM visitor_presence_sessions
      WHERE site_id = $1
        AND session_id = $2
      LIMIT 1
    `,
    [siteId, sessionId]
  );

  return result.rows[0] ?? null;
}

export async function upsertVisitorPresenceSessionRow(input: {
  siteId: string;
  sessionId: string;
  conversationId: string | null;
  email: string | null;
  currentPageUrl: string | null;
  referrer: string | null;
  userAgent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  locale: string | null;
}) {
  const result = await query<VisitorPresenceRow>(
    `
      INSERT INTO visitor_presence_sessions (
        site_id,
        session_id,
        conversation_id,
        email,
        current_page_url,
        referrer,
        user_agent,
        country,
        region,
        city,
        timezone,
        locale,
        started_at,
        last_seen_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      ON CONFLICT (site_id, session_id)
      DO UPDATE SET
        conversation_id = COALESCE(EXCLUDED.conversation_id, visitor_presence_sessions.conversation_id),
        email = COALESCE(EXCLUDED.email, visitor_presence_sessions.email),
        current_page_url = COALESCE(EXCLUDED.current_page_url, visitor_presence_sessions.current_page_url),
        referrer = COALESCE(EXCLUDED.referrer, visitor_presence_sessions.referrer),
        user_agent = COALESCE(EXCLUDED.user_agent, visitor_presence_sessions.user_agent),
        country = COALESCE(EXCLUDED.country, visitor_presence_sessions.country),
        region = COALESCE(EXCLUDED.region, visitor_presence_sessions.region),
        city = COALESCE(EXCLUDED.city, visitor_presence_sessions.city),
        timezone = COALESCE(EXCLUDED.timezone, visitor_presence_sessions.timezone),
        locale = COALESCE(EXCLUDED.locale, visitor_presence_sessions.locale),
        last_seen_at = NOW()
      RETURNING
        site_id,
        session_id,
        conversation_id,
        email,
        current_page_url,
        referrer,
        user_agent,
        country,
        region,
        city,
        timezone,
        locale,
        started_at,
        last_seen_at
    `,
    [
      input.siteId,
      input.sessionId,
      input.conversationId,
      input.email,
      input.currentPageUrl,
      input.referrer,
      input.userAgent,
      input.country,
      input.region,
      input.city,
      input.timezone,
      input.locale
    ]
  );

  return result.rows[0] ?? null;
}

export async function listVisitorPresenceRowsForUser(viewerUserId: string) {
  const result = await query<VisitorPresenceRow>(
    `
      SELECT
        vps.site_id,
        vps.session_id,
        vps.conversation_id,
        vps.email,
        vps.current_page_url,
        vps.referrer,
        vps.user_agent,
        vps.country,
        vps.region,
        vps.city,
        vps.timezone,
        vps.locale,
        vps.started_at,
        vps.last_seen_at
      FROM visitor_presence_sessions vps
      INNER JOIN sites s
        ON s.id = vps.site_id
      WHERE ${workspaceAccessClause("s.user_id", "$1")}
      ORDER BY vps.last_seen_at DESC
    `,
    [viewerUserId]
  );

  return result.rows;
}
