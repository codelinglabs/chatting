import type { DashboardReferralSummary } from "@/lib/referral-types";
import type { BillingInterval, BillingPlanFeatures, BillingPlanKey } from "@/lib/billing-plans";

export type { BillingInterval, BillingPlanFeatures, BillingPlanKey } from "@/lib/billing-plans";

export type DashboardBillingPaymentMethod = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  holderName: string;
  updatedAt: string;
};

export type DashboardBillingInvoice = {
  id: string;
  planKey: BillingPlanKey;
  billingInterval: BillingInterval | null;
  seatQuantity: number | null;
  description: string;
  amountCents: number;
  currency: string;
  status: "paid" | "open";
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
  issuedAt: string;
  paidAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
};

export type DashboardBillingSummary = {
  planKey: BillingPlanKey;
  planName: string;
  priceLabel: string;
  billingInterval: BillingInterval | null;
  usedSeats: number;
  billedSeats: number | null;
  seatLimit: number | null;
  siteCount: number;
  conversationCount: number;
  messageCount?: number;
  avgResponseSeconds?: number | null;
  conversationLimit: number | null;
  conversationUsagePercent: number | null;
  upgradePromptThreshold: number | null;
  remainingConversations: number | null;
  showUpgradePrompt: boolean;
  limitReached: boolean;
  nextBillingDate: string | null;
  trialEndsAt: string | null;
  subscriptionStatus: string | null;
  customerId: string | null;
  portalAvailable: boolean;
  checkoutAvailable: boolean;
  features: BillingPlanFeatures;
  paymentMethod: DashboardBillingPaymentMethod | null;
  invoices: DashboardBillingInvoice[];
  referrals: DashboardReferralSummary;
};
