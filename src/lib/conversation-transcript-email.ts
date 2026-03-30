import {
  buildConversationTranscriptFooterContent,
  type TranscriptViralVariant
} from "@/lib/conversation-transcript-footer";
import {
  renderDashboardEmailTemplateFragment,
  resolveDashboardEmailTemplateValue,
  type DashboardEmailTemplate,
  type DashboardEmailTemplatePreviewContext
} from "@/lib/email-templates";
import { initialsFromLabel } from "@/lib/user-display";
import { escapeHtml } from "@/lib/utils";

export type ConversationTranscriptMessage = {
  sender: "user" | "founder";
  content: string;
  createdAt: string;
};

const PREHEADER_TEXT = "Thanks for chatting! Here's a copy of your conversation for your records.";
const TRANSCRIPT_PLACEHOLDER = "{{transcript}}";

function splitTranscriptTemplateBody(body: string) {
  const [intro = "", ...rest] = body.split(TRANSCRIPT_PLACEHOLDER);
  return {
    intro: intro.trim(),
    outro: rest.join(TRANSCRIPT_PLACEHOLDER).trim()
  };
}

function formatConversationDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function formatConversationTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function renderAvatar(size: 24 | 48, label: string, avatarUrl: string | null) {
  if (avatarUrl) {
    return `<img src="${avatarUrl}" alt="${escapeHtml(label)} avatar" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;border:0;" />`;
  }

  const initials = initialsFromLabel(label);
  const fontSize = size === 48 ? 18 : 11;

  return `<table role="presentation" cellpadding="0" cellspacing="0" width="${size}" height="${size}" style="width:${size}px;height:${size}px;border-radius:50%;background:#DBEAFE;"><tr><td align="center" valign="middle" style="font-size:${fontSize}px;font-weight:600;color:#1D4ED8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${escapeHtml(initials)}</td></tr></table>`;
}

function renderMessageHtml(message: ConversationTranscriptMessage, agentName: string, avatarHtml: string) {
  const content = escapeHtml(message.content.trim() || "(attachment only)").replace(/\n/g, "<br />");
  const time = formatConversationTime(message.createdAt);

  if (message.sender === "user") {
    return `<tr><td style="padding:0 0 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="left"><table role="presentation" cellpadding="0" cellspacing="0" style="max-width:80%;"><tr><td style="background:#E2E8F0;border-radius:12px 12px 12px 4px;padding:12px 16px;font-size:14px;line-height:1.5;color:#0F172A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${content}</td></tr></table><div style="margin-top:4px;font-size:11px;line-height:1.4;color:#94A3B8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${time}</div></td></tr></table></td></tr>`;
  }

  return `<tr><td style="padding:0 0 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="right"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="padding:0 8px 0 0;"><table role="presentation" cellpadding="0" cellspacing="0" style="max-width:80%;"><tr><td style="background:#2563EB;border-radius:12px 12px 4px 12px;padding:12px 16px;font-size:14px;line-height:1.5;color:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${content}</td></tr></table></td><td valign="bottom">${avatarHtml}</td></tr><tr><td colspan="2" align="right" style="padding-top:4px;font-size:11px;line-height:1.4;color:#94A3B8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${escapeHtml(agentName)} • ${time}</td></tr></table></td></tr></table></td></tr>`;
}

function renderOptionalCopyCell(html: string) {
  if (!html.trim()) {
    return "";
  }

  return `<tr><td style="padding:0 32px 24px;font-size:15px;line-height:1.6;color:#475569;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${html}</td></tr>`;
}

export function buildConversationTranscriptPreviewMessages(): ConversationTranscriptMessage[] {
  return [
    {
      sender: "user",
      content: "Hi there! Do you offer annual billing?",
      createdAt: "2026-03-15T10:32:00.000Z"
    },
    {
      sender: "founder",
      content: "We do. I can get that set up for you in a couple of minutes.",
      createdAt: "2026-03-15T10:33:00.000Z"
    },
    {
      sender: "user",
      content: "Perfect, thank you.",
      createdAt: "2026-03-15T10:34:00.000Z"
    }
  ];
}

export function renderConversationTranscriptEmailTemplate(
  template: Pick<DashboardEmailTemplate, "subject" | "body">,
  context: DashboardEmailTemplatePreviewContext,
  options: {
    appUrl: string;
    siteUrl: string;
    replyToEmail: string;
    messages: ConversationTranscriptMessage[];
    teamAvatarUrl: string | null;
    showViralFooter: boolean;
    viralVariant?: TranscriptViralVariant;
    highlightVariables?: boolean;
  }
) {
  const resolvedSubject = resolveDashboardEmailTemplateValue(template.subject, context);
  const bodySegments = splitTranscriptTemplateBody(template.body);
  const intro = renderDashboardEmailTemplateFragment(bodySegments.intro, context, {
    highlightVariables: options.highlightVariables
  });
  const outro = renderDashboardEmailTemplateFragment(bodySegments.outro, context, {
    highlightVariables: options.highlightVariables
  });
  const firstMessageDate = options.messages[0]?.createdAt ?? new Date().toISOString();
  const messageCount = options.messages.length;
  const footer = buildConversationTranscriptFooterContent({
    appUrl: options.appUrl,
    teamName: context.teamName,
    showViralFooter: options.showViralFooter,
    viralVariant: options.viralVariant
  });
  const headerAvatar = renderAvatar(48, context.teamName, options.teamAvatarUrl);
  const teamMessageAvatar = renderAvatar(24, context.teamName, options.teamAvatarUrl);
  const transcriptRows = options.messages
    .map((message) => renderMessageHtml(message, context.agentName, teamMessageAvatar))
    .join("");
  const bodyText = [
    `Your conversation with ${context.teamName}`,
    `${formatConversationDate(firstMessageDate)} • ${messageCount} ${messageCount === 1 ? "message" : "messages"}`,
    intro.text,
    options.messages
      .map((message) => {
        const name = message.sender === "founder" ? context.agentName : "Visitor";
        return `${name} (${formatConversationTime(message.createdAt)}): ${message.content.trim() || "(attachment only)"}`;
      })
      .join("\n\n"),
    outro.text,
    "Need more help? Continue this conversation anytime.",
    `Reply to This Email: mailto:${options.replyToEmail}`,
    `Visit Our Site: ${options.siteUrl}`,
    footer.viral?.text ?? "",
    footer.legal?.text ?? ""
  ]
    .filter(Boolean)
    .join("\n\n");
  const bodyHtml = [
    `<div style="display:none;overflow:hidden;line-height:1px;max-height:0;max-width:0;opacity:0;color:transparent;">${escapeHtml(PREHEADER_TEXT)}</div>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#F1F5F9;margin:0;padding:0;"><tr><td align="center" style="padding:40px 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);overflow:hidden;"><tr><td style="padding:32px 32px 24px;">${headerAvatar}<div style="margin-top:16px;font-family:Georgia,serif;font-size:22px;line-height:1.3;font-weight:600;color:#0F172A;">Your conversation with ${escapeHtml(context.teamName)}</div><div style="margin-top:4px;font-size:13px;line-height:1.5;color:#64748B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${formatConversationDate(firstMessageDate)} • ${messageCount} ${messageCount === 1 ? "message" : "messages"}</div></td></tr>`,
    renderOptionalCopyCell(intro.html),
    `<tr><td style="background:#F8FAFC;padding:24px 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${transcriptRows}</table></td></tr>`,
    renderOptionalCopyCell(outro.html),
    `<tr><td align="center" style="padding:32px;border-bottom:1px solid #F1F5F9;"><div style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">Need more help? Continue this conversation anytime.</div><a href="mailto:${options.replyToEmail}" style="display:inline-block;background:#2563EB;border-radius:6px;padding:12px 24px;font-size:14px;font-weight:500;line-height:1;color:#FFFFFF;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">Reply to This Email</a><span style="display:inline-block;padding:12px 10px 0;color:#475569;font-size:14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">or</span><a href="${options.siteUrl}" style="display:inline-block;padding-top:12px;color:#2563EB;font-size:14px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">Visit Our Site</a></td></tr>`,
    footer.viral
      ? `<tr><td align="center" style="padding:28px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;"><div style="margin:0 0 6px;font-size:14px;line-height:1.6;color:#475569;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">&#128172; Enjoying fast, friendly support?</div><div style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#64748B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">Powered by <strong style="color:#475569;">Chatting</strong> &mdash; live chat for small teams</div><a href="${footer.viral.href}" style="display:inline-block;background:#2563EB;border-radius:6px;padding:10px 20px;font-size:13px;font-weight:500;line-height:1;color:#FFFFFF;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${footer.viral.ctaLabel}</a></td></tr>`
      : "",
    footer.legal
      ? `<tr><td align="center" style="padding:24px 32px;"><div style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#94A3B8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${escapeHtml(footer.legal.attributionText)}</div><a href="${footer.legal.privacyHref}" style="font-size:12px;line-height:1.6;color:#64748B;text-decoration:underline;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${footer.legal.privacyLabel}</a></td></tr>`
      : "",
    `</table></td></tr></table>`
  ].join("");

  return {
    subject: resolvedSubject,
    bodyText,
    bodyHtml
  };
}
