import { query } from "@/lib/db";

export type WeeklyPerformanceTeamMemberRow = {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  joined_at: string;
};

export type WeeklyPerformanceHandledConversationRow = {
  conversation_id: string;
  handler_user_id: string;
  handled_at: string;
  first_response_seconds: string | null;
  status: "open" | "resolved";
  rating: number | null;
};

export async function listWeeklyPerformanceTeamMemberRows(ownerUserId: string) {
  const result = await query<WeeklyPerformanceTeamMemberRow>(
    `
      WITH team_members AS (
        SELECT
          u.id AS user_id,
          u.email,
          us.first_name,
          us.last_name,
          u.created_at AS joined_at
        FROM users u
        LEFT JOIN user_settings us
          ON us.user_id = u.id
        WHERE u.id = $1

        UNION ALL

        SELECT
          u.id AS user_id,
          u.email,
          us.first_name,
          us.last_name,
          tm.created_at AS joined_at
        FROM team_memberships tm
        INNER JOIN users u
          ON u.id = tm.member_user_id
        LEFT JOIN user_settings us
          ON us.user_id = u.id
        WHERE tm.owner_user_id = $1
          AND tm.status = 'active'
      )
      SELECT user_id, email, first_name, last_name, joined_at
      FROM team_members
      ORDER BY joined_at ASC, user_id ASC
    `,
    [ownerUserId]
  );

  return result.rows;
}

export async function listWeeklyPerformanceHandledConversationRows(ownerUserId: string) {
  const result = await query<WeeklyPerformanceHandledConversationRow>(
    `
      WITH workspace_conversations AS (
        SELECT c.id, c.created_at, c.status, f.rating
        FROM conversations c
        INNER JOIN sites s
          ON s.id = c.site_id
        LEFT JOIN feedback f
          ON f.conversation_id = c.id
        WHERE s.user_id = $1
      ),
      first_user AS (
        SELECT m.conversation_id, MIN(m.created_at) AS first_user_at
        FROM messages m
        INNER JOIN workspace_conversations wc
          ON wc.id = m.conversation_id
        WHERE m.sender = 'user'
        GROUP BY m.conversation_id
      ),
      first_team AS (
        SELECT DISTINCT ON (m.conversation_id)
          m.conversation_id,
          m.author_user_id AS handler_user_id,
          m.created_at AS handled_at
        FROM messages m
        INNER JOIN first_user fu
          ON fu.conversation_id = m.conversation_id
        WHERE m.sender = 'team'
          AND m.author_user_id IS NOT NULL
          AND m.created_at > fu.first_user_at
        ORDER BY m.conversation_id ASC, m.created_at ASC
      )
      SELECT
        ft.conversation_id,
        ft.handler_user_id,
        ft.handled_at,
        CASE
          WHEN fu.first_user_at IS NOT NULL AND ft.handled_at > fu.first_user_at
          THEN EXTRACT(EPOCH FROM (ft.handled_at - fu.first_user_at))::text
          ELSE NULL
        END AS first_response_seconds,
        wc.status,
        wc.rating
      FROM first_team ft
      INNER JOIN workspace_conversations wc
        ON wc.id = ft.conversation_id
      LEFT JOIN first_user fu
        ON fu.conversation_id = ft.conversation_id
      ORDER BY ft.handled_at ASC
    `,
    [ownerUserId]
  );

  return result.rows;
}
