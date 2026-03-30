import {
  renderDailyDigestEmail,
  renderMentionNotificationEmail,
  renderWeeklyPerformanceEmail
} from "@/lib/chatly-notification-emails";
import { sendRichEmail } from "@/lib/email";

export async function sendDailyDigestEmail(input: {
  to: string;
  date: string;
  metrics: Array<{ value: string; label: string }>;
  openConversations: Array<{ title: string; preview: string; meta: string }>;
  inboxUrl: string;
}) {
  const rendered = renderDailyDigestEmail(input);
  return sendRichEmail({
    to: input.to,
    subject: rendered.subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml
  });
}

export async function sendMentionNotificationEmail(input: {
  to: string;
  mentionerName: string;
  visitorName: string;
  note: string;
  noteMeta: string;
  conversationUrl: string;
}) {
  const rendered = renderMentionNotificationEmail(input);
  return sendRichEmail({
    to: input.to,
    subject: rendered.subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml
  });
}

export async function sendWeeklyPerformanceEmail(input: {
  to: string;
  dateRange: string;
  highlights: string[];
  busiestHours: string;
  topPages: string[];
  reportUrl: string;
}) {
  const rendered = renderWeeklyPerformanceEmail(input);
  return sendRichEmail({
    to: input.to,
    subject: rendered.subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml
  });
}
