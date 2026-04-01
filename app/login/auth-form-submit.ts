"use client";

import type { FormEvent } from "react";
import type { PasswordActionState } from "./action-types";

type SubmitPasswordFlowInput = {
  action: (formData: FormData) => Promise<PasswordActionState>;
  event: FormEvent<HTMLFormElement>;
  mutateFormData?: (formData: FormData) => void;
  onError: (message: string) => void;
  onSuccess: (result: PasswordActionState) => void;
  setSubmitting: (value: boolean) => void;
};

export async function submitPasswordFlow({
  action,
  event,
  mutateFormData,
  onError,
  onSuccess,
  setSubmitting
}: SubmitPasswordFlowInput) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  mutateFormData?.(formData);
  setSubmitting(true);

  const result = await action(formData);
  setSubmitting(false);

  if (!result.ok) {
    if (result.error) {
      onError(result.error);
    }
    return;
  }

  onSuccess(result);
}
