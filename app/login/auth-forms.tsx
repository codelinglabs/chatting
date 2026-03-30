"use client";

import type { FormEvent } from "react";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "../dashboard/dashboard-ui";
import { FormButton, FormErrorMessage, FormPasswordField, FormSubmitButton, FormTextField } from "../ui/form-controls";
import { AuthFormIntro, AuthPageShell } from "./auth-shell";
import { loginAction, type AuthActionState } from "./actions";

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
  inviteId = "",
  inviteEmail = ""
}: {
  inviteId?: string;
  inviteEmail?: string;
}) {
  const router = useRouter();
  const inviteQuery = inviteId
    ? `?invite=${encodeURIComponent(inviteId)}${inviteEmail ? `&email=${encodeURIComponent(inviteEmail)}` : ""}`
    : "";
  const isInviteFlow = Boolean(inviteId);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [localError, setLocalError] = useState<string | null>(null);
  const [successCopy, setSuccessCopy] = useState({
    title: "Check your inbox",
    body: "If that email exists in Chatting, we’ve sent instructions to continue."
  });
  const [loginState, loginFormAction] = useActionState(loginAction, INITIAL_AUTH_STATE);

  useEffect(() => {
    if (loginState.ok) {
      router.replace((loginState.nextPath ?? "/dashboard") as never);
    }
  }, [loginState.nextPath, loginState.ok, router]);

  function handleModeChange(nextMode: AuthMode) {
    setLocalError(null);
    setMode(nextMode);
  }

  function handleForgotSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    if (!email) {
      setLocalError("Enter your work email to continue.");
      return;
    }

    setLocalError(null);
    setSuccessCopy({
      title: "Reset email sent",
      body: `We sent a password reset link to ${email}.`
    });
    setMode("success");
  }

  function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "").trim();
    const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

    if (!password || password.length < 8) {
      setLocalError("Use at least 8 characters for the new password.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Your password confirmation does not match.");
      return;
    }

    setLocalError(null);
    setSuccessCopy({
      title: "Password updated",
      body: "Your password has been reset. You can sign in with the new one now."
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
        <div>
          <AuthFormIntro
            title={isInviteFlow ? "Sign in to accept your invite" : "Sign in"}
            caption={isInviteFlow ? "Need a new account instead?" : "Don't have an account?"}
            actionLabel="Create one"
            onAction={() => router.push(`/signup${inviteQuery}` as never)}
          />

          <form action={loginFormAction} className="mt-8 space-y-5">
            <FormErrorMessage message={loginState.error} />
            {isInviteFlow ? (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                Use {inviteEmail || "the invited email"} to join this workspace.
              </div>
            ) : null}
            {isInviteFlow ? <input type="hidden" name="inviteId" value={inviteId} /> : null}

            <FormTextField
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={loginState.fields.email}
              placeholder="you@company.com"
            />

            <FormPasswordField
              label="Password"
              name="password"
              required
              autoComplete="current-password"
              defaultValue={loginState.fields.password}
              placeholder="Enter your password"
            />

            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="inline-flex items-center gap-3 text-slate-700">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => handleModeChange("forgot")}
                className="font-semibold text-blue-600"
              >
                Forgot password?
              </button>
            </div>

            <FormSubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />
          </form>
        </div>
      ) : null}

      {mode === "forgot" ? (
        <div>
          <AuthFormIntro
            title="Forgot password"
            caption="Remembered it?"
            actionLabel="Back to sign in"
            onAction={() => handleModeChange("signin")}
          />

          <form onSubmit={handleForgotSubmit} className="mt-10 space-y-5">
            <FormErrorMessage message={localError} />

            <FormTextField
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={loginState.fields.email}
              placeholder="you@company.com"
            />

            <FormButton type="submit" fullWidth trailingIcon={<span aria-hidden="true">→</span>}>
              Send reset link
            </FormButton>
          </form>
        </div>
      ) : null}

      {mode === "reset" ? (
        <div>
          <AuthFormIntro title="Reset password" caption="Set a new password for your account." />

          <form onSubmit={handleResetSubmit} className="mt-10 space-y-5">
            <FormErrorMessage message={localError} />

            <FormPasswordField
              label="New password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Enter a new password"
            />

            <FormPasswordField
              label="Confirm password"
              name="confirmPassword"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Re-enter your password"
            />

            <FormButton type="submit" fullWidth trailingIcon={<span aria-hidden="true">→</span>}>
              Reset password
            </FormButton>
          </form>
        </div>
      ) : null}

      {mode === "success" ? (
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircleIcon className="h-8 w-8" />
          </div>
          <h1 className="display-font mt-8 text-5xl text-slate-900">{successCopy.title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-500">{successCopy.body}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <FormButton type="button" onClick={() => handleModeChange("signin")} trailingIcon={<span aria-hidden="true">→</span>}>
              Back to sign in
            </FormButton>
            <FormButton type="button" variant="secondary" onClick={() => router.push(`/signup${inviteQuery}` as never)}>
              Create account
            </FormButton>
          </div>
        </div>
      ) : null}
    </AuthPageShell>
  );
}
