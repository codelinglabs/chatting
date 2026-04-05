import { query } from "@/lib/db";

export type AuthSessionUserRecord = {
  id: string;
  email: string;
  onboarding_step: string;
  onboarding_completed_at: string | null;
  created_at: string;
  active_workspace_owner_id: string | null;
};

export async function insertAuthSession(input: {
  sessionId: string;
  userId: string;
  tokenHash: string;
  activeWorkspaceOwnerId?: string | null;
}) {
  await query(
    `
      INSERT INTO auth_sessions (id, user_id, token_hash, active_workspace_owner_id, expires_at)
      VALUES ($1, $2, $3, $4, NOW() + INTERVAL '30 days')
    `,
    [input.sessionId, input.userId, input.tokenHash, input.activeWorkspaceOwnerId ?? null]
  );
}

export async function deleteAuthSessionByTokenHash(tokenHash: string) {
  await query(
    `
      DELETE FROM auth_sessions
      WHERE token_hash = $1
    `,
    [tokenHash]
  );
}

export async function findCurrentUserByTokenHash(tokenHash: string) {
  const result = await query<AuthSessionUserRecord>(
    `
      SELECT u.id, u.email, u.created_at
      , u.onboarding_step, u.onboarding_completed_at
      , s.active_workspace_owner_id
      FROM auth_sessions s
      INNER JOIN users u
        ON u.id = s.user_id
      WHERE s.token_hash = $1
        AND s.expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  return result.rows[0] ?? null;
}

export async function findAuthSessionWorkspaceOwnerByTokenHash(tokenHash: string) {
  const result = await query<{ active_workspace_owner_id: string | null }>(
    `
      SELECT active_workspace_owner_id
      FROM auth_sessions
      WHERE token_hash = $1
        AND expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  return result.rows[0]?.active_workspace_owner_id ?? null;
}

export async function updateAuthSessionActiveWorkspaceByTokenHash(tokenHash: string, ownerUserId: string | null) {
  await query(
    `
      UPDATE auth_sessions
      SET active_workspace_owner_id = $2
      WHERE token_hash = $1
        AND expires_at > NOW()
    `,
    [tokenHash, ownerUserId]
  );
}
