import { Resend } from "resend";
import { escapeHtml } from "@/lib/utils";

function getMailer() {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

function getFromAddress() {
  return process.env.MAIL_FROM?.trim() || "Chatly <hello@example.com>";
}

function getAppName() {
  return process.env.APP_NAME?.trim() || "Chatly";
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

function getReplyToAddress(conversationId: string) {
  const domain = process.env.REPLY_DOMAIN?.trim();

  if (!domain) {
    return undefined;
  }

  return `reply+${conversationId}@${domain}`;
}

export async function sendFounderReplyEmail({
  conversationId,
  to,
  content
}: {
  conversationId: string;
  to: string;
  content: string;
}) {
  const mailer = getMailer();
  const appName = getAppName();
  const appUrl = getAppUrl();
  const helpfulYesUrl = `${appUrl}/feedback?conversationId=${encodeURIComponent(conversationId)}&helpful=yes`;
  const helpfulNoUrl = `${appUrl}/feedback?conversationId=${encodeURIComponent(conversationId)}&helpful=no`;
  const escapedBody = escapeHtml(content).replace(/\n/g, "<br />");
  const replyToAddress = getReplyToAddress(conversationId);

  await mailer.emails.send({
    from: getFromAddress(),
    to: [to],
    replyTo: replyToAddress,
    subject: `Reply from ${appName}`,
    text: `${content}

Reply to this email to continue the conversation.

Was this helpful?
Yes: ${helpfulYesUrl}
No: ${helpfulNoUrl}`,
    html: `
      <div style="font-family: Avenir Next, Segoe UI, sans-serif; line-height: 1.6; color: #0d1b1e;">
        <p>${escapedBody}</p>
        <p style="margin-top: 24px;">Reply to this email to continue the conversation.</p>
        <p style="margin-top: 24px; font-weight: 600;">Was this helpful?</p>
        <p>
          <a href="${helpfulYesUrl}" style="display: inline-block; margin-right: 12px; color: #0f766e;">Yes</a>
          <a href="${helpfulNoUrl}" style="display: inline-block; color: #ef7a5d;">No</a>
        </p>
      </div>
    `
  });
}
