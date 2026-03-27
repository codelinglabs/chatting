import { Resend } from "resend";
import { getPublicAppUrl } from "@/lib/env";
import { escapeHtml } from "@/lib/utils";

type EmailAttachment = {
  fileName: string;
  contentType: string;
  content: Buffer;
};

type SendRichEmailInput = {
  to: string;
  replyTo?: string | null;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  attachments?: EmailAttachment[];
};

function getMailer() {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

function getFromAddress() {
  return process.env.MAIL_FROM?.trim() || "Chatting <hello@example.com>";
}

function getAppName() {
  return process.env.APP_NAME?.trim() || "Chatting";
}

function getAppUrl() {
  return getPublicAppUrl();
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
  content,
  attachments = []
}: {
  conversationId: string;
  to: string;
  content: string;
  attachments?: EmailAttachment[];
}) {
  const mailer = getMailer();
  const appName = getAppName();
  const appUrl = getAppUrl();
  const helpfulYesUrl = `${appUrl}/feedback?conversationId=${encodeURIComponent(conversationId)}&helpful=yes`;
  const helpfulNoUrl = `${appUrl}/feedback?conversationId=${encodeURIComponent(conversationId)}&helpful=no`;
  const escapedBody = escapeHtml(content).replace(/\n/g, "<br />");
  const replyToAddress = getReplyToAddress(conversationId);

  await sendRichEmail({
    to,
    replyTo: replyToAddress,
    subject: `Reply from ${appName}`,
    bodyText: `${content}

Reply to this email to continue the conversation.

Was this helpful?
Yes: ${helpfulYesUrl}
No: ${helpfulNoUrl}`,
    bodyHtml: `
      <div style="font-family: Avenir Next, Segoe UI, sans-serif; line-height: 1.6; color: #0d1b1e;">
        <p>${escapedBody}</p>
        ${
          attachments.length
            ? `<p style="margin-top: 20px;">Attached: ${attachments
                .map((attachment) => escapeHtml(attachment.fileName))
                .join(", ")}</p>`
            : ""
        }
        <p style="margin-top: 24px;">Reply to this email to continue the conversation.</p>
        <p style="margin-top: 24px; font-weight: 600;">Was this helpful?</p>
        <p>
          <a href="${helpfulYesUrl}" style="display: inline-block; margin-right: 12px; color: #0f766e;">Yes</a>
          <a href="${helpfulNoUrl}" style="display: inline-block; color: #ef7a5d;">No</a>
        </p>
      </div>
    `,
    attachments
  });
}

export async function sendTeamNewMessageEmail({
  to,
  siteName,
  conversationId,
  content,
  visitorEmail,
  pageUrl,
  attachmentsCount
}: {
  to: string;
  siteName: string;
  conversationId: string;
  content: string;
  visitorEmail: string | null;
  pageUrl: string | null;
  attachmentsCount: number;
}) {
  const mailer = getMailer();
  const appName = getAppName();
  const appUrl = getAppUrl();
  const dashboardUrl = `${appUrl}/dashboard?id=${encodeURIComponent(conversationId)}`;
  const escapedBody = escapeHtml(content).replace(/\n/g, "<br />");

  await sendRichEmail({
    to,
    subject: `New message in ${siteName}`,
    bodyText: `A visitor sent a new message in ${siteName}.

${content}

Visitor email: ${visitorEmail || "Unknown"}
Page: ${pageUrl || "Unknown"}
Attachments: ${attachmentsCount}

Open the conversation:
${dashboardUrl}`,
    bodyHtml: `
      <div style="font-family: Avenir Next, Segoe UI, sans-serif; line-height: 1.6; color: #0d1b1e;">
        <p style="font-weight: 600; margin-bottom: 8px;">New visitor message in ${escapeHtml(siteName)}</p>
        <p>${escapedBody}</p>
        <p style="margin-top: 20px;">Visitor email: ${escapeHtml(visitorEmail || "Unknown")}</p>
        <p>Page: ${escapeHtml(pageUrl || "Unknown")}</p>
        <p>Attachments: ${attachmentsCount}</p>
        <p style="margin-top: 24px;">
          <a href="${dashboardUrl}" style="color: #0f766e;">Open in ${escapeHtml(appName)}</a>
        </p>
      </div>
    `
  });
}

export async function sendRichEmail({
  to,
  replyTo,
  subject,
  bodyText,
  bodyHtml,
  attachments = []
}: SendRichEmailInput) {
  const mailer = getMailer();

  await mailer.emails.send({
    from: getFromAddress(),
    to: [to],
    replyTo: replyTo || undefined,
    subject,
    text: bodyText,
    attachments: attachments.map((attachment) => ({
      filename: attachment.fileName,
      content: attachment.content,
      content_type: attachment.contentType
    })),
    html: `
      <div style="font-family:Avenir Next,Segoe UI,sans-serif;line-height:1.6;color:#334155;">
        ${bodyHtml}
      </div>
    `
  });
}

export async function sendSettingsTemplateTestEmail(input: SendRichEmailInput) {
  return sendRichEmail(input);
}
