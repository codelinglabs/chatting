import type { DashboardSettingsProfile } from "@/lib/data/settings-types";
import { displayNameFromEmail } from "@/lib/user-display";
import type { EditableSettings } from "./dashboard-settings-types";

export function editableSignature(value: EditableSettings) {
  return JSON.stringify(value);
}

export function buildOwnerName(profile: DashboardSettingsProfile) {
  const fullName = [profile.firstName.trim(), profile.lastName.trim()].filter(Boolean).join(" ").trim();
  return fullName || displayNameFromEmail(profile.email);
}

export function passwordStrength(password: string) {
  if (!password) {
    return { label: "Use at least 8 characters.", widthClass: "w-0", toneClass: "bg-slate-300" };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", widthClass: "w-1/4", toneClass: "bg-red-500" };
  if (score === 2) return { label: "Fair", widthClass: "w-1/2", toneClass: "bg-amber-500" };
  if (score === 3) return { label: "Good", widthClass: "w-3/4", toneClass: "bg-blue-500" };
  return { label: "Strong", widthClass: "w-full", toneClass: "bg-green-500" };
}

export function settingsErrorMessage(code: string) {
  switch (code) {
    case "missing_team_name":
      return "Enter a team name before saving your settings.";
    case "missing_email":
      return "Email is required before we can save your settings.";
    case "email_taken":
      return "That email address is already in use by another account.";
    case "missing_current_password":
      return "Enter your current password before choosing a new one.";
    case "missing_password":
      return "Enter a new password to continue.";
    case "weak_password":
      return "Choose a stronger password with at least 8 characters.";
    case "invalid_current_password":
      return "Your current password is incorrect.";
    case "password_confirm":
      return "Your new password and confirmation do not match.";
    default:
      return "We couldn't save your changes just now.";
  }
}

export function billingErrorMessage(code: string) {
  switch (code) {
    case "stripe_not_configured":
      return "Stripe is not configured yet.";
    case "stripe_checkout_unavailable":
      return "We couldn't open Stripe Checkout right now.";
    case "stripe_price_config_invalid":
      return "Stripe Growth pricing is not configured with the expected seat tiers yet.";
    case "proactive_chat_requires_growth":
      return "Proactive chat is available on Growth.";
    case "billing-portal-session-failed":
      return "We couldn't open the Stripe billing portal right now.";
    case "billing-sync-failed":
      return "We couldn't refresh billing from Stripe right now.";
    case "contact_sales_required":
      return "Teams with 50 or more members need a custom setup right now.";
    default:
      return "We couldn't update billing just now.";
  }
}

export function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(amountCents / 100);
}
