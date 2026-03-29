"use client";

import type { DashboardReferralSummary } from "@/lib/data";
import { classNames } from "@/lib/utils";
import {
  earnedValueLabel,
  earnedValueToneClass
} from "./dashboard-settings-referrals-helpers";

function StatCard({
  label,
  value,
  valueClassName
}: {
  label: string;
  value: string | number;
  valueClassName?: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="mb-2 text-[13px] font-normal text-slate-500">{label}</p>
      <p className={classNames("text-[1.75rem] font-bold text-slate-900", valueClassName)}>{value}</p>
    </article>
  );
}

export function DashboardSettingsReferralStats({
  referrals
}: {
  referrals: DashboardReferralSummary;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard label="Referred signups" value={referrals.attributedSignups.length} />
      <StatCard
        label="Pending rewards"
        value={referrals.pendingRewardCount}
        valueClassName={referrals.pendingRewardCount > 0 ? "text-amber-600" : undefined}
      />
      <StatCard
        label="Earned value tracked"
        value={earnedValueLabel(referrals)}
        valueClassName={earnedValueToneClass(referrals)}
      />
    </div>
  );
}
