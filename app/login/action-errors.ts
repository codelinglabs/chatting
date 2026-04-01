import { getGenericAuthErrorMessage } from "./auth-error-messages";

export function formatAuthError(message: string, mode: "login" | "signup") {
  if (message === "EMAIL_TAKEN") return "That email already has an account.";
  if (message === "WEAK_PASSWORD") return "Use at least 8 characters for the password.";
  if (message === "MISSING_PASSWORD") return "Password is required.";
  if (message === "MISSING_EMAIL") return "Work email is required.";
  if (message === "MISSING_DOMAIN") return "Website URL is required.";
  if (message === "INVALID_REFERRAL_CODE" || message === "SELF_REFERRAL") {
    return "That referral code wasn't recognized.";
  }
  if (message === "INVITE_NOT_FOUND") return "That team invite is no longer available.";
  if (message === "INVITE_EXPIRED") return "That team invite has expired. Ask the workspace owner to resend it.";
  if (message === "INVITE_REVOKED") return "That team invite has been revoked.";
  if (message === "INVITE_ALREADY_ACCEPTED") return "That team invite has already been accepted.";
  if (message === "INVITE_EMAIL_MISMATCH") return "Sign in with the email address that received this invite.";
  if (message === "INVITE_OWNER_CONFLICT") return "You already own this workspace.";
  if (message === "INVITE_WORKSPACE_CONFLICT") {
    return "This account already owns another workspace, so it can't join this one yet.";
  }

  return getGenericAuthErrorMessage(mode);
}

export function isExpectedAuthError(message: string) {
  return (
    message === "EMAIL_TAKEN" ||
    message === "WEAK_PASSWORD" ||
    message === "MISSING_PASSWORD" ||
    message === "MISSING_EMAIL" ||
    message === "MISSING_DOMAIN" ||
    message === "INVALID_REFERRAL_CODE" ||
    message === "SELF_REFERRAL"
  );
}
