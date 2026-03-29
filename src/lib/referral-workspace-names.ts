import { query } from "@/lib/db";

type ReferralWorkspaceRow = {
  user_id: string;
  workspace_name: string;
};

export async function listReferralWorkspaceNames(userIds: string[]) {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

  if (!uniqueUserIds.length) {
    return new Map<string, string>();
  }

  const result = await query<ReferralWorkspaceRow>(
    `
      SELECT DISTINCT ON (s.user_id)
        s.user_id,
        s.name AS workspace_name
      FROM sites s
      WHERE s.user_id = ANY($1::text[])
      ORDER BY s.user_id, s.created_at ASC
    `,
    [uniqueUserIds]
  );

  return new Map(result.rows.map((row) => [row.user_id, row.workspace_name]));
}
