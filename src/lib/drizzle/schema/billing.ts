import { check, foreignKey, index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { desc, sql } from "drizzle-orm";
import { users } from "./core";

export const billingAccounts = pgTable("billing_accounts", {
    userId: text("user_id").primaryKey(),
    planKey: text("plan_key").notNull().default("starter"),
    nextBillingDate: timestamp("next_billing_date", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripePriceId: text("stripe_price_id"),
    stripeStatus: text("stripe_status"),
    stripeCurrentPeriodEnd: timestamp("stripe_current_period_end", { withTimezone: true, mode: "date" }),
    billingInterval: text("billing_interval").notNull().default("monthly"),
    seatQuantity: integer("seat_quantity").notNull().default(1),
    trialStartedAt: timestamp("trial_started_at", { withTimezone: true, mode: "date" }),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true, mode: "date" }),
    trialExtensionUsedAt: timestamp("trial_extension_used_at", { withTimezone: true, mode: "date" }),
  }, (table) => ({
    billingAccountsBillingIntervalCheck: check("billing_accounts_billing_interval_check", sql.raw("(billing_interval = ANY (ARRAY['monthly'::text, 'annual'::text]))")),
    billingAccountsPlanKeyCheck: check("billing_accounts_plan_key_check", sql.raw("(plan_key = ANY (ARRAY['starter'::text, 'growth'::text]))")),
    billingAccountsSeatQuantityCheck: check("billing_accounts_seat_quantity_check", sql.raw("(seat_quantity >= 1)")),
    billingAccountsUserIdFkey: foreignKey({ name: "billing_accounts_user_id_fkey", columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
    billingAccountsStripeCustomerIdKey: uniqueIndex("billing_accounts_stripe_customer_id_key").on(table.stripeCustomerId),
    billingAccountsStripeSubscriptionIdKey: uniqueIndex("billing_accounts_stripe_subscription_id_key").on(table.stripeSubscriptionId),
    idxBillingAccountsStripeCustomerId: index("idx_billing_accounts_stripe_customer_id").on(table.stripeCustomerId),
    idxBillingAccountsStripeSubscriptionId: index("idx_billing_accounts_stripe_subscription_id").on(table.stripeSubscriptionId),
  }));

export const billingPaymentMethods = pgTable("billing_payment_methods", {
    userId: text("user_id").primaryKey(),
    brand: text("brand").notNull(),
    last4: text("last4").notNull(),
    expMonth: integer("exp_month").notNull(),
    expYear: integer("exp_year").notNull(),
    holderName: text("holder_name").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    stripePaymentMethodId: text("stripe_payment_method_id"),
  }, (table) => ({
    billingPaymentMethodsUserIdFkey: foreignKey({ name: "billing_payment_methods_user_id_fkey", columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
    billingPaymentMethodsStripePaymentMethodIdKey: uniqueIndex("billing_payment_methods_stripe_payment_method_id_key").on(table.stripePaymentMethodId),
  }));

export const billingInvoices = pgTable("billing_invoices", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    planKey: text("plan_key").notNull(),
    description: text("description").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    status: text("status").notNull().default("paid"),
    issuedAt: timestamp("issued_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true, mode: "date" }),
    periodStart: timestamp("period_start", { withTimezone: true, mode: "date" }),
    periodEnd: timestamp("period_end", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    stripeInvoiceId: text("stripe_invoice_id"),
    hostedInvoiceUrl: text("hosted_invoice_url"),
    invoicePdfUrl: text("invoice_pdf_url"),
    billingInterval: text("billing_interval"),
    seatQuantity: integer("seat_quantity"),
  }, (table) => ({
    billingInvoicesBillingIntervalCheck: check("billing_invoices_billing_interval_check", sql.raw("((billing_interval IS NULL) OR (billing_interval = ANY (ARRAY['monthly'::text, 'annual'::text])))")),
    billingInvoicesPlanKeyCheck: check("billing_invoices_plan_key_check", sql.raw("(plan_key = ANY (ARRAY['starter'::text, 'growth'::text]))")),
    billingInvoicesStatusCheck: check("billing_invoices_status_check", sql.raw("(status = ANY (ARRAY['paid'::text, 'open'::text]))")),
    billingInvoicesUserIdFkey: foreignKey({ name: "billing_invoices_user_id_fkey", columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
    billingInvoicesStripeInvoiceIdKey: uniqueIndex("billing_invoices_stripe_invoice_id_key").on(table.stripeInvoiceId),
    idxBillingInvoicesUserId: index("idx_billing_invoices_user_id").on(table.userId, desc(table.issuedAt)),
  }));
