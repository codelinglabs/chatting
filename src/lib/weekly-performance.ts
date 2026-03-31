import { sendWeeklyPerformanceEmail } from "@/lib/chatly-notification-email-senders";
import { getAnalyticsDataset, type AnalyticsConversationRecord } from "@/lib/data/analytics";
import { getPublicAppUrl } from "@/lib/env";
import {
  hasWeeklyPerformanceDelivery,
  insertWeeklyPerformanceDelivery,
  listWeeklyPerformanceRecipientRows
} from "@/lib/repositories/weekly-performance-repository";
import { optionalText } from "@/lib/utils";
import {
  addUtcDays,
  buildDateRangeLabel,
  dateKey,
  startOfUtcWeek
} from "@/lib/weekly-performance-window";

const FAST_REPLY_SECONDS = 5 * 60;
const WEEKLY_REPORT_SEND_HOUR_UTC = 9;

function formatPercent(value: number | null) {
  return value == null ? "—" : `${Math.round(value)}%`;
}

function pageLabelFromUrl(value: string | null) {
  if (!value) {
    return "/";
  }
  try {
    return new URL(value).pathname || "/";
  } catch {
    return value;
  }
}

function filterConversations(
  conversations: AnalyticsConversationRecord[],
  start: Date,
  end: Date
) {
  return conversations.filter((conversation) => {
    const createdAt = new Date(conversation.createdAt).getTime();
    return createdAt >= start.getTime() && createdAt < end.getTime();
  });
}

function buildVolumeHighlight(currentCount: number, previousCount: number) {
  if (previousCount <= 0) {
    return `${currentCount} conversations came in this week`;
  }
  const delta = ((currentCount - previousCount) / previousCount) * 100;
  if (Math.abs(delta) < 0.5) {
    return "Conversation volume matched last week";
  }

  return `Conversation volume was ${delta > 0 ? "up" : "down"} ${Math.round(Math.abs(delta))}% from last week`;
}

function buildFastReplyHighlight(conversations: AnalyticsConversationRecord[]) {
  const values = conversations
    .map((conversation) => conversation.firstResponseSeconds)
    .filter((value): value is number => value != null);

  if (!values.length) {
    return "No first-response data was recorded this week";
  }

  const fastRate = (values.filter((value) => value <= FAST_REPLY_SECONDS).length / values.length) * 100;
  return `Replies were under 5 minutes for ${formatPercent(fastRate)} of responded conversations`;
}

function buildResolutionHighlight(conversations: AnalyticsConversationRecord[]) {
  const resolvedRate = (conversations.filter((conversation) => conversation.status === "resolved").length / conversations.length) * 100;
  return `Resolved ${formatPercent(resolvedRate)} of this week's conversations`;
}

function formatHourBlock(startHour: number) {
  const formatHour = (hour: number) => {
    const normalized = ((hour % 24) + 24) % 24;
    const suffix = normalized >= 12 ? "pm" : "am";
    const hour12 = normalized % 12 || 12;
    return `${hour12}${suffix}`;
  };

  return `${formatHour(startHour)}-${formatHour(startHour + 2)}`;
}

function buildBusiestHours(conversations: AnalyticsConversationRecord[]) {
  const hourlyCounts = Array.from({ length: 24 }, () => 0);
  conversations.forEach((conversation) => {
    hourlyCounts[new Date(conversation.createdAt).getUTCHours()] += 1;
  });

  const windows = hourlyCounts
    .slice(0, 23)
    .map((count, startHour) => ({ startHour, count: count + hourlyCounts[startHour + 1] }))
    .filter((window) => window.count > 0)
    .sort(
      (left, right) =>
        right.count - left.count ||
        hourlyCounts[right.startHour] - hourlyCounts[left.startHour] ||
        left.startHour - right.startHour
    );

  if (!windows.length) {
    return "No conversation spikes yet";
  }

  const primary = windows[0];
  const secondary = windows.find((window) => Math.abs(window.startHour - primary.startHour) > 1);
  return secondary
    ? `${formatHourBlock(primary.startHour)} and ${formatHourBlock(secondary.startHour)}`
    : formatHourBlock(primary.startHour);
}

function buildTopPages(conversations: AnalyticsConversationRecord[]) {
  const counts = new Map<string, number>();
  conversations.forEach((conversation) => {
    const page = pageLabelFromUrl(conversation.pageUrl);
    counts.set(page, (counts.get(page) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 3)
    .map(([page, count]) => `${page} — ${count} conversation${count === 1 ? "" : "s"}`);
}

export function shouldRunWeeklyPerformanceEmails(now = new Date()) {
  const sendWindow = startOfUtcWeek(now);
  sendWindow.setUTCHours(WEEKLY_REPORT_SEND_HOUR_UTC, 0, 0, 0);
  return now.getTime() >= sendWindow.getTime();
}

export async function sendUserWeeklyPerformanceEmail(input: {
  userId: string;
  notificationEmail: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const weekEnd = startOfUtcWeek(now);
  const weekStart = addUtcDays(weekEnd, -7);
  const previousWeekStart = addUtcDays(weekStart, -7);
  const deliveryKey = dateKey(weekStart);

  if (await hasWeeklyPerformanceDelivery(input.userId, deliveryKey)) {
    return "already-sent" as const;
  }

  const dataset = await getAnalyticsDataset(input.userId);
  const currentWeek = filterConversations(dataset.conversations, weekStart, weekEnd);

  if (!currentWeek.length) {
    return "skipped" as const;
  }

  const previousWeek = filterConversations(dataset.conversations, previousWeekStart, weekStart);

  await sendWeeklyPerformanceEmail({
    to: input.notificationEmail,
    dateRange: buildDateRangeLabel(weekStart, weekEnd),
    highlights: [
      buildVolumeHighlight(currentWeek.length, previousWeek.length),
      buildFastReplyHighlight(currentWeek),
      buildResolutionHighlight(currentWeek)
    ],
    busiestHours: buildBusiestHours(currentWeek),
    topPages: buildTopPages(currentWeek),
    reportUrl: `${getPublicAppUrl()}/dashboard/analytics`
  });
  await insertWeeklyPerformanceDelivery(input.userId, deliveryKey);

  return "sent" as const;
}

export async function runScheduledWeeklyPerformanceEmails(now = new Date()) {
  if (!shouldRunWeeklyPerformanceEmails(now)) {
    return { processedRecipients: 0, sent: 0, skipped: 0 };
  }

  const recipients = await listWeeklyPerformanceRecipientRows();
  let sent = 0;
  let skipped = 0;

  for (const recipient of recipients) {
    try {
      const status = await sendUserWeeklyPerformanceEmail({
        userId: recipient.user_id,
        notificationEmail: optionalText(recipient.notification_email) || recipient.email,
        now
      });
      sent += status === "sent" ? 1 : 0;
      skipped += status === "sent" ? 0 : 1;
    } catch (error) {
      skipped += 1;
      console.error("weekly performance email failed", recipient.user_id, error);
    }
  }

  return { processedRecipients: recipients.length, sent, skipped };
}
