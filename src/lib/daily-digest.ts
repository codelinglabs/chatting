import { sendDailyDigestEmail } from "@/lib/chatly-notification-email-senders";
import { getAnalyticsDataset } from "@/lib/data/analytics";
import { listConversationSummaries } from "@/lib/data/conversations";
import { getPublicAppUrl } from "@/lib/env";
import {
  hasDailyDigestDelivery,
  insertDailyDigestDelivery,
  listDailyDigestRecipientRows
} from "@/lib/repositories/daily-digest-repository";
import { displayNameFromEmail } from "@/lib/user-display";
import { formatRelativeTime, optionalText, truncate } from "@/lib/utils";

const DAILY_DIGEST_SEND_HOUR_UTC = 9;
const FIFTEEN_MINUTES_IN_SECONDS = 15 * 60;

function digestDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function startOfUtcDay(value: Date) {
  return new Date(`${digestDateKey(value)}T00:00:00.000Z`);
}

function endOfUtcDay(value: Date) {
  const end = startOfUtcDay(value);
  end.setUTCDate(end.getUTCDate() + 1);
  return end;
}

function average(values: number[]) {
  if (!values.length) {
    return null;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0
  }).format(value);
}

function formatDuration(value: number | null) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }

  if (value < 60) {
    return `${Math.round(value)}s`;
  }

  if (value < 60 * 60) {
    const minutes = value / 60;
    return `${minutes < 10 ? minutes.toFixed(1) : Math.round(minutes)}m`;
  }

  const hours = value / (60 * 60);
  return `${hours < 10 ? hours.toFixed(1) : Math.round(hours)}h`;
}

function formatPercent(value: number | null) {
  return value == null ? "—" : `${Math.round(value)}%`;
}

function formatDigestDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(value);
}

function pageSourceLabel(value: string | null) {
  if (!value) {
    return "homepage";
  }
  try {
    const path = new URL(value).pathname;
    const segments = path.split("/").filter(Boolean);
    if (!segments.length) {
      return "homepage";
    }

    const label = segments[segments.length - 1]
      ?.split(/[-_]+/g)
      .filter(Boolean)
      .join(" ");
    return label ? `${label} page` : "homepage";
  } catch {
    return value;
  }
}

function buildOpenConversationTitle(email: string | null, pageUrl: string | null) {
  const visitorName = email ? displayNameFromEmail(email) : "Visitor";
  return `${visitorName} from ${pageSourceLabel(pageUrl)}`;
}

export function shouldRunDailyDigests(now = new Date()) {
  return now.getUTCHours() >= DAILY_DIGEST_SEND_HOUR_UTC;
}

export async function sendUserDailyDigest(input: {
  userId: string;
  notificationEmail: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const digestDate = digestDateKey(now);

  if (await hasDailyDigestDelivery(input.userId, digestDate)) {
    return "already-sent" as const;
  }

  const [dataset, summaries] = await Promise.all([
    getAnalyticsDataset(input.userId),
    listConversationSummaries(input.userId)
  ]);
  const start = startOfUtcDay(now);
  const end = endOfUtcDay(now);
  const todaysConversations = dataset.conversations.filter((conversation) => {
    const createdAt = new Date(conversation.createdAt).getTime();
    return createdAt >= start.getTime() && createdAt < end.getTime();
  });
  const responseTimes = todaysConversations
    .map((conversation) => conversation.firstResponseSeconds)
    .filter((value): value is number => value != null);
  const openConversations = summaries
    .filter((conversation) => conversation.status === "open")
    .slice(0, 5)
    .map((conversation) => ({
      title: buildOpenConversationTitle(conversation.email, conversation.pageUrl),
      preview: truncate(conversation.lastMessagePreview || "No message preview yet", 96),
      meta: `${formatRelativeTime(conversation.lastMessageAt || conversation.updatedAt)} • ${
        conversation.pageUrl || conversation.siteName
      }`
    }));

  if (!todaysConversations.length && !openConversations.length) {
    return "skipped" as const;
  }

  const repliedWithinFifteenMinutes = responseTimes.length
    ? (responseTimes.filter((value) => value <= FIFTEEN_MINUTES_IN_SECONDS).length / responseTimes.length) * 100
    : null;

  await sendDailyDigestEmail({
    to: input.notificationEmail,
    date: formatDigestDate(now),
    metrics: [
      { value: formatCount(todaysConversations.length), label: "new conversations" },
      { value: formatDuration(average(responseTimes)), label: "avg first response" },
      { value: formatPercent(repliedWithinFifteenMinutes), label: "replied within 15 min" }
    ],
    openConversations,
    inboxUrl: `${getPublicAppUrl()}/dashboard/inbox`
  });
  await insertDailyDigestDelivery(input.userId, digestDate);

  return "sent" as const;
}

export async function runScheduledDailyDigests(now = new Date()) {
  if (!shouldRunDailyDigests(now)) {
    return { processedRecipients: 0, sent: 0, skipped: 0 };
  }

  const recipients = await listDailyDigestRecipientRows();
  let sent = 0;
  let skipped = 0;

  for (const recipient of recipients) {
    try {
      const status = await sendUserDailyDigest({
        userId: recipient.user_id,
        notificationEmail: optionalText(recipient.notification_email) || recipient.email,
        now
      });
      sent += status === "sent" ? 1 : 0;
      skipped += status === "sent" ? 0 : 1;
    } catch (error) {
      skipped += 1;
      console.error("daily digest send failed", recipient.user_id, error);
    }
  }

  return {
    processedRecipients: recipients.length,
    sent,
    skipped
  };
}
