"use client";

import type { DashboardReferralSummary } from "@/lib/referral-types";
import { DashboardSettingsBillingReferralsCard } from "./dashboard-settings-billing-referrals-card";

export function SettingsReferralsSection({
  title,
  subtitle,
  referrals
}: {
  title: string;
  subtitle: string;
  referrals: DashboardReferralSummary;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-semibold tracking-[-0.02em] text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <DashboardSettingsBillingReferralsCard referrals={referrals} />
    </div>
  );
}
