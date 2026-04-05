import { query } from "@/lib/db";

export type WeeklyPerformanceSnapshotRow = {
  owner_user_id: string;
  week_start: string;
  snapshot_json: string;
  generated_at: string;
};

export async function findWeeklyPerformanceSnapshot(ownerUserId: string, weekStart: string) {
  const result = await query<WeeklyPerformanceSnapshotRow>(
    `
      SELECT owner_user_id, week_start, snapshot_json, generated_at
      FROM weekly_performance_snapshots
      WHERE owner_user_id = $1
        AND week_start = $2::date
      LIMIT 1
    `,
    [ownerUserId, weekStart]
  );

  return result.rows[0] ?? null;
}

export async function upsertWeeklyPerformanceSnapshot(input: {
  ownerUserId: string;
  weekStart: string;
  snapshotJson: string;
}) {
  await query(
    `
      INSERT INTO weekly_performance_snapshots (
        owner_user_id,
        week_start,
        snapshot_json,
        generated_at
      )
      VALUES ($1, $2::date, $3, NOW())
      ON CONFLICT (owner_user_id, week_start)
      DO UPDATE SET
        snapshot_json = EXCLUDED.snapshot_json,
        generated_at = NOW()
    `,
    [input.ownerUserId, input.weekStart, input.snapshotJson]
  );
}
