import { query } from "@/lib/db";

export type TeamMemberRow = {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_data_url: string | null;
  last_seen_at: string | null;
  role: "admin" | "member";
};

export async function listActiveTeamMemberRows(ownerUserId: string) {
  const result = await query<TeamMemberRow>(
    `
      SELECT
        u.id AS user_id,
        u.email,
        us.first_name,
        us.last_name,
        us.avatar_data_url,
        up.last_seen_at,
        tm.role
      FROM team_memberships tm
      INNER JOIN users u
        ON u.id = tm.member_user_id
      LEFT JOIN user_settings us
        ON us.user_id = u.id
      LEFT JOIN user_presence up
        ON up.user_id = u.id
      WHERE tm.owner_user_id = $1
        AND tm.status = 'active'
      ORDER BY u.created_at ASC
    `,
    [ownerUserId]
  );

  return result.rows;
}

export async function countActiveTeamMembershipRows(ownerUserId: string) {
  const result = await query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM team_memberships
      WHERE owner_user_id = $1
        AND status = 'active'
    `,
    [ownerUserId]
  );

  return Number(result.rows[0]?.count ?? 0);
}

export async function hasWorkspaceMemberRecord(ownerUserId: string, memberUserId: string) {
  const result = await query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM users owner_user
        WHERE owner_user.id = $1
          AND owner_user.id = $2

        UNION ALL

        SELECT 1
        FROM team_memberships tm
        WHERE tm.owner_user_id = $1
          AND tm.member_user_id = $2
          AND tm.status = 'active'
      ) AS exists
    `,
    [ownerUserId, memberUserId]
  );

  return Boolean(result.rows[0]?.exists);
}

export async function hasOwnedWorkspaceRecord(userId: string) {
  const result = await query<{ id: string }>(
    `
      SELECT id
      FROM sites
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return Boolean(result.rowCount);
}

export async function upsertActiveTeamMembership(input: {
  ownerUserId: string;
  memberUserId: string;
  role: "admin" | "member";
}) {
  await query(
    `
      INSERT INTO team_memberships (
        owner_user_id,
        member_user_id,
        role,
        status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, 'active', NOW(), NOW())
      ON CONFLICT (owner_user_id, member_user_id)
      DO UPDATE SET
        role = EXCLUDED.role,
        status = 'active',
        updated_at = NOW()
    `,
    [input.ownerUserId, input.memberUserId, input.role]
  );
}

export async function acceptTeamInviteRecord(inviteId: string, memberUserId: string) {
  await query(
    `
      UPDATE team_invites
      SET status = 'accepted',
          accepted_at = NOW(),
          accepted_by_user_id = $2,
          updated_at = NOW()
      WHERE id = $1
    `,
    [inviteId, memberUserId]
  );
}
