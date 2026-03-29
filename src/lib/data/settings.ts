import { randomUUID } from "node:crypto";
import { changeUserPassword } from "@/lib/auth";
import { getDashboardBillingSummary, type DashboardBillingSummary } from "@/lib/data/billing";
import {
  parseDashboardEmailTemplates,
  serializeDashboardEmailTemplates,
  type DashboardEmailTemplate
} from "@/lib/email-templates";
import {
  findDashboardSettingsRow,
  findEmailTemplateSettingsRow,
  findNotificationSettingsRow,
  findUserIdByEmailExcludingUser,
  insertTeamInviteRecord,
  listPendingTeamInviteRows,
  revokePendingTeamInvite,
  touchPendingTeamInvite,
  type TeamInviteRow,
  type UserSettingsRow,
  updatePendingTeamInviteRole,
  updateSettingsUserEmail,
  upsertUserSettingsRecord
} from "@/lib/repositories/settings-repository";
import { maybeSendTeamExpansionEmail } from "@/lib/growth-outreach";
import { displayNameFromEmail, firstNameFromDisplayName, initialsFromLabel } from "@/lib/user-display";
import { optionalText } from "@/lib/utils";

export type DashboardSettingsProfile = {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  avatarDataUrl: string | null;
};

export type DashboardSettingsNotifications = {
  browserNotifications: boolean;
  soundAlerts: boolean;
  emailNotifications: boolean;
  newVisitorAlerts: boolean;
  highIntentAlerts: boolean;
};

export type DashboardSettingsEmail = {
  notificationEmail: string;
  replyToEmail: string;
  templates: DashboardEmailTemplate[];
  emailSignature: string;
};

export type DashboardNotificationDeliverySettings = DashboardSettingsNotifications & {
  notificationEmail: string;
};

export type DashboardEmailTemplateSettings = {
  profile: DashboardSettingsProfile;
  email: DashboardSettingsEmail;
};

export type DashboardTeamMember = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: "owner";
  status: "online" | "offline";
  lastActiveLabel: string;
  isCurrentUser: boolean;
  avatarDataUrl: string | null;
};

export type DashboardTeamInvite = {
  id: string;
  email: string;
  role: "admin" | "member";
  status: "pending";
  message: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardSettingsData = {
  profile: DashboardSettingsProfile;
  notifications: DashboardSettingsNotifications;
  email: DashboardSettingsEmail;
  teamMembers: DashboardTeamMember[];
  teamInvites: DashboardTeamInvite[];
  billing: DashboardBillingSummary;
};

export type UpdateDashboardSettingsInput = {
  profile: DashboardSettingsProfile;
  notifications: DashboardSettingsNotifications;
  email: DashboardSettingsEmail;
  password?: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  } | null;
};

function splitName(email: string, firstName: string | null, lastName: string | null) {
  const displayName = displayNameFromEmail(email);
  const fallbackFirstName = firstNameFromDisplayName(displayName);
  const fallbackLastName = displayName.replace(fallbackFirstName, "").trim();

  return {
    firstName: optionalText(firstName) || fallbackFirstName,
    lastName: optionalText(lastName) || fallbackLastName
  };
}

function formatLastActiveLabel(lastSeenAt: string | null) {
  if (!lastSeenAt) {
    return "Never";
  }

  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  const minutes = Math.max(0, Math.round(diffMs / (60 * 1000)));

  if (minutes <= 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric"
  }).format(new Date(lastSeenAt));
}

function isOnline(lastSeenAt: string | null) {
  if (!lastSeenAt) {
    return false;
  }

  return Date.now() - new Date(lastSeenAt).getTime() <= 5 * 60 * 1000;
}

function mapNotificationSettings(row: Pick<
  UserSettingsRow,
  | "browser_notifications"
  | "sound_alerts"
  | "email_notifications"
  | "new_visitor_alerts"
  | "high_intent_alerts"
>): DashboardSettingsNotifications {
  return {
    browserNotifications: row.browser_notifications ?? true,
    soundAlerts: row.sound_alerts ?? true,
    emailNotifications: row.email_notifications ?? true,
    newVisitorAlerts: row.new_visitor_alerts ?? false,
    highIntentAlerts: row.high_intent_alerts ?? true
  };
}

async function getNotificationSettingsRow(userId: string) {
  const row = await findNotificationSettingsRow(userId);
  if (!row) {
    throw new Error("User not found.");
  }

  return row;
}

export async function getDashboardNotificationSettings(userId: string): Promise<DashboardSettingsNotifications> {
  const row = await getNotificationSettingsRow(userId);
  return mapNotificationSettings(row);
}

export async function getDashboardNotificationDeliverySettings(
  userId: string
): Promise<DashboardNotificationDeliverySettings> {
  const row = await getNotificationSettingsRow(userId);

  return {
    ...mapNotificationSettings(row),
    notificationEmail: optionalText(row.notification_email) || row.email
  };
}

export async function getDashboardEmailTemplateSettings(
  userId: string
): Promise<DashboardEmailTemplateSettings> {
  const row = await findEmailTemplateSettingsRow(userId);
  if (!row) {
    throw new Error("User not found.");
  }

  const name = splitName(row.email, row.first_name, row.last_name);

  return {
    profile: {
      firstName: name.firstName,
      lastName: name.lastName,
      email: row.email,
      jobTitle: "",
      avatarDataUrl: optionalText(row.avatar_data_url)
    },
    email: {
      notificationEmail: optionalText(row.notification_email) || row.email,
      replyToEmail: optionalText(row.reply_to_email) || row.email,
      templates: parseDashboardEmailTemplates(row.email_templates_json),
      emailSignature: row.email_signature ?? ""
    }
  };
}

export async function getDashboardSettingsData(userId: string): Promise<DashboardSettingsData> {
  const [row, inviteRows] = await Promise.all([
    findDashboardSettingsRow(userId),
    listPendingTeamInviteRows(userId)
  ]);

  if (!row) {
    throw new Error("User not found.");
  }

  const name = splitName(row.email, row.first_name, row.last_name);
  const ownerName = [name.firstName, name.lastName].filter(Boolean).join(" ").trim() || displayNameFromEmail(row.email);
  const activeOnline = isOnline(row.last_seen_at);
  const pendingInvites = inviteRows.filter((invite) => invite.status === "pending");
  const usedSeats = 1 + pendingInvites.length;
  const billing = await getDashboardBillingSummary(userId, usedSeats);

  return {
    profile: {
      firstName: name.firstName,
      lastName: name.lastName,
      email: row.email,
      jobTitle: row.job_title ?? "",
      avatarDataUrl: optionalText(row.avatar_data_url)
    },
    notifications: mapNotificationSettings(row),
    email: {
      notificationEmail: optionalText(row.notification_email) || row.email,
      replyToEmail: optionalText(row.reply_to_email) || row.email,
      templates: parseDashboardEmailTemplates(row.email_templates_json),
      emailSignature: row.email_signature ?? ""
    },
    teamMembers: [
      {
        id: row.user_id,
        name: ownerName,
        email: row.email,
        initials: initialsFromLabel(ownerName),
        role: "owner",
        status: activeOnline ? "online" : "offline",
        lastActiveLabel: formatLastActiveLabel(row.last_seen_at),
        isCurrentUser: true,
        avatarDataUrl: optionalText(row.avatar_data_url)
      }
    ],
    teamInvites: pendingInvites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: "pending",
      message: invite.message,
      createdAt: invite.created_at,
      updatedAt: invite.updated_at
    })),
    billing
  };
}

async function ensureEmailAvailable(email: string, userId: string) {
  const existingUserId = await findUserIdByEmailExcludingUser(email, userId);

  if (existingUserId) {
    throw new Error("EMAIL_TAKEN");
  }
}

export async function updateDashboardSettings(userId: string, input: UpdateDashboardSettingsInput) {
  const email = input.profile.email.trim().toLowerCase();

  if (!email) {
    throw new Error("MISSING_EMAIL");
  }

  await ensureEmailAvailable(email, userId);

  await updateSettingsUserEmail(userId, email);

  await upsertUserSettingsRecord({
    userId,
    firstName: input.profile.firstName.trim(),
    lastName: input.profile.lastName.trim(),
    jobTitle: input.profile.jobTitle.trim(),
    avatarDataUrl: optionalText(input.profile.avatarDataUrl),
    notificationEmail: optionalText(input.email.notificationEmail),
    replyToEmail: optionalText(input.email.replyToEmail),
    emailTemplatesJson: serializeDashboardEmailTemplates(input.email.templates),
    browserNotifications: input.notifications.browserNotifications,
    soundAlerts: input.notifications.soundAlerts,
    emailNotifications: input.notifications.emailNotifications,
    newVisitorAlerts: input.notifications.newVisitorAlerts,
    highIntentAlerts: input.notifications.highIntentAlerts,
    emailSignature: input.email.emailSignature
  });

  if (input.password && (input.password.currentPassword || input.password.newPassword || input.password.confirmPassword)) {
    if (input.password.newPassword !== input.password.confirmPassword) {
      throw new Error("PASSWORD_CONFIRM");
    }

    await changeUserPassword(userId, input.password.currentPassword, input.password.newPassword);
  }

  return getDashboardSettingsData(userId);
}

export async function createTeamInvite(input: {
  ownerUserId: string;
  email: string;
  role: "admin" | "member";
  message?: string;
}) {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    throw new Error("MISSING_EMAIL");
  }

  await insertTeamInviteRecord({
    inviteId: randomUUID(),
    ownerUserId: input.ownerUserId,
    email,
    role: input.role,
    message: input.message?.trim() || ""
  });
  await maybeSendTeamExpansionEmail(input.ownerUserId);

  return listTeamInvites(input.ownerUserId);
}

export async function listTeamInvites(ownerUserId: string) {
  const inviteRows = await listPendingTeamInviteRows(ownerUserId);

  return inviteRows.map((invite) => ({
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: "pending" as const,
    message: invite.message,
    createdAt: invite.created_at,
    updatedAt: invite.updated_at
  }));
}

export async function resendTeamInvite(ownerUserId: string, inviteId: string) {
  await touchPendingTeamInvite(ownerUserId, inviteId);

  return listTeamInvites(ownerUserId);
}

export async function updateTeamInviteRole(ownerUserId: string, inviteId: string, role: "admin" | "member") {
  await updatePendingTeamInviteRole(ownerUserId, inviteId, role);

  return listTeamInvites(ownerUserId);
}

export async function revokeTeamInvite(ownerUserId: string, inviteId: string) {
  await revokePendingTeamInvite(ownerUserId, inviteId);

  return listTeamInvites(ownerUserId);
}
