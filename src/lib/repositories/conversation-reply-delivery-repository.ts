import { query } from "@/lib/db";

export async function findConversationReplyDeliveryStateForUser(
  conversationId: string,
  userId: string
) {
  const result = await query<{
    email: string | null;
    visitor_is_live: boolean;
  }>(
    `
      SELECT
        c.email,
        EXISTS (
          SELECT 1
          FROM visitor_presence_sessions vps
          WHERE vps.site_id = c.site_id
            AND vps.last_seen_at > NOW() - INTERVAL '5 minutes'
            AND (vps.conversation_id = c.id OR vps.session_id = c.session_id)
        ) AS visitor_is_live
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
