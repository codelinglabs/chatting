import type { DashboardReferralAttribution, DashboardReferralProgram, DashboardReferralSummary } from "@/lib/data";
import { displayNameFromEmail } from "@/lib/user-display";
import { formatMoney } from "./dashboard-settings-shared";

const PUBLIC_EMAIL_ROOTS = new Set(["gmail", "hotmail", "icloud", "live", "me", "outlook", "yahoo"]);

function capitalizeWord(value: string) {
  return value ? `${value[0]?.toUpperCase() || ""}${value.slice(1).toLowerCase()}` : "";
}

function derivedWorkspaceName(email: string) {
  const domainRoot = email.trim().toLowerCase().split("@")[1]?.split(".")[0] ?? "";

  if (!domainRoot || PUBLIC_EMAIL_ROOTS.has(domainRoot)) {
    return displayNameFromEmail(email);
  }

  return domainRoot
    .split(/[-_]/g)
    .filter(Boolean)
    .map(capitalizeWord)
    .join(" ");
}

export function referralWorkspaceLabel(signup: DashboardReferralAttribution) {
  return signup.workspaceName ?? derivedWorkspaceName(signup.referredEmail);
}

export function formatReferralDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function referralShareLinkLabel(value: string) {
  return value.replace(/^https?:\/\//, "");
}

export function referralProgramShortLabel(programType: DashboardReferralProgram["programType"]) {
  switch (programType) {
    case "customer":
      return "Customer";
    case "affiliate":
      return "Affiliate";
    case "mutual":
      return "Give $10";
  }
}

export function referralRewardToneClass(programType: DashboardReferralProgram["programType"]) {
  switch (programType) {
    case "customer":
      return "text-blue-600";
    case "affiliate":
      return "text-emerald-600";
    case "mutual":
      return "text-violet-600";
  }
}

export function referralProgramBadge(programType: DashboardReferralProgram["programType"]) {
  if (programType !== "affiliate") {
    return null;
  }

  return {
    label: "Recurring",
    className: "bg-emerald-100 text-emerald-700"
  };
}

export function referralStatusMeta(status: DashboardReferralAttribution["status"]) {
  return status === "converted"
    ? { label: "Paid", className: "bg-emerald-100 text-emerald-700" }
    : { label: "Signed up", className: "bg-blue-100 text-blue-700" };
}

export function earnedValueLabel(referrals: DashboardReferralSummary) {
  const earnedCurrencyValue = referrals.earnedDiscountCents + referrals.earnedCommissionCents;
  const parts: string[] = [];

  if (referrals.earnedFreeMonths) {
    parts.push(`${referrals.earnedFreeMonths} free month${referrals.earnedFreeMonths === 1 ? "" : "s"}`);
  }

  if (earnedCurrencyValue > 0 || parts.length === 0) {
    parts.push(formatMoney(earnedCurrencyValue, "USD"));
  }

  return parts.join(" + ");
}

export function earnedValueToneClass(referrals: DashboardReferralSummary) {
  return referrals.earnedFreeMonths || referrals.earnedDiscountCents || referrals.earnedCommissionCents
    ? "text-emerald-600"
    : "text-slate-900";
}
