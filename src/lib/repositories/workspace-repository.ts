import { query } from "@/lib/db";
export type WorkspaceAccessRole = "owner" | "admin" | "member";
export type WorkspaceAccessRow = {
  owner_user_id: string;
  role: WorkspaceAccessRole;
  owner_email: string;
  owner_created_at: string;
};
export type TeamInviteAccessRow = {
  id: string;
  owner_user_id: string;
  email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "revoked";
  message: string;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  accepted_by_user_id: string | null;
  team_name: string | null;
  team_domain: string | null;
  owner_email: string;
  owner_first_name: string | null;
  owner_last_name: string | null;
};
export type TeamMemberRow = {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_data_url: string | null;
  last_seen_at: string | null;
  role: "admin" | "member";
};
export function workspaceAccessClause(ownerColumn: string, viewerParam: string) {
  return `(
    ${ownerColumn} = ${viewerParam}
    OR EXISTS (
      SELECT 1
      FROM team_memberships tm
      WHERE tm.owner_user_id = ${ownerColumn}
        AND tm.member_user_id = ${viewerParam}
        AND tm.status = 'active'
    )
  )`;
}
export async function findWorkspaceAccessRow(userId: string) {
  const result = await query<WorkspaceAccessRow>(
    `
      SELECT
        COALESCE(tm.owner_user_id, u.id) AS owner_user_id,
        CASE
          WHEN tm.member_user_id IS NULL THEN 'owner'
          ELSE tm.role
        END AS role,
        owner_user.email AS owner_email,
        owner_user.created_at AS owner_created_at
      FROM users u
      LEFT JOIN team_memberships tm
        ON tm.member_user_id = u.id
       AND tm.status = 'active'
      INNER JOIN users owner_user
        ON owner_user.id = COALESCE(tm.owner_user_id, u.id)
      WHERE u.id = $1
      LIMIT 1
    `,
    [userId]
  );
  return result.rows[0] ?? null;
}
export async function findTeamInviteAccessRow(inviteId: string) {
  const result = await query<TeamInviteAccessRow>(
    `
      SELECT
        ti.id,
        ti.owner_user_id,
        ti.email,
        ti.role,
        ti.status,
        ti.message,
        ti.created_at,
        ti.updated_at,
        ti.accepted_at,
        ti.accepted_by_user_id,
        owner_user.email AS owner_email,
        owner_settings.first_name AS owner_first_name,
        owner_settings.last_name AS owner_last_name,
        primary_site.name AS team_name,
        primary_site.domain AS team_domain
      FROM team_invites ti
      INNER JOIN users owner_user
        ON owner_user.id = ti.owner_user_id
      LEFT JOIN user_settings owner_settings
        ON owner_settings.user_id = ti.owner_user_id
      LEFT JOIN LATERAL (
        SELECT s.name, s.domain
        FROM sites s
        WHERE s.user_id = ti.owner_user_id
        ORDER BY s.created_at ASC
        LIMIT 1
      ) primary_site ON TRUE
      WHERE ti.id = $1
      LIMIT 1
    `,
    [inviteId]
  );
  return result.rows[0] ?? null;
}
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
      ON CONFLICT (member_user_id)
      DO UPDATE SET
        owner_user_id = EXCLUDED.owner_user_id,
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
