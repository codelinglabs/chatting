import { query } from "@/lib/db";
import type { VisitorNoteIdentityType } from "@/lib/types";

export type VisitorNoteRow = {
  site_id: string;
  identity_type: VisitorNoteIdentityType;
  identity_value: string;
  note: string;
  updated_at: string;
};

export async function findSiteRowForOwner(siteId: string, ownerUserId: string) {
  const result = await query<{ id: string }>(
    `
      SELECT id
      FROM sites
      WHERE id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [siteId, ownerUserId]
  );

  return result.rows[0] ?? null;
}

export async function findVisitorNoteRow(
  siteId: string,
  identityType: VisitorNoteIdentityType,
  identityValue: string
) {
  const result = await query<VisitorNoteRow>(
    `
      SELECT
        site_id,
        identity_type,
        identity_value,
        note,
        updated_at
      FROM visitor_notes
      WHERE site_id = $1
        AND identity_type = $2
        AND identity_value = $3
      LIMIT 1
    `,
    [siteId, identityType, identityValue]
  );

  return result.rows[0] ?? null;
}

export async function upsertVisitorNoteRow(input: {
  siteId: string;
  identityType: VisitorNoteIdentityType;
  identityValue: string;
  note: string;
  updatedByUserId: string | null;
}) {
  const result = await query<VisitorNoteRow>(
    `
      INSERT INTO visitor_notes (
        site_id,
        identity_type,
        identity_value,
        note,
        updated_by_user_id,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (site_id, identity_type, identity_value)
      DO UPDATE SET
        note = EXCLUDED.note,
        updated_by_user_id = EXCLUDED.updated_by_user_id,
        updated_at = NOW()
      RETURNING
        site_id,
        identity_type,
        identity_value,
        note,
        updated_at
    `,
    [
      input.siteId,
      input.identityType,
      input.identityValue,
      input.note,
      input.updatedByUserId
    ]
  );

  return result.rows[0] ?? null;
}

export async function deleteVisitorNoteRow(
  siteId: string,
  identityType: VisitorNoteIdentityType,
  identityValue: string
) {
  await query(
    `
      DELETE FROM visitor_notes
      WHERE site_id = $1
        AND identity_type = $2
        AND identity_value = $3
    `,
    [siteId, identityType, identityValue]
  );
}
