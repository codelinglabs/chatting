import { query } from "@/lib/db";

export type GrowthLifecycleSiteRow = {
  site_id: string;
  user_id: string;
};

export async function listGrowthLifecycleSiteRows() {
  const result = await query<GrowthLifecycleSiteRow>(
    `
      SELECT DISTINCT ON (s.user_id)
        s.id AS site_id,
        s.user_id
      FROM sites s
      WHERE
        s.widget_install_verified_at IS NOT NULL
        OR s.widget_last_seen_at IS NOT NULL
        OR EXISTS (
          SELECT 1
          FROM conversations c
          WHERE c.site_id = s.id
        )
      ORDER BY
        s.user_id,
        COALESCE(s.widget_last_seen_at, s.widget_install_verified_at, s.created_at) DESC
    `
  );

  return result.rows;
}
