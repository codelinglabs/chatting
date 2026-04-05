import { foreignKey, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./core";

export const savedReplies = pgTable("saved_replies", {
    id: text("id").primaryKey(),
    ownerUserId: text("owner_user_id").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    tags: text("tags").array().notNull().default(sql.raw("ARRAY[]::text[]")),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    savedRepliesOwnerUserIdFkey: foreignKey({ name: "saved_replies_owner_user_id_fkey", columns: [table.ownerUserId], foreignColumns: [users.id] }).onDelete("cascade"),
  }));

export const helpCenterArticles = pgTable("help_center_articles", {
    id: text("id").primaryKey(),
    ownerUserId: text("owner_user_id").notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  }, (table) => ({
    helpCenterArticlesOwnerUserIdFkey: foreignKey({ name: "help_center_articles_owner_user_id_fkey", columns: [table.ownerUserId], foreignColumns: [users.id] }).onDelete("cascade"),
    helpCenterArticlesOwnerUserIdSlugKey: uniqueIndex("help_center_articles_owner_user_id_slug_key").on(table.ownerUserId, table.slug),
  }));
