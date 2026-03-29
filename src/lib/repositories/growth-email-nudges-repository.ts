import { query } from "@/lib/db";

export type GrowthEmailNudgeRow = {
  user_id: string;
  nudge_key: string;
  last_sent_at: string;
};

export async function findGrowthEmailNudgeRow(userId: string, nudgeKey: string) {
  const result = await query<GrowthEmailNudgeRow>(
    `
      SELECT user_id, nudge_key, last_sent_at
      FROM growth_email_nudges
      WHERE user_id = $1
        AND nudge_key = $2
      LIMIT 1
    `,
    [userId, nudgeKey]
  );

  return result.rows[0] ?? null;
}

export async function upsertGrowthEmailNudgeRow(userId: string, nudgeKey: string) {
  await query(
    `
      INSERT INTO growth_email_nudges (user_id, nudge_key, last_sent_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id, nudge_key)
      DO UPDATE SET last_sent_at = NOW()
    `,
    [userId, nudgeKey]
  );
}
