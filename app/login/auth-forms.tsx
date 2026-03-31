"use client";

import type { FormEvent } from "react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/toast-provider";
import {
  AuthSuccessView,
  ForgotPasswordView,
  ResetPasswordView,
  SignInAuthView
} from "./auth-form-views";
import { AuthPageShell } from "./auth-shell";
import { forgotPasswordAction, loginAction, resetPasswordAction, type AuthActionState } from "./actions";

type AuthMode = "signin" | "forgot" | "reset" | "success";

const INITIAL_AUTH_STATE: AuthActionState = {
  error: null,
  ok: false,
  nextPath: null,
  fields: {
    email: "",
    password: "",
    websiteUrl: "",
    referralCode: ""
  }
};

export const SIGNIN_STATS = [
  { value: "2,400+", label: "Teams" },
  { value: "1.2m", label: "Avg response" },
  { value: "4.8/5", label: "Rating" }
];

export function AuthForms({
  initialMode = "signin",
  resetToken = "",
  inviteId = "",
  inviteEmail = ""
}: {
  initialMode?: Exclude<AuthMode, "success">;
  resetToken?: string;
  inviteId?: string;
  inviteEmail?: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const inviteQuery = inviteId
    ? `?invite=${encodeURIComponent(inviteId)}${inviteEmail ? `&email=${encodeURIComponent(inviteEmail)}` : ""}`
    : "";
  const isInviteFlow = Boolean(inviteId);
  const [mode, setMode] = useState<AuthMode>(initialMode === "reset" && resetToken ? "reset" : initialMode);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [successCopy, setSuccessCopy] = useState({
    title: "Check your inbox",
    body: "If that email exists in Chatting, we’ve sent instructions to continue."
  });
  const [loginState, loginFormAction] = useActionState(loginAction, INITIAL_AUTH_STATE);
  const lastLoginToastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (loginState.ok) {
      router.replace((loginState.nextPath ?? "/dashboard") as never);
    }
  }, [loginState.nextPath, loginState.ok, router]);

  useEffect(() => {
    if (!loginState.error || lastLoginToastErrorRef.current === loginState.error) {
      return;
    }

    lastLoginToastErrorRef.current = loginState.error;
    showToast("error", loginState.error);
  }, [loginState, showToast]);

  function handleLoginAction(formData: FormData) {
    lastLoginToastErrorRef.current = null;
    return loginFormAction(formData);
  }

  function handleModeChange(nextMode: AuthMode) {
    setMode(nextMode);
  }

  async function handleForgotSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPasswordSubmitting(true);

    const result = await forgotPasswordAction(formData);
    setPasswordSubmitting(false);

    if (!result.ok) {
      if (result.error) {
        showToast("error", result.error);
      }
      return;
    }

    setSuccessCopy({
      title: "Reset email sent",
      body: result.message ?? "Check your inbox for the reset link."
    });
    setMode("success");
  }

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("token", resetToken);
    setPasswordSubmitting(true);

    const result = await resetPasswordAction(formData);
    setPasswordSubmitting(false);

    if (!result.ok) {
      if (result.error) {
        showToast("error", result.error);
      }
      return;
    }

    setSuccessCopy({
      title: "Password updated",
      body: result.message ?? "Your password has been reset. You can sign in with the new one now."
    });
    setMode("success");
  }

  return (
    <AuthPageShell
      heroTitle={isInviteFlow ? "Join your team's workspace" : "Welcome back to Chatting"}
      heroDescription={
        isInviteFlow
          ? "Sign in with the invited email to accept your workspace access and jump into the inbox."
          : "Connect with your visitors in real-time. Turn conversations into customers."
      }
      stats={SIGNIN_STATS}
    >
      {mode === "signin" ? (
        <SignInAuthView
          email={loginState.fields.email}
          inviteEmail={inviteEmail}
          inviteId={inviteId}
          isInviteFlow={isInviteFlow}
          onCreateAccount={() => router.push(`/signup${inviteQuery}` as never)}
          onForgotPassword={() => handleModeChange("forgot")}
          password={loginState.fields.password}
          submitAction={handleLoginAction}
        />
      ) : null}

      {mode === "forgot" ? (
        <ForgotPasswordView
          email={loginState.fields.email}
          isSubmitting={passwordSubmitting}
          onBackToSignIn={() => handleModeChange("signin")}
          onSubmit={handleForgotSubmit}
        />
      ) : null}

      {mode === "reset" ? (
        <ResetPasswordView isSubmitting={passwordSubmitting} onSubmit={handleResetSubmit} />
      ) : null}

      {mode === "success" ? (
        <AuthSuccessView
          body={successCopy.body}
          onBackToSignIn={() => handleModeChange("signin")}
          onCreateAccount={() => router.push(`/signup${inviteQuery}` as never)}
          title={successCopy.title}
        />
      ) : null}
    </AuthPageShell>
  );
}
