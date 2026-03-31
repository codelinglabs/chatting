import { query } from "@/lib/db";
import { workspaceAccessClause } from "@/lib/repositories/workspace-repository";

export async function getDashboardUnreadCount(userId: string) {
  const result = await query<{ unread_count: string }>(
    `
      SELECT COUNT(*)::text AS unread_count
      FROM messages m
      INNER JOIN conversations c
        ON c.id = m.conversation_id
      INNER JOIN sites s
        ON s.id = c.site_id
      LEFT JOIN conversation_reads cr
        ON cr.user_id = $1
       AND cr.conversation_id = c.id
      WHERE ${workspaceAccessClause("s.user_id", "$1")}
        AND m.sender = 'user'
        AND m.created_at > COALESCE(cr.last_read_at, TO_TIMESTAMP(0))
    `,
    [userId]
  );

  return Number(result.rows[0]?.unread_count ?? 0);
}
