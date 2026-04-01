"use client";

import { FormPasswordField, FormSubmitButton, FormTextField } from "../ui/form-controls";
import { AuthFormIntro } from "./auth-shell";

type LoginViewProps = {
  email: string;
  inviteEmail: string;
  inviteId: string;
  isInviteFlow: boolean;
  onCreateAccount: () => void;
  onForgotPassword: () => void;
  onResendVerification: () => void;
  password: string;
  redirectTo: string;
  submitAction: (payload: FormData) => void;
};

export function SignInAuthView({
  email,
  inviteEmail,
  inviteId,
  isInviteFlow,
  onCreateAccount,
  onForgotPassword,
  onResendVerification,
  password,
  redirectTo,
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
        {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

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
          <div className="flex flex-col items-end gap-1">
            <button type="button" onClick={onForgotPassword} className="font-semibold text-blue-600">
              Forgot password?
            </button>
            <button type="button" onClick={onResendVerification} className="font-semibold text-slate-500">
              Resend verification email
            </button>
          </div>
        </div>

        <FormSubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />
      </form>
    </div>
  );
}
