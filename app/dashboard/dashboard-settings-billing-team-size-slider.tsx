"use client";

import { useState } from "react";
import type { BillingInterval } from "@/lib/billing-plans";
import {
  CHATTING_ANNUAL_SAVINGS_LABEL,
  CHATTING_GROWTH_CONTACT_TEAM_SIZE,
  CHATTING_GROWTH_TIER_BREAKPOINTS,
  getChattingGrowthPricingSummary
} from "@/lib/pricing";
import { FormButton } from "../ui/form-controls";
import { classNames } from "@/lib/utils";
import { UsersIcon } from "./dashboard-ui";

function formatMoney(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(amountCents / 100);
}

function sliderProgress(memberCount: number) {
  return ((Math.min(memberCount, CHATTING_GROWTH_CONTACT_TEAM_SIZE) - 1) / (CHATTING_GROWTH_CONTACT_TEAM_SIZE - 1)) * 100;
}

function tickPosition(memberCount: number) {
  return `${sliderProgress(memberCount)}%`;
}

export function DashboardSettingsBillingTeamSizeSlider({
  memberCount,
  interval,
  subtitle = "Preview Growth pricing.",
  onMemberCountChange,
  onIntervalChange
}: {
  memberCount: number;
  interval: BillingInterval;
  subtitle?: string | null;
  onMemberCountChange: (value: number) => void;
  onIntervalChange: (value: BillingInterval) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const summary = getChattingGrowthPricingSummary(interval, memberCount);
  const progress = sliderProgress(summary.memberCount);
  const thumbPosition = `${Math.min(99, Math.max(1, progress))}%`;
  const ariaValueText =
    summary.totalCents === null
      ? "50 or more team members, custom pricing required"
      : `${summary.memberLabel}, ${formatMoney(summary.totalCents)} ${interval === "annual" ? "per year" : "per month"}`;

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_0_rgba(15,23,42,0.02)] sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-base font-medium text-slate-900">How many team members?</p>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>

        <div className="relative inline-flex rounded-[14px] border border-slate-200 bg-slate-100 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          {(["monthly", "annual"] as BillingInterval[]).map((value) => (
            <FormButton
              key={value}
              type="button"
              onClick={() => onIntervalChange(value)}
              aria-pressed={interval === value}
              variant="secondary"
              size="md"
              className={classNames(
                "relative z-10 h-auto min-w-[104px] gap-0 rounded-[10px] border-0 px-4 py-2 font-semibold shadow-none sm:px-5",
                interval === value
                  ? "!border-blue-600 !bg-blue-600 !text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)] hover:!border-blue-600 hover:!bg-blue-600 hover:!text-white"
                  : "bg-transparent text-slate-500 hover:border-0 hover:bg-white/70 hover:text-slate-900"
              )}
            >
              {value === "annual" ? "Yearly" : "Monthly"}
            </FormButton>
          ))}
          {interval === "annual" ? (
            <span className="pointer-events-none absolute -right-1 -top-5 whitespace-nowrap text-xs font-medium italic text-orange-500">
              {CHATTING_ANNUAL_SAVINGS_LABEL}
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative mt-6 pt-11">
        <div
          className="pointer-events-none absolute top-0 z-10 rounded-[10px] bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-[0_10px_24px_rgba(15,23,42,0.22)]"
          style={{ left: thumbPosition, transform: "translateX(-50%)" }}
        >
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            <UsersIcon className="h-4 w-4" />
            {summary.memberLabel}
          </span>
          <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-slate-900" />
        </div>

        <div className="relative h-9">
          <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
          <div
            className={classNames(
              "absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full transition-[width] duration-100 ease-out",
              dragging ? "bg-slate-950" : "bg-slate-900"
            )}
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min={1}
            max={CHATTING_GROWTH_CONTACT_TEAM_SIZE}
            step={1}
            value={Math.min(summary.memberCount, CHATTING_GROWTH_CONTACT_TEAM_SIZE)}
            aria-label="Number of team members"
            aria-valuemin={1}
            aria-valuemax={CHATTING_GROWTH_CONTACT_TEAM_SIZE}
            aria-valuenow={Math.min(summary.memberCount, CHATTING_GROWTH_CONTACT_TEAM_SIZE)}
            aria-valuetext={ariaValueText}
            onChange={(event) => onMemberCountChange(Number(event.target.value))}
            onPointerDown={() => setDragging(true)}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
            onBlur={() => setDragging(false)}
            className="absolute inset-0 h-9 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-slate-900 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_4px_12px_rgba(15,23,42,0.18)] [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-12px] [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-slate-900 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_4px_12px_rgba(15,23,42,0.18)]"
          />
        </div>

        <div className="relative mt-3 h-6 text-[11px] text-slate-400">
          {CHATTING_GROWTH_TIER_BREAKPOINTS.map((value) => (
            <div
              key={value}
              className={classNames(
                "absolute top-0 text-center",
                value === 1 ? "left-0" : value === CHATTING_GROWTH_CONTACT_TEAM_SIZE ? "right-0" : "-translate-x-1/2"
              )}
              style={
                value === 1 || value === CHATTING_GROWTH_CONTACT_TEAM_SIZE ? undefined : { left: tickPosition(value) }
              }
            >
              <span
                className={classNames(
                  "absolute -top-5 left-1/2 h-2.5 w-0.5 -translate-x-1/2 rounded-full bg-slate-300",
                  summary.memberCount >= value ? "bg-slate-900" : null
                )}
              />
              <span>{value === CHATTING_GROWTH_CONTACT_TEAM_SIZE ? "50+" : value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
