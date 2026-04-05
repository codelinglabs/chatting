import { jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const emailRecipientPreferences = pgTable("email_recipient_preferences", {
    email: text("email").primaryKey(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  });

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    source: text("source").notNull().default("blog"),
    lastSource: text("last_source").notNull().default("blog"),
    welcomeEmailSentAt: timestamp("welcome_email_sent_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true, mode: "date" }),
  }, (table) => ({
    newsletterSubscribersEmailKey: uniqueIndex("newsletter_subscribers_email_key").on(table.email),
  }));

export const toolExportRequests = pgTable("tool_export_requests", {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    toolSlug: text("tool_slug").notNull(),
    source: text("source").notNull().default("free-tools"),
    resultPayloadJson: jsonb("result_payload_json").notNull().default(sql.raw("'{}'::jsonb")),
    deliverySentAt: timestamp("delivery_sent_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  });
