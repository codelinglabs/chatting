import { query } from "@/lib/db";

export type AuthEmailTokenType = "password_reset" | "email_verification";

export type AuthEmailTokenRow = {
  id: string;
  user_id: string;
  email: string;
  type: AuthEmailTokenType;
  token_hash: string;
  expires_at: string;
  consumed_at: string | null;
};

export async function invalidateAuthEmailTokens(userId: string, type: AuthEmailTokenType) {
  await query(
    `
      UPDATE auth_email_tokens
      SET consumed_at = COALESCE(consumed_at, NOW())
      WHERE user_id = $1
        AND type = $2
        AND consumed_at IS NULL
    `,
    [userId, type]
  );
}

export async function insertAuthEmailToken(input: {
  tokenId: string;
  userId: string;
  email: string;
  type: AuthEmailTokenType;
  tokenHash: string;
  expiresAt: string;
}) {
  await query(
    `
      INSERT INTO auth_email_tokens (id, user_id, email, type, token_hash, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [input.tokenId, input.userId, input.email, input.type, input.tokenHash, input.expiresAt]
  );
}

export async function findActiveAuthEmailToken(type: AuthEmailTokenType, tokenHash: string) {
  const result = await query<AuthEmailTokenRow>(
    `
      SELECT id, user_id, email, type, token_hash, expires_at, consumed_at
      FROM auth_email_tokens
      WHERE type = $1
        AND token_hash = $2
        AND consumed_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `,
    [type, tokenHash]
  );

  return result.rows[0] ?? null;
}

export async function consumeAuthEmailToken(tokenId: string) {
  await query(
    `
      UPDATE auth_email_tokens
      SET consumed_at = NOW()
      WHERE id = $1
        AND consumed_at IS NULL
    `,
    [tokenId]
  );
}
