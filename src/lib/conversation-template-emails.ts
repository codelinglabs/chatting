import { randomUUID } from "node:crypto";
import { getDashboardEmailTemplateSettings } from "@/lib/data/settings";
import { getPublicAppUrl } from "@/lib/env";
import {
  renderDashboardEmailTemplate,
  type DashboardEmailTemplateKey,
  type DashboardEmailTemplateSection
} from "@/lib/email-templates";
import { sendRichEmail } from "@/lib/email";
import {
  claimTemplateDelivery,
  deletePendingTemplateDelivery,
  findConversationTemplateContext,
  listConversationTranscriptRows,
  markTemplateDeliverySent
} from "@/lib/repositories/conversation-template-email-repository";
import { displayNameFromEmail } from "@/lib/user-display";
import { escapeHtml, optionalText } from "@/lib/utils";

type ConversationTemplateContext = {
  conversationId: string;
  userId: string;
  siteName: string;
  siteDomain: string | null;
  visitorEmail: string | null;
};

type ReplyAttachment = {
  fileName: string;
  contentType: string;
  content: Buffer;
};

function getAppUrl() {
  return getPublicAppUrl();
}

function getReplyAlias(conversationId: string) {
  const domain = process.env.REPLY_DOMAIN?.trim();

  if (!domain) {
    return null;
  }

  return `reply+${conversationId}@${domain}`;
}

function buildSiteUrl(domain: string | null) {
  const normalized = optionalText(domain);
  if (!normalized) {
    return getAppUrl();
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  return `https://${normalized}`;
}

function profileNameFromSettings(settings: Awaited<ReturnType<typeof getDashboardEmailTemplateSettings>>) {
  const name = [settings.profile.firstName, settings.profile.lastName].filter(Boolean).join(" ").trim();
  return name || displayNameFromEmail(settings.profile.email);
}

function buildFeedbackLinks(conversationId: string) {
  const appUrl = getAppUrl();

  return {
    yesUrl: `${appUrl}/feedback?conversationId=${encodeURIComponent(conversationId)}&helpful=yes`,
    noUrl: `${appUrl}/feedback?conversationId=${encodeURIComponent(conversationId)}&helpful=no`
  };
}

async function getConversationTemplateContext(conversationId: string): Promise<ConversationTemplateContext | null> {
  const row = await findConversationTemplateContext(conversationId);
  if (!row) {
    return null;
  }

  return {
    conversationId: row.conversation_id,
    userId: row.user_id,
    siteName: row.site_name,
    siteDomain: row.domain,
    visitorEmail: row.email
  };
}

async function getConversationTranscript(conversationId: string, agentName: string) {
  const rows = await listConversationTranscriptRows(conversationId);

  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return rows
    .map((message) => {
      const author = message.sender === "founder" ? agentName : "Visitor";
      const content = message.content.trim() || "(attachment only)";
      return `[${formatter.format(new Date(message.created_at))}] ${author}: ${content}`;
    })
    .join("\n\n");
}

async function claimDelivery(input: {
  conversationId: string;
  templateKey: DashboardEmailTemplateKey;
  deliveryKey: string;
  recipientEmail: string;
}) {
  return claimTemplateDelivery({
    deliveryId: randomUUID(),
    conversationId: input.conversationId,
    templateKey: input.templateKey,
    deliveryKey: input.deliveryKey,
    recipientEmail: input.recipientEmail
  });
}

async function completeDelivery(deliveryKey: string) {
  await markTemplateDeliverySent(deliveryKey);
}

async function abandonDelivery(deliveryKey: string) {
  await deletePendingTemplateDelivery(deliveryKey);
}

async function sendConversationTemplateEmail(input: {
  conversationId: string;
  userId: string;
  templateKey: DashboardEmailTemplateKey;
  deliveryKey: string;
  attachments?: ReplyAttachment[];
}) {
  const [settings, conversation] = await Promise.all([
    getDashboardEmailTemplateSettings(input.userId),
    getConversationTemplateContext(input.conversationId)
  ]);

  if (!conversation?.visitorEmail) {
    return "skipped";
  }

  const template = settings.email.templates.find((entry) => entry.key === input.templateKey);
  if (!template || !template.enabled) {
    return "skipped";
  }

  const claimed = await claimDelivery({
    conversationId: input.conversationId,
    templateKey: input.templateKey,
    deliveryKey: input.deliveryKey,
    recipientEmail: conversation.visitorEmail
  });

  if (!claimed) {
    return "duplicate";
  }

  const profileName = profileNameFromSettings(settings);
  const agentName = settings.profile.firstName.trim() || profileName.split(/\s+/)[0] || "Support";
  const conversationLink = buildSiteUrl(conversation.siteDomain);
  const feedbackLinks = buildFeedbackLinks(input.conversationId);
  const signature = optionalText(settings.email.emailSignature);
  const sections: DashboardEmailTemplateSection[] = [];

  if (signature) {
    sections.push({
      type: "plain",
      tone: "soft",
      text: signature,
      html: escapeHtml(signature).replace(/\n/g, "<br />")
    });
  }

  if (input.templateKey === "satisfaction_survey") {
    sections.push({
      type: "actions",
      tone: "soft",
      title: "Helpful?",
      textTitle: "Helpful?",
      links: [
        { label: "Yes", href: feedbackLinks.yesUrl },
        { label: "No", href: feedbackLinks.noUrl }
      ]
    });
  }

  const rendered = renderDashboardEmailTemplate(
    {
      subject: template.subject,
      body: template.body
    },
    {
      visitorName: conversation.visitorEmail.split("@")[0] || "there",
      visitorEmail: conversation.visitorEmail,
      teamName: conversation.siteName,
      agentName,
      companyName: conversation.siteName,
      conversationLink,
      transcript: await getConversationTranscript(input.conversationId, agentName),
      unsubscribeLink: getAppUrl()
    },
    {
      highlightVariables: false,
      includeShell: true,
      sections
    }
  );
  const replyTo =
    input.templateKey === "welcome_email"
      ? settings.email.replyToEmail
      : getReplyAlias(input.conversationId) || settings.email.replyToEmail;

  try {
    await sendRichEmail({
      to: conversation.visitorEmail,
      replyTo,
      subject: rendered.subject,
      bodyText: rendered.bodyText,
      bodyHtml: rendered.bodyHtml,
      attachments: input.attachments ?? []
    });
    await completeDelivery(input.deliveryKey);
    return "sent";
  } catch (error) {
    await abandonDelivery(input.deliveryKey);
    throw error;
  }
}

export async function sendOfflineReplyTemplateEmail(input: {
  conversationId: string;
  userId: string;
  messageId: string;
  attachments?: ReplyAttachment[];
}) {
  return sendConversationTemplateEmail({
    conversationId: input.conversationId,
    userId: input.userId,
    templateKey: "offline_reply",
    deliveryKey: `offline_reply:${input.messageId}`,
    attachments: input.attachments
  });
}

export async function sendWelcomeTemplateEmail(input: {
  conversationId: string;
  userId: string;
}) {
  return sendConversationTemplateEmail({
    conversationId: input.conversationId,
    userId: input.userId,
    templateKey: "welcome_email",
    deliveryKey: `welcome_email:${input.conversationId}`
  });
}

export async function sendResolvedConversationTemplateEmails(input: {
  conversationId: string;
  userId: string;
}) {
  for (const templateKey of [
    "conversation_transcript",
    "follow_up_email",
    "satisfaction_survey"
  ] as const) {
    await sendConversationTemplateEmail({
      conversationId: input.conversationId,
      userId: input.userId,
      templateKey,
      deliveryKey: `${templateKey}:${input.conversationId}`
    });
  }
}
