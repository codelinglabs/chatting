import type { DashboardHomeGrowthData } from "@/lib/data/dashboard-growth-types";

const EARLY_ACTIVATION_REMINDER_HOURS = 6;
export const ANALYTICS_EXPANSION_CONVERSATION_THRESHOLD = 40;
export type GrowthOutreachPlanKey = "starter" | "growth";

function hoursSince(value: string | Date, now: Date) {
  return (now.getTime() - new Date(value).getTime()) / (60 * 60 * 1000);
}

export function getActivationReminderKey(
  userCreatedAt: string,
  activationStatus: DashboardHomeGrowthData["activation"]["status"],
  now = new Date()
) {
  const signupHours = hoursSince(userCreatedAt, now);

  if (activationStatus === "countdown" && signupHours >= EARLY_ACTIVATION_REMINDER_HOURS) {
    return "activation-live-no-chat" as const;
  }

  if (activationStatus === "stalled") {
    return "activation-missed-first-day" as const;
  }

  return null;
}

export function isGrowthNudgeDue(lastSentAt: string | null, cooldownHours: number, now = new Date()) {
  if (!lastSentAt) {
    return true;
  }

  return hoursSince(lastSentAt, now) >= cooldownHours;
}

export function shouldSendHealthReminder(
  healthStatus: DashboardHomeGrowthData["health"]["status"],
  totalConversations: number
) {
  return healthStatus === "at-risk" && totalConversations >= 3;
}

export function shouldSendTeamExpansionReminder(planKey: GrowthOutreachPlanKey, usedSeats: number) {
  return planKey === "starter" && usedSeats > 1;
}

export function shouldSendAnalyticsExpansionReminder(
  planKey: GrowthOutreachPlanKey,
  conversationCount: number,
  usedSeats: number
) {
  return (
    planKey === "starter" &&
    (usedSeats > 1 || conversationCount >= ANALYTICS_EXPANSION_CONVERSATION_THRESHOLD)
  );
}
