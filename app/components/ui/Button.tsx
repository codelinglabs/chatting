"use client";

import Link, { type LinkProps } from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { classNames } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "md" | "lg";

type ButtonOptions = {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonOptions & {
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
  };

export type ButtonLinkProps = Omit<LinkProps, "href"> &
  ButtonOptions & {
    href: LinkProps["href"];
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
    children: ReactNode;
  };

const BUTTON_BASE_CLASS =
  "inline-flex items-center justify-center gap-3 rounded-2xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-70";

const BUTTON_VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900"
};

const BUTTON_SIZE_CLASS: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base"
};

function getButtonClassName(input: ButtonOptions) {
  return classNames(
    BUTTON_BASE_CLASS,
    BUTTON_VARIANT_CLASS[input.variant ?? "primary"],
    BUTTON_SIZE_CLASS[input.size ?? "lg"],
    input.fullWidth && "w-full",
    input.className
  );
}

export function Button({
  className,
  variant = "primary",
  size = "lg",
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={getButtonClassName({ className, variant, size, fullWidth })}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "lg",
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      className={getButtonClassName({ className, variant, size, fullWidth })}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  );
}
