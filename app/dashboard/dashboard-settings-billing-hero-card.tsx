"use client";

import { getBillingPreviewDisplayPrice } from "@/lib/billing-plans";
import { CHATTING_GROWTH_BASE_TEAM_LIMIT } from "@/lib/pricing";
import type { DashboardBillingSummary } from "@/lib/data";
import { FormButton } from "../ui/form-controls";
import { ChevronRightIcon } from "./dashboard-ui";

function usageMeter({
  label,
  value,
  helper,
  progress
}: {
  label: string;
  value: string;
  helper?: string | null;
  progress: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm text-white/75">
        <span>{label}</span>
        <span className="font-medium text-white">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
        <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
      </div>
      {helper ? <p className="mt-2 text-xs text-white/65">{helper}</p> : null}
    </div>
  );
}

export function DashboardSettingsBillingHeroCard({
  billing,
  actionLabel,
  actionPending,
  onAction
}: {
  billing: DashboardBillingSummary;
  actionLabel: string;
  actionPending: boolean;
  onAction: () => void;
}) {
  const displayPrice = getBillingPreviewDisplayPrice(
    billing.planKey,
    billing.billingInterval ?? "monthly",
    billing.billedSeats ?? billing.usedSeats
  );
  const teamProgress = billing.seatLimit
    ? Math.max(8, Math.min(100, (billing.usedSeats / Math.max(billing.seatLimit, 1)) * 100))
    : 100;
  const conversationProgress = billing.conversationLimit
    ? Math.max(8, Math.min(100, (billing.conversationCount / Math.max(billing.conversationLimit, 1)) * 100))
    : 100;
  const renewalLabel =
    billing.subscriptionStatus === "trialing" && billing.trialEndsAt
      ? `Trial ends ${billing.trialEndsAt}`
      : billing.nextBillingDate
        ? `Renews ${billing.nextBillingDate}`
        : billing.planKey === "starter"
          ? "No renewal scheduled"
          : "Billing schedule updates in Stripe";
  const teamHelper = billing.seatLimit
    ? `${Math.max(billing.seatLimit - billing.usedSeats, 0)} seats available`
    : billing.billedSeats && billing.billedSeats > CHATTING_GROWTH_BASE_TEAM_LIMIT
      ? `${billing.billedSeats} billed seat${billing.billedSeats === 1 ? "" : "s"}`
      : null;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#2563EB_0%,#1D4ED8_100%)] p-7 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.14)_0%,transparent_50%),radial-gradient(circle_at_0%_100%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />

      <div className="relative">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="inline-flex rounded-lg border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
              Current plan
            </span>
            <h3 className="display-font mt-4 text-[2.3rem] leading-none tracking-[-0.02em] text-white">{billing.planName}</h3>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-[15px] text-white/80">
              <span>
                {displayPrice.amount}
                {displayPrice.cadence || ""}
              </span>
              <span className="text-white/40">·</span>
              <span>{renewalLabel}</span>
            </p>
          </div>

          <FormButton
            type="button"
            onClick={onAction}
            disabled={actionPending}
            variant="secondary"
            trailingIcon={<ChevronRightIcon className="h-4 w-4" />}
            className="self-start border-white/30 bg-white/15 text-white hover:border-white/30 hover:bg-white/25 hover:text-white disabled:opacity-60"
          >
            {actionPending ? "Opening..." : actionLabel}
          </FormButton>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {usageMeter({
            label: "Team members",
            value: billing.seatLimit ? `${billing.usedSeats} of ${billing.seatLimit}` : `${billing.usedSeats} active`,
            helper: teamHelper,
            progress: teamProgress
          })}
          {usageMeter({
            label: "Conversations",
            value: billing.conversationLimit
              ? `${billing.conversationCount} of ${billing.conversationLimit}`
              : `${billing.conversationCount} this month`,
            helper: billing.conversationLimit
              ? `${Math.max((billing.conversationLimit ?? 0) - billing.conversationCount, 0)} conversations remaining`
              : "Unlimited on paid plans",
            progress: conversationProgress
          })}
        </div>
      </div>
    </section>
  );
}
