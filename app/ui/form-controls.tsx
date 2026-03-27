"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { classNames } from "@/lib/utils";
import { EyeIcon } from "../dashboard/dashboard-ui";

type FormButtonVariant = "primary" | "secondary";
type FormButtonSize = "md" | "lg";

type FormButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: FormButtonVariant;
  size?: FormButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

const FORM_BUTTON_BASE_CLASS =
  "inline-flex items-center justify-center gap-3 rounded-2xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-70";

const FORM_BUTTON_VARIANT_CLASS: Record<FormButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900"
};

const FORM_BUTTON_SIZE_CLASS: Record<FormButtonSize, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base"
};

const FORM_TEXT_INPUT_CLASS =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500";

export function FormButton({
  className,
  variant = "primary",
  size = "lg",
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: FormButtonProps) {
  return (
    <button
      {...props}
      className={classNames(
        FORM_BUTTON_BASE_CLASS,
        FORM_BUTTON_VARIANT_CLASS[variant],
        FORM_BUTTON_SIZE_CLASS[size],
        fullWidth && "w-full",
        className
      )}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}

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
    <FormButton type="submit" disabled={pending} variant={variant} size={size} fullWidth trailingIcon={<span aria-hidden="true">→</span>}>
      {pending ? pendingLabel : idleLabel}
    </FormButton>
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
      <input
        {...props}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className={classNames(FORM_TEXT_INPUT_CLASS, className)}
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
