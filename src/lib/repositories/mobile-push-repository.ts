import { query } from "@/lib/db";

export type MobilePushRegistrationRow = {
  id: string;
  site_id: string;
  conversation_id: string | null;
  session_id: string;
  provider: "expo";
  platform: string | null;
  app_id: string | null;
  push_token: string;
  disabled_at: string | null;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
};

export async function upsertMobilePushRegistrationRow(input: {
  id: string;
  siteId: string;
  sessionId: string;
  conversationId: string | null;
  provider: "expo";
  platform: string | null;
  appId: string | null;
  pushToken: string;
}) {
  const result = await query<MobilePushRegistrationRow>(
    `
      INSERT INTO mobile_push_registrations (
        id, site_id, session_id, conversation_id, provider, platform, app_id, push_token, last_seen_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      ON CONFLICT (push_token)
      DO UPDATE SET
        site_id = EXCLUDED.site_id,
        session_id = EXCLUDED.session_id,
        conversation_id = COALESCE(EXCLUDED.conversation_id, mobile_push_registrations.conversation_id),
        provider = EXCLUDED.provider,
        platform = COALESCE(EXCLUDED.platform, mobile_push_registrations.platform),
        app_id = COALESCE(EXCLUDED.app_id, mobile_push_registrations.app_id),
        disabled_at = NULL,
        last_seen_at = NOW(),
        updated_at = NOW()
      RETURNING *
    `,
    [
      input.id,
      input.siteId,
      input.sessionId,
      input.conversationId,
      input.provider,
      input.platform,
      input.appId,
      input.pushToken
    ]
  );

  return result.rows[0] ?? null;
}

export async function disableMobilePushRegistrationRow(input: {
  siteId: string;
  sessionId: string;
  pushToken: string;
}) {
  await query(
    `
      UPDATE mobile_push_registrations
      SET disabled_at = NOW(),
          updated_at = NOW()
      WHERE site_id = $1
        AND session_id = $2
        AND push_token = $3
        AND disabled_at IS NULL
    `,
    [input.siteId, input.sessionId, input.pushToken]
  );
}

export async function bindMobilePushRegistrationsToConversationRow(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
}) {
  await query(
    `
      UPDATE mobile_push_registrations
      SET conversation_id = $3,
          disabled_at = NULL,
          last_seen_at = NOW(),
          updated_at = NOW()
      WHERE site_id = $1
        AND session_id = $2
        AND disabled_at IS NULL
    `,
    [input.siteId, input.sessionId, input.conversationId]
  );
}

export async function listConversationMobilePushTokensRow(input: {
  ownerUserId: string;
  conversationId: string;
}) {
  const result = await query<{ push_token: string }>(
    `
      SELECT DISTINCT mpr.push_token
      FROM mobile_push_registrations mpr
      INNER JOIN conversations c
        ON c.id = mpr.conversation_id
      INNER JOIN sites s
        ON s.id = c.site_id
      WHERE c.id = $1
        AND s.user_id = $2
        AND mpr.provider = 'expo'
        AND mpr.disabled_at IS NULL
      ORDER BY mpr.push_token ASC
    `,
    [input.conversationId, input.ownerUserId]
  );

  return result.rows.map((row) => row.push_token);
}

export async function disableMobilePushTokensRow(pushTokens: string[]) {
  if (!pushTokens.length) {
    return;
  }

  await query(
    `
      UPDATE mobile_push_registrations
      SET disabled_at = NOW(),
          updated_at = NOW()
      WHERE push_token = ANY ($1::text[])
        AND disabled_at IS NULL
    `,
    [pushTokens]
  );
}
