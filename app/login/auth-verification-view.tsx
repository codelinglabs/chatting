"use client";

import type { FormEventHandler } from "react";
import { FormButton, FormTextField } from "../ui/form-controls";
import { AuthFormIntro } from "./auth-shell";

export function ResendVerificationView({
  email = "",
  isSubmitting,
  onBackToSignIn,
  onSubmit
}: {
  email?: string;
  isSubmitting: boolean;
  onBackToSignIn?: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}) {
  return (
    <div>
      <AuthFormIntro
        title="Resend verification"
        caption="Already verified?"
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
          Send verification link
        </FormButton>
      </form>
    </div>
  );
}
