import { boolean, check, foreignKey, index, integer, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { desc, sql } from "drizzle-orm";
import { users } from "./core";

export const userSettings = pgTable("user_settings", {
    userId: text("user_id").primaryKey(),
    firstName: text("first_name").notNull().default(""),
    lastName: text("last_name").notNull().default(""),
    jobTitle: text("job_title").notNull().default(""),
    avatarDataUrl: text("avatar_data_url"),
    notificationEmail: text("notification_email"),
    replyToEmail: text("reply_to_email"),
    browserNotifications: boolean("browser_notifications").notNull().default(true),
    soundAlerts: boolean("sound_alerts").notNull().default(true),
    emailNotifications: boolean("email_notifications").notNull().default(true),
    newVisitorAlerts: boolean("new_visitor_alerts").notNull().default(false),
    highIntentAlerts: boolean("high_intent_alerts").notNull().default(true),
    assignmentNotifications: boolean("assignment_notifications").notNull().default(true),
    mentionNotifications: boolean("mention_notifications").notNull().default(true),
    quietHoursEnabled: boolean("quiet_hours_enabled").notNull().default(false),
    quietHoursStart: text("quiet_hours_start").notNull().default("22:00"),
    quietHoursEnd: text("quiet_hours_end").notNull().default("08:00"),
    emailSignature: text("email_signature").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    emailTemplatesJson: text("email_templates_json").notNull().default(""),
    timezone: text("timezone"),
    weeklyReportEnabled: boolean("weekly_report_enabled").notNull().default(true),
    weeklyReportSendHour: integer("weekly_report_send_hour").notNull().default(9),
    weeklyReportIncludePersonalStats: boolean("weekly_report_include_personal_stats").notNull().default(true),
    weeklyReportSendMinute: integer("weekly_report_send_minute").notNull().default(0),
    workspaceAutomationSettingsJson: text("workspace_automation_settings_json").notNull().default(""),
  }, (table) => ({
    userSettingsUserIdFkey: foreignKey({ name: "user_settings_user_id_fkey", columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
  }));

export const workspaceReportSettings = pgTable("workspace_report_settings", {
    ownerUserId: text("owner_user_id").primaryKey(),
    weeklyReportsEnabled: boolean("weekly_reports_enabled").notNull().default(true),
    includeTeamLeaderboard: boolean("include_team_leaderboard").notNull().default(true),
    aiInsightsEnabled: boolean("ai_insights_enabled").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    workspaceReportSettingsOwnerUserIdFkey: foreignKey({ name: "workspace_report_settings_owner_user_id_fkey", columns: [table.ownerUserId], foreignColumns: [users.id] }).onDelete("cascade"),
  }));

export const teamInvites = pgTable("team_invites", {
    id: text("id").primaryKey(),
    ownerUserId: text("owner_user_id").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull().default("member"),
    message: text("message").notNull().default(""),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true, mode: "date" }),
    acceptedByUserId: text("accepted_by_user_id"),
  }, (table) => ({
    teamInvitesAcceptedByUserIdFkey: foreignKey({ name: "team_invites_accepted_by_user_id_fkey", columns: [table.acceptedByUserId], foreignColumns: [users.id] }).onDelete("set null"),
    teamInvitesOwnerUserIdFkey: foreignKey({ name: "team_invites_owner_user_id_fkey", columns: [table.ownerUserId], foreignColumns: [users.id] }).onDelete("cascade"),
    teamInvitesRoleCheck: check("team_invites_role_check", sql.raw("(role = ANY (ARRAY['admin'::text, 'member'::text]))")),
    teamInvitesStatusCheck: check("team_invites_status_check", sql.raw("(status = ANY (ARRAY['pending'::text, 'accepted'::text, 'revoked'::text]))")),
    idxTeamInvitesOwnerStatus: index("idx_team_invites_owner_status").on(table.ownerUserId, table.status, desc(table.updatedAt)),
  }));

export const teamMemberships = pgTable("team_memberships", {
    ownerUserId: text("owner_user_id").notNull(),
    memberUserId: text("member_user_id").notNull(),
    role: text("role").notNull().default("member"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    teamMembershipsPkey: primaryKey({ name: "team_memberships_pkey", columns: [table.ownerUserId, table.memberUserId] }),
    teamMembershipsMemberUserIdFkey: foreignKey({ name: "team_memberships_member_user_id_fkey", columns: [table.memberUserId], foreignColumns: [users.id] }).onDelete("cascade"),
    teamMembershipsOwnerUserIdFkey: foreignKey({ name: "team_memberships_owner_user_id_fkey", columns: [table.ownerUserId], foreignColumns: [users.id] }).onDelete("cascade"),
    teamMembershipsRoleCheck: check("team_memberships_role_check", sql.raw("(role = ANY (ARRAY['admin'::text, 'member'::text]))")),
    teamMembershipsStatusCheck: check("team_memberships_status_check", sql.raw("(status = ANY (ARRAY['active'::text, 'revoked'::text]))")),
    idxTeamMembershipsMemberStatus: index("idx_team_memberships_member_status").on(table.memberUserId, table.status, desc(table.updatedAt)),
    idxTeamMembershipsOwnerStatus: index("idx_team_memberships_owner_status").on(table.ownerUserId, table.status, desc(table.updatedAt)),
    teamMembershipsMemberUserIdKey: uniqueIndex("team_memberships_member_user_id_key").on(table.memberUserId),
  }));

export const userPresence = pgTable("user_presence", {
    userId: text("user_id").primaryKey(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    userPresenceUserIdFkey: foreignKey({ name: "user_presence_user_id_fkey", columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
  }));
