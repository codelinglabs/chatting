"use client";

import type { FormEventHandler } from "react";
import { CheckCircleIcon } from "../dashboard/dashboard-ui";
import { FormButton, FormPasswordField, FormSubmitButton, FormTextField } from "../ui/form-controls";
import { AuthFormIntro } from "./auth-shell";

type LoginViewProps = {
  email: string;
  inviteEmail: string;
  inviteId: string;
  isInviteFlow: boolean;
  onCreateAccount: () => void;
  onForgotPassword: () => void;
  password: string;
  submitAction: (payload: FormData) => void;
};

type PasswordActionViewProps = {
  email?: string;
  isSubmitting: boolean;
  onBackToSignIn?: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

type SuccessViewProps = {
  body: string;
  onBackToSignIn: () => void;
  onCreateAccount: () => void;
  title: string;
};

export function SignInAuthView({
  email,
  inviteEmail,
  inviteId,
  isInviteFlow,
  onCreateAccount,
  onForgotPassword,
  password,
  submitAction
}: LoginViewProps) {
  return (
    <div>
      <AuthFormIntro
        title={isInviteFlow ? "Sign in to accept your invite" : "Sign in"}
        caption={isInviteFlow ? "Need a new account instead?" : "Don't have an account?"}
        actionLabel="Create one"
        onAction={onCreateAccount}
      />

      <form action={submitAction} className="mt-8 space-y-5">
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
          defaultValue={email}
          placeholder="you@company.com"
        />

        <FormPasswordField
          label="Password"
          name="password"
          required
          autoComplete="current-password"
          defaultValue={password}
          placeholder="Enter your password"
        />

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="inline-flex items-center gap-3 text-slate-700">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
            Remember me
          </label>
          <button type="button" onClick={onForgotPassword} className="font-semibold text-blue-600">
            Forgot password?
          </button>
        </div>

        <FormSubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />
      </form>
    </div>
  );
}

export function ForgotPasswordView({
  email = "",
  isSubmitting,
  onBackToSignIn,
  onSubmit
}: PasswordActionViewProps) {
  return (
    <div>
      <AuthFormIntro
        title="Forgot password"
        caption="Remembered it?"
        actionLabel="Back to sign in"
        onAction={onBackToSignIn}
      />

      <form onSubmit={onSubmit} className="mt-10 space-y-5">
        <FormTextField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={email}
          placeholder="you@company.com"
        />

        <FormButton type="submit" fullWidth disabled={isSubmitting} trailingIcon={<span aria-hidden="true">→</span>}>
          Send reset link
        </FormButton>
      </form>
    </div>
  );
}

export function ResetPasswordView({
  isSubmitting,
  onSubmit
}: Omit<PasswordActionViewProps, "email" | "onBackToSignIn">) {
  return (
    <div>
      <AuthFormIntro title="Reset password" caption="Set a new password for your account." />

      <form onSubmit={onSubmit} className="mt-10 space-y-5">
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

        <FormButton type="submit" fullWidth disabled={isSubmitting} trailingIcon={<span aria-hidden="true">→</span>}>
          Reset password
        </FormButton>
      </form>
    </div>
  );
}

export function AuthSuccessView({
  body,
  onBackToSignIn,
  onCreateAccount,
  title
}: SuccessViewProps) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircleIcon className="h-8 w-8" />
      </div>
      <h1 className="display-font mt-8 text-5xl text-slate-900">{title}</h1>
      <p className="mt-5 text-lg leading-8 text-slate-500">{body}</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <FormButton type="button" onClick={onBackToSignIn} trailingIcon={<span aria-hidden="true">→</span>}>
          Back to sign in
        </FormButton>
        <FormButton type="button" variant="secondary" onClick={onCreateAccount}>
          Create account
        </FormButton>
      </div>
    </div>
  );
}
