"use client";

import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Button,
  ButtonLink,
  type ButtonSize,
  type ButtonVariant
} from "../components/ui/Button";
import { classNames } from "@/lib/utils";
import { EyeIcon } from "../dashboard/dashboard-ui";

export type FormButtonVariant = ButtonVariant;
export type FormButtonSize = ButtonSize;

const FORM_TEXT_INPUT_CLASS =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500";
const FORM_TEXTAREA_CLASS =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500";

export function FormInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={classNames(FORM_TEXT_INPUT_CLASS, className)} />;
}

export function FormSelect({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={classNames(FORM_TEXT_INPUT_CLASS, "pr-10", className)}>
      {children}
    </select>
  );
}

export function FormTextarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={classNames(FORM_TEXTAREA_CLASS, className)} />;
}

export { Button as FormButton, ButtonLink as FormButtonLink };

export function FormSubmitButton({
  idleLabel,
  pendingLabel,
  variant = "primary",
  size = "lg"
}: {
  idleLabel: string;
  pendingLabel: string;
  variant?: FormButtonVariant;
  size?: FormButtonSize;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} variant={variant} size={size} fullWidth trailingIcon={<span aria-hidden="true">→</span>}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}

export function FormErrorMessage({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div>;
}

type FormTextFieldProps = {
  label: string;
  value?: string;
  onChange?: (nextValue: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

export function FormTextField({ label, value, onChange, className, ...props }: FormTextFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <FormInput
        {...props}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className={className}
      />
    </label>
  );
}

type FormPasswordFieldProps = {
  label: string;
  value?: string;
  onChange?: (nextValue: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange">;

export function FormPasswordField({ label, value, onChange, className, ...props }: FormPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-white pr-3 transition focus-within:border-blue-500">
        <input
          {...props}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          className={classNames("h-full w-full rounded-2xl bg-transparent px-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-400", className)}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          <EyeIcon className="h-5 w-5" />
        </button>
      </div>
    </label>
  );
}
