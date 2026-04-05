import { query } from "@/lib/db";

type ContactSettingsRow = {
  workspace_contacts_settings_json: string | null;
};

let contactSettingsColumnReady = false;

async function ensureContactSettingsColumn() {
  if (contactSettingsColumnReady) {
    return;
  }

  await query(
    `
      ALTER TABLE user_settings
      ADD COLUMN IF NOT EXISTS workspace_contacts_settings_json TEXT NOT NULL DEFAULT ''
    `
  );
  contactSettingsColumnReady = true;
}

export async function findWorkspaceContactSettingsValue(userId: string) {
  await ensureContactSettingsColumn();
  const result = await query<ContactSettingsRow>(
    `
      SELECT workspace_contacts_settings_json
      FROM user_settings
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0]?.workspace_contacts_settings_json ?? "";
}

export async function upsertWorkspaceContactSettings(
  ownerUserId: string,
  value: string
) {
  await ensureContactSettingsColumn();
  await query(
    `
      INSERT INTO user_settings (
        user_id,
        workspace_contacts_settings_json
      )
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET
        workspace_contacts_settings_json = EXCLUDED.workspace_contacts_settings_json
    `,
    [ownerUserId, value]
  );
}

