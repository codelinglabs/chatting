import { buildActivation, buildHealth } from "@/lib/data/dashboard-growth-activation-health";
import { getDashboardBillingSummary } from "@/lib/data/billing";
import { mapSite, querySites } from "@/lib/data/shared";
import { sendActivationReminderEmail, sendExpansionReminderEmail, sendHealthReminderEmail } from "@/lib/growth-outreach-email";
import { getGrowthDeliverySettings, maybeSendGrowthEmail } from "@/lib/growth-outreach-shared";
import {
  getActivationReminderKey,
  shouldSendAnalyticsExpansionReminder,
  shouldSendHealthReminder,
  shouldSendTeamExpansionReminder
} from "@/lib/growth-outreach-rules";
import { getDashboardHomeResponseMetrics } from "@/lib/repositories/dashboard-home-repository";
import { getDashboardGrowthSnapshot } from "@/lib/repositories/dashboard-growth-repository";
import { findAuthUserById } from "@/lib/repositories/auth-repository";
import { withRetryableDatabaseConnectionRetry } from "@/lib/retryable-database-errors";
import { isSiteWidgetInstalled } from "@/lib/site-installation";

function roundToWhole(value: string | null | undefined) {
  return value == null ? null : Math.round(Number(value));
}

async function getSiteForGrowthEmails(siteId: string) {
  const result = await withRetryableDatabaseConnectionRetry(() =>
    querySites("s.id = $1", [siteId], "LIMIT 1")
  );
  return result.rows[0] ? mapSite(result.rows[0]) : null;
}

export async function maybeSendSiteLifecycleEmails(siteId: string) {
  try {
    const site = await getSiteForGrowthEmails(siteId);
    if (!site) return;

    const [user, delivery, snapshot, response] = await withRetryableDatabaseConnectionRetry(() =>
      Promise.all([
        findAuthUserById(site.userId),
        getGrowthDeliverySettings(site.userId),
        getDashboardGrowthSnapshot(site.userId),
        getDashboardHomeResponseMetrics(site.userId)
      ])
    );
    if (!user || !delivery?.emailNotifications) return;

    const totalConversations = Number(snapshot.total_conversations ?? 0);
    const activation = buildActivation(
      user.created_at,
      isSiteWidgetInstalled(site),
      totalConversations,
      snapshot.first_conversation_at,
      new Date()
    );
    const activationKey = getActivationReminderKey(user.created_at, activation.status);
    const activationMode =
      activationKey === "activation-live-no-chat"
        ? "live"
        : activationKey === "activation-missed-first-day"
          ? "missed"
          : null;

    if (activationKey && activationMode) {
      await maybeSendGrowthEmail(site.userId, activationKey, 24 * 14, () =>
        sendActivationReminderEmail({
          to: delivery.notificationEmail,
          siteName: site.name,
          pageUrl: site.widgetLastSeenUrl,
          mode: activationMode
        })
      );
    }

    const health = buildHealth(
      totalConversations,
      Number(snapshot.conversations_last_7_days ?? 0),
      Number(snapshot.conversations_previous_7_days ?? 0),
      roundToWhole(response?.current_avg_seconds),
      Number(snapshot.login_sessions_last_7_days ?? 0),
      snapshot.last_login_at
    );

    if (shouldSendHealthReminder(health.status, totalConversations)) {
      await maybeSendGrowthEmail(site.userId, "health-at-risk", 24 * 7, () =>
        sendHealthReminderEmail({
          to: delivery.notificationEmail,
          score: health.score,
          health
        })
      );
    }
  } catch (error) {
    console.error("growth lifecycle email failed", error);
  }
}

export async function maybeSendTeamExpansionEmail(userId: string) {
  try {
    const [delivery, billing] = await withRetryableDatabaseConnectionRetry(() =>
      Promise.all([
        getGrowthDeliverySettings(userId),
        getDashboardBillingSummary(userId)
      ])
    );
    if (!delivery?.emailNotifications || !shouldSendTeamExpansionReminder(billing.planKey, billing.usedSeats)) return;

    await maybeSendGrowthEmail(userId, "expansion-team", 24 * 14, () =>
      sendExpansionReminderEmail({
        to: delivery.notificationEmail,
        planKey: billing.planKey,
        mode: "team",
        usedSeats: billing.usedSeats,
        conversationCount: billing.conversationCount
      })
    );
  } catch (error) {
    console.error("growth team expansion email failed", error);
  }
}

export async function maybeSendAnalyticsExpansionEmail(userId: string) {
  try {
    const [delivery, billing] = await withRetryableDatabaseConnectionRetry(() =>
      Promise.all([
        getGrowthDeliverySettings(userId),
        getDashboardBillingSummary(userId)
      ])
    );
    if (
      !delivery?.emailNotifications ||
      !shouldSendAnalyticsExpansionReminder(billing.planKey, billing.conversationCount, billing.usedSeats)
    ) {
      return;
    }

    await maybeSendGrowthEmail(userId, "expansion-analytics", 24 * 14, () =>
      sendExpansionReminderEmail({
        to: delivery.notificationEmail,
        planKey: billing.planKey,
        mode: "analytics",
        usedSeats: billing.usedSeats,
        conversationCount: billing.conversationCount
      })
    );
  } catch (error) {
    console.error("growth analytics expansion email failed", error);
  }
}
