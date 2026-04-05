import type {
  DashboardNotificationDeliverySettings,
  DashboardSettingsNotifications
} from "@/lib/data/settings-types";
import { mapDashboardNotificationSettings } from "@/lib/data/settings-helpers";
import { findNotificationSettingsRow } from "@/lib/repositories/settings-repository";
import { optionalText } from "@/lib/utils";

async function getNotificationSettingsRow(userId: string) {
  const row = await findNotificationSettingsRow(userId);
  if (!row) {
    throw new Error("User not found.");
  }

  return row;
}

export async function getDashboardNotificationSettings(
  userId: string
): Promise<DashboardSettingsNotifications> {
  const row = await getNotificationSettingsRow(userId);
  return mapDashboardNotificationSettings(row);
}

export async function getDashboardNotificationDeliverySettings(
  userId: string
): Promise<DashboardNotificationDeliverySettings> {
  const row = await getNotificationSettingsRow(userId);

  return {
    ...mapDashboardNotificationSettings(row),
    notificationEmail: optionalText(row.notification_email) || row.email
  };
}
