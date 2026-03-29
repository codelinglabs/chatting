"use client";

import { useEffect, useRef, useState } from "react";
import type { DashboardReferralSummary } from "@/lib/data";
import { useToast } from "../ui/toast-provider";
import { DashboardSettingsReferralPrograms } from "./dashboard-settings-referrals-programs";
import { DashboardSettingsReferralSignups } from "./dashboard-settings-referrals-signups";
import { DashboardSettingsReferralStats } from "./dashboard-settings-referrals-stats";

export function DashboardSettingsBillingReferralsCard({
  referrals
}: {
  referrals: DashboardReferralSummary;
}) {
  const { showToast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    },
    []
  );

  async function handleCopy(value: string, key: string, label: string) {
    if (!navigator.clipboard?.writeText) {
      showToast("error", "Clipboard unavailable.", `Copy the ${label} manually for now.`);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      showToast("success", "Copied to clipboard");

      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }

      resetTimerRef.current = window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 2000);
    } catch {
      showToast("error", "We couldn't copy that just now.", "Please try again in a moment.");
    }
  }

  return (
    <div className="space-y-8">
      <DashboardSettingsReferralStats referrals={referrals} />

      <section>
        <h3 className="font-serif text-base font-medium tracking-[-0.02em] text-slate-900">Referral programs</h3>
        <p className="mb-5 mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Share a code or direct signup link. Rewards stay pending until the referred workspace becomes paid.
        </p>
        <DashboardSettingsReferralPrograms
          programs={referrals.programs}
          copiedKey={copiedKey}
          onCopy={handleCopy}
        />
      </section>

      <section>
        <h3 className="font-serif text-base font-medium tracking-[-0.02em] text-slate-900">Referred signups</h3>
        <p className="mb-5 mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          See which shared codes turned into real workspaces and which ones converted to paid.
        </p>
        <DashboardSettingsReferralSignups signups={referrals.attributedSignups} />
      </section>
    </div>
  );
}
