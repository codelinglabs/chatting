"use server";

import { acceptTeamInvite } from "@/lib/workspace-access";
import { setUserSession, signInUser, signUpInvitedUser, signUpUser } from "@/lib/auth";
import { requestPasswordReset, resetPasswordWithToken } from "@/lib/auth-password-reset";
import { sendAccountWelcomeEmail } from "@/lib/chatly-transactional-email-senders";
import { getPostAuthPath } from "@/lib/data";
import { getPublicAppUrl } from "@/lib/env";

export type AuthActionState = {
  error: string | null;
  ok: boolean;
  nextPath: string | null;
  fields: {
    email: string;
    password: string;
    websiteUrl: string;
    referralCode: string;
  };
};

export type PasswordActionState = {
  ok: boolean;
  error: string | null;
  message: string | null;
};

function formatAuthError(message: string, mode: "login" | "signup") {
  const envLabel =
    process.env.NODE_ENV === "production"
      ? "your deployment environment"
      : "your local .env file";

  if (message === "EMAIL_TAKEN") {
    return "That email already has an account.";
  }

  if (message === "WEAK_PASSWORD") {
    return "Use at least 8 characters for the password.";
  }

  if (message === "MISSING_PASSWORD") {
    return "Password is required.";
  }

  if (message === "MISSING_EMAIL") {
    return "Work email is required.";
  }

  if (message === "MISSING_DOMAIN") {
    return "Website URL is required.";
  }

  if (message === "INVALID_REFERRAL_CODE" || message === "SELF_REFERRAL") {
    return "That referral code wasn't recognized.";
  }

  if (message === "INVITE_NOT_FOUND") {
    return "That team invite is no longer available.";
  }

  if (message === "INVITE_EXPIRED") {
    return "That team invite has expired. Ask the workspace owner to resend it.";
  }

  if (message === "INVITE_REVOKED") {
    return "That team invite has been revoked.";
  }

  if (message === "INVITE_ALREADY_ACCEPTED") {
    return "That team invite has already been accepted.";
  }

  if (message === "INVITE_EMAIL_MISMATCH") {
    return "Sign in with the email address that received this invite.";
  }

  if (message === "INVITE_OWNER_CONFLICT") {
    return "You already own this workspace.";
  }

  if (message === "INVITE_WORKSPACE_CONFLICT") {
    return "This account already owns another workspace, so it can't join this one yet.";
  }

  if (message.includes("DATABASE_URL")) {
    return `DATABASE_URL is missing or invalid in ${envLabel}.`;
  }

  if (message.includes("AUTH_SECRET")) {
    return `AUTH_SECRET is missing in ${envLabel}.`;
  }

  if (
    message.includes("connect") ||
    message.includes("ECONN") ||
    message.includes("getaddrinfo") ||
    message.includes("password authentication failed") ||
    message.includes("connection")
  ) {
    return `Database connection failed. Check the Neon DATABASE_URL in ${envLabel}.`;
  }

  return mode === "signup"
    ? `Account creation failed because of a server setup error. Check ${envLabel} and the server logs.`
    : `Sign in failed because of a server setup error. Check ${envLabel} and the server logs.`;
}

function isExpectedAuthError(message: string) {
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

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const inviteId = String(formData.get("inviteId") ?? "").trim();

  const fields = {
    email,
    password,
    websiteUrl: "",
    referralCode: ""
  };

  if (!email) {
    return {
      ok: false,
      error: "Work email is required.",
      nextPath: null,
      fields
    };
  }

  if (!password) {
    return {
      ok: false,
      error: "Password is required.",
      nextPath: null,
      fields
    };
  }

  try {
    const user = await signInUser(email, password);
    if (!user) {
      return {
        ok: false,
        error: "That email and password combination didn't match.",
        nextPath: null,
        fields
      };
    }

    if (inviteId) {
      await acceptTeamInvite({
        inviteId,
        userId: user.id,
        email: user.email
      });
    }

    await setUserSession(user.id);
    const nextPath = inviteId ? "/dashboard" : await getPostAuthPath(user.id);

    return {
      ok: true,
      error: null,
      nextPath,
      fields
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected login error.";
    if (!isExpectedAuthError(message)) {
      console.error("loginAction failed", error);
    }

    return {
      ok: false,
      error: formatAuthError(message, "login"),
      nextPath: null,
      fields
    };
  }
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
  const referralCode = String(formData.get("referralCode") ?? "").trim();
  const inviteId = String(formData.get("inviteId") ?? "").trim();

  const fields = {
    email,
    password,
    websiteUrl,
    referralCode
  };

  try {
    const user = inviteId
      ? await signUpInvitedUser({
          inviteId,
          email,
          password
        })
      : await signUpUser({
          email,
          password,
          websiteUrl,
          referralCode
        });

    await setUserSession(user.id);
    if (!inviteId) {
      try {
        await sendAccountWelcomeEmail({
          to: user.email,
          firstName: user.email.split("@")[0] || "there",
          dashboardUrl: `${getPublicAppUrl()}/dashboard`
        });
      } catch (emailError) {
        console.error("signup welcome email failed", emailError);
      }
    }

    return {
      ok: true,
      error: null,
      nextPath: inviteId ? "/dashboard" : "/onboarding?step=customize",
      fields
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected signup error.";
    if (!isExpectedAuthError(message)) {
      console.error("signupAction failed", error);
    }

    return {
      ok: false,
      error: formatAuthError(message, "signup"),
      nextPath: null,
      fields
    };
  }
}

export async function forgotPasswordAction(formData: FormData): Promise<PasswordActionState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return {
      ok: false,
      error: "Enter your work email to continue.",
      message: null
    };
  }

  try {
    await requestPasswordReset(email);
    return {
      ok: true,
      error: null,
      message: `We sent a password reset link to ${email}.`
    };
  } catch (error) {
    console.error("forgotPasswordAction failed", error);
    return {
      ok: false,
      error: "We couldn't send the reset link just now. Check your server setup and try again.",
      message: null
    };
  }
}

export async function resetPasswordAction(formData: FormData): Promise<PasswordActionState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

  if (!password || password.length < 8) {
    return {
      ok: false,
      error: "Use at least 8 characters for the new password.",
      message: null
    };
  }

  if (password !== confirmPassword) {
    return {
      ok: false,
      error: "Your password confirmation does not match.",
      message: null
    };
  }

  try {
    await resetPasswordWithToken(token, password);
    return {
      ok: true,
      error: null,
      message: "Your password has been reset. You can sign in with the new one now."
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected password reset error.";
    if (message !== "INVALID_RESET_TOKEN") {
      console.error("resetPasswordAction failed", error);
    }

    return {
      ok: false,
      error:
        message === "INVALID_RESET_TOKEN"
          ? "That reset link is invalid or has expired."
          : "We couldn't reset your password just now. Check your server setup and try again.",
      message: null
    };
  }
}
