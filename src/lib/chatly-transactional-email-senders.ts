import {
  renderAccountWelcomeEmail,
  renderEmailVerificationEmail,
  renderPasswordResetEmail,
  renderTeamInvitationEmail
} from "@/lib/chatly-transactional-emails";
import { sendRichEmail } from "@/lib/email";

export async function sendAccountWelcomeEmail(input: {
  to: string;
  firstName: string;
  dashboardUrl: string;
}) {
  const rendered = renderAccountWelcomeEmail(input);
  return sendRichEmail({
    to: input.to,
    subject: rendered.subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml
  });
}

export async function sendEmailVerificationEmail(input: {
  to: string;
  verifyUrl: string;
}) {
  const rendered = renderEmailVerificationEmail(input);
  return sendRichEmail({
    to: input.to,
    subject: rendered.subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml
  });
}

export async function sendPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
}) {
  const rendered = renderPasswordResetEmail(input);
  return sendRichEmail({
    to: input.to,
    subject: rendered.subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml
  });
}

export async function sendTeamInvitationEmail(input: {
  to: string;
  inviterName: string;
  teamName: string;
  teamWebsite: string | null;
  memberCount: number;
  inviteUrl: string;
}) {
  const rendered = renderTeamInvitationEmail(input);
  return sendRichEmail({
    to: input.to,
    subject: rendered.subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml
  });
}
