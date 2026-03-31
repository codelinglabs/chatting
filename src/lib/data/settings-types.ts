import type { DashboardBillingSummary } from "@/lib/data/billing-types";
import type { DashboardEmailTemplate } from "@/lib/email-templates";

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
  role: "owner" | "admin" | "member";
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
