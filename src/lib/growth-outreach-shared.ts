import { isGrowthNudgeDue } from "@/lib/growth-outreach-rules";
import {
  findGrowthEmailNudgeRow,
  upsertGrowthEmailNudgeRow
} from "@/lib/repositories/growth-email-nudges-repository";
import { findNotificationSettingsRow } from "@/lib/repositories/settings-repository";
import { optionalText } from "@/lib/utils";

export async function maybeSendGrowthEmail(
  userId: string,
  nudgeKey: string,
  cooldownHours: number,
  send: () => Promise<void>
) {
  const existing = await findGrowthEmailNudgeRow(userId, nudgeKey);
  if (!isGrowthNudgeDue(existing?.last_sent_at ?? null, cooldownHours)) {
    return;
  }

  await send();
  await upsertGrowthEmailNudgeRow(userId, nudgeKey);
}

export async function getGrowthDeliverySettings(userId: string) {
  const row = await findNotificationSettingsRow(userId);
  if (!row) {
    return null;
  }

  return {
    emailNotifications: row.email_notifications ?? true,
    notificationEmail: optionalText(row.notification_email) || row.email
  };
}
