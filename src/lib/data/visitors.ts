import type { VisitorPresenceSession } from "@/lib/types";
import { publishDashboardLive } from "@/lib/live-events";
import {
  findSiteOwnerRow,
  findVisitorPresenceSessionRow,
  listVisitorPresenceRowsForUser,
  upsertVisitorPresenceSessionRow
} from "@/lib/repositories/visitor-presence-repository";
import { optionalText } from "@/lib/utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";

export type RecordVisitorPresenceInput = {
  siteId: string;
  sessionId: string;
  conversationId?: string | null;
  email?: string | null;
  pageUrl?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  timezone?: string | null;
  locale?: string | null;
};

function mapVisitorPresenceSession(row: Awaited<ReturnType<typeof upsertVisitorPresenceSessionRow>>) {
  if (!row) {
    return null;
  }

  return {
    siteId: row.site_id,
    sessionId: row.session_id,
    conversationId: row.conversation_id,
    email: row.email,
    currentPageUrl: row.current_page_url,
    referrer: row.referrer,
    userAgent: row.user_agent,
    country: row.country,
    region: row.region,
    city: row.city,
    timezone: row.timezone,
    locale: row.locale,
    startedAt: row.started_at,
    lastSeenAt: row.last_seen_at
  } satisfies VisitorPresenceSession;
}

export async function recordVisitorPresence(input: RecordVisitorPresenceInput) {
  const sessionId = input.sessionId.trim();
  if (!input.siteId || !sessionId) {
    return null;
  }

  const [owner, previous] = await Promise.all([
    findSiteOwnerRow(input.siteId),
    findVisitorPresenceSessionRow(input.siteId, sessionId)
  ]);

  const next = mapVisitorPresenceSession(
    await upsertVisitorPresenceSessionRow({
      siteId: input.siteId,
      sessionId,
      conversationId: optionalText(input.conversationId),
      email: optionalText(input.email),
      currentPageUrl: optionalText(input.pageUrl),
      referrer: optionalText(input.referrer),
      userAgent: optionalText(input.userAgent),
      country: optionalText(input.country),
      region: optionalText(input.region),
      city: optionalText(input.city),
      timezone: optionalText(input.timezone),
      locale: optionalText(input.locale)
    })
  );

  if (!owner?.user_id || !next) {
    return next;
  }

  const pageChanged =
    optionalText(previous?.current_page_url) !== next.currentPageUrl &&
    Boolean(next.currentPageUrl);
  const conversationChanged = optionalText(previous?.conversation_id) !== next.conversationId;
  const emailChanged = optionalText(previous?.email) !== next.email && Boolean(next.email);

  if (pageChanged || conversationChanged || emailChanged || !previous) {
    publishDashboardLive(owner.user_id, {
      type: "visitor.presence.updated",
      siteId: next.siteId,
      sessionId: next.sessionId,
      conversationId: next.conversationId,
      pageUrl: next.currentPageUrl,
      updatedAt: next.lastSeenAt
    });
  }

  return next;
}

export async function getVisitorPresenceSession(input: {
  userId: string;
  siteId: string;
  sessionId: string;
}) {
  const siteId = input.siteId.trim();
  const sessionId = input.sessionId.trim();

  if (!siteId || !sessionId) {
    return null;
  }

  const workspace = await getWorkspaceAccess(input.userId);
  const [owner, row] = await Promise.all([
    findSiteOwnerRow(siteId),
    findVisitorPresenceSessionRow(siteId, sessionId)
  ]);

  if (!row || owner?.user_id !== workspace.ownerUserId) {
    return null;
  }

  return mapVisitorPresenceSession(row);
}

export async function listVisitorPresenceSessions(userId: string) {
  const rows = await listVisitorPresenceRowsForUser(userId);
  return rows
    .map((row) => mapVisitorPresenceSession(row))
    .filter((row): row is VisitorPresenceSession => Boolean(row));
}
