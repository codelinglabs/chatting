import { randomUUID } from "node:crypto";
import { query } from "@/lib/db";
import type {
  ConversationSummary,
  ConversationThread,
  DashboardStats,
  Sender,
  Site,
  ThreadMessage
} from "@/lib/types";
import { optionalText } from "@/lib/utils";

export const DEFAULT_TAGS = ["pricing", "confusion", "bug", "objection"] as const;

type CreateUserMessageInput = {
  siteId: string;
  conversationId?: string | null;
  sessionId: string;
  email?: string | null;
  content: string;
  metadata: {
    pageUrl?: string | null;
    referrer?: string | null;
    userAgent?: string | null;
  };
};

type SiteRow = {
  id: string;
  user_id: string;
  name: string;
  domain: string | null;
  brand_color: string;
  greeting_text: string;
  created_at: string;
  conversation_count: string;
};

type SummaryRow = {
  id: string;
  site_id: string;
  site_name: string;
  email: string | null;
  session_id: string;
  created_at: string;
  updated_at: string;
  page_url: string | null;
  referrer: string | null;
  user_agent: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  helpful: boolean | null;
  tags: string[] | null;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender: Sender;
  content: string;
  created_at: string;
};

const SITE_SELECT = `
  s.id,
  s.user_id,
  s.name,
  s.domain,
  s.brand_color,
  s.greeting_text,
  s.created_at,
  COUNT(c.id)::text AS conversation_count
`;

const SITE_GROUP_BY = `
  s.id,
  s.user_id,
  s.name,
  s.domain,
  s.brand_color,
  s.greeting_text,
  s.created_at
`;

const CONVERSATION_SUMMARY_SELECT = `
  c.id,
  c.site_id,
  s.name AS site_name,
  c.email,
  c.session_id,
  c.created_at,
  c.updated_at,
  cm.page_url,
  cm.referrer,
  cm.user_agent,
  latest.created_at AS last_message_at,
  latest.content AS last_message_preview,
  f.helpful,
  COALESCE(ARRAY_AGG(t.tag ORDER BY t.tag) FILTER (WHERE t.tag IS NOT NULL), '{}') AS tags
`;

const CONVERSATION_SUMMARY_FROM = `
  FROM conversations c
  INNER JOIN sites s
    ON s.id = c.site_id
  LEFT JOIN conversation_metadata cm
    ON cm.conversation_id = c.id
  LEFT JOIN feedback f
    ON f.conversation_id = c.id
  LEFT JOIN LATERAL (
    SELECT m.content, m.created_at
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) latest ON TRUE
  LEFT JOIN tags t
    ON t.conversation_id = c.id
`;

const CONVERSATION_SUMMARY_GROUP_BY = `
  c.id,
  c.site_id,
  s.name,
  c.email,
  c.session_id,
  c.created_at,
  c.updated_at,
  cm.page_url,
  cm.referrer,
  cm.user_agent,
  latest.created_at,
  latest.content,
  f.helpful
`;

function mapSite(row: SiteRow): Site {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    domain: row.domain,
    brandColor: row.brand_color,
    greetingText: row.greeting_text,
    createdAt: row.created_at,
    conversationCount: Number(row.conversation_count)
  };
}

function mapSummary(row: SummaryRow): ConversationSummary {
  return {
    id: row.id,
    siteId: row.site_id,
    siteName: row.site_name,
    email: row.email,
    sessionId: row.session_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pageUrl: row.page_url,
    referrer: row.referrer,
    userAgent: row.user_agent,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
    helpful: row.helpful,
    tags: row.tags ?? []
  };
}

function mapMessage(row: MessageRow): ThreadMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    sender: row.sender,
    content: row.content,
    createdAt: row.created_at
  };
}

async function querySites(whereClause: string, values: unknown[], suffix: string) {
  return query<SiteRow>(
    `
      SELECT
        ${SITE_SELECT}
      FROM sites s
      LEFT JOIN conversations c
        ON c.site_id = s.id
      WHERE ${whereClause}
      GROUP BY
        ${SITE_GROUP_BY}
      ${suffix}
    `,
    values
  );
}

async function queryConversationSummaries(
  whereClause: string,
  values: unknown[],
  suffix: string
) {
  return query<SummaryRow>(
    `
      SELECT
        ${CONVERSATION_SUMMARY_SELECT}
      ${CONVERSATION_SUMMARY_FROM}
      WHERE ${whereClause}
      GROUP BY
        ${CONVERSATION_SUMMARY_GROUP_BY}
      ${suffix}
    `,
    values
  );
}

async function updateConversationEmailValue(
  conversationId: string,
  email: string | null | undefined,
  mode: "merge" | "replace"
) {
  const normalizedEmail = optionalText(email);

  if (!normalizedEmail) {
    return;
  }

  const assignment =
    mode === "replace" ? "email = $2" : "email = COALESCE(email, $2)";

  await query(
    `
      UPDATE conversations
      SET ${assignment},
          updated_at = NOW()
      WHERE id = $1
    `,
    [conversationId, normalizedEmail]
  );
}

async function hasConversationAccess(conversationId: string, userId: string) {
  const result = await query<{ id: string }>(
    `
      SELECT c.id
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE c.id = $1
        AND s.user_id = $2
      LIMIT 1
    `,
    [conversationId, userId]
  );

  return Boolean(result.rowCount);
}

async function ensureConversation(input: CreateUserMessageInput) {
  const requestedId = input.conversationId?.trim();

  if (requestedId) {
    const existing = await query<{ id: string; email: string | null; site_id: string }>(
      `
        SELECT id, email, site_id
        FROM conversations
        WHERE id = $1
        LIMIT 1
      `,
      [requestedId]
    );

    if (existing.rowCount && existing.rows[0].site_id === input.siteId) {
      await updateConversationEmailValue(requestedId, input.email, "merge");

      return requestedId;
    }
  }

  const conversationId = randomUUID();
  await query(
    `
      INSERT INTO conversations (id, site_id, email, session_id)
      VALUES ($1, $2, $3, $4)
    `,
    [conversationId, input.siteId, optionalText(input.email), input.sessionId]
  );

  return conversationId;
}

async function upsertMetadata(
  conversationId: string,
  metadata: CreateUserMessageInput["metadata"]
) {
  await query(
    `
      INSERT INTO conversation_metadata (conversation_id, page_url, referrer, user_agent)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (conversation_id)
      DO UPDATE SET
        page_url = EXCLUDED.page_url,
        referrer = EXCLUDED.referrer,
        user_agent = EXCLUDED.user_agent
    `,
    [
      conversationId,
      optionalText(metadata.pageUrl),
      optionalText(metadata.referrer),
      optionalText(metadata.userAgent)
    ]
  );
}

async function insertMessage(conversationId: string, sender: Sender, content: string) {
  const messageId = randomUUID();
  await query(
    `
      INSERT INTO messages (id, conversation_id, sender, content)
      VALUES ($1, $2, $3, $4)
    `,
    [messageId, conversationId, sender, content.trim()]
  );

  await query(
    `
      UPDATE conversations
      SET updated_at = NOW()
      WHERE id = $1
    `,
    [conversationId]
  );

  return messageId;
}

export async function createSiteForUser(
  userId: string,
  input: {
    name: string;
    domain?: string | null;
    brandColor?: string | null;
    greetingText?: string | null;
  }
) {
  const siteId = randomUUID();
  const name = input.name.trim();

  await query(
    `
      INSERT INTO sites (id, user_id, name, domain, brand_color, greeting_text)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      siteId,
      userId,
      name || "My site",
      optionalText(input.domain),
      optionalText(input.brandColor) || "#0f766e",
      optionalText(input.greetingText) || "Ask us anything before you bounce"
    ]
  );

  const created = await query<SiteRow>(
    `
      SELECT
        id,
        user_id,
        name,
        domain,
        brand_color,
        greeting_text,
        created_at,
        '0'::text AS conversation_count
      FROM sites
      WHERE id = $1
      LIMIT 1
    `,
    [siteId]
  );

  return mapSite(created.rows[0]);
}

export async function listSitesForUser(userId: string) {
  const result = await querySites("s.user_id = $1", [userId], "ORDER BY s.created_at ASC");

  return result.rows.map(mapSite);
}

export async function getSiteByPublicId(siteId: string) {
  const result = await querySites("s.id = $1", [siteId], "LIMIT 1");

  return result.rows[0] ? mapSite(result.rows[0]) : null;
}

export async function createUserMessage(input: CreateUserMessageInput) {
  const site = await getSiteByPublicId(input.siteId);

  if (!site) {
    throw new Error("SITE_NOT_FOUND");
  }

  const conversationId = await ensureConversation(input);
  await upsertMetadata(conversationId, input.metadata);
  await insertMessage(conversationId, "user", input.content);
  return { conversationId };
}

export async function addFounderReply(conversationId: string, content: string, userId: string) {
  if (!(await hasConversationAccess(conversationId, userId))) {
    return false;
  }

  await insertMessage(conversationId, "founder", content);
  return true;
}

export async function addInboundReply(
  conversationId: string,
  email: string | null,
  content: string
) {
  await updateConversationEmailValue(conversationId, email, "merge");

  await insertMessage(conversationId, "user", content);
}

export async function listConversationSummaries(userId: string) {
  const result = await queryConversationSummaries(
    "s.user_id = $1",
    [userId],
    "ORDER BY latest.created_at DESC NULLS LAST, c.updated_at DESC"
  );

  return result.rows.map(mapSummary);
}

export async function getConversationById(id: string, userId: string) {
  const summaryResult = await queryConversationSummaries(
    "c.id = $1 AND s.user_id = $2",
    [id, userId],
    "LIMIT 1"
  );

  if (!summaryResult.rowCount) {
    return null;
  }

  const messagesResult = await query<MessageRow>(
    `
      SELECT id, conversation_id, sender, content, created_at
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `,
    [id]
  );

  return {
    ...mapSummary(summaryResult.rows[0]),
    messages: messagesResult.rows.map(mapMessage)
  } satisfies ConversationThread;
}

export async function toggleTag(conversationId: string, tag: string, userId: string) {
  if (!(await hasConversationAccess(conversationId, userId))) {
    return false;
  }

  const normalizedTag = tag.trim().toLowerCase();
  const existing = await query<{ conversation_id: string }>(
    `
      SELECT conversation_id
      FROM tags
      WHERE conversation_id = $1 AND tag = $2
      LIMIT 1
    `,
    [conversationId, normalizedTag]
  );

  if (existing.rowCount) {
    await query(
      `
        DELETE FROM tags
        WHERE conversation_id = $1 AND tag = $2
      `,
      [conversationId, normalizedTag]
    );
    return true;
  }

  await query(
    `
      INSERT INTO tags (conversation_id, tag)
      VALUES ($1, $2)
      ON CONFLICT (conversation_id, tag) DO NOTHING
    `,
    [conversationId, normalizedTag]
  );
  return true;
}

export async function recordFeedback(conversationId: string, helpful: boolean) {
  await query(
    `
      INSERT INTO feedback (conversation_id, helpful)
      VALUES ($1, $2)
      ON CONFLICT (conversation_id)
      DO UPDATE SET helpful = EXCLUDED.helpful, created_at = NOW()
    `,
    [conversationId, helpful]
  );
}

export async function updateConversationEmail(
  conversationId: string,
  email: string,
  userId: string
) {
  if (!(await hasConversationAccess(conversationId, userId))) {
    return false;
  }

  await updateConversationEmailValue(conversationId, email, "replace");
  return true;
}

export async function getConversationEmail(conversationId: string, userId: string) {
  const result = await query<{
    email: string | null;
    site_id: string;
    site_name: string;
  }>(
    `
      SELECT c.email, c.site_id, s.name AS site_name
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE c.id = $1
        AND s.user_id = $2
      LIMIT 1
    `,
    [conversationId, userId]
  );

  return result.rows[0] ?? null;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [totals, helpful, tags] = await Promise.all([
    query<{ total: string; answered: string }>(
      `
        SELECT
          COUNT(*)::text AS total,
          COUNT(*) FILTER (
            WHERE EXISTS (
              SELECT 1
              FROM messages m
              WHERE m.conversation_id = c.id
                AND m.sender = 'founder'
            )
          )::text AS answered
        FROM conversations c
        INNER JOIN sites s
          ON s.id = c.site_id
        WHERE s.user_id = $1
      `,
      [userId]
    ),
    query<{ helpful: string }>(
      `
        SELECT COUNT(*) FILTER (WHERE f.helpful = TRUE)::text AS helpful
        FROM feedback f
        INNER JOIN conversations c
          ON c.id = f.conversation_id
        INNER JOIN sites s
          ON s.id = c.site_id
        WHERE s.user_id = $1
      `,
      [userId]
    ),
    query<{ tag: string; count: string }>(
      `
        SELECT t.tag, COUNT(*)::text AS count
        FROM tags t
        INNER JOIN conversations c
          ON c.id = t.conversation_id
        INNER JOIN sites s
          ON s.id = c.site_id
        WHERE s.user_id = $1
        GROUP BY t.tag
        ORDER BY COUNT(*) DESC, t.tag ASC
        LIMIT 4
      `,
      [userId]
    )
  ]);

  return {
    totalConversations: Number(totals.rows[0]?.total ?? 0),
    answeredConversations: Number(totals.rows[0]?.answered ?? 0),
    helpfulResponses: Number(helpful.rows[0]?.helpful ?? 0),
    topTags: tags.rows.map((row: { tag: string; count: string }) => ({
      tag: row.tag,
      count: Number(row.count)
    }))
  };
}
