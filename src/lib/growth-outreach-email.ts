import type { DashboardHomeGrowthData } from "@/lib/data/dashboard-growth-types";
import type { GrowthOutreachPlanKey } from "@/lib/growth-outreach-rules";
import { sendRichEmail } from "@/lib/email";
import { getPublicAppUrl } from "@/lib/env";
import { escapeHtml } from "@/lib/utils";

function appUrl(path: string) {
  return `${getPublicAppUrl()}${path}`;
}

export async function sendActivationReminderEmail(input: {
  to: string;
  siteName: string;
  pageUrl: string | null;
  mode: "live" | "missed";
}) {
  const subject =
    input.mode === "live"
      ? "Your widget is live. Let's land the first chat today."
      : "Your widget is installed, but the first chat still hasn't happened";
  const widgetUrl = appUrl("/dashboard/widget");
  const analyticsUrl = appUrl("/dashboard/analytics");
  const pageLine = input.pageUrl ? `Last seen on: ${input.pageUrl}` : "Put the widget on pricing, demo, or contact pages.";
  const actionLine =
    input.mode === "live"
      ? "Tighten the welcome message, place the widget on a high-intent page, and send yourself a test message."
      : "Move the widget to a higher-intent page and sharpen the opener so the first reply loop starts faster.";

  await sendRichEmail({
    to: input.to,
    subject,
    bodyText: `${subject}\n\n${pageLine}\n\n${actionLine}\n\nWidget settings: ${widgetUrl}\nAnalytics: ${analyticsUrl}`,
    bodyHtml: `
      <p><strong>${escapeHtml(subject)}</strong></p>
      <p>${escapeHtml(pageLine)}</p>
      <p>${escapeHtml(actionLine)}</p>
      <p><a href="${widgetUrl}">Open widget settings</a> · <a href="${analyticsUrl}">Open analytics</a></p>
    `
  });
}

export async function sendHealthReminderEmail(input: {
  to: string;
  score: number;
  health: DashboardHomeGrowthData["health"];
}) {
  const actionUrl = appUrl(input.health.action.href);
  const subject = `Your workspace health score dropped to ${input.score}`;

  await sendRichEmail({
    to: input.to,
    subject,
    bodyText: `${subject}\n\n${input.health.description}\n\nNext step: ${input.health.action.label}\n${actionUrl}`,
    bodyHtml: `
      <p><strong>${escapeHtml(subject)}</strong></p>
      <p>${escapeHtml(input.health.description)}</p>
      <p><a href="${actionUrl}">${escapeHtml(input.health.action.label)}</a></p>
    `
  });
}

export async function sendExpansionReminderEmail(input: {
  to: string;
  planKey: GrowthOutreachPlanKey;
  mode: "team" | "analytics";
  usedSeats: number;
  conversationCount: number;
}) {
  const billingUrl = appUrl("/dashboard/settings?section=billing");
  const subject =
    input.mode === "team"
      ? "Your workspace is growing beyond Starter"
      : input.planKey === "growth"
        ? "You may be ready for Pro reporting and API access"
        : "You may be ready for deeper analytics and API access";
  const intro =
    input.mode === "team"
      ? `You now have ${input.usedSeats} reserved seats in play. As the inbox becomes a team workflow, moving beyond Starter keeps coverage and reporting from getting cramped.`
      : input.planKey === "growth"
        ? `Your workspace is showing signs that Pro could help: ${input.conversationCount} conversations this month and a team that likely needs deeper reporting plus API access.`
        : `Your workspace is showing signs that a paid plan could help: ${input.conversationCount} conversations this month and enough activity to benefit from fuller analytics and API options.`;

  await sendRichEmail({
    to: input.to,
    subject,
    bodyText: `${subject}\n\n${intro}\n\nReview plans: ${billingUrl}`,
    bodyHtml: `
      <p><strong>${escapeHtml(subject)}</strong></p>
      <p>${escapeHtml(intro)}</p>
      <p><a href="${billingUrl}">Review plans</a></p>
    `
  });
}
