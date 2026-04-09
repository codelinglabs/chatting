import { optionalDateTime } from "@/lib/utils";

type TimestampValue = string | Date | null | undefined;

type BillingAccountTimestampFields = {
  next_billing_date?: TimestampValue;
  stripe_current_period_end?: TimestampValue;
  trial_started_at?: TimestampValue;
  trial_ends_at?: TimestampValue;
  trial_extension_used_at?: TimestampValue;
  created_at?: TimestampValue;
  updated_at?: TimestampValue;
};

type BillingPaymentMethodTimestampFields = {
  created_at?: TimestampValue;
  updated_at?: TimestampValue;
};

type BillingInvoiceTimestampFields = {
  issued_at?: TimestampValue;
  paid_at?: TimestampValue;
  period_start?: TimestampValue;
  period_end?: TimestampValue;
  created_at?: TimestampValue;
};

type ExpiredGrowthTrialTimestampFields = {
  trial_ends_at?: TimestampValue;
};

function normalizeTimestampField(row: Record<string, unknown>, key: string) {
  if (!Object.prototype.hasOwnProperty.call(row, key)) {
    return;
  }

  const value = row[key];
  if (value == null || value instanceof Date || typeof value === "string") {
    row[key] = optionalDateTime(value);
  }
}

export function normalizeBillingAccountRow<
  T extends Record<string, unknown> & BillingAccountTimestampFields
>(row: T) {
  const normalized = { ...row };

  normalizeTimestampField(normalized, "next_billing_date");
  normalizeTimestampField(normalized, "stripe_current_period_end");
  normalizeTimestampField(normalized, "trial_started_at");
  normalizeTimestampField(normalized, "trial_ends_at");
  normalizeTimestampField(normalized, "trial_extension_used_at");
  normalizeTimestampField(normalized, "created_at");
  normalizeTimestampField(normalized, "updated_at");

  return normalized;
}

export function normalizeBillingPaymentMethodRow<
  T extends Record<string, unknown> & BillingPaymentMethodTimestampFields
>(row: T) {
  const normalized = { ...row };

  normalizeTimestampField(normalized, "created_at");
  normalizeTimestampField(normalized, "updated_at");

  return normalized;
}

export function normalizeBillingInvoiceRow<
  T extends Record<string, unknown> & BillingInvoiceTimestampFields
>(row: T) {
  const normalized = { ...row };

  normalizeTimestampField(normalized, "issued_at");
  normalizeTimestampField(normalized, "paid_at");
  normalizeTimestampField(normalized, "period_start");
  normalizeTimestampField(normalized, "period_end");
  normalizeTimestampField(normalized, "created_at");

  return normalized;
}

export function normalizeExpiredGrowthTrialWorkspaceRow<
  T extends Record<string, unknown> & ExpiredGrowthTrialTimestampFields
>(row: T) {
  const normalized = { ...row };

  normalizeTimestampField(normalized, "trial_ends_at");

  return normalized;
}
