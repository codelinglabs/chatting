import { check, foreignKey, index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    onboardingStep: text("onboarding_step").notNull().default("done"),
    onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true, mode: "date" }),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true, mode: "date" }),
    ownerOnboardingStage: text("owner_onboarding_stage").notNull().default("complete"),
    ownerOnboardingSiteDomain: text("owner_onboarding_site_domain"),
    ownerOnboardingReferralCode: text("owner_onboarding_referral_code"),
  }, (table) => ({
    usersOnboardingStepCheck: check("users_onboarding_step_check", sql.raw("(onboarding_step = ANY (ARRAY['signup'::text, 'team'::text, 'customize'::text, 'install'::text, 'done'::text]))")),
    usersOwnerOnboardingStageCheck: check("users_owner_onboarding_stage_check", sql.raw("(owner_onboarding_stage = ANY (ARRAY['account_created'::text, 'site_created'::text, 'billing_ready'::text, 'referral_applied'::text, 'complete'::text]))")),
    idxUsersEmail: index("idx_users_email").on(table.email),
    usersEmailKey: uniqueIndex("users_email_key").on(table.email),
  }));

export const authEmailTokens = pgTable("auth_email_tokens", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    email: text("email").notNull(),
    type: text("type").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    authEmailTokensTypeCheck: check("auth_email_tokens_type_check", sql.raw("(type = ANY (ARRAY['password_reset'::text, 'email_verification'::text]))")),
    authEmailTokensUserIdFkey: foreignKey({ name: "auth_email_tokens_user_id_fkey", columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
    authEmailTokensTokenHashKey: uniqueIndex("auth_email_tokens_token_hash_key").on(table.tokenHash),
  }));

export const authSessions = pgTable("auth_sessions", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    activeWorkspaceOwnerId: text("active_workspace_owner_id"),
  }, (table) => ({
    authSessionsActiveWorkspaceOwnerIdFkey: foreignKey({ name: "auth_sessions_active_workspace_owner_id_fkey", columns: [table.activeWorkspaceOwnerId], foreignColumns: [users.id] }).onDelete("set null"),
    authSessionsUserIdFkey: foreignKey({ name: "auth_sessions_user_id_fkey", columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
    authSessionsTokenHashKey: uniqueIndex("auth_sessions_token_hash_key").on(table.tokenHash),
    idxAuthSessionsTokenHash: index("idx_auth_sessions_token_hash").on(table.tokenHash),
  }));
