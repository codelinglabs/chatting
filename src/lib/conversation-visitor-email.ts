import { buildConversationTranscriptFooterContent, type TranscriptViralVariant } from "@/lib/conversation-transcript-footer";
import type { ConversationFeedbackLink } from "@/lib/conversation-feedback";
import {
  renderConversationFeedbackScale,
  renderConversationFeedbackText
} from "@/lib/conversation-feedback-email";
import {
  joinEmailText,
  renderButtonRow,
  renderChattingEmailShell,
  renderEmailSection,
  renderFooterBlock,
  renderHeadingBlock,
  renderPanel
} from "@/lib/chatly-email-foundation";
import {
  renderDashboardEmailTemplateFragment,
  resolveDashboardEmailTemplateValue,
  type DashboardEmailTemplate,
  type DashboardEmailTemplateKey,
  type DashboardEmailTemplatePreviewContext
} from "@/lib/email-templates";
import { initialsFromLabel } from "@/lib/user-display";
import { escapeHtml } from "@/lib/utils";

type SupportedVisitorTemplateKey = Exclude<DashboardEmailTemplateKey, "conversation_transcript">;

function renderAvatar(label: string, avatarUrl: string | null) {
  if (avatarUrl) {
    return `<img src="${avatarUrl}" alt="${escapeHtml(label)} avatar" width="48" height="48" style="display:block;width:48px;height:48px;border-radius:50%;object-fit:cover;border:0;" />`;
  }

  return `<div style="width:48px;height:48px;border-radius:50%;background:#DBEAFE;color:#1D4ED8;font:600 18px/48px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;text-align:center;">${escapeHtml(
    initialsFromLabel(label)
  )}</div>`;
}

function splitBody(body: string) {
  const marker = "{{transcript}}";
  const [intro = "", ...rest] = body.split(marker);
  return {
    intro: intro.trim(),
    outro: rest.join(marker).trim()
  };
}

function resolveTitle(key: SupportedVisitorTemplateKey, context: DashboardEmailTemplatePreviewContext) {
  if (key === "offline_reply") {
    return "We replied to your message";
  }

  if (key === "satisfaction_survey") {
    return "How was your experience?";
  }

  return key === "welcome_email" ? `Welcome to ${context.teamName}` : `Checking in from ${context.teamName}`;
}

function shouldShowViralFooter(key: SupportedVisitorTemplateKey, showViralFooter: boolean) {
  return showViralFooter && (key === "offline_reply" || key === "follow_up_email");
}

export function renderVisitorConversationEmailTemplate(
  template: Pick<DashboardEmailTemplate, "subject" | "body">,
  context: DashboardEmailTemplatePreviewContext,
  options: {
    templateKey: SupportedVisitorTemplateKey;
    appUrl: string;
    siteUrl: string;
    replyToEmail: string;
    teamAvatarUrl: string | null;
    showViralFooter: boolean;
    feedbackLinks?: ConversationFeedbackLink[];
    viralVariant?: TranscriptViralVariant;
    highlightVariables?: boolean;
  }
) {
  const subject = resolveDashboardEmailTemplateValue(template.subject, context);
  const body = splitBody(template.body);
  const intro = renderDashboardEmailTemplateFragment(body.intro, context, {
    highlightVariables: options.highlightVariables
  });
  const outro = renderDashboardEmailTemplateFragment(body.outro, context, {
    highlightVariables: options.highlightVariables
  });
  const viralFooter = buildConversationTranscriptFooterContent({
    appUrl: options.appUrl,
    teamName: context.teamName,
    showViralFooter: shouldShowViralFooter(options.templateKey, options.showViralFooter),
    viralVariant: options.viralVariant,
    utmSource: "visitor_email"
  });
  const feedbackScale =
    options.templateKey === "satisfaction_survey" && options.feedbackLinks?.length
      ? renderConversationFeedbackScale(options.feedbackLinks)
      : "";
  const footerLinks =
    options.templateKey === "welcome_email"
        ? {
            primary: { href: options.siteUrl, label: "Visit Our Site" },
            secondary: null
          }
      : options.templateKey === "satisfaction_survey"
        ? null
      : {
          primary: {
            href: `mailto:${options.replyToEmail}`,
            label: "Reply to This Email"
          },
          secondary: { href: options.siteUrl, label: "Visit Our Site" }
        };
  const transcriptPanel =
    options.templateKey === "offline_reply" || options.templateKey === "follow_up_email"
      ? context.transcript
        ? renderPanel(
            `<div style="font:600 13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;">Conversation recap</div><div style="margin-top:12px;font:400 14px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;white-space:pre-line;">${escapeHtml(
              context.transcript
            )}</div>`
          )
        : ""
      : "";
  const textCta =
    options.templateKey === "satisfaction_survey" && options.feedbackLinks?.length
      ? renderConversationFeedbackText(options.feedbackLinks)
      : [footerLinks?.primary, footerLinks?.secondary]
          .filter((link): link is { label: string; href: string } => Boolean(link))
          .map((link) => `${link.label}: ${link.href}`)
          .join("\n");
  const callToAction =
    feedbackScale ||
    renderButtonRow({
      primary: footerLinks?.primary,
      secondary: footerLinks?.secondary
    });
  const legalText = viralFooter.legal?.text ?? "";
  const bodyText = joinEmailText([
    resolveTitle(options.templateKey, context),
    intro.text,
    options.templateKey === "offline_reply" || options.templateKey === "follow_up_email"
      ? context.transcript || undefined
      : undefined,
    outro.text,
    options.templateKey === "satisfaction_survey"
      ? "Click a rating above — it only takes a second."
      : "Need more help? Continue this conversation anytime.",
    textCta,
    viralFooter.viral?.text ?? "",
    legalText
  ]);

  return {
    subject,
    bodyText,
    bodyHtml: renderChattingEmailShell({
      preheader:
        options.templateKey === "satisfaction_survey"
          ? `We'd love your feedback on your recent chat with ${context.teamName}.`
          : `${context.teamName} sent you an update about your conversation.`,
      rows: [
        renderEmailSection(
          `${renderAvatar(context.teamName, options.teamAvatarUrl)}<div style="margin-top:16px;">${renderHeadingBlock({
            title: resolveTitle(options.templateKey, context)
          })}</div>`,
          { padding: "32px 32px 24px" }
        ),
        intro.html ? renderEmailSection(`<div style="font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${intro.html}</div>`, {
          padding: "0 32px 24px"
        }) : "",
        transcriptPanel ? renderEmailSection(transcriptPanel, { padding: "0 32px 24px" }) : "",
        outro.html ? renderEmailSection(`<div style="font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${outro.html}</div>`, {
          padding: "0 32px 24px"
        }) : "",
        renderEmailSection(
          `<div style="text-align:center;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${
            options.templateKey === "satisfaction_survey"
              ? "Click a rating below — it only takes a second."
              : "Need more help? Continue this conversation anytime."
          }</div><div style="margin-top:20px;">${callToAction}</div>`,
          { align: "center", padding: "32px", borderTopColor: "#F1F5F9" }
        ),
        viralFooter.viral
          ? renderEmailSection(
              `<div style="text-align:center;font:400 14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${escapeHtml(
                viralFooter.viral.hookText
              )}</div><div style="margin-top:6px;text-align:center;font:400 13px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#64748B;">${escapeHtml(
                viralFooter.viral.brandText
              ).replace("Chatting", "<strong style=\"color:#475569;\">Chatting</strong>")}</div><div style="margin-top:16px;text-align:center;">${renderButtonRow({
                primary: { href: viralFooter.viral.href, label: viralFooter.viral.ctaLabel }
              })}</div>`,
              { align: "center", padding: "28px 32px", background: "#F8FAFC", borderTopColor: "#E2E8F0" }
            )
          : "",
        viralFooter.legal
          ? renderEmailSection(
              renderFooterBlock({
                text: viralFooter.legal.attributionText,
                links: [{ label: viralFooter.legal.privacyLabel, href: viralFooter.legal.privacyHref }]
              }),
              { align: "center", padding: "24px 32px" }
            )
          : ""
      ].filter(Boolean)
    })
  };
}
